import { Tenant, Product, Order, Customer, Warehouse, TenantUser, PlatformStats, BusinessStats, Category, InventoryItem, StockAdjustment, Delivery, Driver, DeliveryRoute, Invoice, Payment, AccountingStats, AgingBucket, TopDebtor, SalesReportData, TaxReportData, PriceHistoryEntry, PriceGroupRule } from './types';

export const platformStats: PlatformStats = {
  totalTenants: 47,
  activeTenants: 42,
  totalRevenue: 284500,
  mrr: 23700,
  totalOrders: 12840,
  totalUsers: 1265,
  trialTenants: 5,
  churnRate: 2.3,
};

export const tenants: Tenant[] = [
  { id: 't1', name: 'Mama Foods', status: 'active', plan: 'professional', subscriptionStatus: 'active', usersCount: 18, warehousesCount: 2, monthlyRevenue: 890, createdAt: '2024-01-15', contactEmail: 'admin@mamafoods.com', contactPhone: '+213 555 0101', address: 'Zone Industrielle, Alger' },
  { id: 't2', name: 'Atlas Distribution', status: 'active', plan: 'enterprise', subscriptionStatus: 'active', usersCount: 45, warehousesCount: 5, monthlyRevenue: 2400, createdAt: '2023-11-20', contactEmail: 'ops@atlasdist.com', contactPhone: '+213 555 0202', address: 'Quartier Affaires, Oran' },
  { id: 't3', name: 'Sahara Goods', status: 'active', plan: 'starter', subscriptionStatus: 'active', usersCount: 4, warehousesCount: 1, monthlyRevenue: 49, createdAt: '2024-06-10', contactEmail: 'hello@saharagoods.com', contactPhone: '+213 555 0303', address: 'Centre Ville, Constantine' },
  { id: 't4', name: 'MediterranéeSupply', status: 'onboarding', plan: 'professional', subscriptionStatus: 'trial', usersCount: 0, warehousesCount: 0, monthlyRevenue: 0, createdAt: '2024-12-01', contactEmail: 'contact@medsupply.dz', contactPhone: '+213 555 0404', address: 'Port, Annaba' },
  { id: 't5', name: 'Djurdjura Express', status: 'active', plan: 'professional', subscriptionStatus: 'active', usersCount: 12, warehousesCount: 2, monthlyRevenue: 650, createdAt: '2024-03-22', contactEmail: 'info@djurdjura.com', contactPhone: '+213 555 0505', address: 'Zone Commerciale, Tizi Ouzou' },
  { id: 't6', name: 'Kabylie Fresh', status: 'inactive', plan: 'starter', subscriptionStatus: 'cancelled', usersCount: 3, warehousesCount: 1, monthlyRevenue: 0, createdAt: '2024-02-14', contactEmail: 'admin@kabfresh.com', contactPhone: '+213 555 0606', address: 'Marché Central, Béjaïa' },
  { id: 't7', name: 'Aurès Trading', status: 'active', plan: 'enterprise', subscriptionStatus: 'active', usersCount: 32, warehousesCount: 4, monthlyRevenue: 1800, createdAt: '2023-09-05', contactEmail: 'ops@aurestrading.com', contactPhone: '+213 555 0707', address: 'Zone Logistique, Batna' },
  { id: 't8', name: 'Oasis Market', status: 'active', plan: 'starter', subscriptionStatus: 'active', usersCount: 5, warehousesCount: 1, monthlyRevenue: 49, createdAt: '2024-08-18', contactEmail: 'hello@oasismarket.dz', contactPhone: '+213 555 0808', address: 'Centre, Ghardaïa' },
];

export const businessStats: BusinessStats = {
  totalProducts: 156,
  totalOrders: 342,
  pendingOrders: 28,
  totalCustomers: 89,
  monthlyRevenue: 45200,
  inventoryValue: 128000,
  activeDrivers: 6,
  deliveryRate: 94.5,
};

export const priceHistory: import('./types').PriceHistoryEntry[] = [
  { id: 'ph1', productId: 'p1', productName: 'Couscous Fin 1kg', segment: 'superette', unitId: 'u2', unitName: 'Pack (12)', oldPrice: 1100, newPrice: 1200, changedBy: 'Admin', reason: 'Augmentation fournisseur', timestamp: '2024-06-15T10:00:00' },
  { id: 'ph2', productId: 'p1', productName: 'Couscous Fin 1kg', segment: 'wholesale', unitId: 'u2', unitName: 'Pack (12)', oldPrice: 1000, newPrice: 1050, changedBy: 'Admin', reason: 'Augmentation fournisseur', timestamp: '2024-06-15T10:00:00' },
  { id: 'ph3', productId: 'p2', productName: "Huile d'Olive 1L", segment: 'retail', unitId: 'u5', unitName: 'Carton (6)', oldPrice: 5000, newPrice: 4800, changedBy: 'Manager', reason: 'Promo été', timestamp: '2024-07-01T08:00:00' },
  { id: 'ph4', productId: 'p4', productName: 'Tomate Concentrée 400g', segment: 'depot', unitId: 'u10', unitName: 'Tray (24)', oldPrice: 2200, newPrice: 2400, changedBy: 'Admin', reason: 'Nouveau tarif', timestamp: '2024-08-20T14:00:00' },
];

