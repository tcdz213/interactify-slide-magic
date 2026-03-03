// ============================================================
// Jawda — Mock Data Phase 20–22 (Multi-Industry — Algeria)
// Warehouses: Construction (Alger), Agroalimentaire (Oran), Technologie (Constantine)
// ============================================================

// ---------- Phase 20: Yard & Dock Management ----------
export type DockStatus = "Available" | "Occupied" | "Maintenance" | "Reserved";
export type TruckCheckInStatus = "Checked_In" | "Docked" | "Unloading" | "Loading" | "Checked_Out" | "Cancelled";
export type GateLogDirection = "In" | "Out";

export interface DockSlot {
  id: string;
  warehouseId: string;
  warehouseName: string;
  dockNumber: string;
  type: "Inbound" | "Outbound" | "Both";
  status: DockStatus;
  capacity: string;
  scheduledDate?: string;
  scheduledTime?: string;
  assignedTruckId?: string;
  notes: string;
}

export interface TruckCheckIn {
  id: string;
  warehouseId: string;
  warehouseName: string;
  truckPlate: string;
  driverName: string;
  driverPhone: string;
  carrierName: string;
  dockId: string;
  dockNumber: string;
  poId?: string;
  soId?: string;
  purpose: "Inbound" | "Outbound" | "Return";
  status: TruckCheckInStatus;
  checkInTime: string;
  checkOutTime?: string;
  sealNumber?: string;
  notes: string;
}

export interface GateLog {
  id: string;
  warehouseId: string;
  warehouseName: string;
  truckPlate: string;
  driverName: string;
  direction: GateLogDirection;
  timestamp: string;
  gateNumber: string;
  checkInId?: string;
  guardName: string;
  notes: string;
}

