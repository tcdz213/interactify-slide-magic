import api, { handleApiError } from './api';
import { API_CONFIG } from '@/config/api';

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface RevenueData {
  total: number;
  currency: string;
  byPeriod: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export const analyticsService = {
  async getSales(startDate?: string, endDate?: string): Promise<SalesData[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await api.get(
        `${API_CONFIG.ENDPOINTS.ANALYTICS.SALES}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getRevenue(): Promise<RevenueData> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ANALYTICS.REVENUE);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getProductsAnalytics(): Promise<any> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ANALYTICS.PRODUCTS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getCustomersAnalytics(): Promise<any> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ANALYTICS.CUSTOMERS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