export const priceGroupRules: import('./types').PriceGroupRule[] = [
  { id: 'pgr1', tenantId: 't1', segment: 'depot', marginPercent: 10, description: 'Prix dépôt = coût + 10%' },
  { id: 'pgr2', tenantId: 't1', segment: 'wholesale', marginPercent: 15, description: 'Prix grossiste = coût + 15%' },
  { id: 'pgr3', tenantId: 't1', segment: 'retail', marginPercent: 25, description: 'Prix détail = coût + 25%' },
  { id: 'pgr4', tenantId: 't1', segment: 'small_trader', marginPercent: 20, description: 'Petit commerce = coût + 20%' },
  { id: 'pgr5', tenantId: 't1', segment: 'special_client', marginPercent: 8, description: 'Client spécial = coût + 8%' },
];

export const products: Product[] = [
  {
    id: 'p1', tenantId: 't1', name: 'Couscous Fin 1kg', description: 'Couscous de blé dur extra fin, qualité premium algérienne', sku: 'CSC-001', category: 'Grains',
    baseUnit: 'piece', stockBase: 14400, isDeleted: false, updatedAt: '2024-06-15',
    units: [
      { id: 'u1', name: 'Piece', conversionToBase: 1 },
      { id: 'u2', name: 'Pack (12)', conversionToBase: 12 },
      { id: 'u3', name: 'Pallet (600)', conversionToBase: 600 },
    ],
    pricingRules: [
      { id: 'pr1', segment: 'depot', unitId: 'u2', unitName: 'Pack (12)', price: 1000, costPrice: 900, effectiveFrom: '2024-01-01' },
      { id: 'pr2', segment: 'wholesale', unitId: 'u2', unitName: 'Pack (12)', price: 1050, costPrice: 900, effectiveFrom: '2024-01-01' },
      { id: 'pr3', segment: 'retail', unitId: 'u2', unitName: 'Pack (12)', price: 1200, costPrice: 900, effectiveFrom: '2024-01-01' },
      { id: 'pr4', segment: 'small_trader', unitId: 'u2', unitName: 'Pack (12)', price: 1100, costPrice: 900, effectiveFrom: '2024-01-01' },
      { id: 'pr5', segment: 'wholesale', unitId: 'u3', unitName: 'Pallet (600)', price: 48000, costPrice: 42000, effectiveFrom: '2024-01-01' },
      { id: 'pr6', segment: 'retail', unitId: 'u1', unitName: 'Piece', price: 110, costPrice: 80, effectiveFrom: '2024-01-01' },
    ],
    customerPrices: [
      { id: 'cp1', customerId: 'c1', customerName: 'Superette El Baraka', unitId: 'u2', unitName: 'Pack (12)', price: 1150, effectiveFrom: '2024-03-01' },
      { id: 'cp2', customerId: 'c5', customerName: 'Wholesale Center Blida', unitId: 'u3', unitName: 'Pallet (600)', price: 46000, effectiveFrom: '2024-01-01' },
    ],
    isActive: true, createdAt: '2024-01-20',
  },
  {
    id: 'p2', tenantId: 't1', name: "Huile d'Olive 1L", description: "Huile d'olive vierge extra, première pression à froid", sku: 'OIL-001', category: 'Oils',
    baseUnit: 'bottle', stockBase: 3600, isDeleted: false, updatedAt: '2024-07-01',
    units: [
      { id: 'u4', name: 'Bottle', conversionToBase: 1 },
      { id: 'u5', name: 'Carton (6)', conversionToBase: 6 },
      { id: 'u6', name: 'Pallet (180)', conversionToBase: 180 },
    ],
    pricingRules: [
      { id: 'pr7', segment: 'depot', unitId: 'u5', unitName: 'Carton (6)', price: 4200, costPrice: 3800, effectiveFrom: '2024-01-01' },
      { id: 'pr8', segment: 'wholesale', unitId: 'u5', unitName: 'Carton (6)', price: 4500, costPrice: 3800, effectiveFrom: '2024-01-01' },
      { id: 'pr9', segment: 'retail', unitId: 'u5', unitName: 'Carton (6)', price: 4800, costPrice: 3800, effectiveFrom: '2024-01-01' },
      { id: 'pr10', segment: 'retail', unitId: 'u4', unitName: 'Bottle', price: 850, costPrice: 650, effectiveFrom: '2024-07-01', effectiveTo: '2024-08-31', isPromo: true, promoLabel: 'Promo été' },
    ],
    customerPrices: [],
    isActive: true, createdAt: '2024-02-05',
  },
  {
    id: 'p3', tenantId: 't1', name: 'Semoule Extra 5kg', description: 'Semoule de blé dur extra pour couscous et pâtisserie', sku: 'SEM-001', category: 'Grains',
    baseUnit: 'bag', stockBase: 2400, isDeleted: false, updatedAt: '2024-02-10',
    units: [
      { id: 'u7', name: 'Bag', conversionToBase: 1 },
      { id: 'u8', name: 'Pack (10)', conversionToBase: 10 },
    ],
    pricingRules: [
      { id: 'pr11', segment: 'depot', unitId: 'u8', unitName: 'Pack (10)', price: 3000, costPrice: 2700, effectiveFrom: '2024-01-01' },
      { id: 'pr12', segment: 'wholesale', unitId: 'u8', unitName: 'Pack (10)', price: 3100, costPrice: 2700, effectiveFrom: '2024-01-01' },
      { id: 'pr13', segment: 'retail', unitId: 'u8', unitName: 'Pack (10)', price: 3500, costPrice: 2700, effectiveFrom: '2024-01-01' },
    ],
    customerPrices: [],
    isActive: true, createdAt: '2024-02-10',
  },
  {
    id: 'p4', tenantId: 't1', name: 'Tomate Concentrée 400g', description: 'Double concentré de tomate, conditionnement boîte métal', sku: 'TOM-001', category: 'Canned Goods',
    baseUnit: 'can', stockBase: 7200, isDeleted: false, updatedAt: '2024-08-20',
    units: [
      { id: 'u9', name: 'Can', conversionToBase: 1 },
      { id: 'u10', name: 'Tray (24)', conversionToBase: 24 },
    ],
    pricingRules: [
      { id: 'pr14', segment: 'depot', unitId: 'u10', unitName: 'Tray (24)', price: 2100, costPrice: 1900, effectiveFrom: '2024-01-01' },
      { id: 'pr15', segment: 'wholesale', unitId: 'u10', unitName: 'Tray (24)', price: 2200, costPrice: 1900, effectiveFrom: '2024-01-01' },
      { id: 'pr16', segment: 'retail', unitId: 'u10', unitName: 'Tray (24)', price: 2400, costPrice: 1900, effectiveFrom: '2024-01-01' },
    ],
    customerPrices: [
      { id: 'cp3', customerId: 'c2', customerName: 'Gros Bazar Oran', unitId: 'u10', unitName: 'Tray (24)', price: 2050, effectiveFrom: '2024-06-01' },
    ],
    isActive: true, createdAt: '2024-03-01',
  },
  {
    id: 'p5', tenantId: 't1', name: 'Lait UHT 1L', description: 'Lait entier UHT longue conservation', sku: 'MLK-001', category: 'Dairy',
    baseUnit: 'brick', stockBase: 9600, isDeleted: false, updatedAt: '2024-03-15',
    units: [
      { id: 'u11', name: 'Brick', conversionToBase: 1 },
      { id: 'u12', name: 'Pack (12)', conversionToBase: 12 },
      { id: 'u13', name: 'Pallet (480)', conversionToBase: 480 },
    ],
    pricingRules: [
      { id: 'pr17', segment: 'depot', unitId: 'u12', unitName: 'Pack (12)', price: 500, costPrice: 450, effectiveFrom: '2024-01-01' },
      { id: 'pr18', segment: 'wholesale', unitId: 'u12', unitName: 'Pack (12)', price: 520, costPrice: 450, effectiveFrom: '2024-01-01' },
      { id: 'pr19', segment: 'retail', unitId: 'u12', unitName: 'Pack (12)', price: 600, costPrice: 450, effectiveFrom: '2024-01-01' },
    ],
    customerPrices: [],
    isActive: true, createdAt: '2024-03-15',
  },
  {
    id: 'p6', tenantId: 't1', name: 'Sucre Blanc 1kg', description: 'Sucre blanc cristallisé, sachet 1kg', sku: 'SUG-001', category: 'Basics',
    baseUnit: 'piece', stockBase: 0, isDeleted: false, updatedAt: '2024-04-01',
    units: [
      { id: 'u14', name: 'Piece', conversionToBase: 1 },
      { id: 'u15', name: 'Pack (10)', conversionToBase: 10 },
    ],
    pricingRules: [
      { id: 'pr20', segment: 'depot', unitId: 'u15', unitName: 'Pack (10)', price: 900, costPrice: 800, effectiveFrom: '2024-01-01' },
      { id: 'pr21', segment: 'wholesale', unitId: 'u15', unitName: 'Pack (10)', price: 950, costPrice: 800, effectiveFrom: '2024-01-01' },
      { id: 'pr22', segment: 'retail', unitId: 'u15', unitName: 'Pack (10)', price: 1100, costPrice: 800, effectiveFrom: '2024-01-01' },
    ],
    customerPrices: [],
    isActive: false, createdAt: '2024-04-01',
  },
];

