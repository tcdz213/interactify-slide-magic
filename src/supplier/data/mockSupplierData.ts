/**
 * 📦 Supplier Portal — Mock Data (Complete)
 */
import type {
  SupplierProfile,
  SupplierPO,
  SupplierInvoice,
  SupplierDelivery,
  SupplierNotification,
  SupplierProduct,
  SupplierPerformance,
} from "../types/supplier";

export const SUPPLIER_PROFILE: SupplierProfile = {
  id: "SUP-001",
  tenantId: "T-FRN-01",
  companyName: "Agro Sahel Distribution",
  contactName: "Karim Benmoussa",
  email: "contact@agrosahel.dz",
  phone: "+213-21-555-678",
  zone: "Alger",
  category: "Alimentaire",
  status: "Active",
  rating: 4.2,
  address: "Zone Industrielle Oued Smar, Lot 42, Alger 16270",
  rib: "00799999000300452178 — BNA Agence Oued Smar",
  taxId: "NIF 000216099054321",
};

export const supplierPOs: SupplierPO[] = [
  {
    id: "PO-2026-0087",
    tenantId: "T-FRN-01",
    supplierId: "SUP-001",
    status: "Pending",
    totalAmount: 3_450_000,
    createdAt: "2026-03-06T09:00:00",
    expectedDelivery: "2026-03-10",
    warehouseId: "WH-001",
    warehouseName: "Entrepôt Central Alger",
    lines: [
      { productId: "P001", productName: "Huile d'olive 1L", qty: 500, unitPrice: 3_200, unit: "bouteille" },
      { productId: "P002", productName: "Semoule 25kg", qty: 200, unitPrice: 5_250, unit: "sac" },
    ],
  },
  {
    id: "PO-2026-0082",
    tenantId: "T-FRN-01",
    supplierId: "SUP-001",
    status: "Confirmed",
    totalAmount: 2_100_000,
    createdAt: "2026-03-03T11:30:00",
    expectedDelivery: "2026-03-08",
    warehouseId: "WH-002",
    warehouseName: "Entrepôt Oran",
    lines: [
      { productId: "P003", productName: "Tomates pelées 400g", qty: 1000, unitPrice: 850, unit: "boîte" },
      { productId: "P004", productName: "Lait UHT 1L", qty: 800, unitPrice: 1_500, unit: "brique" },
    ],
  },
  {
    id: "PO-2026-0075",
    tenantId: "T-FRN-01",
    supplierId: "SUP-001",
    status: "Delivered",
    totalAmount: 5_800_000,
    createdAt: "2026-02-25T08:00:00",
    expectedDelivery: "2026-03-01",
    warehouseId: "WH-001",
    warehouseName: "Entrepôt Central Alger",
    lines: [
      { productId: "P001", productName: "Huile d'olive 1L", qty: 1000, unitPrice: 3_200, unit: "bouteille" },
      { productId: "P005", productName: "Sucre 1kg", qty: 600, unitPrice: 2_800, unit: "paquet" },
    ],
  },
  {
    id: "PO-2026-0068",
    tenantId: "T-FRN-01",
    supplierId: "SUP-001",
    status: "Delivered",
    totalAmount: 1_750_000,
    createdAt: "2026-02-18T14:00:00",
    expectedDelivery: "2026-02-22",
    warehouseId: "WH-003",
    warehouseName: "Entrepôt Constantine",
    lines: [
      { productId: "P006", productName: "Farine 10kg", qty: 300, unitPrice: 4_500, unit: "sac" },
    ],
  },
  {
    id: "PO-2026-0060",
    tenantId: "T-FRN-01",
    supplierId: "SUP-001",
    status: "Shipped",
    totalAmount: 4_200_000,
    createdAt: "2026-03-05T07:30:00",
    expectedDelivery: "2026-03-09",
    warehouseId: "WH-001",
    warehouseName: "Entrepôt Central Alger",
    lines: [
      { productId: "P002", productName: "Semoule 25kg", qty: 400, unitPrice: 5_250, unit: "sac" },
      { productId: "P007", productName: "Pâtes 500g", qty: 1200, unitPrice: 1_750, unit: "paquet" },
    ],
  },
  {
    id: "PO-2026-0055",
    tenantId: "T-FRN-01",
    supplierId: "SUP-001",
    status: "Rejected",
    totalAmount: 900_000,
    createdAt: "2026-02-12T10:00:00",
    expectedDelivery: "2026-02-16",
    warehouseId: "WH-002",
    warehouseName: "Entrepôt Oran",
    lines: [
      { productId: "P008", productName: "Conserves sardines", qty: 500, unitPrice: 1_800, unit: "boîte" },
    ],
  },
];

export const supplierInvoices: SupplierInvoice[] = [
  { id: "INV-S-001", tenantId: "T-FRN-01", poId: "PO-2026-0075", supplierId: "SUP-001", amount: 5_800_000, balance: 0, status: "Paid", issuedAt: "2026-03-02", dueDate: "2026-04-01" },
  { id: "INV-S-002", tenantId: "T-FRN-01", poId: "PO-2026-0068", supplierId: "SUP-001", amount: 1_750_000, balance: 1_750_000, status: "Pending", issuedAt: "2026-02-23", dueDate: "2026-03-25" },
  { id: "INV-S-003", tenantId: "T-FRN-01", poId: "PO-2026-0082", supplierId: "SUP-001", amount: 2_100_000, balance: 2_100_000, status: "Validated", issuedAt: "2026-03-04", dueDate: "2026-04-04" },
  { id: "INV-S-004", tenantId: "T-FRN-01", poId: "PO-2026-0060", supplierId: "SUP-001", amount: 4_200_000, balance: 4_200_000, status: "Pending", issuedAt: "2026-03-06", dueDate: "2026-04-06" },
];

