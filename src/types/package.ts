/**
 * Package/Subscription Plan Types
 */

export type PackageTier = 'free' | 'basic' | 'premium' | 'business';

export interface PackageFeatures {
  maxCards: number;
  maxBoosts: number;
  canExploreCards: boolean;
  prioritySupport: boolean;
  verificationBadge: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
  apiAccess: boolean;
}

export interface Package {
  id: string;
  name: string;
  tier: PackageTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PackageFeatures;
  description: string;
  isActive: boolean;
  scheduledActivateAt?: string;
  scheduledDeactivateAt?: string;
  subscriberCount?: number;
  revenue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPackage {
  id: string;
  userId: string;
  packageId: string;
  package: Package;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageUsage {
  userId: string;
  packageId: string;
  cardsCreated: number;
  maxCards: number;
  boostsUsed: number;
  maxBoosts: number;
  period: {
    start: string;
    end: string;
  };
}

export interface BoostCard {
  id: string;
  cardId: string;
  userId: string;
  duration: number; // days
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
  impressions: number;
  clicks: number;
  createdAt: string;
}

export interface CreatePackageData {
  name: string;
  tier: PackageTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PackageFeatures;
  description: string;
  isActive: boolean;
}

export interface UpdatePackageData extends Partial<CreatePackageData> {}

export interface RevenueReport {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  growthRate: number;
  byPackage: {
    packageId: string;
    packageName: string;
    revenue: number;
    subscriberCount: number;
  }[];
  byPeriod: {
    period: string;
    revenue: number;
    newSubscribers: number;
  }[];
}

export interface PlanUsageStats {
  totalSubscribers: number;
  byTier: {
    tier: PackageTier;
    count: number;
    percentage: number;
    revenue: number;
  }[];
}

export interface SubscriberListItem {
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  revenue: number;
}
