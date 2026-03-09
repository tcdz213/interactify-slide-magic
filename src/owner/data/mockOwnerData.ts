/**
 * 👑 Owner Portal — Mock Data (SaaS Model)
 * Phase 3: Alignment with 9 Tenant IDs
 */
import type {
  OwnerProfile,
  OwnerSaaSKpis,
  MrrPoint,
  PlanDistribution,
  Subscriber,
  SubscriptionInvoice,
  OnboardingRequest,
  SupportTicket,
  OwnerAlert,
} from "../types/owner";

export const OWNER_PROFILE: OwnerProfile = {
  id: "T-OWN-01",
  name: "Yacine Hadj-Ali",
  email: "yacine@jawda.dz",
  phone: "+213-21-000-001",
  role: "PlatformOwner",
  avatarInitials: "YH",
};

// ── Subscribers (Entrepôts & External) ──
export const subscribers: Subscriber[] = [
  {
    id: "T-ENT-01", name: "Bennet Eddar", type: "entrepot", plan: "enterprise",
    status: "active", city: "Blida", wilaya: "Blida",
    contactName: "Ahmed Mansour", contactEmail: "ahmed@benneteddar.dz", contactPhone: "+213-25-431-001",
    startDate: "2025-06-01", renewalDate: "2026-06-01", monthlyFee: 150_000,
    userCount: 18, maxUsers: 999, warehouseCount: 2, maxWarehouses: 999,
    totalOrders: 2_340, totalRevenue: 145_000_000, lastActive: "2026-03-08T09:00:00",
    sector: "Agroalimentaire",
  },
  {
    id: "T-ENT-02", name: "Atlas BTP", type: "entrepot", plan: "pro",
    status: "active", city: "Alger", wilaya: "Alger",
    contactName: "Karim Ben Ali", contactEmail: "karim@atlasbtp.dz", contactPhone: "+213-21-812-002",
    startDate: "2025-09-15", renewalDate: "2026-09-15", monthlyFee: 85_000,
    userCount: 8, maxUsers: 25, warehouseCount: 1, maxWarehouses: 3,
    totalOrders: 876, totalRevenue: 62_000_000, lastActive: "2026-03-08T08:45:00",
    sector: "Matériaux de construction",
  },
  {
    id: "T-ENT-03", name: "TechStore Pro", type: "entrepot", plan: "pro",
    status: "active", city: "Constantine", wilaya: "Constantine",
    contactName: "Hassan Nour", contactEmail: "hassan@techstore.dz", contactPhone: "+213-31-200-003",
    startDate: "2025-07-01", renewalDate: "2026-07-01", monthlyFee: 85_000,
    userCount: 22, maxUsers: 25, warehouseCount: 3, maxWarehouses: 3,
    totalOrders: 1_890, totalRevenue: 128_000_000, lastActive: "2026-03-08T10:15:00",
    sector: "Technologie",
  },
  {
    id: "T-ENT-04", name: "Pharmed Distribution", type: "entrepot", plan: "standard",
    status: "active", city: "Oran", wilaya: "Oran",
    contactName: "Mourad Zeroual", contactEmail: "mourad@pharmed.dz", contactPhone: "+213-41-680-004",
    startDate: "2025-11-01", renewalDate: "2026-11-01", monthlyFee: 45_000,
    userCount: 6, maxUsers: 10, warehouseCount: 1, maxWarehouses: 1,
    totalOrders: 542, totalRevenue: 38_000_000, lastActive: "2026-03-07T16:30:00",
    sector: "Pharmaceutique",
  },
  {
    id: "T-EXT-01", name: "Client Final A", type: "entrepot", plan: "trial",
    status: "trial", city: "Boumerdes", wilaya: "Boumerdes",
    contactName: "Ali Final", contactEmail: "ali@client-a.dz", contactPhone: "+213-24-960-006",
    startDate: "2026-02-15", renewalDate: "2026-03-15", monthlyFee: 0,
    userCount: 3, maxUsers: 3, warehouseCount: 1, maxWarehouses: 1,
    totalOrders: 45, totalRevenue: 3_200_000, lastActive: "2026-03-06T14:00:00",
    sector: "Alimentation générale",
  },
  {
    id: "T-EXT-02", name: "Magasin B", type: "entrepot", plan: "standard",
    status: "suspended", city: "Bechar", wilaya: "Bechar",
    contactName: "Omar Djelloul", contactEmail: "omar@magasin-b.dz", contactPhone: "+213-49-120-008",
    startDate: "2025-08-01", renewalDate: "2026-08-01", monthlyFee: 45_000,
    userCount: 4, maxUsers: 10, warehouseCount: 1, maxWarehouses: 1,
    totalOrders: 210, totalRevenue: 15_000_000, lastActive: "2026-02-20T11:00:00",
    sector: "Électronique",
  },
];