export const orders: Order[] = [
  { id: 'o1', tenantId: 't1', customerId: 'c1', customerName: 'Superette El Baraka', status: 'delivered', totalAmount: 24000, itemsCount: 3, createdAt: '2024-12-01T10:30:00', updatedAt: '2024-12-02T14:00:00', assignedDriver: 'Yacine B.', assignedSalesRep: 'Karim M.' },
  { id: 'o2', tenantId: 't1', customerId: 'c2', customerName: 'Gros Bazar Oran', status: 'confirmed', totalAmount: 96000, itemsCount: 5, createdAt: '2024-12-05T09:00:00', updatedAt: '2024-12-05T11:00:00', assignedSalesRep: 'Karim M.' },
  { id: 'o3', tenantId: 't1', customerId: 'c3', customerName: 'Mini Market Saïd', status: 'draft', totalAmount: 12000, itemsCount: 2, createdAt: '2024-12-06T08:15:00', updatedAt: '2024-12-06T08:15:00' },
  { id: 'o4', tenantId: 't1', customerId: 'c4', customerName: 'Alimentation Générale Nour', status: 'picking', totalAmount: 36000, itemsCount: 4, createdAt: '2024-12-05T14:30:00', updatedAt: '2024-12-06T09:00:00', assignedSalesRep: 'Sofiane T.' },
  { id: 'o5', tenantId: 't1', customerId: 'c5', customerName: 'Wholesale Center Blida', status: 'dispatched', totalAmount: 156000, itemsCount: 8, createdAt: '2024-12-04T07:00:00', updatedAt: '2024-12-06T06:30:00', assignedDriver: 'Ahmed K.', assignedSalesRep: 'Karim M.' },
  { id: 'o6', tenantId: 't1', customerId: 'c1', customerName: 'Superette El Baraka', status: 'settled', totalAmount: 18500, itemsCount: 2, createdAt: '2024-11-28T11:00:00', updatedAt: '2024-11-30T16:00:00', assignedDriver: 'Yacine B.', assignedSalesRep: 'Karim M.' },
  { id: 'o7', tenantId: 't1', customerId: 'c6', customerName: 'Épicerie Fine Alger', status: 'cancelled', totalAmount: 8400, itemsCount: 1, createdAt: '2024-12-03T13:00:00', updatedAt: '2024-12-04T09:00:00' },
];

