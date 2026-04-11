import { Tenant, Product, Order, Customer, Warehouse, TenantUser, PlatformStats, BusinessStats } from './types';

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

export const products: Product[] = [
  {
    id: 'p1', tenantId: 't1', name: 'Couscous Fin 1kg', sku: 'CSC-001', category: 'Grains',
    baseUnit: 'piece', stockBase: 14400,
    units: [
      { id: 'u1', name: 'Piece', conversionToBase: 1 },
      { id: 'u2', name: 'Pack (12)', conversionToBase: 12 },
      { id: 'u3', name: 'Pallet (600)', conversionToBase: 600 },
    ],
    pricingRules: [
      { id: 'pr1', segment: 'superette', unitId: 'u2', unitName: 'Pack (12)', price: 1200, effectiveFrom: '2024-01-01' },
      { id: 'pr2', segment: 'wholesale', unitId: 'u2', unitName: 'Pack (12)', price: 1050, effectiveFrom: '2024-01-01' },
      { id: 'pr3', segment: 'superette', unitId: 'u3', unitName: 'Pallet (600)', price: 55000, effectiveFrom: '2024-01-01' },
      { id: 'pr4', segment: 'wholesale', unitId: 'u3', unitName: 'Pallet (600)', price: 48000, effectiveFrom: '2024-01-01' },
    ],
    isActive: true, createdAt: '2024-01-20',
  },
  {
    id: 'p2', tenantId: 't1', name: 'Huile d\'Olive 1L', sku: 'OIL-001', category: 'Oils',
    baseUnit: 'bottle', stockBase: 3600,
    units: [
      { id: 'u4', name: 'Bottle', conversionToBase: 1 },
      { id: 'u5', name: 'Carton (6)', conversionToBase: 6 },
      { id: 'u6', name: 'Pallet (180)', conversionToBase: 180 },
    ],
    pricingRules: [
      { id: 'pr5', segment: 'superette', unitId: 'u5', unitName: 'Carton (6)', price: 4800, effectiveFrom: '2024-01-01' },
      { id: 'pr6', segment: 'wholesale', unitId: 'u5', unitName: 'Carton (6)', price: 4200, effectiveFrom: '2024-01-01' },
    ],
    isActive: true, createdAt: '2024-02-05',
  },
  {
    id: 'p3', tenantId: 't1', name: 'Semoule Extra 5kg', sku: 'SEM-001', category: 'Grains',
    baseUnit: 'bag', stockBase: 2400,
    units: [
      { id: 'u7', name: 'Bag', conversionToBase: 1 },
      { id: 'u8', name: 'Pack (10)', conversionToBase: 10 },
    ],
    pricingRules: [
      { id: 'pr7', segment: 'superette', unitId: 'u8', unitName: 'Pack (10)', price: 3500, effectiveFrom: '2024-01-01' },
      { id: 'pr8', segment: 'wholesale', unitId: 'u8', unitName: 'Pack (10)', price: 3100, effectiveFrom: '2024-01-01' },
    ],
    isActive: true, createdAt: '2024-02-10',
  },
  {
    id: 'p4', tenantId: 't1', name: 'Tomate Concentrée 400g', sku: 'TOM-001', category: 'Canned Goods',
    baseUnit: 'can', stockBase: 7200,
    units: [
      { id: 'u9', name: 'Can', conversionToBase: 1 },
      { id: 'u10', name: 'Tray (24)', conversionToBase: 24 },
    ],
    pricingRules: [
      { id: 'pr9', segment: 'superette', unitId: 'u10', unitName: 'Tray (24)', price: 2400, effectiveFrom: '2024-01-01' },
      { id: 'pr10', segment: 'wholesale', unitId: 'u10', unitName: 'Tray (24)', price: 2100, effectiveFrom: '2024-01-01' },
    ],
    isActive: true, createdAt: '2024-03-01',
  },
  {
    id: 'p5', tenantId: 't1', name: 'Lait UHT 1L', sku: 'MLK-001', category: 'Dairy',
    baseUnit: 'brick', stockBase: 9600,
    units: [
      { id: 'u11', name: 'Brick', conversionToBase: 1 },
      { id: 'u12', name: 'Pack (12)', conversionToBase: 12 },
      { id: 'u13', name: 'Pallet (480)', conversionToBase: 480 },
    ],
    pricingRules: [
      { id: 'pr11', segment: 'superette', unitId: 'u12', unitName: 'Pack (12)', price: 600, effectiveFrom: '2024-01-01' },
      { id: 'pr12', segment: 'wholesale', unitId: 'u12', unitName: 'Pack (12)', price: 520, effectiveFrom: '2024-01-01' },
    ],
    isActive: true, createdAt: '2024-03-15',
  },
  {
    id: 'p6', tenantId: 't1', name: 'Sucre Blanc 1kg', sku: 'SUG-001', category: 'Basics',
    baseUnit: 'piece', stockBase: 6000,
    units: [
      { id: 'u14', name: 'Piece', conversionToBase: 1 },
      { id: 'u15', name: 'Pack (10)', conversionToBase: 10 },
    ],
    pricingRules: [
      { id: 'pr13', segment: 'superette', unitId: 'u15', unitName: 'Pack (10)', price: 1100, effectiveFrom: '2024-01-01' },
      { id: 'pr14', segment: 'wholesale', unitId: 'u15', unitName: 'Pack (10)', price: 950, effectiveFrom: '2024-01-01' },
    ],
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
