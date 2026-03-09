/**
 * Generic CRUD Service Layer — Abstracts data access from mock/localStorage.
 * When migrating to a real API, replace the mock implementations
 * without changing the consumer code.
 */

export interface CRUDService<T> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(item: T): T;
  update(id: string, partial: Partial<T>): T | undefined;
  delete(id: string): boolean;
  filter(predicate: (item: T) => boolean): T[];
  count(): number;
}

/**
 * Create a mock CRUD service backed by React state.
 * @param getter - Function returning the current array
 * @param setter - React state setter for the array
 */
export function createMockCRUDService<T extends { id: string }>(
  getter: () => T[],
  setter: React.Dispatch<React.SetStateAction<T[]>>
): CRUDService<T> {
  return {
    getAll: () => getter(),
    getById: (id: string) => getter().find((item) => item.id === id),
    create: (item: T) => {
      setter((prev) => [...prev, item]);
      return item;
    },
    update: (id: string, partial: Partial<T>) => {
      let updated: T | undefined;
      setter((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            updated = { ...item, ...partial };
            return updated;
          }
          return item;
        })
      );
      return updated;
    },
    delete: (id: string) => {
      setter((prev) => prev.filter((item) => item.id !== id));
      return true;
    },
    filter: (predicate: (item: T) => boolean) => getter().filter(predicate),
    count: () => getter().length,
  };
}

/**
 * Generate a unique ID with a given prefix.
 * Format: PREFIX-YYYYMMDD-NNN
 */
export function generateId(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `${prefix}-${dateStr}-${rand}`;
}

// ── Phase 2 — Optimistic Locking Utilities ──

/**
 * Check if a row's version matches the expected version before mutation.
 * Returns null on success, or an error message on conflict.
 */
export function checkVersion<T extends { version?: number }>(
  row: T,
  expectedVersion: number
): string | null {
  const currentVersion = row.version ?? 1;
  if (currentVersion !== expectedVersion) {
    return `Conflit de version: attendu v${expectedVersion}, trouvé v${currentVersion}. Veuillez rafraîchir.`;
  }
  return null;
}

/**
 * Apply a mutation with version increment.
 * Returns the updated item with version bumped.
 */
export function applyVersionedUpdate<T extends { version?: number }>(
  item: T,
  changes: Partial<T>
): T {
  return {
    ...item,
    ...changes,
    version: (item.version ?? 1) + 1,
  };
}