export const customers: Customer[] = [
  { id: 'c1', tenantId: 't1', name: 'Superette El Baraka', segment: 'superette', isShadow: false, email: 'baraka@email.com', phone: '+213 555 1001', address: 'Rue Didouche, Alger', totalOrders: 24, totalSpent: 186000 },
  { id: 'c2', tenantId: 't1', name: 'Gros Bazar Oran', segment: 'wholesale', isShadow: false, email: 'grosbazar@email.com', phone: '+213 555 1002', address: 'Boulevard Front de Mer, Oran', totalOrders: 56, totalSpent: 1240000 },
  { id: 'c3', tenantId: 't1', name: 'Mini Market Saïd', segment: 'superette', isShadow: true, email: '', phone: '+213 555 1003', address: 'Quartier Saïd, Blida', totalOrders: 3, totalSpent: 15600 },
  { id: 'c4', tenantId: 't1', name: 'Alimentation Générale Nour', segment: 'superette', isShadow: false, email: 'nour@email.com', phone: '+213 555 1004', address: 'Cité 500, Sétif', totalOrders: 12, totalSpent: 89000 },
  { id: 'c5', tenantId: 't1', name: 'Wholesale Center Blida', segment: 'wholesale', isShadow: false, email: 'wc.blida@email.com', phone: '+213 555 1005', address: 'Zone Industrielle, Blida', totalOrders: 78, totalSpent: 2450000 },
  { id: 'c6', tenantId: 't1', name: 'Épicerie Fine Alger', segment: 'superette', isShadow: false, email: 'epiceriefine@email.com', phone: '+213 555 1006', address: 'Hydra, Alger', totalOrders: 8, totalSpent: 42000 },
];

export const warehouses: Warehouse[] = [
  { id: 'w1', tenantId: 't1', name: 'Entrepôt Principal', address: 'Zone Industrielle Rouiba, Alger', managerId: 'u1', managerName: 'Rachid B.', productsCount: 156, capacity: 5000, utilization: 72 },
  { id: 'w2', tenantId: 't1', name: 'Dépôt Ouest', address: 'Zone Logistique, Oran', managerId: 'u2', managerName: 'Fatima Z.', productsCount: 98, capacity: 3000, utilization: 58 },
];

export const tenantUsers: TenantUser[] = [
  { id: 'tu1', tenantId: 't1', name: 'Rachid Benmoussa', email: 'rachid@mamafoods.com', role: 'manager', isActive: true, lastLogin: '2024-12-06T08:00:00' },
  { id: 'tu2', tenantId: 't1', name: 'Karim Meziane', email: 'karim@mamafoods.com', role: 'sales_rep', isActive: true, lastLogin: '2024-12-06T07:30:00' },
  { id: 'tu3', tenantId: 't1', name: 'Yacine Belkacem', email: 'yacine@mamafoods.com', role: 'driver', isActive: true, lastLogin: '2024-12-06T06:00:00' },
  { id: 'tu4', tenantId: 't1', name: 'Sofiane Taleb', email: 'sofiane@mamafoods.com', role: 'sales_rep', isActive: true, lastLogin: '2024-12-05T18:00:00' },
  { id: 'tu5', tenantId: 't1', name: 'Ahmed Khelifi', email: 'ahmed@mamafoods.com', role: 'driver', isActive: true, lastLogin: '2024-12-06T05:45:00' },
  { id: 'tu6', tenantId: 't1', name: 'Nadia Cherif', email: 'nadia@mamafoods.com', role: 'accountant', isActive: true, lastLogin: '2024-12-05T17:00:00' },
];

export const revenueData = [
  { month: 'Jul', revenue: 15200 },
  { month: 'Aug', revenue: 18400 },
  { month: 'Sep', revenue: 21000 },
  { month: 'Oct', revenue: 19800 },
  { month: 'Nov', revenue: 24500 },
  { month: 'Dec', revenue: 23700 },
];

export const ordersByStatus = [
  { status: 'Draft', count: 12, color: 'hsl(var(--muted-foreground))' },
  { status: 'Confirmed', count: 28, color: 'hsl(var(--info))' },
  { status: 'Picking', count: 15, color: 'hsl(var(--warning))' },
  { status: 'Dispatched', count: 8, color: 'hsl(var(--chart-4))' },
  { status: 'Delivered', count: 245, color: 'hsl(var(--success))' },
  { status: 'Settled', count: 210, color: 'hsl(var(--primary))' },
];

