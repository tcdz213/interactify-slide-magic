/**
 * Mock data for the mobile sales rep app.
 * Simulates customers, orders, routes, and rep profile.
 */

export interface MobileCustomer {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  creditLimit: number;
  creditUsed: number;
  oldestOverdueDays: number;
  lastVisit: string;
  category: "A" | "B" | "C";
}

export interface MobileOrderLine {
  productId: string;
  productName: string;
  sku: string;
  qty: number;
  unitPrice: number;
  stock: number;
}

export type MobileOrderStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Picking" | "Shipped" | "Delivered" | "Cancelled";

export interface MobileOrder {
  id: string;
  customerId: string;
  customerName: string;
  status: MobileOrderStatus;
  lines: MobileOrderLine[];
  totalAmount: number;
  createdAt: string;
  acceptPartial: boolean;
}

export interface RoutePlan {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  plannedTime: string;
  checkedIn: boolean;
  checkedOut: boolean;
}

export const REP_PROFILE = {
  id: "REP-001",
  name: "Yassine Khelifi",
  pin: "123456",
  avatar: "YK",
  zone: "Alger Ouest",
  quotaTarget: 500000,
  quotaCurrent: 385000,
};

export const mockCustomers: MobileCustomer[] = [
  { id: "C001", name: "Café Central", address: "12 Rue Didouche Mourad, Alger", phone: "0555-123-456", lat: 36.7538, lng: 3.0588, creditLimit: 500000, creditUsed: 120000, oldestOverdueDays: 5, lastVisit: "2026-02-27", category: "A" },
  { id: "C002", name: "Market Express", address: "45 Bd Mohamed V, Alger", phone: "0555-234-567", lat: 36.7600, lng: 3.0500, creditLimit: 300000, creditUsed: 210000, oldestOverdueDays: 25, lastVisit: "2026-02-24", category: "A" },
  { id: "C003", name: "Épicerie Nord", address: "8 Rue Abane Ramdane, Alger", phone: "0555-345-678", lat: 36.7700, lng: 3.0650, creditLimit: 200000, creditUsed: 195000, oldestOverdueDays: 65, lastVisit: "2026-02-17", category: "B" },
  { id: "C004", name: "Superette El Baraka", address: "23 Av. 1er Novembre, Blida", phone: "0555-456-789", lat: 36.4700, lng: 2.8300, creditLimit: 400000, creditUsed: 80000, oldestOverdueDays: 0, lastVisit: "2026-02-28", category: "A" },
  { id: "C005", name: "Boulangerie Sami", address: "67 Rue des Frères Bouadou, Alger", phone: "0555-567-890", lat: 36.7450, lng: 3.0750, creditLimit: 150000, creditUsed: 45000, oldestOverdueDays: 10, lastVisit: "2026-02-26", category: "B" },
  { id: "C006", name: "Restaurant El Djazair", address: "3 Place Audin, Alger", phone: "0555-678-901", lat: 36.7580, lng: 3.0520, creditLimit: 350000, creditUsed: 340000, oldestOverdueDays: 45, lastVisit: "2026-02-20", category: "C" },
  { id: "C007", name: "Mini Market Soltane", address: "15 Cité 1000 Logements, Bab Ezzouar", phone: "0555-789-012", lat: 36.7200, lng: 3.1800, creditLimit: 250000, creditUsed: 60000, oldestOverdueDays: 0, lastVisit: "2026-03-01", category: "B" },
  { id: "C008", name: "Pâtisserie Rania", address: "41 Rue Hassiba Ben Bouali, Alger", phone: "0555-890-123", lat: 36.7520, lng: 3.0420, creditLimit: 180000, creditUsed: 30000, oldestOverdueDays: 0, lastVisit: "2026-02-25", category: "C" },
];

export const mockOrders: MobileOrder[] = [
  { id: "SO-2026-0401", customerId: "C001", customerName: "Café Central", status: "Delivered", lines: [{ productId: "P010", productName: "Huile de tournesol 5L", sku: "FOOD-002", qty: 20, unitPrice: 1650, stock: 450 }], totalAmount: 33000, createdAt: "2026-02-28T09:15:00", acceptPartial: false },
  { id: "SO-2026-0402", customerId: "C002", customerName: "Market Express", status: "Approved", lines: [{ productId: "P009", productName: "Farine de blé T55 (50kg)", sku: "FOOD-001", qty: 10, unitPrice: 4800, stock: 380 }, { productId: "P012", productName: "Sucre blanc 1kg", sku: "FOOD-004", qty: 15, unitPrice: 7200, stock: 190 }], totalAmount: 156000, createdAt: "2026-02-28T14:30:00", acceptPartial: true },
  { id: "SO-2026-0403", customerId: "C004", customerName: "Superette El Baraka", status: "Pending", lines: [{ productId: "P014", productName: "Pâtes alimentaires 500g", sku: "FOOD-006", qty: 30, unitPrice: 2400, stock: 320 }], totalAmount: 72000, createdAt: "2026-03-01T08:00:00", acceptPartial: false },
  { id: "SO-2026-0404", customerId: "C005", customerName: "Boulangerie Sami", status: "Shipped", lines: [{ productId: "P009", productName: "Farine de blé T55 (50kg)", sku: "FOOD-001", qty: 25, unitPrice: 4800, stock: 380 }], totalAmount: 120000, createdAt: "2026-02-27T11:45:00", acceptPartial: false },
  { id: "SO-2026-0405", customerId: "C006", customerName: "Restaurant El Djazair", status: "Rejected", lines: [{ productId: "P010", productName: "Huile de tournesol 5L", sku: "FOOD-002", qty: 50, unitPrice: 1650, stock: 450 }], totalAmount: 82500, createdAt: "2026-02-26T16:20:00", acceptPartial: false },
];