export const dockSlots: DockSlot[] = [
  // Alger Construction
  { id: "DOCK-01", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", dockNumber: "Quai 1", type: "Inbound", status: "Occupied", capacity: "40T", scheduledDate: "2026-02-24", scheduledTime: "08:00", assignedTruckId: "TCI-001", notes: "Déchargement ciment GICA" },
  { id: "DOCK-02", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", dockNumber: "Quai 2", type: "Both", status: "Available", capacity: "40T", notes: "" },
  { id: "DOCK-03", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", dockNumber: "Quai 3", type: "Outbound", status: "Reserved", capacity: "20T", scheduledDate: "2026-02-24", scheduledTime: "14:00", notes: "Réservé pour livraison COSIDER" },
  { id: "DOCK-04", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", dockNumber: "Quai 4", type: "Inbound", status: "Maintenance", capacity: "40T", notes: "Réparation rampe — retour prévu 26/02" },
  // Oran Food
  { id: "DOCK-05", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", dockNumber: "Quai 1", type: "Both", status: "Available", capacity: "30T", notes: "" },
  { id: "DOCK-06", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", dockNumber: "Quai 2", type: "Both", status: "Occupied", capacity: "30T", scheduledDate: "2026-02-24", scheduledTime: "06:00", assignedTruckId: "TCI-003", notes: "Chargement commande Supermarché Uno" },
  // Constantine Tech
  { id: "DOCK-07", warehouseId: "wh-constantine-tech", warehouseName: "Entrepôt Technologie Constantine", dockNumber: "Quai 1", type: "Both", status: "Available", capacity: "20T", notes: "Accès badge requis" },
];

export const truckCheckIns: TruckCheckIn[] = [
  { id: "TCI-001", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", truckPlate: "00100-114-16", driverName: "Boualem Saadi", driverPhone: "+213-55-12-34-56", carrierName: "TransAlger Express", dockId: "DOCK-01", dockNumber: "Quai 1", poId: "PO-2026-0146", purpose: "Inbound", status: "Unloading", checkInTime: "2026-02-24T07:45:00", sealNumber: "SEAL-6001", notes: "Carrelage + briques SEROR — livraison partielle restante" },
  { id: "TCI-002", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", truckPlate: "00245-128-16", driverName: "Moussa Krim", driverPhone: "+213-55-98-76-54", carrierName: "TransAlger Express", dockId: "DOCK-03", dockNumber: "Quai 3", soId: "ORD-20260222-001", purpose: "Outbound", status: "Loading", checkInTime: "2026-02-24T13:30:00", notes: "Chargement ciment pour COSIDER" },
  { id: "TCI-003", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", truckPlate: "00512-310-31", driverName: "Rachid Benmohamed", driverPhone: "+213-55-44-33-22", carrierName: "Ouest Logistique", dockId: "DOCK-06", dockNumber: "Quai 2", soId: "ORD-20260223-004", purpose: "Outbound", status: "Checked_Out", checkInTime: "2026-02-24T05:30:00", checkOutTime: "2026-02-24T07:30:00", notes: "Livraison complète Supermarché Uno" },
  { id: "TCI-004", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", truckPlate: "00100-114-16", driverName: "Boualem Saadi", driverPhone: "+213-55-12-34-56", carrierName: "TransAlger Express", dockId: "DOCK-01", dockNumber: "Quai 1", poId: "PO-2026-0145", purpose: "Inbound", status: "Checked_Out", checkInTime: "2026-02-13T07:00:00", checkOutTime: "2026-02-13T11:30:00", sealNumber: "SEAL-5990", notes: "Livraison complète ciment + plâtre" },
];

export const gateLogs: GateLog[] = [
  { id: "GL-001", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", truckPlate: "00100-114-16", driverName: "Boualem Saadi", direction: "In", timestamp: "2026-02-24T07:40:00", gateNumber: "Porte A", checkInId: "TCI-001", guardName: "Yahia Meziane", notes: "" },
  { id: "GL-002", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", truckPlate: "00245-128-16", driverName: "Moussa Krim", direction: "In", timestamp: "2026-02-24T13:25:00", gateNumber: "Porte A", checkInId: "TCI-002", guardName: "Yahia Meziane", notes: "" },
  { id: "GL-003", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", truckPlate: "00512-310-31", driverName: "Rachid Benmohamed", direction: "In", timestamp: "2026-02-24T05:25:00", gateNumber: "Porte 1", checkInId: "TCI-003", guardName: "Anis Boukhari", notes: "" },
  { id: "GL-004", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", truckPlate: "00512-310-31", driverName: "Rachid Benmohamed", direction: "Out", timestamp: "2026-02-24T07:35:00", gateNumber: "Porte 1", checkInId: "TCI-003", guardName: "Anis Boukhari", notes: "Départ après chargement" },
  { id: "GL-005", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", truckPlate: "00100-114-16", driverName: "Boualem Saadi", direction: "In", timestamp: "2026-02-13T06:55:00", gateNumber: "Porte A", checkInId: "TCI-004", guardName: "Yahia Meziane", notes: "" },
  { id: "GL-006", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", truckPlate: "00100-114-16", driverName: "Boualem Saadi", direction: "Out", timestamp: "2026-02-13T11:35:00", gateNumber: "Porte B", checkInId: "TCI-004", guardName: "Yahia Meziane", notes: "Départ après déchargement" },
];

// ---------- Phase 21: Advanced Configuration ----------
export type PutawayRulePriority = "High" | "Medium" | "Low";

export interface PutawayRule {
  id: string;
  name: string;
  warehouseId: string;
  warehouseName: string;
  condition: string;
  conditionType: "Category" | "Vendor" | "Temperature" | "Weight" | "Custom";
  conditionValue: string;
  targetZone: string;
  targetLocationType: string;
  priority: PutawayRulePriority;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  notes: string;
}

export interface AlertRule {
  id: string;
  name: string;
  warehouseId: string;
  warehouseName: string;
  metric: "StockLevel" | "ExpiryDate" | "Temperature" | "OrderDelay" | "CycleCountVariance" | "Custom";
  condition: "Below" | "Above" | "Equals" | "Within" | "Overdue";
  threshold: string;
  channel: "InApp" | "Email" | "Both";
  recipients: string;
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
  createdBy: string;
  createdAt: string;
  notes: string;
}

export interface LocationType {
  id: string;
  name: string;
  code: string;
  description: string;
  allowPicking: boolean;
  allowPutaway: boolean;
  allowStorage: boolean;
  isQuarantine: boolean;
  temperatureControlled: boolean;
  maxWeight?: number;
  color: string;
  isActive: boolean;
}

export const putawayRules: PutawayRule[] = [
  // Construction
  { id: "PAR-001", name: "Ciment → Zone A (Sec)", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", condition: "Catégorie = Ciment & Liants", conditionType: "Category", conditionValue: "Ciment & Liants", targetZone: "A", targetLocationType: "Dry", priority: "High", isActive: true, createdBy: "Karim Ben Ali", createdAt: "2025-12-01", notes: "Zone sèche impérative — humidité = perte" },
  { id: "PAR-002", name: "Acier → Zone B (Couvert)", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", condition: "Catégorie = Acier & Ferronnerie", conditionType: "Category", conditionValue: "Acier & Ferronnerie", targetZone: "B", targetLocationType: "Ambient", priority: "High", isActive: true, createdBy: "Karim Ben Ali", createdAt: "2025-12-01", notes: "Protection contre rouille" },
  { id: "PAR-003", name: "Peinture → Zone C (Ventilé)", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", condition: "Catégorie = Peinture", conditionType: "Category", conditionValue: "Peinture", targetZone: "C", targetLocationType: "Dry", priority: "Medium", isActive: true, createdBy: "Karim Ben Ali", createdAt: "2025-12-01", notes: "Zone ventilée — produits inflammables" },
  // Food
  { id: "PAR-004", name: "Produits laitiers → Zone B (Froid)", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", condition: "Catégorie = Produits laitiers", conditionType: "Temperature", conditionValue: "2-8°C", targetZone: "B", targetLocationType: "Chilled", priority: "High", isActive: true, createdBy: "Samir Rafik", createdAt: "2025-12-01", notes: "Chaîne du froid obligatoire — HACCP" },
  { id: "PAR-005", name: "Conserves → Zone D (Sec)", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", condition: "Catégorie = Conserves", conditionType: "Category", conditionValue: "Conserves", targetZone: "D", targetLocationType: "Dry", priority: "Medium", isActive: true, createdBy: "Samir Rafik", createdAt: "2025-12-01", notes: "" },
  // Tech
  { id: "PAR-006", name: "High-value → Zone A (Sécurisée)", warehouseId: "wh-constantine-tech", warehouseName: "Entrepôt Technologie Constantine", condition: "Valeur unitaire > 50000 DZD", conditionType: "Custom", conditionValue: ">50000", targetZone: "A", targetLocationType: "Ambient", priority: "High", isActive: true, createdBy: "Hassan Nour", createdAt: "2025-12-01", notes: "Zone accès badge — caméras 24/7" },
];

export const alertRules: AlertRule[] = [
  { id: "ALR-001", name: "Stock bas — Ciment", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", metric: "StockLevel", condition: "Below", threshold: "500", channel: "Both", recipients: "Karim Ben Ali, Ahmed Mansour", isActive: true, lastTriggered: "2026-02-22", triggerCount: 5, createdBy: "Karim Ben Ali", createdAt: "2025-12-01", notes: "Saison haute BTP — seuil critique" },
  { id: "ALR-002", name: "DLC < 30 jours", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", metric: "ExpiryDate", condition: "Within", threshold: "30 jours", channel: "Both", recipients: "Samir Rafik, Mourad Ziani", isActive: true, lastTriggered: "2026-02-24", triggerCount: 18, createdBy: "Samir Rafik", createdAt: "2025-12-01", notes: "Critique HACCP — FEFO obligatoire" },
  { id: "ALR-003", name: "Variance comptage > 2%", warehouseId: "wh-constantine-tech", warehouseName: "Entrepôt Technologie Constantine", metric: "CycleCountVariance", condition: "Above", threshold: "2%", channel: "Email", recipients: "Hassan Nour, Ahmed Mansour", isActive: true, lastTriggered: "2026-02-15", triggerCount: 1, createdBy: "Hassan Nour", createdAt: "2026-01-01", notes: "Enquête obligatoire — high-value items" },
  { id: "ALR-004", name: "Retard commande > 48h", warehouseId: "wh-alger-construction", warehouseName: "Entrepôt Construction Alger", metric: "OrderDelay", condition: "Overdue", threshold: "48h", channel: "Both", recipients: "Ahmed Mansour", isActive: true, triggerCount: 2, createdBy: "Ahmed Mansour", createdAt: "2026-01-05", notes: "Impact chantier = pénalités" },
  { id: "ALR-005", name: "Température chambre froide", warehouseId: "wh-oran-food", warehouseName: "Entrepôt Agroalimentaire Oran", metric: "Temperature", condition: "Above", threshold: "8°C", channel: "Both", recipients: "Samir Rafik", isActive: true, lastTriggered: "2026-02-10", triggerCount: 3, createdBy: "Samir Rafik", createdAt: "2025-12-15", notes: "Alerte critique — rupture chaîne du froid" },
];

export const locationTypes: LocationType[] = [
  { id: "LT-001", name: "Bulk Storage", code: "BULK", description: "Stockage en vrac — ciment, sable, agrégats", allowPicking: false, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: false, maxWeight: 50000, color: "#3b82f6", isActive: true },
  { id: "LT-002", name: "Picking", code: "PICK", description: "Zone de prélèvement pour préparation commandes", allowPicking: true, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: false, color: "#22c55e", isActive: true },
  { id: "LT-003", name: "Staging", code: "STAG", description: "Zone de transit temporaire", allowPicking: false, allowPutaway: false, allowStorage: false, isQuarantine: false, temperatureControlled: false, color: "#f59e0b", isActive: true },
  { id: "LT-004", name: "Quarantine", code: "QUAR", description: "Zone d'isolation — QC en attente", allowPicking: false, allowPutaway: true, allowStorage: true, isQuarantine: true, temperatureControlled: false, color: "#ef4444", isActive: true },
  { id: "LT-005", name: "Dock", code: "DOCK", description: "Quai de chargement/déchargement", allowPicking: false, allowPutaway: false, allowStorage: false, isQuarantine: false, temperatureControlled: false, color: "#8b5cf6", isActive: true },
  { id: "LT-006", name: "Cold Storage", code: "COLD", description: "Stockage réfrigéré (2-8°C) — produits laitiers", allowPicking: true, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: true, color: "#06b6d4", isActive: true },
  { id: "LT-007", name: "Frozen", code: "FRZN", description: "Stockage surgelé (-18°C)", allowPicking: true, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: true, color: "#6366f1", isActive: true },
  { id: "LT-008", name: "Secure", code: "SECU", description: "Zone sécurisée — accès badge, caméras (high-value tech)", allowPicking: true, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: false, maxWeight: 5000, color: "#dc2626", isActive: true },
];

// ---------- Phase 22: Integrations ----------
export type IntegrationStatus = "Connected" | "Disconnected" | "Error" | "Syncing";
export type IntegrationType = "ERP" | "E-Commerce" | "Carrier" | "Accounting" | "Custom";

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  provider: string;
  status: IntegrationStatus;
  lastSync?: string;
  syncFrequency: string;
  endpoint: string;
  apiKeyConfigured: boolean;
  errorCount: number;
  lastError?: string;
  recordsSynced: number;
  createdAt: string;
  isActive: boolean;
  notes: string;
}

export interface ImportJob {
  id: string;
  name: string;
  type: "Products" | "Inventory" | "Vendors" | "Customers" | "PurchaseOrders" | "Locations";
  fileName: string;
  status: "Pending" | "Processing" | "Completed" | "Failed" | "Scheduled";
  totalRows: number;
  processedRows: number;
  errorRows: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  mapping: Record<string, string>;
  notes: string;
}

export const integrations: Integration[] = [
  { id: "INT-001", name: "SAP ERP", type: "ERP", provider: "SAP", status: "Connected", lastSync: "2026-02-24T08:00:00", syncFrequency: "Toutes les 4h", endpoint: "https://sap.jawda.dz/api/v1", apiKeyConfigured: true, errorCount: 0, recordsSynced: 15420, createdAt: "2025-12-01", isActive: true, notes: "Sync articles, commandes, factures — 3 entrepôts" },
  { id: "INT-002", name: "Jumia Marketplace", type: "E-Commerce", provider: "Jumia", status: "Connected", lastSync: "2026-02-24T07:30:00", syncFrequency: "Toutes les heures", endpoint: "https://api.jumia.dz/v2", apiKeyConfigured: true, errorCount: 2, lastError: "Timeout sur sync produits 23/02 à 15h", recordsSynced: 3210, createdAt: "2026-01-15", isActive: true, notes: "Sync produits tech uniquement" },
  { id: "INT-003", name: "DHL Express", type: "Carrier", provider: "DHL", status: "Disconnected", syncFrequency: "Temps réel", endpoint: "https://api.dhl.com/track/v2", apiKeyConfigured: false, errorCount: 0, recordsSynced: 0, createdAt: "2026-02-20", isActive: false, notes: "En attente clé API — contrat en cours" },
  { id: "INT-004", name: "SAGE Comptabilité", type: "Accounting", provider: "SAGE", status: "Error", lastSync: "2026-02-23T22:00:00", syncFrequency: "Quotidien", endpoint: "https://sage.flow-erp.dz/api", apiKeyConfigured: true, errorCount: 5, lastError: "Erreur auth token expiré — renouveler", recordsSynced: 8900, createdAt: "2025-12-05", isActive: true, notes: "Sync factures et paiements — 3 secteurs" },
  { id: "INT-005", name: "Yalidine Shipping", type: "Carrier", provider: "Yalidine", status: "Connected", lastSync: "2026-02-24T06:00:00", syncFrequency: "Toutes les 2h", endpoint: "https://api.yalidine.com/v1", apiKeyConfigured: true, errorCount: 0, recordsSynced: 1850, createdAt: "2026-02-01", isActive: true, notes: "Tracking colis tech — Constantine" },
];

export const importJobs: ImportJob[] = [
  { id: "IMP-001", name: "Import produits Construction", type: "Products", fileName: "produits_construction_feb2026.csv", status: "Completed", totalRows: 85, processedRows: 85, errorRows: 0, startedAt: "2026-02-10T10:00:00", completedAt: "2026-02-10T10:01:00", createdBy: "Karim Ben Ali", createdAt: "2026-02-10", mapping: { "nom": "name", "sku": "sku", "prix": "unitCost" }, notes: "" },
  { id: "IMP-002", name: "MAJ stock alimentaire Oran", type: "Inventory", fileName: "inventory_snapshot_oran.csv", status: "Completed", totalRows: 320, processedRows: 320, errorRows: 0, startedAt: "2026-02-22T14:00:00", completedAt: "2026-02-22T14:03:00", createdBy: "Samir Rafik", createdAt: "2026-02-22", mapping: { "produit": "productId", "qte": "quantity", "emplacement": "locationId" }, notes: "" },
  { id: "IMP-003", name: "Import fournisseurs tech", type: "Vendors", fileName: "new_vendors_tech_q1.csv", status: "Failed", totalRows: 15, processedRows: 8, errorRows: 7, startedAt: "2026-02-23T09:00:00", completedAt: "2026-02-23T09:01:00", createdBy: "Hassan Nour", createdAt: "2026-02-23", mapping: { "nom": "name", "contact": "contact", "tel": "phone" }, notes: "Erreur format téléphone — fichier à corriger" },
  { id: "IMP-004", name: "Import commandes Jumia", type: "PurchaseOrders", fileName: "jumia_orders_daily.csv", status: "Scheduled", totalRows: 0, processedRows: 0, errorRows: 0, scheduledAt: "2026-02-25T22:00:00", createdBy: "Système", createdAt: "2026-02-24", mapping: { "order_id": "id", "product": "productName", "qty": "quantity" }, notes: "Import automatique quotidien" },
];
