import { tenants, products, orders, customers, warehouses, tenantUsers, platformStats, businessStats, revenueData, ordersByStatus, categories, inventoryItems, stockAdjustments, deliveries, drivers, deliveryRoutes, invoices, payments, accountingStats, agingBuckets, topDebtors, salesReportData, taxReportData, priceHistory, priceGroupRules } from './data';
import type { Tenant, Product, Order, Customer, Warehouse, PlatformStats, BusinessStats, Category, InventoryItem, StockAdjustment, Delivery, Driver, DeliveryRoute, Invoice, Payment, AccountingStats, AgingBucket, TopDebtor, SalesReportData, TaxReportData, PriceHistoryEntry, PriceGroupRule, CustomerSpecificPrice } from './types';

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

export async function getOrder(id: string): Promise<Order | undefined> {
  await delay();
  return orders.find(o => o.id === id);
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

// ─── Phase 4: Inventory & Catalog APIs ───
export async function getCategories(tenantId: string = 't1'): Promise<Category[]> {
  await delay();
  return categories.filter(c => c.tenantId === tenantId);
}

export async function getInventoryItems(tenantId: string = 't1'): Promise<InventoryItem[]> {
  await delay();
  return inventoryItems.filter(i => i.tenantId === tenantId);
}

export async function getStockAdjustments(tenantId: string = 't1'): Promise<StockAdjustment[]> {
  await delay();
  return stockAdjustments.filter(a => a.tenantId === tenantId);
}

// ─── Phase 5: Orders & Delivery APIs ───
export async function getDeliveries(tenantId: string = 't1'): Promise<Delivery[]> {
  await delay();
  return deliveries.filter(d => d.tenantId === tenantId);
}

export async function getDrivers(tenantId: string = 't1'): Promise<Driver[]> {
  await delay();
  return drivers.filter(d => d.tenantId === tenantId);
}

export async function getDeliveryRoutes(tenantId: string = 't1'): Promise<DeliveryRoute[]> {
  await delay();
  return deliveryRoutes.filter(r => r.tenantId === tenantId);
}

// ─── Phase 6: Finance & Reports APIs ───
export async function getInvoices(tenantId: string = 't1'): Promise<Invoice[]> {
  await delay();
  return invoices.filter(i => i.tenantId === tenantId);
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  await delay();
  return invoices.find(i => i.id === id);
}

export async function getPayments(tenantId: string = 't1'): Promise<Payment[]> {
  await delay();
  return payments.filter(p => p.tenantId === tenantId);
}

export async function getAccountingStats(): Promise<AccountingStats> {
  await delay();
  return accountingStats;
}

export async function getAgingBuckets(): Promise<AgingBucket[]> {
  await delay();
  return agingBuckets;
}

export async function getTopDebtors(): Promise<TopDebtor[]> {
  await delay();
  return topDebtors;
}

export async function getSalesReportData(): Promise<SalesReportData> {
  await delay();
  return salesReportData;
}

export async function getTaxReportData(): Promise<TaxReportData> {
  await delay();
  return taxReportData;
}

// ─── Mutations: Categories ───
export async function createCategory(data: Omit<Category, 'id' | 'tenantId' | 'productsCount' | 'createdAt'>): Promise<Category> {
  await delay();
  const cat: Category = { id: `cat${Date.now()}`, tenantId: 't1', productsCount: 0, createdAt: new Date().toISOString(), ...data };
  categories.push(cat);
  return cat;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  await delay();
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  categories[idx] = { ...categories[idx], ...data };
  return categories[idx];
}

export async function deleteCategory(id: string): Promise<void> {
  await delay();
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  if (categories[idx].productsCount > 0) throw new Error('Cannot delete category with products');
  categories.splice(idx, 1);
}

// ─── Mutations: Customers ───
export async function createCustomer(data: Omit<Customer, 'id' | 'tenantId' | 'totalOrders' | 'totalSpent'>): Promise<Customer> {
  await delay();
  const c: Customer = { id: `c${Date.now()}`, tenantId: 't1', totalOrders: 0, totalSpent: 0, ...data };
  customers.push(c);
  return c;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  await delay();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Customer not found');
  customers[idx] = { ...customers[idx], ...data };
  return customers[idx];
}

export async function deleteCustomer(id: string): Promise<void> {
  await delay();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Customer not found');
  customers.splice(idx, 1);
}

// ─── Mutations: Stock Adjustments ───
export async function createStockAdjustment(data: Omit<StockAdjustment, 'id' | 'tenantId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<StockAdjustment> {
  await delay();
  const adj: StockAdjustment = { id: `adj${Date.now()}`, tenantId: 't1', status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
  stockAdjustments.push(adj);
  return adj;
}

export async function approveStockAdjustment(id: string, approvedBy: string): Promise<StockAdjustment> {
  await delay();
  const idx = stockAdjustments.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Adjustment not found');
  stockAdjustments[idx] = { ...stockAdjustments[idx], status: 'approved', approvedBy, updatedAt: new Date().toISOString() };
  return stockAdjustments[idx];
}

export async function rejectStockAdjustment(id: string, approvedBy: string): Promise<StockAdjustment> {
  await delay();
  const idx = stockAdjustments.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Adjustment not found');
  stockAdjustments[idx] = { ...stockAdjustments[idx], status: 'rejected', approvedBy, updatedAt: new Date().toISOString() };
  return stockAdjustments[idx];
}

// ─── Mutations: Inventory ───
export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
  await delay();
  const idx = inventoryItems.findIndex(i => i.id === id);
  if (idx === -1) throw new Error('Inventory item not found');
  inventoryItems[idx] = { ...inventoryItems[idx], ...data, lastUpdated: new Date().toISOString().split('T')[0] };
  return inventoryItems[idx];
}

// ─── Mutations: Products ───
export async function createProduct(data: Omit<Product, 'id' | 'tenantId' | 'createdAt'>): Promise<Product> {
  await delay();
  const p: Product = { id: `p${Date.now()}`, tenantId: 't1', createdAt: new Date().toISOString().split('T')[0], ...data };
  products.unshift(p);
  return p;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  await delay();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString().split('T')[0] };
  return products[idx];
}

