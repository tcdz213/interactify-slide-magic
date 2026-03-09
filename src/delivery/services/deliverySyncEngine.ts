/**
 * Offline delivery sync engine — mock with localStorage
 */
export interface SyncQueueItem {
  id: string;
  type: "delivery_confirm" | "cash_collection" | "incident_report" | "signature_upload" | "photo_upload" | "gps_batch";
  payload: unknown;
  createdAt: string;
  synced: boolean;
}

const QUEUE_KEY = "delivery_sync_queue";

function getQueue(): SyncQueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(q: SyncQueueItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function addToQueue(type: SyncQueueItem["type"], payload: unknown): string {
  const queue = getQueue();
  const id = `SYNC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  queue.push({ id, type, payload, createdAt: new Date().toISOString(), synced: false });
  saveQueue(queue);
  return id;
}

export function getPendingItems(): SyncQueueItem[] {
  return getQueue().filter((i) => !i.synced);
}

export function markSynced(id: string) {
  const queue = getQueue();
  const item = queue.find((i) => i.id === id);
  if (item) {
    item.synced = true;
    saveQueue(queue);
  }
}

export function syncAll(): Promise<number> {
  return new Promise((resolve) => {
    const pending = getPendingItems();
    setTimeout(() => {
      pending.forEach((i) => markSynced(i.id));
      resolve(pending.length);
    }, 1000);
  });
}

export function getQueueStats() {
  const queue = getQueue();
  return {
    total: queue.length,
    pending: queue.filter((i) => !i.synced).length,
    synced: queue.filter((i) => i.synced).length,
  };
}