// ── Subscribers (Fournisseurs) ──
export const supplierSubscribers: Subscriber[] = [
  {
    id: "T-FRN-01", name: "Agro Sahel Distribution", type: "fournisseur", plan: "pro",
    status: "active", city: "Alger", wilaya: "Alger",
    contactName: "Karim Benmoussa", contactEmail: "karim@agrosahel.dz", contactPhone: "+213-21-400-010",
    startDate: "2025-05-01", renewalDate: "2026-05-01", monthlyFee: 85_000,
    userCount: 4, maxUsers: 25, warehouseCount: 0, maxWarehouses: 0,
    totalOrders: 890, totalRevenue: 78_000_000, lastActive: "2026-03-08T08:30:00",
    sector: "Agroalimentaire",
  },
  {
    id: "T-FRN-02", name: "Cimenterie d'Alger", type: "fournisseur", plan: "standard" as any,
    status: "active", city: "Alger", wilaya: "Alger",
    contactName: "Youcef Krim", contactEmail: "youcef@cimenterie.dz", contactPhone: "+213-21-880-012",
    startDate: "2025-08-01", renewalDate: "2026-08-01", monthlyFee: 45_000,
    userCount: 3, maxUsers: 10, warehouseCount: 0, maxWarehouses: 0,
    totalOrders: 456, totalRevenue: 42_000_000, lastActive: "2026-03-07T17:00:00",
    sector: "Matériaux de construction",
  },
  {
    id: "T-FRN-03", name: "IT Components DZ", type: "fournisseur", plan: "pro",
    status: "active", city: "Constantine", wilaya: "Constantine",
    contactName: "Farid Meddour", contactEmail: "farid@itcomp.dz", contactPhone: "+213-31-920-013",
    startDate: "2025-06-15", renewalDate: "2026-06-15", monthlyFee: 85_000,
    userCount: 5, maxUsers: 25, warehouseCount: 0, maxWarehouses: 0,
    totalOrders: 678, totalRevenue: 56_000_000, lastActive: "2026-03-08T07:00:00",
    sector: "Électronique & Pièces",
  },
];

export const allSubscribers = [...subscribers, ...supplierSubscribers];

// ── SaaS KPIs ──
const activeEntrepots = subscribers.filter(s => s.status === "active").length;
const activeFournisseurs = supplierSubscribers.filter(s => s.status === "active").length;
const totalActive = activeEntrepots + activeFournisseurs;
const mrrEntrepots = subscribers.filter(s => s.status === "active").reduce((s, e) => s + e.monthlyFee, 0);
const mrrFournisseurs = supplierSubscribers.filter(s => s.status === "active").reduce((s, e) => s + e.monthlyFee, 0);
const totalMrr = mrrEntrepots + mrrFournisseurs;