export const mockRoutePlan: RoutePlan[] = [
  { id: "R001", customerId: "C001", customerName: "Café Central", address: "12 Rue Didouche Mourad", lat: 36.7538, lng: 3.0588, plannedTime: "09:00", checkedIn: true, checkedOut: true },
  { id: "R002", customerId: "C002", customerName: "Market Express", address: "45 Bd Mohamed V", lat: 36.7600, lng: 3.0500, plannedTime: "10:30", checkedIn: true, checkedOut: false },
  { id: "R003", customerId: "C005", customerName: "Boulangerie Sami", address: "67 Rue des Frères Bouadou", lat: 36.7450, lng: 3.0750, plannedTime: "11:30", checkedIn: false, checkedOut: false },
  { id: "R004", customerId: "C007", customerName: "Mini Market Soltane", address: "15 Cité 1000 Logements", lat: 36.7200, lng: 3.1800, plannedTime: "14:00", checkedIn: false, checkedOut: false },
  { id: "R005", customerId: "C008", customerName: "Pâtisserie Rania", address: "41 Rue Hassiba Ben Bouali", lat: 36.7520, lng: 3.0420, plannedTime: "15:30", checkedIn: false, checkedOut: false },
];

/** Products available in the mobile catalog */
export interface MobileCatalogItem {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stock: number; // in base unit
  category: string;
  baseUnit: string; // abbreviation of base unit
  conversions: { unitName: string; unitAbbr: string; factor: number }[];
}

export const mobileCatalog: MobileCatalogItem[] = [
  { id: "P009", name: "Farine de blé T55 (50kg)", sku: "FOOD-001", unitPrice: 4800, stock: 380, category: "Farines", baseUnit: "kg",
    conversions: [{ unitName: "kg", unitAbbr: "kg", factor: 1 }, { unitName: "Sac (50kg)", unitAbbr: "Sac", factor: 50 }, { unitName: "Tonne", unitAbbr: "T", factor: 1000 }] },
  { id: "P010", name: "Huile de tournesol 5L", sku: "FOOD-002", unitPrice: 1650, stock: 450, category: "Huiles", baseUnit: "L",
    conversions: [{ unitName: "Litre", unitAbbr: "L", factor: 1 }, { unitName: "Bidon (5L)", unitAbbr: "Bid", factor: 5 }, { unitName: "Carton (4 bid.)", unitAbbr: "Ctn", factor: 20 }] },
  { id: "P011", name: "Tomate concentrée 800g", sku: "FOOD-003", unitPrice: 3200, stock: 280, category: "Conserves", baseUnit: "Bte",
    conversions: [{ unitName: "Boîte", unitAbbr: "Bte", factor: 1 }, { unitName: "Carton (24)", unitAbbr: "Ctn", factor: 24 }] },
  { id: "P012", name: "Sucre blanc 1kg", sku: "FOOD-004", unitPrice: 7200, stock: 190, category: "Sucre", baseUnit: "kg",
    conversions: [{ unitName: "kg", unitAbbr: "kg", factor: 1 }, { unitName: "Sac (50kg)", unitAbbr: "Sac", factor: 50 }] },
  { id: "P013", name: "Lait UHT 1L", sku: "FOOD-005", unitPrice: 600, stock: 550, category: "Laitiers", baseUnit: "Brq",
    conversions: [{ unitName: "Brique", unitAbbr: "Brq", factor: 1 }, { unitName: "Carton (12)", unitAbbr: "Ctn", factor: 12 }] },
  { id: "P014", name: "Pâtes alimentaires 500g", sku: "FOOD-006", unitPrice: 2400, stock: 320, category: "Pâtes", baseUnit: "Pqt",
    conversions: [{ unitName: "Paquet", unitAbbr: "Pqt", factor: 1 }, { unitName: "Carton (20)", unitAbbr: "Ctn", factor: 20 }] },
  { id: "P015", name: "Riz basmati 5kg", sku: "FOOD-007", unitPrice: 3000, stock: 240, category: "Farines", baseUnit: "kg",
    conversions: [{ unitName: "kg", unitAbbr: "kg", factor: 1 }, { unitName: "Sac (5kg)", unitAbbr: "Sac", factor: 5 }] },
  { id: "P016", name: "Sardines en conserve 125g", sku: "FOOD-008", unitPrice: 4800, stock: 180, category: "Conserves", baseUnit: "Bte",
    conversions: [{ unitName: "Boîte", unitAbbr: "Bte", factor: 1 }, { unitName: "Carton (48)", unitAbbr: "Ctn", factor: 48 }] },
  { id: "P036", name: "Eau minérale Ifri 1.5L (pack 6)", sku: "FOOD-012", unitPrice: 280, stock: 500, category: "Boissons", baseUnit: "Pack",
    conversions: [{ unitName: "Pack (6)", unitAbbr: "Pack", factor: 1 }] },
  { id: "P037", name: "Café moulu Tassili 250g", sku: "FOOD-013", unitPrice: 9600, stock: 140, category: "Boissons", baseUnit: "Pce",
    conversions: [{ unitName: "Pièce", unitAbbr: "Pce", factor: 1 }, { unitName: "Carton (24)", unitAbbr: "Ctn", factor: 24 }] },
];
