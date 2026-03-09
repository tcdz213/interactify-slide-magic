/**
 * 🏪 Client Portal — Mock Data
 * Customer-scoped data for Café Central (C001 mapped to portal customer "COSIDER Travaux Publics")
 * We use real customer C004 "Supermarché Uno" as portal demo customer.
 */

import type {
  PortalUser,
  PortalInvoice,
  PortalPayment,
  PortalOrder,
  PortalNotification,
  StatementEntry,
  ReturnRequest,
} from "../types/portal";

// ── Portal User ──
export const PORTAL_USER: PortalUser = {
  id: "PU-001",
  customerId: "C004",
  customerName: "Supermarché Uno",
  email: "appro@uno.dz",
  phone: "+213-41-777-888",
  role: "customer",
};

export const PORTAL_CUSTOMER = {
  id: "C004",
  name: "Supermarché Uno",
  type: "Grand Compte" as const,
  zone: "Oran",
  phone: "+213-41-777-888",
  email: "appro@uno.dz",
  creditLimit: 20000000,
  creditUsed: 9500000,
  paymentTerms: "Net_30" as const,
  status: "Active" as const,
};

// ── Orders ──
export const portalOrders: PortalOrder[] = [
  {
    id: "ORD-20260223-004",
    customerId: "C004",
    customerName: "Supermarché Uno",
    status: "Delivered",
    totalAmount: 4178916,
    createdAt: "2026-02-23T07:00:00",
    deliveryDate: "2026-02-24",
    lines: [
      { productId: "P010", productName: "Huile de tournesol 5L", qty: 800, unitPrice: 1650, lineTotal: 1280400 },
      { productId: "P012", productName: "Sucre blanc 1kg", qty: 100, unitPrice: 7200, lineTotal: 698400 },
      { productId: "P013", productName: "Lait UHT 1L", qty: 400, unitPrice: 600, lineTotal: 232800 },
      { productId: "P014", productName: "Pâtes alimentaires 500g", qty: 200, unitPrice: 2400, lineTotal: 465600 },
    ],
  },
  {
    id: "ORD-20260301-010",
    customerId: "C004",
    customerName: "Supermarché Uno",
    status: "Shipped",
    totalAmount: 2850000,
    createdAt: "2026-03-01T08:30:00",
    deliveryDate: "2026-03-02",
    eta: "14:00",
    lines: [
      { productId: "P009", productName: "Farine de blé T55 (50kg)", qty: 200, unitPrice: 4800, lineTotal: 960000 },
      { productId: "P010", productName: "Huile de tournesol 5L", qty: 600, unitPrice: 1650, lineTotal: 990000 },
      { productId: "P015", productName: "Riz basmati 5kg", qty: 300, unitPrice: 3000, lineTotal: 900000 },
    ],
  },
  {
    id: "ORD-20260228-009",
    customerId: "C004",
    customerName: "Supermarché Uno",
    status: "Approved",
    totalAmount: 1920000,
    createdAt: "2026-02-28T10:00:00",
    deliveryDate: "2026-03-01",
    lines: [
      { productId: "P011", productName: "Tomate concentrée 800g", qty: 300, unitPrice: 3200, lineTotal: 960000 },
      { productId: "P016", productName: "Sardines en conserve 125g", qty: 200, unitPrice: 4800, lineTotal: 960000 },
    ],
  },
  {
    id: "ORD-20260215-007",
    customerId: "C004",
    customerName: "Supermarché Uno",
    status: "Delivered",
    totalAmount: 3500000,
    createdAt: "2026-02-15T09:00:00",
    deliveryDate: "2026-02-16",
    lines: [
      { productId: "P010", productName: "Huile de tournesol 5L", qty: 1000, unitPrice: 1650, lineTotal: 1650000 },
      { productId: "P012", productName: "Sucre blanc 1kg", qty: 150, unitPrice: 7200, lineTotal: 1080000 },
      { productId: "P014", productName: "Pâtes alimentaires 500g", qty: 320, unitPrice: 2400, lineTotal: 768000 },
    ],
  },
  {
    id: "ORD-20260205-005",
    customerId: "C004",
    customerName: "Supermarché Uno",
    status: "Cancelled",
    totalAmount: 1200000,
    createdAt: "2026-02-05T11:00:00",
    lines: [
      { productId: "P009", productName: "Farine de blé T55 (50kg)", qty: 250, unitPrice: 4800, lineTotal: 1200000 },
    ],
  },
];