export async function deleteProduct(id: string, soft = true): Promise<void> {
  await delay();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  // Check if product used in orders
  const usedInOrders = orders.some(o => o.customerId && o.status !== 'cancelled');
  if (soft) {
    products[idx] = { ...products[idx], isDeleted: true, isActive: false, deletedAt: new Date().toISOString() };
  } else {
    products.splice(idx, 1);
  }
}

export async function restoreProduct(id: string): Promise<Product> {
  await delay();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  products[idx] = { ...products[idx], isDeleted: false, isActive: true, deletedAt: undefined };
  return products[idx];
}

// ─── Price History ───
export async function getPriceHistory(productId?: string): Promise<PriceHistoryEntry[]> {
  await delay();
  if (productId) return priceHistory.filter(h => h.productId === productId);
  return priceHistory;
}

export async function addPriceHistoryEntry(entry: Omit<PriceHistoryEntry, 'id' | 'timestamp'>): Promise<PriceHistoryEntry> {
  await delay();
  const e: PriceHistoryEntry = { id: `ph${Date.now()}`, timestamp: new Date().toISOString(), ...entry };
  priceHistory.unshift(e);
  return e;
}

// ─── Price Group Rules ───
export async function getPriceGroupRules(tenantId: string = 't1'): Promise<PriceGroupRule[]> {
  await delay();
  return priceGroupRules.filter(r => r.tenantId === tenantId);
}

export async function updatePriceGroupRule(id: string, data: Partial<PriceGroupRule>): Promise<PriceGroupRule> {
  await delay();
  const idx = priceGroupRules.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Price group rule not found');
  priceGroupRules[idx] = { ...priceGroupRules[idx], ...data };
  return priceGroupRules[idx];
}

// ─── Price Regeneration Engine ───
export async function regeneratePrices(tenantId: string = 't1'): Promise<{ updated: number }> {
  await delay();
  let updated = 0;
  const rules = priceGroupRules.filter(r => r.tenantId === tenantId);
  for (const product of products.filter(p => p.tenantId === tenantId && !p.isDeleted)) {
    for (const pr of product.pricingRules) {
      const groupRule = rules.find(r => r.segment === pr.segment);
      if (groupRule && pr.costPrice) {
        const oldPrice = pr.price;
        const newPrice = Math.round(pr.costPrice * (1 + groupRule.marginPercent / 100));
        if (newPrice !== oldPrice) {
          priceHistory.unshift({
            id: `ph${Date.now()}_${updated}`, productId: product.id, productName: product.name,
            segment: pr.segment, unitId: pr.unitId, unitName: pr.unitName,
            oldPrice, newPrice, changedBy: 'Système', reason: 'Régénération automatique',
            timestamp: new Date().toISOString(),
          });
          pr.price = newPrice;
          updated++;
        }
      }
    }
  }
  return { updated };
}

// ─── Mutations: Payments ───
export async function createPayment(data: Omit<Payment, 'id' | 'tenantId' | 'createdAt'>): Promise<Payment> {
  await delay();
  const p: Payment = { id: `pay${Date.now()}`, tenantId: 't1', createdAt: new Date().toISOString(), ...data };
  payments.push(p);
  // Update invoice paid amount
  const inv = invoices.find(i => i.id === data.invoiceId);
  if (inv) {
    inv.paidAmount += data.amount;
    inv.remainingAmount = inv.total - inv.paidAmount;
    if (inv.remainingAmount <= 0) inv.status = 'paid';
    else if (inv.paidAmount > 0) inv.status = 'partial';
    inv.payments.push(p);
  }
  return p;
}

export async function refundPayment(id: string): Promise<Payment> {
  await delay();
  const idx = payments.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Payment not found');
  payments[idx] = { ...payments[idx], status: 'refunded' };
  return payments[idx];
}

// ─── Mutations: Accounting Journal Entries ───
export interface JournalEntry {
  id: string; date: string; description: string; debit: string; credit: string; amount: number; createdBy: string;
}

const journalEntriesStore: JournalEntry[] = [
  { id: 'JE001', date: '2024-12-15', description: 'Sale revenue', debit: 'Accounts Receivable', credit: 'Sales Revenue', amount: 85000, createdBy: 'System' },
  { id: 'JE002', date: '2024-12-14', description: 'Purchase goods', debit: 'COGS', credit: 'Accounts Payable', amount: 42000, createdBy: 'System' },
  { id: 'JE003', date: '2024-12-13', description: 'Payment received', debit: 'Cash', credit: 'Accounts Receivable', amount: 65000, createdBy: 'System' },
  { id: 'JE004', date: '2024-12-12', description: 'Salary payment', debit: 'Salary Expense', credit: 'Cash', amount: 120000, createdBy: 'System' },
  { id: 'JE005', date: '2024-12-11', description: 'Rent payment', debit: 'Rent Expense', credit: 'Cash', amount: 35000, createdBy: 'System' },
];

export async function getJournalEntries(): Promise<JournalEntry[]> {
  await delay();
  return journalEntriesStore;
}

export async function createJournalEntry(data: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
  await delay();
  const je: JournalEntry = { id: `JE${Date.now()}`, ...data };
  journalEntriesStore.unshift(je);
  return je;
}

export * from './types';
