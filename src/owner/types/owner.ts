/**
 * 👑 Owner Portal — Types (SaaS Model)
 */

export interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "PlatformOwner";
  avatarInitials: string;
}

// ── Subscription Plans ──
export type SubscriptionPlan = "trial" | "standard" | "pro" | "enterprise";
export type SubscriberType = "entrepot" | "fournisseur";
export type SubscriptionStatus = "active" | "trial" | "suspended" | "cancelled" | "pending";

export interface Subscriber {
  id: string;
  name: string;
  type: SubscriberType;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  city: string;
  wilaya: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  renewalDate: string;
  monthlyFee: number; // DZD
  userCount: number;
  maxUsers: number;
  warehouseCount: number;
  maxWarehouses: number;
  totalOrders: number;
  totalRevenue: number; // their business revenue on platform
  lastActive: string;
  sector: string;
}

export interface SubscriptionInvoice {
  id: string;
  subscriberId: string;
  subscriberName: string;
  period: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  issuedAt: string;
  paidAt: string | null;
  dueDate: string;
}

export interface OnboardingRequest {
  id: string;
  companyName: string;
  type: SubscriberType;
  contactName: string;
  contactEmail: string;
  city: string;
  wilaya: string;
  sector: string;
  requestedPlan: SubscriptionPlan;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  notes: string;
}

export interface SupportTicket {
  id: string;
  subscriberId: string;
  subscriberName: string;
  subject: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  category: string;
}

// ── SaaS KPIs ──
export interface OwnerSaaSKpis {
  mrr: number;
  mrrGrowthPct: number;
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribersThisMonth: number;
  churnRate: number;
  arpu: number;
  totalEntrepots: number;
  totalFournisseurs: number;
  trialCount: number;
  pendingOnboarding: number;
  openTickets: number;
  platformOrders: number;
  platformGmv: number;
}

export interface MrrPoint {
  month: string;
  mrr: number;
  entrepots: number;
  fournisseurs: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
  revenue: number;
  color: string;
}

export interface OwnerAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  createdAt: string;
  module: string;
}
