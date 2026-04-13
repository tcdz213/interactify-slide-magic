export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type TenantStatus = 'active' | 'inactive' | 'onboarding';
export type OrderStatus = 'draft' | 'confirmed' | 'picking' | 'dispatched' | 'delivered' | 'settled' | 'cancelled';
export type CustomerSegment = 'superette' | 'wholesale' | 'shadow';
export type UserRole = 'super_admin' | 'manager' | 'driver' | 'sales_rep' | 'retailer' | 'accountant';

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  status: TenantStatus;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  usersCount: number;
  warehousesCount: number;
  monthlyRevenue: number;
  createdAt: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  category: string;
  baseUnit: string;
  units: ProductUnit[];
  pricingRules: PricingRule[];
  stockBase: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductUnit {
  id: string;
  name: string;
  conversionToBase: number;
}

export interface PricingRule {
  id: string;
  segment: CustomerSegment;
  unitId: string;
  unitName: string;
  price: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
  assignedDriver?: string;
  assignedSalesRep?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  segment: CustomerSegment;
  isShadow: boolean;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  managerId: string;
  managerName: string;
  productsCount: number;
  capacity: number;
  utilization: number;
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  mrr: number;
  totalOrders: number;
  totalUsers: number;
  trialTenants: number;
  churnRate: number;
}

export interface BusinessStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
  inventoryValue: number;
  activeDrivers: number;
  deliveryRate: number;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  productsCount: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export type StockStatus = 'normal' | 'low' | 'out';

export interface InventoryItem {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  category: string;
  baseUnit: string;
  quantity: number;
  reorderPoint: number;
  stockStatus: StockStatus;
  inventoryValue: number;
  lastUpdated: string;
}

export type AdjustmentStatus = 'pending' | 'approved' | 'rejected';
export type AdjustmentReason = 'damage' | 'expiry' | 'count_correction' | 'return' | 'transfer' | 'other';

export interface StockAdjustment {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  quantityChange: number;
  reason: AdjustmentReason;
  notes: string;
  status: AdjustmentStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'failed';

export interface Delivery {
  id: string;
  tenantId: string;
  orderId: string;
  customerName: string;
  customerAddress: string;
  driverId: string;
  driverName: string;
  status: DeliveryStatus;
  estimatedArrival: string;
  actualArrival?: string;
  createdAt: string;
}

export type DriverStatus = 'available' | 'on_route' | 'offline';

export interface Driver {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  vehicle: string;
  status: DriverStatus;
  deliveriesToday: number;
  completedToday: number;
  onTimeRate: number;
  avatar?: string;
}

export interface RouteStop {
  orderId: string;
  customerName: string;
  address: string;
  estimatedTime: string;
  status: 'pending' | 'completed';
}

export interface DeliveryRoute {
  id: string;
  tenantId: string;
  driverId: string;
  driverName: string;
  date: string;
  stops: RouteStop[];
  totalDistance: number;
  estimatedDuration: string;
  status: 'planned' | 'in_progress' | 'completed';
}

// ─── Phase 6: Finance & Reports ───
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'mobile_payment';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface InvoiceLineItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tva9: number;
  tva19: number;
  totalTva: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  date: string;
  createdAt: string;
}

export interface AccountingStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  dso: number;
  tvaCollected: number;
  tvaDue: number;
  outstandingReceivables: number;
}

export interface AgingBucket {
  range: string;
  amount: number;
  count: number;
}

export interface TopDebtor {
  customerId: string;
  customerName: string;
  outstanding: number;
  daysOverdue: number;
}

export interface SalesReportData {
  revenueByMonth: { month: string; revenue: number }[];
  revenueBySegment: { segment: string; revenue: number }[];
  topProducts: { name: string; revenue: number; quantity: number }[];
  topCustomers: { name: string; spent: number; orders: number }[];
  salesRepPerformance: { name: string; orders: number; revenue: number; avgOrderValue: number }[];
}

export interface TaxReportData {
  period: string;
  rows: { taxRate: number; taxableBase: number; tvaCollected: number }[];
  totalTaxableBase: number;
  totalTva: number;
}
