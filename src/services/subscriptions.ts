import api, { handleApiError } from './api';
import { API_CONFIG } from '@/config/api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export const subscriptionsService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS?.PLANS || '/api/v1/subscriptions/plans');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS?.CURRENT || '/api/v1/subscriptions/current');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async subscribe(planId: string): Promise<{ checkoutUrl: string }> {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS?.SUBSCRIBE || '/api/v1/subscriptions/subscribe', {
        plan_id: planId,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async cancelSubscription(): Promise<void> {
    try {
      await api.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS?.CANCEL || '/api/v1/subscriptions/cancel');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
