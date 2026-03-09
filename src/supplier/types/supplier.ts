/**
 * 📦 Supplier Portal — Types
 */

export interface SupplierProfile {
  id: string;
  tenantId?: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  zone: string;
  category: string;
  status: "Active" | "Suspended" | "Pending";
  rating: number;
  address: string;
  rib: string;
  taxId: string;
}

export interface SupplierPO {
  id: string;
  tenantId?: string;
  supplierId: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Rejected";
  totalAmount: number;
  createdAt: string;
  expectedDelivery: string;
  warehouseId: string;
  warehouseName: string;
  lines: SupplierPOLine[];
}

export interface SupplierPOLine {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  unit: string;
}

export interface SupplierInvoice {
  id: string;
  tenantId?: string;
  poId: string;
  supplierId: string;
  amount: number;
  balance: number;
  status: "Pending" | "Validated" | "Paid" | "Disputed";
  issuedAt: string;
  dueDate: string;
}

export interface SupplierDelivery {
  id: string;
  tenantId?: string;
  poId: string;
  supplierId: string;
  status: "Preparing" | "InTransit" | "Delivered" | "Partial";
  dispatchedAt: string | null;
  deliveredAt: string | null;
  itemCount: number;
  grnId: string | null;
}

export interface SupplierNotification {
  id: string;
  tenantId?: string;
  title: string;
  body: string;
  type: "po" | "payment" | "quality" | "info";
  read: boolean;
  createdAt: string;
}

export interface SupplierProduct {
  id: string;
  tenantId?: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
  available: boolean;
  lastUpdated: string;
}

export interface SupplierPerformance {
  tenantId?: string;
  globalScore: number;
  onTimeDeliveryRate: number;
  qualityConformityRate: number;
  acceptanceRate: number;
  returnRate: number;
  avgDeliveryDays: number;
  contractTargets: { onTime: number; quality: number; acceptance: number };
  monthlyOrders: { month: string; count: number; amount: number }[];
  qualityClaims: { id: string; date: string; description: string; status: "Open" | "Resolved" }[];
}

export interface SupplierKpiData {
  activePOs: number;
  deliveredThisMonth: number;
  pendingPayment: number;
  qualityScore: number;
  onTimeRate: number;
  totalRevenue: number;
}
