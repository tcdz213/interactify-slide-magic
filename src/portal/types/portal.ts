/**
 * 🏪 Client Portal — Type definitions
 */

export interface PortalUser {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone?: string;
  role: "customer" | "customer_admin";
}

export interface PortalInvoice {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: "draft" | "issued" | "paid" | "overdue" | "partially_paid" | "cancelled";
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
}

export interface PortalPayment {
  id: string;
  customerId: string;
  invoiceId: string;
  amount: number;
  method: "cash" | "cheque" | "transfer" | "card";
  reference: string;
  status: "pending" | "confirmed" | "rejected" | "bounced";
  paidAt: string;
  proofUrl?: string;
}

export interface StatementEntry {
  id: string;
  date: string;
  description: string;
  type: "debit" | "credit";
  amount: number;
  runningBalance: number;
  reference: string;
  documentType: "invoice" | "payment" | "credit_note" | "adjustment";
}

export interface ReturnRequest {
  id: string;
  customerId: string;
  orderId: string;
  status: "pending" | "approved" | "rejected" | "completed";
  lines: ReturnLine[];
  reason: string;
  notes?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export interface ReturnLine {
  productId: string;
  productName: string;
  orderedQty: number;
  returnQty: number;
  reason: ReturnItemReason;
}

export type ReturnItemReason =
  | "damaged"
  | "expired"
  | "wrong_product"
  | "quality_issue"
  | "not_ordered"
  | "other";

export interface PortalNotification {
  id: string;
  customerId: string;
  type: "order_status" | "invoice_issued" | "invoice_due" | "payment_received" | "return_status" | "credit_warning";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface PortalOrder {
  id: string;
  customerId: string;
  customerName: string;
  status: "Draft" | "Pending" | "Approved" | "Picking" | "Shipped" | "Delivered" | "Cancelled" | "Credit_Hold";
  lines: PortalOrderLine[];
  totalAmount: number;
  createdAt: string;
  deliveryDate?: string;
  eta?: string;
}

export interface PortalOrderLine {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}