// ── Invoices ──
export const portalInvoices: PortalInvoice[] = [
  {
    id: "INV-20260223-002",
    orderId: "ORD-20260223-004",
    customerId: "C004",
    amount: 3620000,
    taxAmount: 667716,
    totalAmount: 4178916,
    paidAmount: 0,
    balance: 4178916,
    status: "issued",
    issuedDate: "2026-02-23",
    dueDate: "2026-03-25",
  },
  {
    id: "INV-20260215-010",
    orderId: "ORD-20260215-007",
    customerId: "C004",
    amount: 3500000,
    taxAmount: 665000,
    totalAmount: 4165000,
    paidAmount: 4165000,
    balance: 0,
    status: "paid",
    issuedDate: "2026-02-15",
    dueDate: "2026-03-17",
    paidDate: "2026-02-28",
  },
  {
    id: "INV-20260130-011",
    orderId: "ORD-20260130-003",
    customerId: "C004",
    amount: 2800000,
    taxAmount: 532000,
    totalAmount: 3332000,
    paidAmount: 1500000,
    balance: 1832000,
    status: "partially_paid",
    issuedDate: "2026-01-30",
    dueDate: "2026-03-01",
  },
  {
    id: "INV-20260110-012",
    orderId: "ORD-20260110-002",
    customerId: "C004",
    amount: 1800000,
    taxAmount: 342000,
    totalAmount: 2142000,
    paidAmount: 0,
    balance: 2142000,
    status: "overdue",
    issuedDate: "2026-01-10",
    dueDate: "2026-02-09",
  },
];

// ── Payments ──
export const portalPayments: PortalPayment[] = [
  {
    id: "PPAY-001",
    customerId: "C004",
    invoiceId: "INV-20260215-010",
    amount: 4165000,
    method: "transfer",
    reference: "VIR-20260228-004",
    status: "confirmed",
    paidAt: "2026-02-28",
  },
  {
    id: "PPAY-002",
    customerId: "C004",
    invoiceId: "INV-20260130-011",
    amount: 1500000,
    method: "cheque",
    reference: "CHQ-442310",
    status: "confirmed",
    paidAt: "2026-02-20",
  },
  {
    id: "PPAY-003",
    customerId: "C004",
    invoiceId: "INV-20260110-012",
    amount: 2142000,
    method: "transfer",
    reference: "VIR-20260301-UNO",
    status: "pending",
    paidAt: "2026-03-01",
  },
];

// ── Statement ──
export const portalStatement: StatementEntry[] = [
  { id: "ST-001", date: "2026-03-01", description: "Paiement virement — INV-20260110-012", type: "credit", amount: 2142000, runningBalance: 5974916, reference: "VIR-20260301-UNO", documentType: "payment" },
  { id: "ST-002", date: "2026-02-28", description: "Paiement virement — INV-20260215-010", type: "credit", amount: 4165000, runningBalance: 8116916, reference: "VIR-20260228-004", documentType: "payment" },
  { id: "ST-003", date: "2026-02-23", description: "Facture INV-20260223-002", type: "debit", amount: 4178916, runningBalance: 12281916, reference: "INV-20260223-002", documentType: "invoice" },
  { id: "ST-004", date: "2026-02-20", description: "Paiement chèque — INV-20260130-011", type: "credit", amount: 1500000, runningBalance: 8103000, reference: "CHQ-442310", documentType: "payment" },
  { id: "ST-005", date: "2026-02-15", description: "Facture INV-20260215-010", type: "debit", amount: 4165000, runningBalance: 9603000, reference: "INV-20260215-010", documentType: "invoice" },
  { id: "ST-006", date: "2026-01-30", description: "Facture INV-20260130-011", type: "debit", amount: 3332000, runningBalance: 5438000, reference: "INV-20260130-011", documentType: "invoice" },
  { id: "ST-007", date: "2026-01-10", description: "Facture INV-20260110-012", type: "debit", amount: 2142000, runningBalance: 2106000, reference: "INV-20260110-012", documentType: "invoice" },
  { id: "ST-008", date: "2026-01-01", description: "Solde d'ouverture", type: "debit", amount: 0, runningBalance: -36000, reference: "OPEN-2026", documentType: "adjustment" },
];