export const ownerSaaSKpis: OwnerSaaSKpis = {
  mrr: totalMrr,
  mrrGrowthPct: 8.5,
  totalSubscribers: allSubscribers.length,
  activeSubscribers: totalActive,
  newSubscribersThisMonth: 2,
  churnRate: 2.1,
  arpu: totalActive > 0 ? Math.round(totalMrr / totalActive) : 0,
  totalEntrepots: subscribers.length,
  totalFournisseurs: supplierSubscribers.length,
  trialCount: allSubscribers.filter(s => s.status === "trial").length,
  pendingOnboarding: allSubscribers.filter(s => s.status === "pending").length,
  openTickets: 5,
  platformOrders: allSubscribers.reduce((s, e) => s + e.totalOrders, 0),
  platformGmv: allSubscribers.reduce((s, e) => s + e.totalRevenue, 0),
};

// ── MRR History ──
export const mrrHistory: MrrPoint[] = [
  { month: "Sep 25", mrr: 380_000, entrepots: 250_000, fournisseurs: 130_000 },
  { month: "Oct 25", mrr: 425_000, entrepots: 285_000, fournisseurs: 140_000 },
  { month: "Nov 25", mrr: 480_000, entrepots: 330_000, fournisseurs: 150_000 },
  { month: "Déc 25", mrr: 515_000, entrepots: 355_000, fournisseurs: 160_000 },
  { month: "Jan 26", mrr: 555_000, entrepots: 385_000, fournisseurs: 170_000 },
  { month: "Fév 26", mrr: 610_000, entrepots: 420_000, fournisseurs: 190_000 },
  { month: "Mar 26", mrr: totalMrr, entrepots: mrrEntrepots, fournisseurs: mrrFournisseurs },
];

// ── Plan Distribution ──
export const planDistribution: PlanDistribution[] = [
  { plan: "Enterprise", count: 1, revenue: 150_000, color: "hsl(var(--primary))" },
  { plan: "Pro", count: 4, revenue: 85_000 * 4, color: "hsl(var(--info))" },
  { plan: "Standard", count: 3, revenue: 45_000 * 3, color: "hsl(var(--warning))" },
  { plan: "Trial", count: 1, revenue: 0, color: "hsl(var(--muted-foreground))" },
];

// ── Invoices ──
export const subscriptionInvoices: SubscriptionInvoice[] = [
  { id: "INV-001", subscriberId: "T-ENT-01", subscriberName: "Bennet Eddar", period: "Mars 2026", amount: 150_000, status: "paid", issuedAt: "2026-03-01", paidAt: "2026-03-02", dueDate: "2026-03-10" },
  { id: "INV-002", subscriberId: "T-ENT-02", subscriberName: "Atlas BTP", period: "Mars 2026", amount: 85_000, status: "paid", issuedAt: "2026-03-01", paidAt: "2026-03-03", dueDate: "2026-03-10" },
  { id: "INV-003", subscriberId: "T-ENT-03", subscriberName: "TechStore Pro", period: "Mars 2026", amount: 85_000, status: "pending", issuedAt: "2026-03-01", paidAt: null, dueDate: "2026-03-10" },
  { id: "INV-004", subscriberId: "T-EXT-02", subscriberName: "Magasin B", period: "Fév 2026", amount: 45_000, status: "overdue", issuedAt: "2026-02-01", paidAt: null, dueDate: "2026-02-10" },
  { id: "INV-005", subscriberId: "T-EXT-02", subscriberName: "Magasin B", period: "Mars 2026", amount: 45_000, status: "overdue", issuedAt: "2026-03-01", paidAt: null, dueDate: "2026-03-10" },
  { id: "INV-006", subscriberId: "T-FRN-01", subscriberName: "Agro Sahel Distribution", period: "Mars 2026", amount: 85_000, status: "paid", issuedAt: "2026-03-01", paidAt: "2026-03-01", dueDate: "2026-03-10" },
  { id: "INV-007", subscriberId: "T-ENT-04", subscriberName: "Pharmed Distribution", period: "Mars 2026", amount: 45_000, status: "pending", issuedAt: "2026-03-01", paidAt: null, dueDate: "2026-03-10" },
  { id: "INV-008", subscriberId: "T-FRN-02", subscriberName: "Cimenterie d'Alger", period: "Mars 2026", amount: 45_000, status: "paid", issuedAt: "2026-03-01", paidAt: "2026-03-04", dueDate: "2026-03-10" },
  { id: "INV-009", subscriberId: "T-FRN-03", subscriberName: "IT Components DZ", period: "Mars 2026", amount: 85_000, status: "pending", issuedAt: "2026-03-01", paidAt: null, dueDate: "2026-03-10" },
];

