/**
 * Mock Audit Log Service — localStorage-persisted, immutable audit trail.
 * Phase 4.4 completion: real persistence for audit entries.
 */

export interface AuditDiffField {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  module: string;
  entityId: string;
  performedBy: string;
  details: string;
  diff?: AuditDiffField[];
  metadata?: {
    ip?: string;
    device?: string;
    gps?: { lat: number; lng: number };
    offlineQueuedAt?: number;
  };
}

const STORAGE_KEY = "jawda-audit-log";

function loadEntries(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: AuditEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota exceeded
  }
}

/** Append an immutable audit entry. */
export function logAudit(
  entry: Omit<AuditEntry, "id" | "timestamp">
): AuditEntry {
  const record: AuditEntry = {
    ...entry,
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  const entries = loadEntries();
  entries.unshift(record); // newest first
  // Keep last 500 entries max
  if (entries.length > 500) entries.length = 500;
  saveEntries(entries);
  return record;
}

/** Get all audit entries (newest first). */
export function getAuditLog(): AuditEntry[] {
  return loadEntries();
}

/** Get entries for a specific entity. */
export function getEntityAudit(entityType: string, entityId: string): AuditEntry[] {
  return loadEntries().filter(
    (e) => e.module === entityType && e.entityId === entityId
  );
}

/** Clear all entries (admin only). */
export function clearAuditLog(): void {
  localStorage.removeItem(STORAGE_KEY);
}
