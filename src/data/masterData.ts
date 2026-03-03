// ============================================================
// Domain: Master Data — Products, Vendors, Warehouses, Locations,
// Categories, UOM, Carriers, Barcodes
// ============================================================

// ---------- Helpers ----------
export const currency = (v: number) =>
  v.toLocaleString("fr-DZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " DZD";
export const pct = (v: number) => v.toFixed(1) + "%";

// ---------- Products ----------
export interface Product {
  id: string; name: string; sku: string; category: string;
  uom: string; unitCost: number; unitPrice: number; reorderPoint: number;
  isActive: boolean;
  isDeleted?: boolean;
  baseUnit?: string;      // R1: canonical base unit (e.g. "kg", "Pièce")
  baseUnitAbbr?: string;  // R1: abbreviation (e.g. "kg", "Pce")
  baseUnitId?: string;    // FK → UnitOfMeasure.id (new refactoring)
}

export const products: Product[] = [
  // ── Construction (Alger) — P001-P008, P025-P032 ──
  { id: "P001", name: "Ciment CPJ 42.5 (50kg)", sku: "CONST-001", category: "Ciment & Liants", uom: "Sac", unitCost: 850, unitPrice: 1200, reorderPoint: 500, isActive: true },
  { id: "P002", name: "Fer à béton Ø12 (barre 12m)", sku: "CONST-002", category: "Acier & Ferronnerie", uom: "Barre", unitCost: 2400, unitPrice: 3200, reorderPoint: 200, isActive: true },
  { id: "P003", name: "Carrelage 40x40 (m²)", sku: "CONST-003", category: "Revêtement", uom: "m²", unitCost: 1500, unitPrice: 2200, reorderPoint: 300, isActive: true },
  { id: "P004", name: "Sable lavé 0/3 (tonne)", sku: "CONST-004", category: "Agrégats", uom: "Tonne", unitCost: 3500, unitPrice: 5000, reorderPoint: 100, isActive: true },
  { id: "P005", name: "Brique rouge 10x20x30", sku: "CONST-005", category: "Maçonnerie", uom: "Palette (200)", unitCost: 8000, unitPrice: 12000, reorderPoint: 80, isActive: true },
  { id: "P006", name: "Tuyau PVC Ø110 (4m)", sku: "CONST-006", category: "Plomberie", uom: "Barre", unitCost: 1800, unitPrice: 2600, reorderPoint: 150, isActive: true },
  { id: "P007", name: "Peinture acrylique 25L", sku: "CONST-007", category: "Peinture", uom: "Seau", unitCost: 4500, unitPrice: 6500, reorderPoint: 100, isActive: true },
  { id: "P008", name: "Plâtre fin 40kg", sku: "CONST-008", category: "Ciment & Liants", uom: "Sac", unitCost: 650, unitPrice: 950, reorderPoint: 300, isActive: true },
  { id: "P025", name: "Gravier concassé 5/15 (tonne)", sku: "CONST-009", category: "Agrégats", uom: "Tonne", unitCost: 4200, unitPrice: 6000, reorderPoint: 80, isActive: true },
  { id: "P026", name: "Tube cuivre Ø15 (barre 5m)", sku: "CONST-010", category: "Plomberie", uom: "Barre", unitCost: 3200, unitPrice: 4800, reorderPoint: 100, isActive: true },
  { id: "P027", name: "Câble électrique 2.5mm² (100m)", sku: "CONST-011", category: "Électricité", uom: "Bobine", unitCost: 2800, unitPrice: 4200, reorderPoint: 60, isActive: true },
  { id: "P028", name: "Membrane bitume 4mm (rouleau 10m²)", sku: "CONST-012", category: "Étanchéité", uom: "Rouleau", unitCost: 3500, unitPrice: 5200, reorderPoint: 50, isActive: true },
  { id: "P029", name: "Porte intérieure bois isoplane", sku: "CONST-013", category: "Menuiserie", uom: "Pièce", unitCost: 6500, unitPrice: 9500, reorderPoint: 30, isActive: true },
  { id: "P030", name: "Vitre double vitrage 4/16/4 (m²)", sku: "CONST-014", category: "Vitrerie", uom: "m²", unitCost: 5500, unitPrice: 8000, reorderPoint: 50, isActive: true },
  { id: "P031", name: "Coude PVC 90° Ø110", sku: "CONST-015", category: "Plomberie", uom: "Pièce", unitCost: 120, unitPrice: 250, reorderPoint: 200, isActive: true },
  { id: "P032", name: "Parpaing creux 20x20x50", sku: "CONST-016", category: "Maçonnerie", uom: "Unité", unitCost: 55, unitPrice: 95, reorderPoint: 1000, isActive: true },
  // ── Agroalimentaire (Oran) — P009-P016, P033-P040 ──
  { id: "P009", name: "Farine de blé T55 (50kg)", sku: "FOOD-001", category: "Farines & Céréales", uom: "Sac", unitCost: 3800, unitPrice: 4800, reorderPoint: 400, isActive: true },
  { id: "P010", name: "Huile de tournesol 5L", sku: "FOOD-002", category: "Huiles & Corps gras", uom: "Bidon", unitCost: 1200, unitPrice: 1650, reorderPoint: 500, isActive: true },
  { id: "P011", name: "Tomate concentrée 800g", sku: "FOOD-003", category: "Conserves", uom: "Carton (24)", unitCost: 2400, unitPrice: 3200, reorderPoint: 300, isActive: true },
  { id: "P012", name: "Sucre blanc 1kg", sku: "FOOD-004", category: "Sucre & Confiserie", uom: "Sac (50kg)", unitCost: 5500, unitPrice: 7200, reorderPoint: 200, isActive: true },
  { id: "P013", name: "Lait UHT 1L", sku: "FOOD-005", category: "Produits laitiers", uom: "Carton (12)", unitCost: 420, unitPrice: 600, reorderPoint: 600, isActive: true },
  { id: "P014", name: "Pâtes alimentaires 500g", sku: "FOOD-006", category: "Pâtes & Semoule", uom: "Carton (20)", unitCost: 1800, unitPrice: 2400, reorderPoint: 350, isActive: true },
  { id: "P015", name: "Riz basmati 5kg", sku: "FOOD-007", category: "Farines & Céréales", uom: "Sac", unitCost: 2200, unitPrice: 3000, reorderPoint: 250, isActive: true },
  { id: "P016", name: "Sardines en conserve 125g", sku: "FOOD-008", category: "Conserves", uom: "Carton (48)", unitCost: 3600, unitPrice: 4800, reorderPoint: 200, isActive: true },
  { id: "P033", name: "Semoule fine 25kg", sku: "FOOD-009", category: "Farines & Céréales", uom: "Sac", unitCost: 2200, unitPrice: 3000, reorderPoint: 200, isActive: true },
  { id: "P034", name: "Thon en conserve 160g", sku: "FOOD-010", category: "Conserves", uom: "Carton (48)", unitCost: 4800, unitPrice: 6200, reorderPoint: 150, isActive: true },
  { id: "P035", name: "Margarine Fleurial 500g", sku: "FOOD-011", category: "Huiles & Corps gras", uom: "Carton (24)", unitCost: 3600, unitPrice: 4800, reorderPoint: 200, isActive: true },
  { id: "P036", name: "Eau minérale Ifri 1.5L (pack 6)", sku: "FOOD-012", category: "Boissons", uom: "Pack", unitCost: 180, unitPrice: 280, reorderPoint: 500, isActive: true },
  { id: "P037", name: "Café moulu Tassili 250g", sku: "FOOD-013", category: "Boissons", uom: "Carton (24)", unitCost: 7200, unitPrice: 9600, reorderPoint: 150, isActive: true },
  { id: "P038", name: "Lentilles vertes 1kg", sku: "FOOD-014", category: "Légumineuses", uom: "Sac (25kg)", unitCost: 6500, unitPrice: 8500, reorderPoint: 100, isActive: true },
  { id: "P039", name: "Harissa CAP BON 380g", sku: "FOOD-015", category: "Condiments", uom: "Carton (24)", unitCost: 4200, unitPrice: 5800, reorderPoint: 120, isActive: true },
  { id: "P040", name: "Confiture Saida abricot 430g", sku: "FOOD-016", category: "Conserves", uom: "Carton (12)", unitCost: 2800, unitPrice: 3800, reorderPoint: 100, isActive: true },
  // ── Technologie (Constantine) — P017-P024, P041-P050 ──
  { id: "P017", name: "Laptop HP ProBook 450", sku: "TECH-001", category: "Ordinateurs", uom: "Pièce", unitCost: 95000, unitPrice: 135000, reorderPoint: 30, isActive: true },
  { id: "P018", name: "Smartphone Samsung A54", sku: "TECH-002", category: "Téléphonie", uom: "Pièce", unitCost: 42000, unitPrice: 58000, reorderPoint: 50, isActive: true },
  { id: "P019", name: "Câble réseau Cat6 (100m)", sku: "TECH-003", category: "Câblage & Réseau", uom: "Bobine", unitCost: 3500, unitPrice: 5200, reorderPoint: 80, isActive: true },
  { id: "P020", name: "Serveur Dell PowerEdge T150", sku: "TECH-004", category: "Serveurs", uom: "Pièce", unitCost: 250000, unitPrice: 350000, reorderPoint: 10, isActive: true },
  { id: "P021", name: "Imprimante HP LaserJet Pro", sku: "TECH-005", category: "Impression", uom: "Pièce", unitCost: 38000, unitPrice: 52000, reorderPoint: 20, isActive: true },
  { id: "P022", name: "Tablette Lenovo Tab M10", sku: "TECH-006", category: "Tablettes", uom: "Pièce", unitCost: 28000, unitPrice: 39000, reorderPoint: 40, isActive: true },
  { id: "P023", name: "Routeur WiFi 6 TP-Link", sku: "TECH-007", category: "Câblage & Réseau", uom: "Pièce", unitCost: 8500, unitPrice: 12500, reorderPoint: 60, isActive: true },
  { id: "P024", name: "Onduleur APC 1500VA", sku: "TECH-008", category: "Énergie", uom: "Pièce", unitCost: 18000, unitPrice: 26000, reorderPoint: 25, isActive: true },
  { id: "P041", name: "Moniteur Dell 24\" FHD", sku: "TECH-009", category: "Écrans", uom: "Pièce", unitCost: 22000, unitPrice: 32000, reorderPoint: 30, isActive: true },
  { id: "P042", name: "Kit clavier+souris sans fil Logitech", sku: "TECH-010", category: "Périphériques", uom: "Kit", unitCost: 3500, unitPrice: 5500, reorderPoint: 50, isActive: true },
  { id: "P043", name: "SSD Samsung 512GB SATA", sku: "TECH-011", category: "Stockage", uom: "Pièce", unitCost: 6500, unitPrice: 9500, reorderPoint: 60, isActive: true },
  { id: "P044", name: "Câble HDMI 2.0 (3m)", sku: "TECH-012", category: "Câblage & Réseau", uom: "Pièce", unitCost: 800, unitPrice: 1500, reorderPoint: 100, isActive: true },
  { id: "P045", name: "Vidéoprojecteur Epson EB-X51", sku: "TECH-013", category: "Impression", uom: "Pièce", unitCost: 65000, unitPrice: 92000, reorderPoint: 10, isActive: true },
  { id: "P046", name: "Disque dur externe Seagate 2TB", sku: "TECH-014", category: "Stockage", uom: "Pièce", unitCost: 8500, unitPrice: 12500, reorderPoint: 40, isActive: true },
  { id: "P047", name: "Casque audio Jabra Evolve2", sku: "TECH-015", category: "Audio", uom: "Pièce", unitCost: 12000, unitPrice: 18000, reorderPoint: 25, isActive: true },
  { id: "P048", name: "Switch TP-Link 24 ports Gigabit", sku: "TECH-016", category: "Câblage & Réseau", uom: "Pièce", unitCost: 15000, unitPrice: 22000, reorderPoint: 15, isActive: true },
  { id: "P049", name: "Caméra IP Hikvision 4MP", sku: "TECH-017", category: "Sécurité", uom: "Pièce", unitCost: 9000, unitPrice: 14000, reorderPoint: 40, isActive: true },
  { id: "P050", name: "Panneau solaire 300W monocristallin", sku: "TECH-018", category: "Énergie", uom: "Pièce", unitCost: 25000, unitPrice: 38000, reorderPoint: 20, isActive: false },
  // ── Construction — Carrelage dimensionnel (P051-P053) ──
  { id: "P051", name: "Carrelage grès cérame 50×50", sku: "CONST-017", category: "Revêtement", uom: "m²", unitCost: 1800, unitPrice: 2800, reorderPoint: 200, isActive: true },
  { id: "P052", name: "Faïence murale 35×35", sku: "CONST-018", category: "Revêtement", uom: "m²", unitCost: 1200, unitPrice: 1900, reorderPoint: 300, isActive: true },
  { id: "P053", name: "Carrelage porcelaine 60×60", sku: "CONST-019", category: "Revêtement", uom: "m²", unitCost: 2500, unitPrice: 3800, reorderPoint: 150, isActive: true },
];

// ---------- Vendors ----------
export type VendorPaymentTerms = "Comptant" | "Net_15" | "Net_30" | "Net_45" | "Net_60" | "30_jours_fin_mois";

export interface Vendor {
  id: string; name: string; contact: string; phone: string; email: string;
  city: string; address?: string; rating: number;
  status: "Active" | "Inactive" | "Suspended";
  totalPOs: number; totalValue: number; avgLeadDays: number;
  lastDelivery: string; paymentTerms?: VendorPaymentTerms;
}

export const vendors: Vendor[] = [
  { id: "V001", name: "GICA Cimenterie", contact: "Amine Belaïd", phone: "+213-21-45-67-89", email: "commercial@gica.dz", city: "Alger", address: "Zone Industrielle Rouiba, Alger", rating: 4.8, status: "Active", totalPOs: 180, totalValue: 85000000, avgLeadDays: 2, lastDelivery: "2026-02-23", paymentTerms: "Net_30" },
  { id: "V002", name: "ArcelorMittal Annaba", contact: "Karim Mechri", phone: "+213-38-86-45-00", email: "ventes@arcelormittal.dz", city: "Annaba", address: "Zone Sidérurgique, Annaba", rating: 4.5, status: "Active", totalPOs: 120, totalValue: 62000000, avgLeadDays: 5, lastDelivery: "2026-02-20", paymentTerms: "Net_45" },
  { id: "V003", name: "Céramique SEROR", contact: "Farid Hamadi", phone: "+213-31-34-56-78", email: "export@seror.dz", city: "Constantine", address: "Zone Industrielle Palma", rating: 4.2, status: "Active", totalPOs: 95, totalValue: 38000000, avgLeadDays: 4, lastDelivery: "2026-02-22", paymentTerms: "Net_30" },
  { id: "V004", name: "Cevital Agro", contact: "Mohammed Salhi", phone: "+213-21-56-78-90", email: "b2b@cevital.dz", city: "Béjaïa", address: "Port de Béjaïa", rating: 4.7, status: "Active", totalPOs: 210, totalValue: 95000000, avgLeadDays: 3, lastDelivery: "2026-02-24", paymentTerms: "Net_30" },
  { id: "V005", name: "SIM Blida (Groupe)", contact: "Nabil Khelifi", phone: "+213-25-43-21-00", email: "commandes@sim.dz", city: "Blida", address: "Zone Industrielle Ouled Yaïch", rating: 4.3, status: "Active", totalPOs: 165, totalValue: 72000000, avgLeadDays: 2, lastDelivery: "2026-02-23", paymentTerms: "Net_30" },
  { id: "V006", name: "Ifri (IBSA)", contact: "Rachid Oulaid", phone: "+213-34-28-10-00", email: "distribution@ifri.dz", city: "Tizi Ouzou", address: "Ighzer Amokrane, Ifri Ouzellaguen", rating: 4.1, status: "Active", totalPOs: 88, totalValue: 28000000, avgLeadDays: 3, lastDelivery: "2026-02-21", paymentTerms: "Comptant" },
  { id: "V007", name: "Condor Electronics", contact: "Yacine Benamar", phone: "+213-36-93-50-00", email: "pro@condor.dz", city: "Bordj Bou Arréridj", address: "Zone Industrielle El Harrach", rating: 4.4, status: "Active", totalPOs: 140, totalValue: 180000000, avgLeadDays: 4, lastDelivery: "2026-02-22", paymentTerms: "Net_30" },
  { id: "V008", name: "Iris Technologies", contact: "Sofiane Djabri", phone: "+213-25-49-88-00", email: "ventes@iris.dz", city: "Sétif", address: "Zone Industrielle, Sétif", rating: 4.0, status: "Active", totalPOs: 75, totalValue: 95000000, avgLeadDays: 5, lastDelivery: "2026-02-19", paymentTerms: "Net_45" },
];

// ---------- Warehouses & Locations ----------
export type WarehouseType = "construction" | "food" | "technology" | "general";
export type WarehouseStatus = "active" | "inactive" | "maintenance";

export interface Warehouse {
  id: string; name: string; shortCode: string; type: WarehouseType;
  city: string; wilaya: string; zones: number; capacity: number; utilization: number;
  address: string; manager: string; phone: string; speciality: string;
  status: WarehouseStatus; temperature?: string;
  certifications?: string[]; security?: string;
}

export const warehouses: Warehouse[] = [
  { id: "wh-alger-construction", shortCode: "WH-ALG-CONST", name: "Entrepôt Construction Alger", type: "construction", city: "Alger", wilaya: "Alger (16)", zones: 6, capacity: 5000, utilization: 74, address: "Zone Industrielle Rouiba, Alger", manager: "Karim Ben Ali", phone: "+213-21-100-200", speciality: "Matériaux de construction, ciment, acier, carrelage", status: "active" },
  { id: "wh-oran-food", shortCode: "WH-ORA-FOOD", name: "Entrepôt Agroalimentaire Oran", type: "food", city: "Oran", wilaya: "Oran (31)", zones: 5, capacity: 3500, utilization: 68, address: "Zone d'Activité Hassi Ameur, Oran", manager: "Samir Rafik", phone: "+213-41-200-300", speciality: "Produits alimentaires, céréales, huiles, conserves", status: "active", temperature: "Ambient + Cold chain (2–8°C)", certifications: ["HACCP", "ISO 22000"] },
  { id: "wh-constantine-tech", shortCode: "WH-CST-TECH", name: "Entrepôt Technologie Constantine", type: "technology", city: "Constantine", wilaya: "Constantine (25)", zones: 4, capacity: 2000, utilization: 81, address: "Zone Industrielle Palma, Constantine", manager: "Hassan Nour", phone: "+213-31-300-400", speciality: "Électronique, informatique, télécoms, composants", status: "active", security: "High (caméras, alarme, accès badge)" },
];

export interface WarehouseLocation {
  id: string; warehouseId: string; zone: string; aisle: string; rack: string; level: string;
  type: "Ambient" | "Chilled" | "Frozen" | "Dry"; capacity: number; used: number;
  status: "Available" | "Full" | "Reserved" | "Maintenance";
}

export const warehouseLocations: WarehouseLocation[] = [
  // ── Alger Construction ──
  { id: "ALG-A1-01", warehouseId: "wh-alger-construction", zone: "A", aisle: "1", rack: "01", level: "1", type: "Dry", capacity: 800, used: 650, status: "Available" },
  { id: "ALG-A1-02", warehouseId: "wh-alger-construction", zone: "A", aisle: "1", rack: "02", level: "1", type: "Dry", capacity: 800, used: 720, status: "Available" },
  { id: "ALG-B1-01", warehouseId: "wh-alger-construction", zone: "B", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 600, used: 480, status: "Available" },
  { id: "ALG-B1-02", warehouseId: "wh-alger-construction", zone: "B", aisle: "1", rack: "02", level: "1", type: "Ambient", capacity: 600, used: 590, status: "Full" },
  { id: "ALG-C1-01", warehouseId: "wh-alger-construction", zone: "C", aisle: "1", rack: "01", level: "1", type: "Dry", capacity: 500, used: 380, status: "Available" },
  { id: "ALG-C1-02", warehouseId: "wh-alger-construction", zone: "C", aisle: "1", rack: "02", level: "1", type: "Dry", capacity: 500, used: 0, status: "Maintenance" },
  { id: "ALG-D1-01", warehouseId: "wh-alger-construction", zone: "D", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 400, used: 320, status: "Available" },
  { id: "ALG-D1-02", warehouseId: "wh-alger-construction", zone: "D", aisle: "1", rack: "02", level: "1", type: "Ambient", capacity: 400, used: 100, status: "Reserved" },
  // ── Oran Food ──
  { id: "ORA-A1-01", warehouseId: "wh-oran-food", zone: "A", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 500, used: 420, status: "Available" },
  { id: "ORA-A1-02", warehouseId: "wh-oran-food", zone: "A", aisle: "1", rack: "02", level: "1", type: "Ambient", capacity: 500, used: 350, status: "Available" },
  { id: "ORA-B1-01", warehouseId: "wh-oran-food", zone: "B", aisle: "1", rack: "01", level: "1", type: "Chilled", capacity: 400, used: 320, status: "Available" },
  { id: "ORA-B1-02", warehouseId: "wh-oran-food", zone: "B", aisle: "1", rack: "02", level: "1", type: "Chilled", capacity: 400, used: 380, status: "Available" },
  { id: "ORA-C1-01", warehouseId: "wh-oran-food", zone: "C", aisle: "1", rack: "01", level: "1", type: "Frozen", capacity: 300, used: 210, status: "Available" },
  { id: "ORA-D1-01", warehouseId: "wh-oran-food", zone: "D", aisle: "1", rack: "01", level: "1", type: "Dry", capacity: 350, used: 280, status: "Available" },
  // ── Constantine Tech ──
  { id: "CST-A1-01", warehouseId: "wh-constantine-tech", zone: "A", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 300, used: 250, status: "Available" },
  { id: "CST-A1-02", warehouseId: "wh-constantine-tech", zone: "A", aisle: "1", rack: "02", level: "1", type: "Ambient", capacity: 300, used: 280, status: "Available" },
  { id: "CST-B1-01", warehouseId: "wh-constantine-tech", zone: "B", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 250, used: 190, status: "Available" },
  { id: "CST-B1-02", warehouseId: "wh-constantine-tech", zone: "B", aisle: "1", rack: "02", level: "1", type: "Ambient", capacity: 250, used: 120, status: "Available" },
  { id: "CST-C1-01", warehouseId: "wh-constantine-tech", zone: "C", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 200, used: 180, status: "Available" },
];

// ---------- Product Categories ----------
export interface ProductCategory {
  id: string; name: string; parentId?: string; description: string;
  productCount: number; status: "Active" | "Inactive";
}

export const productCategories: ProductCategory[] = [
  // Construction
  { id: "CAT-001", name: "Ciment & Liants", description: "Ciment, plâtre, mortier, chaux", productCount: 2, status: "Active" },
  { id: "CAT-002", name: "Acier & Ferronnerie", description: "Fer à béton, profilés, quincaillerie", productCount: 1, status: "Active" },
  { id: "CAT-003", name: "Revêtement", description: "Carrelage, faïence, marbre", productCount: 1, status: "Active" },
  { id: "CAT-004", name: "Agrégats", description: "Sable, gravier, gravillon", productCount: 2, status: "Active" },
  { id: "CAT-005", name: "Maçonnerie", description: "Briques, parpaings, blocs", productCount: 2, status: "Active" },
  { id: "CAT-006", name: "Plomberie", description: "Tuyaux, raccords, robinetterie", productCount: 3, status: "Active" },
  { id: "CAT-007", name: "Peinture", description: "Peinture, vernis, enduit", productCount: 1, status: "Active" },
  { id: "CAT-030", name: "Électricité", description: "Câbles, interrupteurs, tableaux", productCount: 1, status: "Active" },
  { id: "CAT-031", name: "Étanchéité", description: "Membranes, bitume, revêtements", productCount: 1, status: "Active" },
  { id: "CAT-032", name: "Menuiserie", description: "Portes, fenêtres, bois", productCount: 1, status: "Active" },
  { id: "CAT-033", name: "Vitrerie", description: "Vitres, miroirs, double vitrage", productCount: 1, status: "Active" },
  // Food
  { id: "CAT-008", name: "Farines & Céréales", description: "Farine, semoule, riz, céréales", productCount: 3, status: "Active" },
  { id: "CAT-009", name: "Huiles & Corps gras", description: "Huiles végétales, margarine, beurre", productCount: 2, status: "Active" },
  { id: "CAT-010", name: "Conserves", description: "Tomate, sardines, thon, confitures", productCount: 4, status: "Active" },
  { id: "CAT-011", name: "Sucre & Confiserie", description: "Sucre, chocolat, biscuits", productCount: 1, status: "Active" },
  { id: "CAT-012", name: "Produits laitiers", description: "Lait, yaourt, fromage", productCount: 1, status: "Active" },
  { id: "CAT-013", name: "Pâtes & Semoule", description: "Pâtes, couscous, vermicelle", productCount: 1, status: "Active" },
  { id: "CAT-034", name: "Boissons", description: "Eau, jus, café, thé", productCount: 2, status: "Active" },
  { id: "CAT-035", name: "Légumineuses", description: "Lentilles, pois chiches, haricots", productCount: 1, status: "Active" },
  { id: "CAT-036", name: "Condiments", description: "Harissa, moutarde, épices", productCount: 1, status: "Active" },
  // Tech
  { id: "CAT-014", name: "Ordinateurs", description: "Laptops, desktops, workstations", productCount: 1, status: "Active" },
  { id: "CAT-015", name: "Téléphonie", description: "Smartphones, téléphones fixes", productCount: 1, status: "Active" },
  { id: "CAT-016", name: "Câblage & Réseau", description: "Câbles, routeurs, switches", productCount: 4, status: "Active" },
  { id: "CAT-017", name: "Serveurs", description: "Serveurs rack, tour, NAS", productCount: 1, status: "Active" },
  { id: "CAT-018", name: "Impression", description: "Imprimantes, vidéoprojecteurs", productCount: 2, status: "Active" },
  { id: "CAT-019", name: "Tablettes", description: "Tablettes Android, iPad", productCount: 1, status: "Active" },
  { id: "CAT-020", name: "Énergie", description: "Onduleurs, panneaux solaires, batteries", productCount: 2, status: "Active" },
  { id: "CAT-037", name: "Écrans", description: "Moniteurs, écrans tactiles", productCount: 1, status: "Active" },
  { id: "CAT-038", name: "Périphériques", description: "Claviers, souris, webcams", productCount: 1, status: "Active" },
  { id: "CAT-039", name: "Stockage", description: "SSD, HDD, clés USB", productCount: 2, status: "Active" },
  { id: "CAT-040", name: "Audio", description: "Casques, enceintes, microphones", productCount: 1, status: "Active" },
  { id: "CAT-041", name: "Sécurité", description: "Caméras IP, alarmes, contrôle accès", productCount: 1, status: "Active" },
];

// ---------- UOM ----------
export type UnitKind = "PHYSICAL" | "ABSTRACT";

export interface UnitOfMeasure {
  id: string; name: string; abbreviation: string; type: "Weight" | "Volume" | "Length" | "Count" | "Area";
  unitKind: UnitKind;  // PHYSICAL = integer-only, ABSTRACT = decimals allowed
  baseUnit?: string; conversionFactor?: number;
}

export const unitsOfMeasure: UnitOfMeasure[] = [
  { id: "UOM-001", name: "Kilogramme", abbreviation: "kg", type: "Weight", unitKind: "ABSTRACT" },
  { id: "UOM-002", name: "Tonne", abbreviation: "T", type: "Weight", unitKind: "ABSTRACT", baseUnit: "kg", conversionFactor: 1000 },
  { id: "UOM-003", name: "Litre", abbreviation: "L", type: "Volume", unitKind: "ABSTRACT" },
  { id: "UOM-004", name: "Mètre", abbreviation: "m", type: "Length", unitKind: "ABSTRACT" },
  { id: "UOM-005", name: "Mètre carré", abbreviation: "m²", type: "Area", unitKind: "ABSTRACT" },
  { id: "UOM-006", name: "Pièce", abbreviation: "Pce", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-007", name: "Carton", abbreviation: "Ctn", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-008", name: "Palette", abbreviation: "Pal", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-009", name: "Sac", abbreviation: "Sac", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-010", name: "Bobine", abbreviation: "Bob", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-011", name: "Barre", abbreviation: "Bar", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-012", name: "Seau", abbreviation: "Seau", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-013", name: "Bidon", abbreviation: "Bid", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-014", name: "Pack", abbreviation: "Pack", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-015", name: "Kit", abbreviation: "Kit", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-016", name: "Rouleau", abbreviation: "Rlx", type: "Count", unitKind: "PHYSICAL" },
  { id: "UOM-017", name: "Unité", abbreviation: "U", type: "Count", unitKind: "PHYSICAL" },
];

// ---------- Carriers ----------
export interface Carrier {
  id: string; name: string; contact: string; phone: string; email: string;
  city: string; vehicleCount: number; coverageZones: string[];
  status: "Active" | "Inactive"; rating: number;
}

export const carriers: Carrier[] = [
  { id: "CR-001", name: "TransAlger Express", contact: "Youcef Benmohamed", phone: "+213-21-55-66-77", email: "ops@transalger.dz", city: "Alger", vehicleCount: 15, coverageZones: ["Alger", "Blida", "Boumerdès", "Tipaza"], status: "Active", rating: 4.6 },
  { id: "CR-002", name: "Ouest Logistique", contact: "Rachid Touati", phone: "+213-41-33-44-55", email: "contact@ouestlog.dz", city: "Oran", vehicleCount: 10, coverageZones: ["Oran", "Tlemcen", "Mostaganem", "Aïn Témouchent"], status: "Active", rating: 4.2 },
  { id: "CR-003", name: "Est Fret", contact: "Djamel Kaci", phone: "+213-31-22-33-44", email: "info@estfret.dz", city: "Constantine", vehicleCount: 8, coverageZones: ["Constantine", "Annaba", "Sétif", "Batna"], status: "Active", rating: 4.0 },
  { id: "CR-004", name: "Sahara Transport", contact: "Mourad Saidi", phone: "+213-49-11-22-33", email: "ops@saharatransport.dz", city: "Ghardaïa", vehicleCount: 5, coverageZones: ["Ghardaïa", "Ouargla", "Biskra"], status: "Inactive", rating: 3.5 },
];

// ---------- Barcodes ----------
export type BarcodeType = "EAN-13" | "EAN-8" | "UPC-A" | "Code128" | "QR" | "DataMatrix";

export interface Barcode {
  id: string; productId: string; productName: string;
  type: BarcodeType; value: string; isPrimary: boolean; createdAt: string;
}

export const barcodes: Barcode[] = [
  { id: "BC-001", productId: "P001", productName: "Ciment CPJ 42.5 (50kg)", type: "EAN-13", value: "6191000000010", isPrimary: true, createdAt: "2025-12-01" },
  { id: "BC-002", productId: "P002", productName: "Fer à béton Ø12", type: "Code128", value: "CONST002BAR12", isPrimary: true, createdAt: "2025-12-01" },
  { id: "BC-003", productId: "P009", productName: "Farine de blé T55 (50kg)", type: "EAN-13", value: "6191000000090", isPrimary: true, createdAt: "2025-12-01" },
  { id: "BC-004", productId: "P010", productName: "Huile de tournesol 5L", type: "EAN-13", value: "6191000000100", isPrimary: true, createdAt: "2025-12-01" },
  { id: "BC-005", productId: "P017", productName: "Laptop HP ProBook 450", type: "EAN-13", value: "6191000000170", isPrimary: true, createdAt: "2025-12-01" },
  { id: "BC-006", productId: "P018", productName: "Smartphone Samsung A54", type: "EAN-13", value: "6191000000180", isPrimary: true, createdAt: "2025-12-01" },
  { id: "BC-007", productId: "P023", productName: "Routeur WiFi 6 TP-Link", type: "EAN-13", value: "6191000000230", isPrimary: true, createdAt: "2025-12-01" },
  { id: "BC-008", productId: "P024", productName: "Onduleur APC 1500VA", type: "EAN-13", value: "6191000000240", isPrimary: true, createdAt: "2025-12-01" },
  // New products barcodes
  { id: "BC-009", productId: "P025", productName: "Gravier concassé 5/15", type: "Code128", value: "CONST009GRV15", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-010", productId: "P026", productName: "Tube cuivre Ø15", type: "Code128", value: "CONST010CUI15", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-011", productId: "P027", productName: "Câble électrique 2.5mm²", type: "EAN-13", value: "6191000000270", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-012", productId: "P028", productName: "Membrane bitume 4mm", type: "Code128", value: "CONST012BIT04", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-013", productId: "P033", productName: "Semoule fine 25kg", type: "EAN-13", value: "6191000000330", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-014", productId: "P034", productName: "Thon en conserve 160g", type: "EAN-13", value: "6191000000340", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-015", productId: "P036", productName: "Eau minérale Ifri 1.5L", type: "EAN-13", value: "6191000000360", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-016", productId: "P037", productName: "Café moulu Tassili 250g", type: "EAN-13", value: "6191000000370", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-017", productId: "P041", productName: "Moniteur Dell 24\" FHD", type: "EAN-13", value: "6191000000410", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-018", productId: "P042", productName: "Kit clavier+souris Logitech", type: "EAN-13", value: "6191000000420", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-019", productId: "P043", productName: "SSD Samsung 512GB", type: "EAN-13", value: "6191000000430", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-020", productId: "P045", productName: "Vidéoprojecteur Epson", type: "EAN-13", value: "6191000000450", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-021", productId: "P048", productName: "Switch TP-Link 24 ports", type: "EAN-13", value: "6191000000480", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-022", productId: "P049", productName: "Caméra IP Hikvision 4MP", type: "EAN-13", value: "6191000000490", isPrimary: true, createdAt: "2025-12-15" },
  { id: "BC-023", productId: "P050", productName: "Panneau solaire 300W", type: "EAN-13", value: "6191000000500", isPrimary: true, createdAt: "2025-12-15" },
];
