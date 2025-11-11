import api, { handleApiError } from './api';
import { API_CONFIG } from '@/config/api';

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueGrowth: number;
  userGrowth: number;
  productGrowth: number;
  orderGrowth: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  productsCount: number;
  joinedAt: string;
}

export interface CardManagement {
  id: string;
  title: string;
  status: 'active' | 'flagged' | 'deleted';
  views: number;
  clicks: number;
  createdAt: string;
  flagReason?: string;
}

export const adminService = {
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_STATS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const response = await api.get(
        `${API_CONFIG.ENDPOINTS.ADMIN.USERS}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getCards(status?: 'all' | 'active' | 'flagged' | 'deleted'): Promise<CardManagement[]> {
    try {
      const params = status && status !== 'all' ? `?status=${status}` : '';
      const response = await api.get(`${API_CONFIG.ENDPOINTS.ADMIN.CARDS}${params}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async flagCard(id: string, reason: string): Promise<void> {
    try {
      await api.put(`${API_CONFIG.ENDPOINTS.ADMIN.CARDS}/${id}/flag`, { reason });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async unflagCard(id: string): Promise<void> {
    try {
      await api.put(`${API_CONFIG.ENDPOINTS.ADMIN.CARDS}/${id}/unflag`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async deleteCard(id: string, permanent: boolean = false): Promise<void> {
    try {
      const endpoint = permanent
        ? `${API_CONFIG.ENDPOINTS.ADMIN.CARDS}/${id}/permanent`
        : `${API_CONFIG.ENDPOINTS.ADMIN.CARDS}/${id}`;
      await api.delete(endpoint);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async restoreCard(id: string): Promise<void> {
    try {
      await api.post(`${API_CONFIG.ENDPOINTS.ADMIN.CARDS}/${id}/restore`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