export const categories: Category[] = [
  { id: 'cat1', tenantId: 't1', name: 'Grains', description: 'Couscous, semoule, riz, pâtes', productsCount: 2, isActive: true, displayOrder: 1, createdAt: '2024-01-10' },
  { id: 'cat2', tenantId: 't1', name: 'Oils', description: 'Huiles d\'olive, végétale, tournesol', productsCount: 1, isActive: true, displayOrder: 2, createdAt: '2024-01-10' },
  { id: 'cat3', tenantId: 't1', name: 'Canned Goods', description: 'Tomate concentrée, conserves, harissa', productsCount: 1, isActive: true, displayOrder: 3, createdAt: '2024-01-10' },
  { id: 'cat4', tenantId: 't1', name: 'Dairy', description: 'Lait UHT, fromage, beurre', productsCount: 1, isActive: true, displayOrder: 4, createdAt: '2024-01-10' },
  { id: 'cat5', tenantId: 't1', name: 'Basics', description: 'Sucre, sel, farine, café', productsCount: 1, isActive: true, displayOrder: 5, createdAt: '2024-01-10' },
  { id: 'cat6', tenantId: 't1', name: 'Beverages', description: 'Jus, eau, boissons gazeuses', productsCount: 0, isActive: false, displayOrder: 6, createdAt: '2024-02-15' },
];

