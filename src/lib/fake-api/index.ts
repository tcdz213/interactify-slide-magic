import { tenants, products, orders, customers, warehouses, tenantUsers, platformStats, businessStats, revenueData, ordersByStatus } from './data';
import type { Tenant, Product, Order, PlatformStats, BusinessStats } from './types';

const delay = (ms: number = 300) => new Promise(r => setTimeout(r, ms));

// ─── Super Admin APIs ───
export async function getPlatformStats(): Promise<PlatformStats> {
  await delay();
  return platformStats;
}

export async function getTenants(): Promise<Tenant[]> {
  await delay();
  return tenants;
}

export async function getTenant(id: string): Promise<Tenant | undefined> {
  await delay();
  return tenants.find(t => t.id === id);
}

// ─── Business Manager APIs ───
export async function getBusinessStats(): Promise<BusinessStats> {
  await delay();
  return businessStats;
}

export async function getProducts(tenantId: string = 't1'): Promise<Product[]> {
  await delay();
  return products.filter(p => p.tenantId === tenantId);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  await delay();
  return products.find(p => p.id === id);
}

export async function getOrders(tenantId: string = 't1'): Promise<Order[]> {
  await delay();
  return orders.filter(o => o.tenantId === tenantId);
}

export async function getCustomers(tenantId: string = 't1') {
  await delay();
  return customers.filter(c => c.tenantId === tenantId);
}

export async function getWarehouses(tenantId: string = 't1') {
  await delay();
  return warehouses.filter(w => w.tenantId === tenantId);
}

export async function getTenantUsers(tenantId: string = 't1') {
  await delay();
  return tenantUsers.filter(u => u.tenantId === tenantId);
}

export async function getRevenueData() {
  await delay();
  return revenueData;
}

export async function getOrdersByStatus() {
  await delay();
  return ordersByStatus;
}

export * from './types';
