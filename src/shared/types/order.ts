/**
 * Shared order types — used by both Mobile and Admin apps.
 * Extracted per MOBILE_SPLIT_ARCHITECTURE Phase 3.3.
 */

export type OrderStatus =
  | "Draft"
  | "Pending"
  | "Credit_Hold"
  | "Approved"
  | "Rejected"
  | "Picking"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderLine {
  lineId: number;
  productId: string;
  productName: string;
  orderedQty: number;
  reservedQty: number;
  shippedQty: number;
  unitPrice: number;
  unitCost: number;
  unitCostAtSale: number;
  lineDiscount: number;
  lineTotal: number;
  // R2: Unit conversion metadata — Phase 1.1 (REQUIRED)
  unitId: string;             // FK → ProductUnitConversion.id
  unitAbbr: string;           // selected unit abbreviation (e.g. "Ctn", "kg")
  unitName: string;           // selected unit name
  conversionFactor: number;   // base units per 1 of selected unit
  baseQty: number;            // orderedQty converted to base units
}

export interface Order {
  id: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  repId?: string;
  salesRep: string;
  status: OrderStatus;
  lines: OrderLine[];
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountPct: number;
  creditCheckResult?: CreditCheckResult;
  acceptPartial: boolean;
  orderDate: string;
  deliveryDate: string;
  paymentTerms: string;
  channel: string;
  notes: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreditCheckResult {
  passed: boolean;
  available: number;
  requested: number;
  overdueDays: number;
  blocked: boolean;
}