// ── Notifications ──
export const portalNotifications: PortalNotification[] = [
  { id: "N001", customerId: "C004", type: "order_status", title: "Commande expédiée", message: "Votre commande ORD-20260301-010 est en cours de livraison. ETA: 14h00.", read: false, createdAt: "2026-03-01T10:30:00", actionUrl: "/portal/orders/ORD-20260301-010" },
  { id: "N002", customerId: "C004", type: "invoice_due", title: "Facture bientôt échue", message: "La facture INV-20260130-011 arrive à échéance le 01/03. Solde: 1,832,000 DZD.", read: false, createdAt: "2026-02-28T08:00:00", actionUrl: "/portal/invoices" },
  { id: "N003", customerId: "C004", type: "payment_received", title: "Paiement reçu", message: "Votre paiement de 4,165,000 DZD a été confirmé pour INV-20260215-010.", read: true, createdAt: "2026-02-28T15:00:00" },
  { id: "N004", customerId: "C004", type: "invoice_issued", title: "Nouvelle facture", message: "La facture INV-20260223-002 de 4,178,916 DZD est disponible.", read: true, createdAt: "2026-02-23T12:00:00", actionUrl: "/portal/invoices" },
  { id: "N005", customerId: "C004", type: "credit_warning", title: "Alerte crédit", message: "Votre utilisation crédit atteint 47%. Limite: 20,000,000 DZD.", read: true, createdAt: "2026-02-20T09:00:00" },
];

// ── Return Requests ──
export const portalReturns: ReturnRequest[] = [
  {
    id: "RET-001",
    customerId: "C004",
    orderId: "ORD-20260215-007",
    status: "approved",
    reason: "Produit abîmé à la livraison",
    notes: "Cartons d'huile écrasés",
    requestedAt: "2026-02-17T10:00:00",
    reviewedAt: "2026-02-18T14:00:00",
    lines: [
      { productId: "P010", productName: "Huile de tournesol 5L", orderedQty: 1000, returnQty: 12, reason: "damaged" },
    ],
  },
];

// ── Product Catalog (customer-facing with own prices) ──
export const portalCatalog = [
  { id: "P009", name: "Farine de blé T55 (50kg)", sku: "FOOD-001", unitPrice: 4800, stock: 380, category: "Farines" },
  { id: "P010", name: "Huile de tournesol 5L", sku: "FOOD-002", unitPrice: 1650, stock: 450, category: "Huiles" },
  { id: "P011", name: "Tomate concentrée 800g", sku: "FOOD-003", unitPrice: 3200, stock: 280, category: "Conserves" },
  { id: "P012", name: "Sucre blanc 1kg", sku: "FOOD-004", unitPrice: 7200, stock: 190, category: "Sucre" },
  { id: "P013", name: "Lait UHT 1L", sku: "FOOD-005", unitPrice: 600, stock: 550, category: "Laitiers" },
  { id: "P014", name: "Pâtes alimentaires 500g", sku: "FOOD-006", unitPrice: 2400, stock: 320, category: "Pâtes" },
  { id: "P015", name: "Riz basmati 5kg", sku: "FOOD-007", unitPrice: 3000, stock: 240, category: "Farines" },
  { id: "P016", name: "Sardines en conserve 125g", sku: "FOOD-008", unitPrice: 4800, stock: 180, category: "Conserves" },
  { id: "P036", name: "Eau minérale Ifri 1.5L (pack 6)", sku: "FOOD-012", unitPrice: 280, stock: 500, category: "Boissons" },
  { id: "P037", name: "Café moulu Tassili 250g", sku: "FOOD-013", unitPrice: 9600, stock: 140, category: "Boissons" },
];
