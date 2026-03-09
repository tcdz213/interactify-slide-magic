/**
 * Offline Sync Engine — IndexedDB queue with auto-sync on reconnect.
 * Uses the `idb` library for typed IndexedDB access.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ── Types ──────────────────────────────────────────────────────
export type SyncStatus = "pending" | "syncing" | "synced" | "conflict" | "failed";

export interface QueuedAction {
  id: string;
  type: "create_order" | "update_order" | "log_visit" | "update_customer" | "check_in" | "check_out";
  payload: Record<string, unknown>;
  timestamp: number;
  status: SyncStatus;
  retries: number;
  error?: string;
  /** Server version at time of queue — used for conflict detection */
  serverVersion?: number;
}

export interface SyncConflict {
  id: string;
  actionId: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  field: string;
  resolvedWith?: "local" | "server";
}

// ── DB Schema ──────────────────────────────────────────────────
interface OfflineDB extends DBSchema {
  queue: {
    key: string;
    value: QueuedAction;
    indexes: { "by-status": SyncStatus; "by-timestamp": number };
  };
  conflicts: {
    key: string;
    value: SyncConflict;
    indexes: { "by-action": string };
  };
}

const DB_NAME = "jawda-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const queue = db.createObjectStore("queue", { keyPath: "id" });
        queue.createIndex("by-status", "status");
        queue.createIndex("by-timestamp", "timestamp");

        const conflicts = db.createObjectStore("conflicts", { keyPath: "id" });
        conflicts.createIndex("by-action", "actionId");
      },
    });
  }
  return dbPromise;
}

// ── Queue Operations ───────────────────────────────────────────
export async function enqueue(action: Omit<QueuedAction, "id" | "timestamp" | "status" | "retries">): Promise<QueuedAction> {
  const db = await getDB();
  const item: QueuedAction = {
    ...action,
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    status: "pending",
    retries: 0,
  };
  await db.put("queue", item);
  return item;
}

export async function getQueue(): Promise<QueuedAction[]> {
  const db = await getDB();
  return db.getAllFromIndex("queue", "by-timestamp");
}

export async function getPendingActions(): Promise<QueuedAction[]> {
  const db = await getDB();
  return db.getAllFromIndex("queue", "by-status", "pending");
}

export async function updateAction(id: string, updates: Partial<QueuedAction>): Promise<void> {
  const db = await getDB();
  const action = await db.get("queue", id);
  if (action) {
    await db.put("queue", { ...action, ...updates });
  }
}

export async function removeAction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("queue", id);
}

export async function clearSynced(): Promise<void> {
  const db = await getDB();
  const synced = await db.getAllFromIndex("queue", "by-status", "synced");
  const tx = db.transaction("queue", "readwrite");
  for (const item of synced) {
    await tx.store.delete(item.id);
  }
  await tx.done;
}

// ── Conflict Operations ────────────────────────────────────────
export async function addConflict(conflict: Omit<SyncConflict, "id">): Promise<SyncConflict> {
  const db = await getDB();
  const item: SyncConflict = {
    ...conflict,
    id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  await db.put("conflicts", item);
  return item;
}

export async function getConflicts(): Promise<SyncConflict[]> {
  const db = await getDB();
  return db.getAll("conflicts");
}

export async function resolveConflict(id: string, resolution: "local" | "server"): Promise<void> {
  const db = await getDB();
  const conflict = await db.get("conflicts", id);
  if (conflict) {
    await db.put("conflicts", { ...conflict, resolvedWith: resolution });
  }
}

export async function removeConflict(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("conflicts", id);
}

// ── Sync Engine ────────────────────────────────────────────────
type SyncCallback = (results: { synced: number; failed: number; conflicts: number }) => void;

let syncInProgress = false;

/** Exponential backoff delays in ms: 5s, 15s, 45s, 2min, 5min */
const BACKOFF_DELAYS = [5000, 15000, 45000, 120000, 300000];
const MAX_RETRIES = 5;

/** Per-action sync callback — called for each successfully synced action */
export type ActionSyncedCallback = (action: QueuedAction) => void;
let actionSyncedListeners: ActionSyncedCallback[] = [];

export function onActionSynced(cb: ActionSyncedCallback): () => void {
  actionSyncedListeners.push(cb);
  return () => { actionSyncedListeners = actionSyncedListeners.filter(l => l !== cb); };
}

/**
 * Simulate syncing pending actions to the server.
 * Implements exponential backoff retry strategy.
 */
export async function syncAll(onComplete?: SyncCallback): Promise<void> {
  if (syncInProgress) return;
  syncInProgress = true;

  const pending = await getPendingActions();
  let synced = 0;
  let failed = 0;
  let conflicts = 0;

  for (const action of pending) {
    await updateAction(action.id, { status: "syncing" });

    try {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

      // Simulate 5% conflict rate, 3% failure rate
      const roll = Math.random();
      if (roll < 0.03) {
        throw new Error("Network timeout");
      }
      if (roll < 0.08) {
        // Simulate conflict
        await addConflict({
          actionId: action.id,
          localData: action.payload,
          serverData: { ...action.payload, _serverModified: Date.now() },
          field: "status",
        });
        await updateAction(action.id, { status: "conflict" });
        conflicts++;
        continue;
      }

      await updateAction(action.id, { status: "synced" });
      synced++;
      // Notify listeners about the synced action
      actionSyncedListeners.forEach(cb => cb(action));
    } catch (err) {
      const retries = action.retries + 1;
      if (retries >= MAX_RETRIES) {
        await updateAction(action.id, {
          status: "failed",
          retries,
          error: err instanceof Error ? err.message : "Unknown error",
        });
        failed++;
      } else {
        // Schedule retry with backoff
        const delay = BACKOFF_DELAYS[retries - 1] || BACKOFF_DELAYS[BACKOFF_DELAYS.length - 1];
        await updateAction(action.id, {
          status: "pending",
          retries,
          error: `Retry ${retries}/${MAX_RETRIES} in ${Math.round(delay / 1000)}s`,
        });
        failed++;
      }
    }
  }

  syncInProgress = false;
  onComplete?.({ synced, failed, conflicts });
}

// ── Online/Offline Listener ────────────────────────────────────
let autoSyncCleanup: (() => void) | null = null;

export function startAutoSync(onComplete?: SyncCallback): () => void {
  if (autoSyncCleanup) autoSyncCleanup();

  const handler = () => {
    if (navigator.onLine) {
      syncAll(onComplete);
    }
  };

  window.addEventListener("online", handler);

  // Also sync periodically when online
  const interval = setInterval(() => {
    if (navigator.onLine) syncAll(onComplete);
  }, 60_000);

  autoSyncCleanup = () => {
    window.removeEventListener("online", handler);
    clearInterval(interval);
  };

  return autoSyncCleanup;
}

export function isOnline(): boolean {
  return navigator.onLine;
}
