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
