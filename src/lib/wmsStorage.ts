/**
 * Phase 2 — Persistance minimale (démo).
 * Toujours mockData : pas d'API, données sauvegardées en localStorage et réinitialisables.
 *
 * Mode données : mock uniquement (USE_API = false). Les données viennent de @/data/mockData
 * et sont persistées en localStorage. Aucune couche API backend ; pour brancher une API
 * ultérieurement, ajouter un flag et des services qui remplacent load/save par des appels HTTP.
 */
export const USE_API = false;

const STORAGE_KEY = "flow-food-wms-state";
const VERSION_KEY = "flow-food-wms-version";
/**
 * Bump this number every time mock data changes significantly.
 * When the stored version doesn't match, localStorage is wiped
 * and fresh mock data is loaded.
 */
export const DATA_VERSION = 10;

export interface PersistedWMSState {
  grns: unknown[];
  purchaseOrders: unknown[];
  inventory: unknown[];
  stockAdjustments: unknown[];
  stockTransfers: unknown[];
  cycleCounts: unknown[];
  returns: unknown[];
  salesOrders: unknown[];
  customers: unknown[];
  invoices: unknown[];
  payments: unknown[];
  deliveryTrips: unknown[];
  alerts: unknown[];
  vendors: unknown[];
  warehouses: unknown[];
  warehouseLocations: unknown[];
  sectors: unknown[];
  productCategories: unknown[];
  subCategories: unknown[];
  unitsOfMeasure: unknown[];
  carriers: unknown[];
  barcodes: unknown[];
  products: unknown[];
  // Phase 2
  qcInspections: unknown[];
  putawayTasks: unknown[];
  stockMovements: unknown[];
  // Phase 18
  crossDocks: unknown[];
  kitRecipes: unknown[];
  kitOrders: unknown[];
  stockBlocks: unknown[];
  repackOrders: unknown[];
  // Phase 19
  lotBatches: unknown[];
  serialNumbers: unknown[];
  // Phase 20-22
  dockSlots: unknown[];
  truckCheckIns: unknown[];
  gateLogs: unknown[];
  putawayRules: unknown[];
  alertRules: unknown[];
  locationTypes: unknown[];
  integrations: unknown[];
  importJobs: unknown[];
  // Unit conversion system
  productUnitConversions: unknown[];
  productBaseUnits: unknown[];
  productDimensions: unknown[];
  warehouseProducts: unknown[];
  // Sprint 4: Audit trail
  productHistory: unknown[];
  // ERP Payment Terms
  paymentTerms: unknown[];
  // ERP Returns & Claims
  creditNotes: unknown[];
  qualityClaims: unknown[];
}

function isPersistedState(x: unknown): x is PersistedWMSState {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    Array.isArray(o.grns) &&
    Array.isArray(o.purchaseOrders) &&
    Array.isArray(o.inventory) &&
    Array.isArray(o.stockAdjustments) &&
    Array.isArray(o.stockTransfers) &&
    Array.isArray(o.cycleCounts) &&
    Array.isArray(o.returns) &&
    Array.isArray(o.salesOrders) &&
    Array.isArray(o.customers) &&
    Array.isArray(o.invoices) &&
    Array.isArray(o.payments) &&
    Array.isArray(o.deliveryTrips) &&
    Array.isArray(o.alerts) &&
    Array.isArray(o.vendors) &&
    Array.isArray(o.warehouses) &&
    Array.isArray(o.warehouseLocations) &&
    // New Phase 1 fields are optional for migration
    true
  );
}

export function loadPersistedState(): PersistedWMSState | null {
  try {
    // Check version — if mismatch, discard stale data
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== String(DATA_VERSION)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!isPersistedState(data)) return null;
    return data;
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedWMSState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
  } catch {
    // quota or disabled localStorage
  }
}
