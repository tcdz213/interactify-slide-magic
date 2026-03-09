// ============================================================
// Domain: Master Data — Products, Vendors, Warehouses, Locations,
// Categories, UOM, Carriers, Barcodes
// ============================================================

// ---------- Helpers ----------
export const currency = (v: number) =>
  v.toLocaleString("fr-DZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " DZD";
export const pct = (v: number) => v.toFixed(1) + "%";

// ---------- Products ----------
export type ProductType = "Storable" | "Consumable" | "Service";
export type CostMethod = "Standard" | "Average" | "FIFO";

export interface Product {
  tenantId?: string;
  id: string; name: string; sku: string; category: string;
  subcategoryId?: string;  // FK → SubCategory.id (hierarchical)
  uom: string; unitCost: number; unitPrice: number; reorderPoint: number;
  isActive: boolean;
  isDeleted?: boolean;
  baseUnit?: string;      // R1: canonical base unit (e.g. "kg", "Pièce")
  baseUnitAbbr?: string;  // R1: abbreviation (e.g. "kg", "Pce")
  baseUnitId?: string;    // FK → UnitOfMeasure.id (new refactoring)
  // ERP fields per ERP_PO_PREREQUISITES §1.2
  productType?: ProductType;     // Storable, Consumable, Service
  canBePurchased?: boolean;      // purchase_ok flag
  canBeSold?: boolean;           // sale_ok flag
  costMethod?: CostMethod;       // Standard, Average, FIFO
  purchaseUomId?: string;        // separate purchase UoM
  taxScheduleId?: string;        // FK → Tax Code
  expenseAccountId?: string;     // FK → CoA for non-stock items
  defaultVendorId?: string;      // FK → Vendor — default supplier for PO pre-fill
}

export const products: Product[] = [
  // ── Construction (Alger) — P001-P008, P025-P032 ──
  { id: "P001", name: "Ciment CPJ 42.5 (50kg)", sku: "CONST-001", category: "Ciment & Liants", subcategoryId: "SUB-001", uom: "Sac", unitCost: 850, unitPrice: 1200, reorderPoint: 500, isActive: true },
  { id: "P002", name: "Fer à béton Ø12 (barre 12m)", sku: "CONST-002", category: "Acier & Ferronnerie", subcategoryId: "SUB-011", uom: "Barre", unitCost: 2400, unitPrice: 3200, reorderPoint: 200, isActive: true },
  { id: "P003", name: "Carrelage 40x40 (m²)", sku: "CONST-003", category: "Revêtement", subcategoryId: "SUB-014", uom: "m²", unitCost: 1500, unitPrice: 2200, reorderPoint: 300, isActive: true },
  { id: "P004", name: "Sable lavé 0/3 (tonne)", sku: "CONST-004", category: "Agrégats", subcategoryId: "SUB-005", uom: "Tonne", unitCost: 3500, unitPrice: 5000, reorderPoint: 100, isActive: true },
  { id: "P005", name: "Brique rouge 10x20x30", sku: "CONST-005", category: "Maçonnerie", subcategoryId: "SUB-008", uom: "Palette (200)", unitCost: 8000, unitPrice: 12000, reorderPoint: 80, isActive: true },
  { id: "P006", name: "Tuyau PVC Ø110 (4m)", sku: "CONST-006", category: "Plomberie", subcategoryId: "SUB-019", uom: "Barre", unitCost: 1800, unitPrice: 2600, reorderPoint: 150, isActive: true },
  { id: "P007", name: "Peinture acrylique 25L", sku: "CONST-007", category: "Peinture", subcategoryId: "SUB-030", uom: "Seau", unitCost: 4500, unitPrice: 6500, reorderPoint: 100, isActive: true },
  { id: "P008", name: "Plâtre fin 40kg", sku: "CONST-008", category: "Ciment & Liants", subcategoryId: "SUB-002", uom: "Sac", unitCost: 650, unitPrice: 950, reorderPoint: 300, isActive: true },
  { id: "P025", name: "Gravier concassé 5/15 (tonne)", sku: "CONST-009", category: "Agrégats", subcategoryId: "SUB-006", uom: "Tonne", unitCost: 4200, unitPrice: 6000, reorderPoint: 80, isActive: true },
  { id: "P026", name: "Tube cuivre Ø15 (barre 5m)", sku: "CONST-010", category: "Plomberie", subcategoryId: "SUB-019", uom: "Barre", unitCost: 3200, unitPrice: 4800, reorderPoint: 100, isActive: true },
  { id: "P027", name: "Câble électrique 2.5mm² (100m)", sku: "CONST-011", category: "Électricité", subcategoryId: "SUB-022", uom: "Bobine", unitCost: 2800, unitPrice: 4200, reorderPoint: 60, isActive: true },
  { id: "P028", name: "Membrane bitume 4mm (rouleau 10m²)", sku: "CONST-012", category: "Étanchéité", subcategoryId: "SUB-018", uom: "Rouleau", unitCost: 3500, unitPrice: 5200, reorderPoint: 50, isActive: true },
  { id: "P029", name: "Porte intérieure bois isoplane", sku: "CONST-013", category: "Menuiserie", subcategoryId: "SUB-025", uom: "Pièce", unitCost: 6500, unitPrice: 9500, reorderPoint: 30, isActive: true },
  { id: "P030", name: "Vitre double vitrage 4/16/4 (m²)", sku: "CONST-014", category: "Vitrerie", subcategoryId: "SUB-029", uom: "m²", unitCost: 5500, unitPrice: 8000, reorderPoint: 50, isActive: true },
  { id: "P031", name: "Coude PVC 90° Ø110", sku: "CONST-015", category: "Plomberie", subcategoryId: "SUB-020", uom: "Pièce", unitCost: 120, unitPrice: 250, reorderPoint: 200, isActive: true },
  { id: "P032", name: "Parpaing creux 20x20x50", sku: "CONST-016", category: "Maçonnerie", subcategoryId: "SUB-009", uom: "Unité", unitCost: 55, unitPrice: 95, reorderPoint: 1000, isActive: true },
  // ── Agroalimentaire (Oran) — P009-P016, P033-P040 ──
  { id: "P009", name: "Farine de blé T55 (50kg)", sku: "FOOD-001", category: "Farines & Céréales", subcategoryId: "SUB-033", uom: "Sac", unitCost: 3800, unitPrice: 4800, reorderPoint: 400, isActive: true },
  { id: "P010", name: "Huile de tournesol 5L", sku: "FOOD-002", category: "Huiles & Corps gras", subcategoryId: "SUB-040", uom: "Bidon", unitCost: 1200, unitPrice: 1650, reorderPoint: 500, isActive: true },
  { id: "P011", name: "Tomate concentrée 800g", sku: "FOOD-003", category: "Conserves", subcategoryId: "SUB-046", uom: "Carton (24)", unitCost: 2400, unitPrice: 3200, reorderPoint: 300, isActive: true },
  { id: "P012", name: "Sucre blanc 1kg", sku: "FOOD-004", category: "Sucre & Confiserie", subcategoryId: "SUB-049", uom: "Sac (50kg)", unitCost: 5500, unitPrice: 7200, reorderPoint: 200, isActive: true },
  { id: "P013", name: "Lait UHT 1L", sku: "FOOD-005", category: "Produits laitiers", subcategoryId: "SUB-043", uom: "Carton (12)", unitCost: 420, unitPrice: 600, reorderPoint: 600, isActive: true },
  { id: "P014", name: "Pâtes alimentaires 500g", sku: "FOOD-006", category: "Pâtes & Semoule", subcategoryId: "SUB-036", uom: "Carton (20)", unitCost: 1800, unitPrice: 2400, reorderPoint: 350, isActive: true },
  { id: "P015", name: "Riz basmati 5kg", sku: "FOOD-007", category: "Farines & Céréales", subcategoryId: "SUB-035", uom: "Sac", unitCost: 2200, unitPrice: 3000, reorderPoint: 250, isActive: true },
  { id: "P016", name: "Sardines en conserve 125g", sku: "FOOD-008", category: "Conserves", subcategoryId: "SUB-047", uom: "Carton (48)", unitCost: 3600, unitPrice: 4800, reorderPoint: 200, isActive: true },
  { id: "P033", name: "Semoule fine 25kg", sku: "FOOD-009", category: "Farines & Céréales", subcategoryId: "SUB-034", uom: "Sac", unitCost: 2200, unitPrice: 3000, reorderPoint: 200, isActive: true },
  { id: "P034", name: "Thon en conserve 160g", sku: "FOOD-010", category: "Conserves", subcategoryId: "SUB-047", uom: "Carton (48)", unitCost: 4800, unitPrice: 6200, reorderPoint: 150, isActive: true },
  { id: "P035", name: "Margarine Fleurial 500g", sku: "FOOD-011", category: "Huiles & Corps gras", subcategoryId: "SUB-042", uom: "Carton (24)", unitCost: 3600, unitPrice: 4800, reorderPoint: 200, isActive: true },
  { id: "P036", name: "Eau minérale Ifri 1.5L (pack 6)", sku: "FOOD-012", category: "Boissons", subcategoryId: "SUB-052", uom: "Pack", unitCost: 180, unitPrice: 280, reorderPoint: 500, isActive: true },
  { id: "P037", name: "Café moulu Tassili 250g", sku: "FOOD-013", category: "Boissons", subcategoryId: "SUB-054", uom: "Carton (24)", unitCost: 7200, unitPrice: 9600, reorderPoint: 150, isActive: true },
  { id: "P038", name: "Lentilles vertes 1kg", sku: "FOOD-014", category: "Légumineuses", subcategoryId: "SUB-038", uom: "Sac (25kg)", unitCost: 6500, unitPrice: 8500, reorderPoint: 100, isActive: true },
  { id: "P039", name: "Harissa CAP BON 380g", sku: "FOOD-015", category: "Condiments", subcategoryId: "SUB-056", uom: "Carton (24)", unitCost: 4200, unitPrice: 5800, reorderPoint: 120, isActive: true },
  { id: "P040", name: "Confiture Saida abricot 430g", sku: "FOOD-016", category: "Conserves", uom: "Carton (12)", unitCost: 2800, unitPrice: 3800, reorderPoint: 100, isActive: true },
  // ── Technologie (Constantine) — P017-P024, P041-P050 ──
  { id: "P017", name: "Laptop HP ProBook 450", sku: "TECH-001", category: "Ordinateurs", subcategoryId: "SUB-059", uom: "Pièce", unitCost: 95000, unitPrice: 135000, reorderPoint: 30, isActive: true },
  { id: "P018", name: "Smartphone Samsung A54", sku: "TECH-002", category: "Téléphonie", subcategoryId: "SUB-062", uom: "Pièce", unitCost: 42000, unitPrice: 58000, reorderPoint: 50, isActive: true },
  { id: "P019", name: "Câble réseau Cat6 (100m)", sku: "TECH-003", category: "Câblage & Réseau", subcategoryId: "SUB-070", uom: "Bobine", unitCost: 3500, unitPrice: 5200, reorderPoint: 80, isActive: true },
  { id: "P020", name: "Serveur Dell PowerEdge T150", sku: "TECH-004", category: "Serveurs", subcategoryId: "SUB-066", uom: "Pièce", unitCost: 250000, unitPrice: 350000, reorderPoint: 10, isActive: true },
  { id: "P021", name: "Imprimante HP LaserJet Pro", sku: "TECH-005", category: "Impression", subcategoryId: "SUB-076", uom: "Pièce", unitCost: 38000, unitPrice: 52000, reorderPoint: 20, isActive: true },
  { id: "P022", name: "Tablette Lenovo Tab M10", sku: "TECH-006", category: "Tablettes", subcategoryId: "SUB-064", uom: "Pièce", unitCost: 28000, unitPrice: 39000, reorderPoint: 40, isActive: true },
  { id: "P023", name: "Routeur WiFi 6 TP-Link", sku: "TECH-007", category: "Câblage & Réseau", subcategoryId: "SUB-068", uom: "Pièce", unitCost: 8500, unitPrice: 12500, reorderPoint: 60, isActive: true },
  { id: "P024", name: "Onduleur APC 1500VA", sku: "TECH-008", category: "Énergie", subcategoryId: "SUB-088", uom: "Pièce", unitCost: 18000, unitPrice: 26000, reorderPoint: 25, isActive: true },
  { id: "P041", name: "Moniteur Dell 24\" FHD", sku: "TECH-009", category: "Écrans", subcategoryId: "SUB-074", uom: "Pièce", unitCost: 22000, unitPrice: 32000, reorderPoint: 30, isActive: true },
  { id: "P042", name: "Kit clavier+souris sans fil Logitech", sku: "TECH-010", category: "Périphériques", subcategoryId: "SUB-078", uom: "Kit", unitCost: 3500, unitPrice: 5500, reorderPoint: 50, isActive: true },
  { id: "P043", name: "SSD Samsung 512GB SATA", sku: "TECH-011", category: "Stockage", subcategoryId: "SUB-071", uom: "Pièce", unitCost: 6500, unitPrice: 9500, reorderPoint: 60, isActive: true },
  { id: "P044", name: "Câble HDMI 2.0 (3m)", sku: "TECH-012", category: "Câblage & Réseau", subcategoryId: "SUB-070", uom: "Pièce", unitCost: 800, unitPrice: 1500, reorderPoint: 100, isActive: true },
  { id: "P045", name: "Vidéoprojecteur Epson EB-X51", sku: "TECH-013", category: "Impression", subcategoryId: "SUB-077", uom: "Pièce", unitCost: 65000, unitPrice: 92000, reorderPoint: 10, isActive: true },
  { id: "P046", name: "Disque dur externe Seagate 2TB", sku: "TECH-014", category: "Stockage", subcategoryId: "SUB-072", uom: "Pièce", unitCost: 8500, unitPrice: 12500, reorderPoint: 40, isActive: true },
  { id: "P047", name: "Casque audio Jabra Evolve2", sku: "TECH-015", category: "Audio", subcategoryId: "SUB-081", uom: "Pièce", unitCost: 12000, unitPrice: 18000, reorderPoint: 25, isActive: true },
  { id: "P048", name: "Switch TP-Link 24 ports Gigabit", sku: "TECH-016", category: "Câblage & Réseau", subcategoryId: "SUB-069", uom: "Pièce", unitCost: 15000, unitPrice: 22000, reorderPoint: 15, isActive: true },
  { id: "P049", name: "Caméra IP Hikvision 4MP", sku: "TECH-017", category: "Sécurité", subcategoryId: "SUB-084", uom: "Pièce", unitCost: 9000, unitPrice: 14000, reorderPoint: 40, isActive: true },
  { id: "P050", name: "Panneau solaire 300W monocristallin", sku: "TECH-018", category: "Énergie", subcategoryId: "SUB-087", uom: "Pièce", unitCost: 25000, unitPrice: 38000, reorderPoint: 20, isActive: false },
  // ── Construction — Carrelage dimensionnel (P051-P053) ──
  { id: "P051", name: "Carrelage grès cérame 50×50", sku: "CONST-017", category: "Revêtement", subcategoryId: "SUB-014", uom: "m²", unitCost: 1800, unitPrice: 2800, reorderPoint: 200, isActive: true },
  { id: "P052", name: "Faïence murale 35×35", sku: "CONST-018", category: "Revêtement", subcategoryId: "SUB-015", uom: "m²", unitCost: 1200, unitPrice: 1900, reorderPoint: 300, isActive: true },
  { id: "P053", name: "Carrelage porcelaine 60×60", sku: "CONST-019", category: "Revêtement", subcategoryId: "SUB-014", uom: "m²", unitCost: 2500, unitPrice: 3800, reorderPoint: 150, isActive: true },
];

// ---------- Vendors ----------
export type VendorPaymentTerms = "Comptant" | "Net_15" | "Net_30" | "Net_45" | "Net_60" | "30_jours_fin_mois";
export type VendorStatus = "Active" | "On Hold" | "Blocked";

export interface Vendor {
  tenantId?: string;
  id: string; name: string; contact: string; phone: string; email: string;
  city: string; address?: string; rating: number;
  status: VendorStatus;
  totalPOs: number; totalValue: number; avgLeadDays: number;
  lastDelivery: string; paymentTerms?: VendorPaymentTerms;
  // ERP fields per ERP_PO_PREREQUISITES §1.1
  taxId?: string;              // NIF / tax registration number
  currencyId?: string;         // FK → Currency (default: DZD)
  bankAccount?: string;        // IBAN or local bank account
  bankBIC?: string;            // BIC/SWIFT code
  fiscalPositionId?: string;   // FK → Fiscal Position
  procurementCategory?: string;// sourcing category
  supplierRank?: number;       // [Odoo] supplier_rank
  isBlacklisted?: boolean;     // compliance flag
}

export const vendors: Vendor[] = [
  { id: "V001", name: "GICA Cimenterie", contact: "Amine Belaïd", phone: "+213-21-45-67-89", email: "commercial@gica.dz", city: "Alger", address: "Zone Industrielle Rouiba, Alger", rating: 4.8, status: "Active", totalPOs: 180, totalValue: 85000000, avgLeadDays: 2, lastDelivery: "2026-02-23", paymentTerms: "Net_30", taxId: "000216045678901", currencyId: "DZD", bankAccount: "DZ580002100000000123456789", bankBIC: "BADRDZAL", procurementCategory: "Construction" },
  { id: "V002", name: "ArcelorMittal Annaba", contact: "Karim Mechri", phone: "+213-38-86-45-00", email: "ventes@arcelormittal.dz", city: "Annaba", address: "Zone Sidérurgique, Annaba", rating: 4.5, status: "Active", totalPOs: 120, totalValue: 62000000, avgLeadDays: 5, lastDelivery: "2026-02-20", paymentTerms: "Net_45", taxId: "000238086450012", currencyId: "DZD", bankAccount: "DZ580003800000000987654321", bankBIC: "CNEPDZAL", procurementCategory: "Acier" },
  { id: "V003", name: "Céramique SEROR", contact: "Farid Hamadi", phone: "+213-31-34-56-78", email: "export@seror.dz", city: "Constantine", address: "Zone Industrielle Palma", rating: 4.2, status: "Active", totalPOs: 95, totalValue: 38000000, avgLeadDays: 4, lastDelivery: "2026-02-22", paymentTerms: "Net_30", taxId: "000231034567823", currencyId: "DZD", bankAccount: "DZ580001000000000456789012", bankBIC: "BNAADZAL", procurementCategory: "Revêtement" },
  { id: "V004", name: "Cevital Agro", contact: "Mohammed Salhi", phone: "+213-21-56-78-90", email: "b2b@cevital.dz", city: "Béjaïa", address: "Port de Béjaïa", rating: 4.7, status: "Active", totalPOs: 210, totalValue: 95000000, avgLeadDays: 3, lastDelivery: "2026-02-24", paymentTerms: "Net_30", taxId: "000206056789034", currencyId: "DZD", bankAccount: "DZ580004200000000111222333", bankBIC: "GULBDZAL", procurementCategory: "Agroalimentaire" },
  { id: "V005", name: "SIM Blida (Groupe)", contact: "Nabil Khelifi", phone: "+213-25-43-21-00", email: "commandes@sim.dz", city: "Blida", address: "Zone Industrielle Ouled Yaïch", rating: 4.3, status: "Active", totalPOs: 165, totalValue: 72000000, avgLeadDays: 2, lastDelivery: "2026-02-23", paymentTerms: "Net_30", taxId: "000209043210045", currencyId: "DZD", bankAccount: "DZ580005100000000444555666", bankBIC: "BADRDZAL", procurementCategory: "Agroalimentaire" },
  { id: "V006", name: "Ifri (IBSA)", contact: "Rachid Oulaid", phone: "+213-34-28-10-00", email: "distribution@ifri.dz", city: "Tizi Ouzou", address: "Ighzer Amokrane, Ifri Ouzellaguen", rating: 4.1, status: "Active", totalPOs: 88, totalValue: 28000000, avgLeadDays: 3, lastDelivery: "2026-02-21", paymentTerms: "Comptant", taxId: "000215028100056", currencyId: "DZD", bankAccount: "DZ580006300000000777888999", bankBIC: "CNEPDZAL", procurementCategory: "Boissons" },
  { id: "V007", name: "Condor Electronics", contact: "Yacine Benamar", phone: "+213-36-93-50-00", email: "pro@condor.dz", city: "Bordj Bou Arréridj", address: "Zone Industrielle El Harrach", rating: 4.4, status: "Active", totalPOs: 140, totalValue: 180000000, avgLeadDays: 4, lastDelivery: "2026-02-22", paymentTerms: "Net_30", taxId: "000234093500067", currencyId: "EUR", bankAccount: "DZ580007500000000222333444", bankBIC: "BADRDZAL", procurementCategory: "Technologie" },
  { id: "V008", name: "Iris Technologies", contact: "Sofiane Djabri", phone: "+213-25-49-88-00", email: "ventes@iris.dz", city: "Sétif", address: "Zone Industrielle, Sétif", rating: 4.0, status: "Active", totalPOs: 75, totalValue: 95000000, avgLeadDays: 5, lastDelivery: "2026-02-19", paymentTerms: "Net_45", taxId: "000219049880078", currencyId: "DZD", bankAccount: "DZ580008700000000555666777", bankBIC: "BNAADZAL", procurementCategory: "Technologie" },
  // ── Agro Sahel — Fournisseur-Entrepôt (vend aux Entrepôts Oran & Alger) ──
  { id: "V-SAHEL", name: "Agro Sahel Distribution", contact: "Karim Benmoussa", phone: "+213-21-555-678", email: "contact@agrosahel.dz", city: "Alger", address: "Zone Industrielle Oued Smar, Lot 42, Alger 16270", rating: 4.2, status: "Active", totalPOs: 45, totalValue: 32000000, avgLeadDays: 2, lastDelivery: "2026-03-06", paymentTerms: "Net_30", taxId: "000216099054321", currencyId: "DZD", bankAccount: "DZ580007990003004521780000", bankBIC: "BNAADZAL", procurementCategory: "Agroalimentaire" },
];

// ---------- Payment Terms ----------
export interface PaymentTerm {
  tenantId?: string;
  id: string;
  name: string;
  code: VendorPaymentTerms;
  description: string;
  dueDays: number;
  discountPct: number;
  discountDays: number;
  isActive: boolean;
}

export const paymentTerms: PaymentTerm[] = [
  { id: "PT-001", name: "Comptant", code: "Comptant", description: "Paiement immédiat à la commande", dueDays: 0, discountPct: 0, discountDays: 0, isActive: true },
  { id: "PT-002", name: "Net 15 jours", code: "Net_15", description: "Paiement sous 15 jours", dueDays: 15, discountPct: 0, discountDays: 0, isActive: true },
  { id: "PT-003", name: "Net 30 jours", code: "Net_30", description: "Paiement sous 30 jours date facture", dueDays: 30, discountPct: 0, discountDays: 0, isActive: true },
  { id: "PT-004", name: "2/10 Net 30", code: "Net_30", description: "2% escompte si payé sous 10 jours, sinon 30 jours", dueDays: 30, discountPct: 2, discountDays: 10, isActive: true },
  { id: "PT-005", name: "Net 45 jours", code: "Net_45", description: "Paiement sous 45 jours", dueDays: 45, discountPct: 0, discountDays: 0, isActive: true },
  { id: "PT-006", name: "Net 60 jours", code: "Net_60", description: "Paiement sous 60 jours", dueDays: 60, discountPct: 0, discountDays: 0, isActive: true },
  { id: "PT-007", name: "30 jours fin de mois", code: "30_jours_fin_mois", description: "Paiement 30 jours après fin du mois de facturation", dueDays: 30, discountPct: 0, discountDays: 0, isActive: true },
];

// ---------- Warehouses & Locations ----------
export type WarehouseType = "construction" | "food" | "technology" | "general";
export type WarehouseStatus = "active" | "inactive" | "maintenance";

export interface Warehouse {
  tenantId?: string;
  id: string; name: string; shortCode: string; type: WarehouseType;
  city: string; wilaya: string; zones: number; capacity: number; utilization: number;
  address: string; manager: string; phone: string; speciality: string;
  status: WarehouseStatus; temperature?: string;
  certifications?: string[]; security?: string;
  // ERP fields per ERP_PO_PREREQUISITES §1.3
  inputLocationId?: string;    // FK → WarehouseLocation — default receiving location
  companyId?: string;          // FK → Company for multi-company isolation
}

export const warehouses: Warehouse[] = [
  { id: "wh-alger-construction", shortCode: "WH-ALG-CONST", name: "Entrepôt Construction Alger", type: "construction", city: "Alger", wilaya: "Alger (16)", zones: 6, capacity: 5000, utilization: 74, address: "Zone Industrielle Rouiba, Alger", manager: "Karim Ben Ali", phone: "+213-21-100-200", speciality: "Matériaux de construction, ciment, acier, carrelage", status: "active" },
  { id: "wh-oran-food", shortCode: "WH-ORA-FOOD", name: "Entrepôt Agroalimentaire Oran", type: "food", city: "Oran", wilaya: "Oran (31)", zones: 5, capacity: 3500, utilization: 68, address: "Zone d'Activité Hassi Ameur, Oran", manager: "Samir Rafik", phone: "+213-41-200-300", speciality: "Produits alimentaires, céréales, huiles, conserves", status: "active", temperature: "Ambient + Cold chain (2–8°C)", certifications: ["HACCP", "ISO 22000"] },
  { id: "wh-constantine-tech", shortCode: "WH-CST-TECH", name: "Entrepôt Technologie Constantine", type: "technology", city: "Constantine", wilaya: "Constantine (25)", zones: 4, capacity: 2000, utilization: 81, address: "Zone Industrielle Palma, Constantine", manager: "Hassan Nour", phone: "+213-31-300-400", speciality: "Électronique, informatique, télécoms, composants", status: "active", security: "High (caméras, alarme, accès badge)" },
  // ── Fournisseur = Entrepôt (Agro Sahel Distribution) ──
  { id: "wh-sahel-supplier", shortCode: "WH-SAH-SUP", name: "Entrepôt Agro Sahel — Oued Smar", type: "food", city: "Alger", wilaya: "Alger (16)", zones: 3, capacity: 2500, utilization: 62, address: "Zone Industrielle Oued Smar, Lot 42, Alger 16270", manager: "Mourad Sahli", phone: "+213-21-555-678", speciality: "Distribution agroalimentaire, huiles, céréales, conserves", status: "active", temperature: "Ambient", certifications: ["HACCP"], companyId: "COMP-SAHEL" },
];

export interface WarehouseLocation {
  tenantId?: string;
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
  // ── Sahel Supplier ──
  { id: "SAH-A1-01", warehouseId: "wh-sahel-supplier", zone: "A", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 600, used: 420, status: "Available" },
  { id: "SAH-A1-02", warehouseId: "wh-sahel-supplier", zone: "A", aisle: "1", rack: "02", level: "1", type: "Ambient", capacity: 600, used: 380, status: "Available" },
  { id: "SAH-B1-01", warehouseId: "wh-sahel-supplier", zone: "B", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 500, used: 350, status: "Available" },
];

// ---------- Sectors ----------
export interface Sector {
  tenantId?: string;
  id: string; code: string; name: string; icon: string; color: string;
  description: string; status: "Active" | "Inactive";
}

export const sectors: Sector[] = [
  { id: "SEC-01", code: "SEC-01", name: "Construction & BTP", icon: "🏗", color: "hsl(30, 60%, 50%)", description: "Matériaux de construction, gros œuvre, second œuvre", status: "Active" },
  { id: "SEC-02", code: "SEC-02", name: "Food & FMCG", icon: "🍞", color: "hsl(120, 40%, 45%)", description: "Agroalimentaire, boissons, produits de grande consommation", status: "Active" },
  { id: "SEC-03", code: "SEC-03", name: "Technology & IT", icon: "💻", color: "hsl(220, 60%, 55%)", description: "Informatique, télécoms, électronique, sécurité", status: "Active" },
  { id: "SEC-04", code: "SEC-04", name: "Energy & Industrial", icon: "⚡", color: "hsl(45, 80%, 50%)", description: "Énergie renouvelable, équipements industriels", status: "Active" },
];

// ---------- Product Categories (Level 2) ----------
export interface ProductCategory {
  tenantId?: string;
  id: string; code: string; name: string; sectorId: string;
  description: string; productCount: number; status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export const productCategories: ProductCategory[] = [
  // SEC-01: Construction
  { id: "CAT-001", code: "CEM-01", sectorId: "SEC-01", name: "Ciment & Liants", description: "Ciment, plâtre, mortier, chaux", productCount: 2, status: "Active" },
  { id: "CAT-004", code: "CEM-02", sectorId: "SEC-01", name: "Agrégats", description: "Sable, gravier, gravillon", productCount: 2, status: "Active" },
  { id: "CAT-005", code: "CEM-03", sectorId: "SEC-01", name: "Maçonnerie", description: "Briques, parpaings, blocs", productCount: 2, status: "Active" },
  { id: "CAT-002", code: "MET-01", sectorId: "SEC-01", name: "Acier & Ferronnerie", description: "Fer à béton, profilés, quincaillerie", productCount: 1, status: "Active" },
  { id: "CAT-003", code: "FIN-01", sectorId: "SEC-01", name: "Revêtement", description: "Carrelage, faïence, marbre", productCount: 1, status: "Active" },
  { id: "CAT-031", code: "ISO-01", sectorId: "SEC-01", name: "Étanchéité", description: "Membranes, bitume, revêtements", productCount: 1, status: "Active" },
  { id: "CAT-006", code: "PLO-01", sectorId: "SEC-01", name: "Plomberie", description: "Tuyaux, raccords, robinetterie", productCount: 3, status: "Active" },
  { id: "CAT-030", code: "ELE-01", sectorId: "SEC-01", name: "Électricité", description: "Câbles, interrupteurs, tableaux", productCount: 1, status: "Active" },
  { id: "CAT-032", code: "MEN-01", sectorId: "SEC-01", name: "Menuiserie", description: "Portes, fenêtres, bois", productCount: 1, status: "Active" },
  { id: "CAT-033", code: "VIT-01", sectorId: "SEC-01", name: "Vitrerie", description: "Vitres, miroirs, double vitrage", productCount: 1, status: "Active" },
  { id: "CAT-007", code: "PEI-01", sectorId: "SEC-01", name: "Peinture", description: "Peinture, vernis, enduit", productCount: 1, status: "Active" },
  // SEC-02: Food
  { id: "CAT-008", code: "FOD-01", sectorId: "SEC-02", name: "Farines & Céréales", description: "Farine, semoule, riz, céréales", productCount: 3, status: "Active" },
  { id: "CAT-013", code: "FOD-02", sectorId: "SEC-02", name: "Pâtes & Semoule", description: "Pâtes, couscous, vermicelle", productCount: 1, status: "Active" },
  { id: "CAT-035", code: "FOD-03", sectorId: "SEC-02", name: "Légumineuses", description: "Lentilles, pois chiches, haricots", productCount: 1, status: "Active" },
  { id: "CAT-009", code: "FOD-04", sectorId: "SEC-02", name: "Huiles & Corps gras", description: "Huiles végétales, margarine, beurre", productCount: 2, status: "Active" },
  { id: "CAT-012", code: "FOD-05", sectorId: "SEC-02", name: "Produits laitiers", description: "Lait, yaourt, fromage", productCount: 1, status: "Active" },
  { id: "CAT-010", code: "FOD-06", sectorId: "SEC-02", name: "Conserves", description: "Tomate, sardines, thon, confitures", productCount: 4, status: "Active" },
  { id: "CAT-011", code: "FOD-07", sectorId: "SEC-02", name: "Sucre & Confiserie", description: "Sucre, chocolat, biscuits", productCount: 1, status: "Active" },
  { id: "CAT-034", code: "FOD-08", sectorId: "SEC-02", name: "Boissons", description: "Eau, jus, café, thé", productCount: 2, status: "Active" },
  { id: "CAT-036", code: "FOD-09", sectorId: "SEC-02", name: "Condiments", description: "Harissa, moutarde, épices", productCount: 1, status: "Active" },
  // SEC-03: Tech
  { id: "CAT-014", code: "IT-01", sectorId: "SEC-03", name: "Ordinateurs", description: "Laptops, desktops, workstations", productCount: 1, status: "Active" },
  { id: "CAT-015", code: "IT-02", sectorId: "SEC-03", name: "Téléphonie", description: "Smartphones, téléphones fixes", productCount: 1, status: "Active" },
  { id: "CAT-019", code: "IT-03", sectorId: "SEC-03", name: "Tablettes", description: "Tablettes Android, iPad", productCount: 1, status: "Active" },
  { id: "CAT-017", code: "IT-04", sectorId: "SEC-03", name: "Serveurs", description: "Serveurs rack, tour, NAS", productCount: 1, status: "Active" },
  { id: "CAT-016", code: "IT-05", sectorId: "SEC-03", name: "Câblage & Réseau", description: "Câbles, routeurs, switches", productCount: 4, status: "Active" },
  { id: "CAT-039", code: "IT-06", sectorId: "SEC-03", name: "Stockage", description: "SSD, HDD, clés USB", productCount: 2, status: "Active" },
  { id: "CAT-037", code: "IT-07", sectorId: "SEC-03", name: "Écrans", description: "Moniteurs, écrans tactiles", productCount: 1, status: "Active" },
  { id: "CAT-018", code: "IT-08", sectorId: "SEC-03", name: "Impression", description: "Imprimantes, vidéoprojecteurs", productCount: 2, status: "Active" },
  { id: "CAT-038", code: "IT-09", sectorId: "SEC-03", name: "Périphériques", description: "Claviers, souris, webcams", productCount: 1, status: "Active" },
  { id: "CAT-040", code: "IT-10", sectorId: "SEC-03", name: "Audio", description: "Casques, enceintes, microphones", productCount: 1, status: "Active" },
  { id: "CAT-041", code: "IT-11", sectorId: "SEC-03", name: "Sécurité", description: "Caméras IP, alarmes, contrôle accès", productCount: 1, status: "Active" },
  // SEC-04: Energy
  { id: "CAT-020", code: "ENR-01", sectorId: "SEC-04", name: "Énergie", description: "Panneaux solaires, onduleurs, batteries", productCount: 2, status: "Active" },
];

// ---------- SubCategories (Level 3) ----------
export interface SubCategory {
  tenantId?: string;
  id: string; name: string; categoryId: string; status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export const subCategories: SubCategory[] = [
  // CEM-01 Ciment & Liants
  { id: "SUB-001", name: "Ciment", categoryId: "CAT-001", status: "Active" },
  { id: "SUB-002", name: "Plâtre", categoryId: "CAT-001", status: "Active" },
  { id: "SUB-003", name: "Mortier", categoryId: "CAT-001", status: "Active" },
  { id: "SUB-004", name: "Chaux", categoryId: "CAT-001", status: "Active" },
  // CEM-02 Agrégats
  { id: "SUB-005", name: "Sable", categoryId: "CAT-004", status: "Active" },
  { id: "SUB-006", name: "Gravier", categoryId: "CAT-004", status: "Active" },
  { id: "SUB-007", name: "Gravillon", categoryId: "CAT-004", status: "Active" },
  // CEM-03 Maçonnerie
  { id: "SUB-008", name: "Briques", categoryId: "CAT-005", status: "Active" },
  { id: "SUB-009", name: "Parpaings", categoryId: "CAT-005", status: "Active" },
  { id: "SUB-010", name: "Blocs", categoryId: "CAT-005", status: "Active" },
  // MET-01 Acier
  { id: "SUB-011", name: "Fer à béton", categoryId: "CAT-002", status: "Active" },
  { id: "SUB-012", name: "Profilés", categoryId: "CAT-002", status: "Active" },
  { id: "SUB-013", name: "Quincaillerie", categoryId: "CAT-002", status: "Active" },
  // FIN-01 Revêtements
  { id: "SUB-014", name: "Carrelage", categoryId: "CAT-003", status: "Active" },
  { id: "SUB-015", name: "Faïence", categoryId: "CAT-003", status: "Active" },
  { id: "SUB-016", name: "Marbre", categoryId: "CAT-003", status: "Active" },
  // ISO-01 Étanchéité
  { id: "SUB-017", name: "Membranes", categoryId: "CAT-031", status: "Active" },
  { id: "SUB-018", name: "Bitume", categoryId: "CAT-031", status: "Active" },
  // PLO-01 Plomberie
  { id: "SUB-019", name: "Tuyaux", categoryId: "CAT-006", status: "Active" },
  { id: "SUB-020", name: "Raccords", categoryId: "CAT-006", status: "Active" },
  { id: "SUB-021", name: "Robinetterie", categoryId: "CAT-006", status: "Active" },
  // ELE-01 Électricité
  { id: "SUB-022", name: "Câbles", categoryId: "CAT-030", status: "Active" },
  { id: "SUB-023", name: "Interrupteurs", categoryId: "CAT-030", status: "Active" },
  { id: "SUB-024", name: "Tableaux", categoryId: "CAT-030", status: "Active" },
  // MEN-01 Menuiserie
  { id: "SUB-025", name: "Portes", categoryId: "CAT-032", status: "Active" },
  { id: "SUB-026", name: "Fenêtres", categoryId: "CAT-032", status: "Active" },
  { id: "SUB-027", name: "Bois", categoryId: "CAT-032", status: "Active" },
  // VIT-01 Vitrerie
  { id: "SUB-028", name: "Vitres", categoryId: "CAT-033", status: "Active" },
  { id: "SUB-029", name: "Double vitrage", categoryId: "CAT-033", status: "Active" },
  // PEI-01 Peinture
  { id: "SUB-030", name: "Peinture", categoryId: "CAT-007", status: "Active" },
  { id: "SUB-031", name: "Vernis", categoryId: "CAT-007", status: "Active" },
  { id: "SUB-032", name: "Enduit", categoryId: "CAT-007", status: "Active" },
  // FOD-01 Farines
  { id: "SUB-033", name: "Farine", categoryId: "CAT-008", status: "Active" },
  { id: "SUB-034", name: "Semoule", categoryId: "CAT-008", status: "Active" },
  { id: "SUB-035", name: "Riz", categoryId: "CAT-008", status: "Active" },
  // FOD-02 Pâtes
  { id: "SUB-036", name: "Pâtes", categoryId: "CAT-013", status: "Active" },
  { id: "SUB-037", name: "Couscous", categoryId: "CAT-013", status: "Active" },
  // FOD-03 Légumineuses
  { id: "SUB-038", name: "Lentilles", categoryId: "CAT-035", status: "Active" },
  { id: "SUB-039", name: "Pois chiches", categoryId: "CAT-035", status: "Active" },
  // FOD-04 Huiles
  { id: "SUB-040", name: "Huile", categoryId: "CAT-009", status: "Active" },
  { id: "SUB-041", name: "Beurre", categoryId: "CAT-009", status: "Active" },
  { id: "SUB-042", name: "Margarine", categoryId: "CAT-009", status: "Active" },
  // FOD-05 Produits laitiers
  { id: "SUB-043", name: "Lait", categoryId: "CAT-012", status: "Active" },
  { id: "SUB-044", name: "Yaourt", categoryId: "CAT-012", status: "Active" },
  { id: "SUB-045", name: "Fromage", categoryId: "CAT-012", status: "Active" },
  // FOD-06 Conserves
  { id: "SUB-046", name: "Tomate", categoryId: "CAT-010", status: "Active" },
  { id: "SUB-047", name: "Sardines", categoryId: "CAT-010", status: "Active" },
  { id: "SUB-048", name: "Thon", categoryId: "CAT-010", status: "Active" },
  // FOD-07 Sucre
  { id: "SUB-049", name: "Sucre", categoryId: "CAT-011", status: "Active" },
  { id: "SUB-050", name: "Chocolat", categoryId: "CAT-011", status: "Active" },
  { id: "SUB-051", name: "Biscuits", categoryId: "CAT-011", status: "Active" },
  // FOD-08 Boissons
  { id: "SUB-052", name: "Eau", categoryId: "CAT-034", status: "Active" },
  { id: "SUB-053", name: "Jus", categoryId: "CAT-034", status: "Active" },
  { id: "SUB-054", name: "Café", categoryId: "CAT-034", status: "Active" },
  { id: "SUB-055", name: "Thé", categoryId: "CAT-034", status: "Active" },
  // FOD-09 Condiments
  { id: "SUB-056", name: "Harissa", categoryId: "CAT-036", status: "Active" },
  { id: "SUB-057", name: "Moutarde", categoryId: "CAT-036", status: "Active" },
  { id: "SUB-058", name: "Épices", categoryId: "CAT-036", status: "Active" },
  // IT-01 Ordinateurs
  { id: "SUB-059", name: "Laptop", categoryId: "CAT-014", status: "Active" },
  { id: "SUB-060", name: "Desktop", categoryId: "CAT-014", status: "Active" },
  { id: "SUB-061", name: "Workstation", categoryId: "CAT-014", status: "Active" },
  // IT-02 Téléphonie
  { id: "SUB-062", name: "Smartphones", categoryId: "CAT-015", status: "Active" },
  { id: "SUB-063", name: "Téléphones fixes", categoryId: "CAT-015", status: "Active" },
  // IT-03 Tablettes
  { id: "SUB-064", name: "Android", categoryId: "CAT-019", status: "Active" },
  { id: "SUB-065", name: "iPad", categoryId: "CAT-019", status: "Active" },
  // IT-04 Serveurs
  { id: "SUB-066", name: "Rack", categoryId: "CAT-017", status: "Active" },
  { id: "SUB-067", name: "NAS", categoryId: "CAT-017", status: "Active" },
  // IT-05 Réseau
  { id: "SUB-068", name: "Routeurs", categoryId: "CAT-016", status: "Active" },
  { id: "SUB-069", name: "Switches", categoryId: "CAT-016", status: "Active" },
  { id: "SUB-070", name: "Câbles réseau", categoryId: "CAT-016", status: "Active" },
  // IT-06 Stockage
  { id: "SUB-071", name: "SSD", categoryId: "CAT-039", status: "Active" },
  { id: "SUB-072", name: "HDD", categoryId: "CAT-039", status: "Active" },
  { id: "SUB-073", name: "USB", categoryId: "CAT-039", status: "Active" },
  // IT-07 Écrans
  { id: "SUB-074", name: "Moniteurs", categoryId: "CAT-037", status: "Active" },
  { id: "SUB-075", name: "Tactiles", categoryId: "CAT-037", status: "Active" },
  // IT-08 Impression
  { id: "SUB-076", name: "Imprimantes", categoryId: "CAT-018", status: "Active" },
  { id: "SUB-077", name: "Vidéoprojecteurs", categoryId: "CAT-018", status: "Active" },
  // IT-09 Périphériques
  { id: "SUB-078", name: "Claviers", categoryId: "CAT-038", status: "Active" },
  { id: "SUB-079", name: "Souris", categoryId: "CAT-038", status: "Active" },
  { id: "SUB-080", name: "Webcam", categoryId: "CAT-038", status: "Active" },
  // IT-10 Audio
  { id: "SUB-081", name: "Casques", categoryId: "CAT-040", status: "Active" },
  { id: "SUB-082", name: "Enceintes", categoryId: "CAT-040", status: "Active" },
  { id: "SUB-083", name: "Microphones", categoryId: "CAT-040", status: "Active" },
  // IT-11 Sécurité
  { id: "SUB-084", name: "Caméras", categoryId: "CAT-041", status: "Active" },
  { id: "SUB-085", name: "Alarmes", categoryId: "CAT-041", status: "Active" },
  { id: "SUB-086", name: "DVR", categoryId: "CAT-041", status: "Active" },
  // ENR-01 Énergie
  { id: "SUB-087", name: "Panneaux solaires", categoryId: "CAT-020", status: "Active" },
  { id: "SUB-088", name: "Onduleurs", categoryId: "CAT-020", status: "Active" },
  { id: "SUB-089", name: "Batteries", categoryId: "CAT-020", status: "Active" },
];

// ---------- UOM ----------
export type UnitKind = "PHYSICAL" | "ABSTRACT";

export interface UnitOfMeasure {
  tenantId?: string;
  id: string; name: string; abbreviation: string; type: "Weight" | "Volume" | "Length" | "Count" | "Area";
  unitKind: UnitKind;  // PHYSICAL = integer-only, ABSTRACT = decimals allowed
  baseUnit?: string; conversionFactor?: number;
  // ERP fields per ERP_PO_PREREQUISITES §1.4
  roundingPrecision?: number;  // decimal places (e.g. 0.001 for weight, 1 for discrete)
  uomCategory?: string;       // category group (e.g. "Weight", "Volume")
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
  tenantId?: string;
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
  tenantId?: string;
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

// --- TENANT ENRICHMENT ---
import { assignTenant } from "@/lib/tenantEnrichment";


products.forEach(x => assignTenant(x, "productSku"));
vendors.forEach(x => assignTenant(x, "customerVendor"));
warehouses.forEach(x => assignTenant(x, "warehouse"));
