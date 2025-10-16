import { API_CONFIG, getAuthHeaders } from '@/config/api';

export interface UserSubscription {
  isPro: boolean;
  plan: 'free' | 'pro' | 'premium';
  expiresAt?: string;
}

/**
 * Check if current user has pro subscription
 * TODO: Wire this to your actual API endpoint
 */
export const checkProStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/user/subscription`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) return false;

    const data: UserSubscription = await response.json();
    return data.isPro;
  } catch (error) {
    console.error('Failed to check pro status:', error);
    return false;
  }
};

export const subscriptionApi = {
  checkProStatus
};