// ── Onboarding Requests ──
export const onboardingRequests: OnboardingRequest[] = [
  { id: "ONB-001", companyName: "Laiterie du Tell", type: "fournisseur", contactName: "Rachid Hamidi", contactEmail: "rachid@laiterie-tell.dz", city: "Sétif", wilaya: "Sétif", sector: "Produits laitiers", requestedPlan: "standard", requestedAt: "2026-03-05T14:00:00", status: "pending", notes: "Producteur local — 50 points de distribution" },
  { id: "ONB-002", companyName: "Entrepôt Médéa Centre", type: "entrepot", contactName: "Sofiane Kaci", contactEmail: "sofiane@medea-centre.dz", city: "Médéa", wilaya: "Médéa", sector: "Distribution générale", requestedPlan: "standard", requestedAt: "2026-03-06T10:30:00", status: "pending", notes: "PME en croissance" },
  { id: "ONB-003", companyName: "Cosmétique Sahara", type: "fournisseur", contactName: "Leila Ouazani", contactEmail: "leila@cosm-sahara.dz", city: "Ouargla", wilaya: "Ouargla", sector: "Cosmétique naturelle", requestedPlan: "pro", requestedAt: "2026-03-04T09:00:00", status: "pending", notes: "Produits bio" },
];

// ── Support Tickets ──
export const supportTickets: SupportTicket[] = [
  { id: "TK-001", subscriberId: "T-EXT-02", subscriberName: "Magasin B", subject: "Problème de connexion après suspension", priority: "high", status: "open", createdAt: "2026-03-07T11:00:00", updatedAt: "2026-03-07T11:00:00", category: "Accès" },
  { id: "TK-002", subscriberId: "T-ENT-03", subscriberName: "TechStore Pro", subject: "Erreur d'export PDF des rapports", priority: "medium", status: "in_progress", createdAt: "2026-03-06T14:30:00", updatedAt: "2026-03-07T09:00:00", category: "Rapports" },
  { id: "TK-003", subscriberId: "T-FRN-01", subscriberName: "Agro Sahel Distribution", subject: "Synchronisation catalogue lente", priority: "low", status: "open", createdAt: "2026-03-05T16:00:00", updatedAt: "2026-03-05T16:00:00", category: "Performance" },
  { id: "TK-004", subscriberId: "T-ENT-01", subscriberName: "Bennet Eddar", subject: "Demande d'ajout de 5 utilisateurs supplémentaires", priority: "medium", status: "open", createdAt: "2026-03-06T08:00:00", updatedAt: "2026-03-06T08:00:00", category: "Abonnement" },
];

// ── Alerts ──
export const ownerAlerts: OwnerAlert[] = [
  { id: "OA-001", severity: "critical", title: "Magasin B — Abonnement impayé", description: "Magasin B suspendue pour factures impayées (90,000 DZD).", createdAt: "2026-03-08T08:00:00", module: "Facturation" },
  { id: "OA-002", severity: "critical", title: "Client Final A — Trial expire", description: "Client Final A doit convertir ou perdre l'accès.", createdAt: "2026-03-08T07:30:00", module: "Abonnements" },
  { id: "OA-003", severity: "warning", title: "3 demandes d'onboarding en attente", description: "Laiterie du Tell, Entrepôt Médéa, Cosmétique Sahara attendent validation.", createdAt: "2026-03-07T16:00:00", module: "Onboarding" },
  { id: "OA-004", severity: "warning", title: "4 tickets support ouverts", description: "2 tickets haute priorité nécessitent une intervention.", createdAt: "2026-03-06T10:00:00", module: "Support" },
];