export const supplierDeliveries: SupplierDelivery[] = [
  { id: "DEL-S-001", tenantId: "T-FRN-01", poId: "PO-2026-0075", supplierId: "SUP-001", status: "Delivered", dispatchedAt: "2026-02-28", deliveredAt: "2026-03-01", itemCount: 1600, grnId: "GRN-4501" },
  { id: "DEL-S-002", tenantId: "T-FRN-01", poId: "PO-2026-0068", supplierId: "SUP-001", status: "Delivered", dispatchedAt: "2026-02-20", deliveredAt: "2026-02-22", itemCount: 300, grnId: "GRN-4489" },
  { id: "DEL-S-003", tenantId: "T-FRN-01", poId: "PO-2026-0060", supplierId: "SUP-001", status: "InTransit", dispatchedAt: "2026-03-07", deliveredAt: null, itemCount: 1600, grnId: null },
  { id: "DEL-S-004", tenantId: "T-FRN-01", poId: "PO-2026-0082", supplierId: "SUP-001", status: "Preparing", dispatchedAt: null, deliveredAt: null, itemCount: 1800, grnId: null },
];

export const supplierNotifications: SupplierNotification[] = [
  { id: "SN-001", tenantId: "T-FRN-01", title: "Nouvelle commande PO-2026-0087", body: "Vous avez reçu une nouvelle commande à confirmer.", type: "po", read: false, createdAt: "2026-03-06T09:05:00" },
  { id: "SN-002", tenantId: "T-FRN-01", title: "Paiement reçu — INV-S-001", body: "Le paiement de 5 800 000 DZD a été crédité.", type: "payment", read: false, createdAt: "2026-03-05T14:00:00" },
  { id: "SN-003", tenantId: "T-FRN-01", title: "Réclamation qualité #QC-019", body: "Un lot de conserves présente un problème d'étiquetage.", type: "quality", read: true, createdAt: "2026-03-03T10:00:00" },
  { id: "SN-004", tenantId: "T-FRN-01", title: "Rappel : livraison PO-2026-0082", body: "La date de livraison prévue est le 08/03/2026.", type: "info", read: true, createdAt: "2026-03-02T08:00:00" },
  { id: "SN-005", tenantId: "T-FRN-01", title: "Facture INV-S-002 bientôt échue", body: "L'échéance de la facture INV-S-002 est dans 5 jours.", type: "payment", read: false, createdAt: "2026-03-07T08:00:00" },
  { id: "SN-006", tenantId: "T-FRN-01", title: "Commande PO-2026-0082 confirmée", body: "Votre confirmation a été enregistrée.", type: "po", read: true, createdAt: "2026-03-03T12:00:00" },
];

export const supplierProducts: SupplierProduct[] = [
  { id: "P001", tenantId: "T-FRN-01", name: "Huile d'olive 1L", category: "Huiles", unitPrice: 3_200, unit: "bouteille", available: true, lastUpdated: "2026-03-01" },
  { id: "P002", tenantId: "T-FRN-01", name: "Semoule 25kg", category: "Céréales", unitPrice: 5_250, unit: "sac", available: true, lastUpdated: "2026-02-28" },
  { id: "P003", tenantId: "T-FRN-01", name: "Tomates pelées 400g", category: "Conserves", unitPrice: 850, unit: "boîte", available: true, lastUpdated: "2026-02-20" },
  { id: "P004", tenantId: "T-FRN-01", name: "Lait UHT 1L", category: "Produits laitiers", unitPrice: 1_500, unit: "brique", available: false, lastUpdated: "2026-03-05" },
  { id: "P005", tenantId: "T-FRN-01", name: "Sucre 1kg", category: "Épicerie", unitPrice: 2_800, unit: "paquet", available: true, lastUpdated: "2026-02-25" },
  { id: "P006", tenantId: "T-FRN-01", name: "Farine 10kg", category: "Céréales", unitPrice: 4_500, unit: "sac", available: true, lastUpdated: "2026-02-15" },
  { id: "P007", tenantId: "T-FRN-01", name: "Pâtes 500g", category: "Épicerie", unitPrice: 1_750, unit: "paquet", available: true, lastUpdated: "2026-03-02" },
  { id: "P008", tenantId: "T-FRN-01", name: "Conserves sardines", category: "Conserves", unitPrice: 1_800, unit: "boîte", available: false, lastUpdated: "2026-01-30" },
];

export const supplierPerformance: SupplierPerformance = {
  tenantId: "T-FRN-01",
  globalScore: 4.2,
  onTimeDeliveryRate: 92,
  qualityConformityRate: 96,
  acceptanceRate: 88,
  returnRate: 2.1,
  avgDeliveryDays: 3.4,
  contractTargets: { onTime: 95, quality: 98, acceptance: 90 },
  monthlyOrders: [
    { month: "Oct", count: 8, amount: 12_000_000 },
    { month: "Nov", count: 10, amount: 15_500_000 },
    { month: "Déc", count: 7, amount: 9_800_000 },
    { month: "Jan", count: 11, amount: 17_200_000 },
    { month: "Fév", count: 9, amount: 13_800_000 },
    { month: "Mar", count: 6, amount: 10_500_000 },
  ],
  qualityClaims: [
    { id: "QC-019", date: "2026-03-03", description: "Problème d'étiquetage — lot sardines", status: "Open" },
    { id: "QC-015", date: "2026-02-10", description: "Emballage endommagé — semoule 25kg", status: "Resolved" },
    { id: "QC-012", date: "2026-01-18", description: "Date péremption incorrecte — lait UHT", status: "Resolved" },
  ],
};
