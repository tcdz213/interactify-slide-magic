export interface PlanLimits {
  products: number;
  teamMembers: number;
  featuresPerMonth: number;
  storage: string;
  advancedAnalytics: boolean;
  customWorkflows: boolean;
  prioritySupport: boolean;
  sso: boolean;
  apiAccess: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  limits: PlanLimits;
}

export interface Subscription {
  id: string;
  userId: string;
  workspaceId: string;
  planId: string;
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  interval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
}

export interface Usage {
  products: number;
  teamMembers: number;
  features: number;
  storage: number;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  createdAt: string;
  paidAt: string | null;
  invoiceUrl: string | null;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface CreateSubscriptionRequest {
  planId: string;
  interval: 'monthly' | 'yearly';
}

export interface UpdateSubscriptionRequest {
  planId: string;
}