export const inventoryItems: InventoryItem[] = [
  { id: 'inv1', tenantId: 't1', productId: 'p1', productName: 'Couscous Fin 1kg', sku: 'CSC-001', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', category: 'Grains', baseUnit: 'piece', quantity: 10800, reorderPoint: 2000, stockStatus: 'normal', inventoryValue: 108000, lastUpdated: '2024-12-05' },
  { id: 'inv2', tenantId: 't1', productId: 'p1', productName: 'Couscous Fin 1kg', sku: 'CSC-001', warehouseId: 'w2', warehouseName: 'Dépôt Ouest', category: 'Grains', baseUnit: 'piece', quantity: 3600, reorderPoint: 1000, stockStatus: 'normal', inventoryValue: 36000, lastUpdated: '2024-12-04' },
  { id: 'inv3', tenantId: 't1', productId: 'p2', productName: 'Huile d\'Olive 1L', sku: 'OIL-001', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', category: 'Oils', baseUnit: 'bottle', quantity: 2400, reorderPoint: 500, stockStatus: 'normal', inventoryValue: 192000, lastUpdated: '2024-12-05' },
  { id: 'inv4', tenantId: 't1', productId: 'p2', productName: 'Huile d\'Olive 1L', sku: 'OIL-001', warehouseId: 'w2', warehouseName: 'Dépôt Ouest', category: 'Oils', baseUnit: 'bottle', quantity: 1200, reorderPoint: 300, stockStatus: 'normal', inventoryValue: 96000, lastUpdated: '2024-12-03' },
  { id: 'inv5', tenantId: 't1', productId: 'p3', productName: 'Semoule Extra 5kg', sku: 'SEM-001', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', category: 'Grains', baseUnit: 'bag', quantity: 180, reorderPoint: 200, stockStatus: 'low', inventoryValue: 63000, lastUpdated: '2024-12-05' },
  { id: 'inv6', tenantId: 't1', productId: 'p4', productName: 'Tomate Concentrée 400g', sku: 'TOM-001', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', category: 'Canned Goods', baseUnit: 'can', quantity: 7200, reorderPoint: 1000, stockStatus: 'normal', inventoryValue: 72000, lastUpdated: '2024-12-04' },
  { id: 'inv7', tenantId: 't1', productId: 'p5', productName: 'Lait UHT 1L', sku: 'MLK-001', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', category: 'Dairy', baseUnit: 'brick', quantity: 9600, reorderPoint: 2000, stockStatus: 'normal', inventoryValue: 48000, lastUpdated: '2024-12-05' },
  { id: 'inv8', tenantId: 't1', productId: 'p6', productName: 'Sucre Blanc 1kg', sku: 'SUG-001', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', category: 'Basics', baseUnit: 'piece', quantity: 0, reorderPoint: 500, stockStatus: 'out', inventoryValue: 0, lastUpdated: '2024-12-01' },
];

export const stockAdjustments: StockAdjustment[] = [
  { id: 'adj1', tenantId: 't1', productId: 'p1', productName: 'Couscous Fin 1kg', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', quantityChange: -48, reason: 'damage', notes: 'Palettes endommagées lors du transport', status: 'approved', createdBy: 'Rachid B.', approvedBy: 'Karim M.', createdAt: '2024-12-04T10:30:00', updatedAt: '2024-12-04T14:00:00' },
  { id: 'adj2', tenantId: 't1', productId: 'p3', productName: 'Semoule Extra 5kg', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', quantityChange: 100, reason: 'count_correction', notes: 'Correction après inventaire physique', status: 'approved', createdBy: 'Rachid B.', approvedBy: 'Karim M.', createdAt: '2024-12-03T09:00:00', updatedAt: '2024-12-03T11:00:00' },
  { id: 'adj3', tenantId: 't1', productId: 'p5', productName: 'Lait UHT 1L', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', quantityChange: -120, reason: 'expiry', notes: 'Lot expiré le 01/12', status: 'pending', createdBy: 'Sofiane T.', createdAt: '2024-12-05T16:00:00', updatedAt: '2024-12-05T16:00:00' },
  { id: 'adj4', tenantId: 't1', productId: 'p4', productName: 'Tomate Concentrée 400g', warehouseId: 'w2', warehouseName: 'Dépôt Ouest', quantityChange: 240, reason: 'transfer', notes: 'Transfert depuis entrepôt principal', status: 'pending', createdBy: 'Fatima Z.', createdAt: '2024-12-06T08:00:00', updatedAt: '2024-12-06T08:00:00' },
  { id: 'adj5', tenantId: 't1', productId: 'p2', productName: 'Huile d\'Olive 1L', warehouseId: 'w1', warehouseName: 'Entrepôt Principal', quantityChange: -6, reason: 'return', notes: 'Retour client — bouteilles cassées', status: 'rejected', createdBy: 'Yacine B.', approvedBy: 'Rachid B.', createdAt: '2024-12-02T14:00:00', updatedAt: '2024-12-02T16:30:00' },
];

export const drivers: Driver[] = [
  { id: 'drv1', tenantId: 't1', name: 'Yacine Belkacem', phone: '+213 555 3001', vehicle: 'Hyundai HD72 — 00123-101-16', status: 'on_route', deliveriesToday: 5, completedToday: 3, onTimeRate: 92 },
  { id: 'drv2', tenantId: 't1', name: 'Ahmed Khelifi', phone: '+213 555 3002', vehicle: 'Isuzu NQR — 00456-101-16', status: 'available', deliveriesToday: 4, completedToday: 4, onTimeRate: 97 },
  { id: 'drv3', tenantId: 't1', name: 'Mohamed Saidi', phone: '+213 555 3003', vehicle: 'Mitsubishi Canter — 00789-101-16', status: 'on_route', deliveriesToday: 6, completedToday: 4, onTimeRate: 88 },
  { id: 'drv4', tenantId: 't1', name: 'Amine Boudiaf', phone: '+213 555 3004', vehicle: 'Renault Master — 01012-101-16', status: 'offline', deliveriesToday: 0, completedToday: 0, onTimeRate: 94 },
];

export const deliveries: Delivery[] = [
  { id: 'del1', tenantId: 't1', orderId: 'o1', customerName: 'Superette El Baraka', customerAddress: 'Rue Didouche, Alger', driverId: 'drv1', driverName: 'Yacine Belkacem', status: 'delivered', estimatedArrival: '2024-12-02T14:00:00', actualArrival: '2024-12-02T13:45:00', createdAt: '2024-12-01T10:30:00' },
  { id: 'del2', tenantId: 't1', orderId: 'o5', customerName: 'Wholesale Center Blida', customerAddress: 'Zone Industrielle, Blida', driverId: 'drv1', driverName: 'Yacine Belkacem', status: 'in_transit', estimatedArrival: '2024-12-06T11:00:00', createdAt: '2024-12-06T06:30:00' },
  { id: 'del3', tenantId: 't1', orderId: 'o2', customerName: 'Gros Bazar Oran', customerAddress: 'Boulevard Front de Mer, Oran', driverId: 'drv3', driverName: 'Mohamed Saidi', status: 'pending', estimatedArrival: '2024-12-07T10:00:00', createdAt: '2024-12-05T09:00:00' },
  { id: 'del4', tenantId: 't1', orderId: 'o4', customerName: 'Alimentation Générale Nour', customerAddress: 'Cité 500, Sétif', driverId: 'drv2', driverName: 'Ahmed Khelifi', status: 'delivered', estimatedArrival: '2024-12-06T15:00:00', actualArrival: '2024-12-06T14:50:00', createdAt: '2024-12-05T14:30:00' },
  { id: 'del5', tenantId: 't1', orderId: 'o6', customerName: 'Superette El Baraka', customerAddress: 'Rue Didouche, Alger', driverId: 'drv3', driverName: 'Mohamed Saidi', status: 'failed', estimatedArrival: '2024-11-30T12:00:00', createdAt: '2024-11-28T11:00:00' },
];

export const deliveryRoutes: DeliveryRoute[] = [
  {
    id: 'rt1', tenantId: 't1', driverId: 'drv1', driverName: 'Yacine Belkacem', date: '2024-12-06',
    totalDistance: 45, estimatedDuration: '2h 30min', status: 'in_progress',
    stops: [
      { orderId: 'o5', customerName: 'Wholesale Center Blida', address: 'Zone Industrielle, Blida', estimatedTime: '09:30', status: 'completed' },
      { orderId: 'o2', customerName: 'Gros Bazar Oran', address: 'Boulevard Front de Mer, Oran', estimatedTime: '11:00', status: 'pending' },
    ],
  },
  {
    id: 'rt2', tenantId: 't1', driverId: 'drv2', driverName: 'Ahmed Khelifi', date: '2024-12-06',
    totalDistance: 28, estimatedDuration: '1h 45min', status: 'completed',
    stops: [
      { orderId: 'o4', customerName: 'Alimentation Générale Nour', address: 'Cité 500, Sétif', estimatedTime: '10:00', status: 'completed' },
      { orderId: 'o1', customerName: 'Superette El Baraka', address: 'Rue Didouche, Alger', estimatedTime: '12:00', status: 'completed' },
    ],
  },
  {
    id: 'rt3', tenantId: 't1', driverId: 'drv3', driverName: 'Mohamed Saidi', date: '2024-12-07',
    totalDistance: 62, estimatedDuration: '3h 15min', status: 'planned',
    stops: [
      { orderId: 'o3', customerName: 'Mini Market Saïd', address: 'Quartier Saïd, Blida', estimatedTime: '08:30', status: 'pending' },
      { orderId: 'o2', customerName: 'Gros Bazar Oran', address: 'Boulevard Front de Mer, Oran', estimatedTime: '10:00', status: 'pending' },
      { orderId: 'o7', customerName: 'Épicerie Fine Alger', address: 'Hydra, Alger', estimatedTime: '12:30', status: 'pending' },
    ],
  },
];

// ─── Phase 6: Finance & Reports Data ───

const invoicePayments: Payment[] = [
  { id: 'pay1', tenantId: 't1', invoiceId: 'inv1', invoiceNumber: 'FAC-2024-001', customerId: 'c1', customerName: 'Superette El Baraka', amount: 50000, method: 'bank_transfer', status: 'completed', reference: 'VIR-2024-0001', date: '2024-12-10', createdAt: '2024-12-10' },
  { id: 'pay2', tenantId: 't1', invoiceId: 'inv2', invoiceNumber: 'FAC-2024-002', customerId: 'c2', customerName: 'Gros Bazar Oran', amount: 200000, method: 'cheque', status: 'completed', reference: 'CHQ-445566', date: '2024-12-08', createdAt: '2024-12-08' },
  { id: 'pay3', tenantId: 't1', invoiceId: 'inv3', invoiceNumber: 'FAC-2024-003', customerId: 'c3', customerName: 'Mini Market Saïd', amount: 15000, method: 'cash', status: 'completed', reference: 'CASH-003', date: '2024-12-12', createdAt: '2024-12-12' },
  { id: 'pay4', tenantId: 't1', invoiceId: 'inv4', invoiceNumber: 'FAC-2024-004', customerId: 'c1', customerName: 'Superette El Baraka', amount: 30000, method: 'mobile_payment', status: 'pending', reference: 'MOB-2024-004', date: '2024-12-15', createdAt: '2024-12-15' },
  { id: 'pay5', tenantId: 't1', invoiceId: 'inv5', invoiceNumber: 'FAC-2024-005', customerId: 'c4', customerName: 'Épicerie Fine Alger', amount: 75000, method: 'bank_transfer', status: 'completed', reference: 'VIR-2024-0005', date: '2024-11-28', createdAt: '2024-11-28' },
  { id: 'pay6', tenantId: 't1', invoiceId: 'inv6', invoiceNumber: 'FAC-2024-006', customerId: 'c5', customerName: 'Dépôt Central Blida', amount: 0, method: 'bank_transfer', status: 'failed', reference: 'VIR-FAIL-006', date: '2024-12-14', createdAt: '2024-12-14' },
];

export const invoices: Invoice[] = [
  {
    id: 'inv1', tenantId: 't1', orderId: 'o1', customerId: 'c1', customerName: 'Superette El Baraka',
    invoiceNumber: 'FAC-2024-001', status: 'paid', issueDate: '2024-12-05', dueDate: '2025-01-05',
    subtotal: 84000, tva9: 0, tva19: 15960, totalTva: 15960, total: 99960, paidAmount: 99960, remainingAmount: 0,
    lineItems: [
      { productId: 'p1', productName: 'Couscous Fin 1kg', unit: 'Pack (12)', quantity: 40, unitPrice: 1200, tvaRate: 19, total: 57120 },
      { productId: 'p2', productName: 'Huile de Tournesol 5L', unit: 'Piece', quantity: 60, unitPrice: 450, tvaRate: 19, total: 32130 },
    ],
    payments: [invoicePayments[0]], createdAt: '2024-12-05',
  },
  {
    id: 'inv2', tenantId: 't1', orderId: 'o2', customerId: 'c2', customerName: 'Gros Bazar Oran',
    invoiceNumber: 'FAC-2024-002', status: 'paid', issueDate: '2024-12-03', dueDate: '2025-01-03',
    subtotal: 336000, tva9: 0, tva19: 63840, totalTva: 63840, total: 399840, paidAmount: 399840, remainingAmount: 0,
    lineItems: [
      { productId: 'p1', productName: 'Couscous Fin 1kg', unit: 'Pallet (600)', quantity: 4, unitPrice: 48000, tvaRate: 19, total: 228480 },
      { productId: 'p3', productName: 'Lait UHT 1L', unit: 'Pack (24)', quantity: 100, unitPrice: 1440, tvaRate: 9, total: 156960 },
    ],
    payments: [invoicePayments[1]], createdAt: '2024-12-03',
  },
  {
    id: 'inv3', tenantId: 't1', orderId: 'o3', customerId: 'c3', customerName: 'Mini Market Saïd',
    invoiceNumber: 'FAC-2024-003', status: 'partial', issueDate: '2024-12-08', dueDate: '2025-01-08',
    subtotal: 36000, tva9: 0, tva19: 6840, totalTva: 6840, total: 42840, paidAmount: 15000, remainingAmount: 27840,
    lineItems: [
      { productId: 'p2', productName: 'Huile de Tournesol 5L', unit: 'Piece', quantity: 80, unitPrice: 450, tvaRate: 19, total: 42840 },
    ],
    payments: [invoicePayments[2]], createdAt: '2024-12-08',
  },
  {
    id: 'inv4', tenantId: 't1', orderId: 'o4', customerId: 'c1', customerName: 'Superette El Baraka',
    invoiceNumber: 'FAC-2024-004', status: 'overdue', issueDate: '2024-11-01', dueDate: '2024-12-01',
    subtotal: 120000, tva9: 0, tva19: 22800, totalTva: 22800, total: 142800, paidAmount: 30000, remainingAmount: 112800,
    lineItems: [
      { productId: 'p1', productName: 'Couscous Fin 1kg', unit: 'Pack (12)', quantity: 100, unitPrice: 1200, tvaRate: 19, total: 142800 },
    ],
    payments: [invoicePayments[3]], createdAt: '2024-11-01',
  },
  {
    id: 'inv5', tenantId: 't1', orderId: 'o5', customerId: 'c4', customerName: 'Épicerie Fine Alger',
    invoiceNumber: 'FAC-2024-005', status: 'paid', issueDate: '2024-11-20', dueDate: '2024-12-20',
    subtotal: 150000, tva9: 0, tva19: 28500, totalTva: 28500, total: 178500, paidAmount: 178500, remainingAmount: 0,
    lineItems: [
      { productId: 'p1', productName: 'Couscous Fin 1kg', unit: 'Pallet (600)', quantity: 2, unitPrice: 55000, tvaRate: 19, total: 130900 },
      { productId: 'p2', productName: 'Huile de Tournesol 5L', unit: 'Piece', quantity: 40, unitPrice: 450, tvaRate: 19, total: 21420 },
    ],
    payments: [invoicePayments[4]], createdAt: '2024-11-20',
  },
  {
    id: 'inv6', tenantId: 't1', orderId: 'o6', customerId: 'c5', customerName: 'Dépôt Central Blida',
    invoiceNumber: 'FAC-2024-006', status: 'sent', issueDate: '2024-12-14', dueDate: '2025-01-14',
    subtotal: 250000, tva9: 0, tva19: 47500, totalTva: 47500, total: 297500, paidAmount: 0, remainingAmount: 297500,
    lineItems: [
      { productId: 'p1', productName: 'Couscous Fin 1kg', unit: 'Pallet (600)', quantity: 3, unitPrice: 48000, tvaRate: 19, total: 171360 },
      { productId: 'p3', productName: 'Lait UHT 1L', unit: 'Pack (24)', quantity: 50, unitPrice: 1440, tvaRate: 9, total: 78480 },
    ],
    payments: [], createdAt: '2024-12-14',
  },
  {
    id: 'inv7', tenantId: 't1', orderId: 'o7', customerId: 'c6', customerName: 'Marché de Nuit Sétif',
    invoiceNumber: 'FAC-2024-007', status: 'draft', issueDate: '2024-12-16', dueDate: '2025-01-16',
    subtotal: 48000, tva9: 4320, tva19: 0, totalTva: 4320, total: 52320, paidAmount: 0, remainingAmount: 52320,
    lineItems: [
      { productId: 'p3', productName: 'Lait UHT 1L', unit: 'Pack (24)', quantity: 30, unitPrice: 1600, tvaRate: 9, total: 52320 },
    ],
    payments: [], createdAt: '2024-12-16',
  },
];

export const payments: Payment[] = invoicePayments;

export const accountingStats: AccountingStats = {
  totalRevenue: 1213760,
  totalExpenses: 845000,
  netProfit: 368760,
  dso: 34,
  tvaCollected: 189760,
  tvaDue: 142500,
  outstandingReceivables: 490460,
};

export const agingBuckets: AgingBucket[] = [
  { range: '0-30', amount: 325340, count: 3 },
  { range: '31-60', amount: 112800, count: 1 },
  { range: '61-90', amount: 52320, count: 1 },
  { range: '90+', amount: 0, count: 0 },
];

export const topDebtors: TopDebtor[] = [
  { customerId: 'c5', customerName: 'Dépôt Central Blida', outstanding: 297500, daysOverdue: 0 },
  { customerId: 'c1', customerName: 'Superette El Baraka', outstanding: 112800, daysOverdue: 45 },
  { customerId: 'c3', customerName: 'Mini Market Saïd', outstanding: 27840, daysOverdue: 5 },
  { customerId: 'c6', customerName: 'Marché de Nuit Sétif', outstanding: 52320, daysOverdue: 0 },
];

export const salesReportData: SalesReportData = {
  revenueByMonth: [
    { month: '2024-07', revenue: 180000 }, { month: '2024-08', revenue: 210000 },
    { month: '2024-09', revenue: 195000 }, { month: '2024-10', revenue: 230000 },
    { month: '2024-11', revenue: 265000 }, { month: '2024-12', revenue: 310000 },
  ],
  revenueBySegment: [
    { segment: 'superette', revenue: 520000 }, { segment: 'wholesale', revenue: 680000 }, { segment: 'shadow', revenue: 13760 },
  ],
  topProducts: [
    { name: 'Couscous Fin 1kg', revenue: 650000, quantity: 12400 },
    { name: 'Huile de Tournesol 5L', revenue: 320000, quantity: 5200 },
    { name: 'Lait UHT 1L', revenue: 243760, quantity: 8500 },
  ],
  topCustomers: [
    { name: 'Gros Bazar Oran', spent: 399840, orders: 12 },
    { name: 'Dépôt Central Blida', spent: 297500, orders: 8 },
    { name: 'Épicerie Fine Alger', spent: 178500, orders: 6 },
    { name: 'Superette El Baraka', spent: 242760, orders: 15 },
    { name: 'Mini Market Saïd', spent: 42840, orders: 4 },
  ],
  salesRepPerformance: [
    { name: 'Ahmed Bensalem', orders: 45, revenue: 520000, avgOrderValue: 11555 },
    { name: 'Fatima Zahra', orders: 38, revenue: 430000, avgOrderValue: 11315 },
    { name: 'Karim Medjdoub', orders: 22, revenue: 263760, avgOrderValue: 11989 },
  ],
};

export const taxReportData: TaxReportData = {
  period: '2024-Q4',
  rows: [
    { taxRate: 9, taxableBase: 235440, tvaCollected: 21190 },
    { taxRate: 19, taxableBase: 940000, tvaCollected: 178600 },
  ],
  totalTaxableBase: 1175440,
  totalTva: 199790,
};