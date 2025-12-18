import { apiFetch } from '@/lib/api';
import type {
  AdminUser,
  AdminBillingRecord,
  AdminReport,
  AdminStats,
  AdminUserListParams,
  AdminBillingListParams,
  AdminReportListParams,
  PaginatedResponse,
  CorsConfig,
  CorsResponse,
} from '@/types/admin';

// Admin Users API
export const adminUsersApi = {
  list: async (params?: AdminUserListParams): Promise<PaginatedResponse<AdminUser>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    
    return apiFetch(`/admin/users?${searchParams.toString()}`);
  },

  getById: async (id: string): Promise<{ data: AdminUser }> => {
    return apiFetch(`/admin/users/${id}`);
  },

  updateStatus: async (id: string, status: 'active' | 'suspended'): Promise<{ data: AdminUser }> => {
    return apiFetch(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updateRole: async (id: string, role: string): Promise<{ data: AdminUser }> => {
    return apiFetch(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
  },

  resetPassword: async (id: string): Promise<{ data: { message: string } }> => {
    return apiFetch(`/admin/users/${id}/reset-password`, { method: 'POST' });
  },
};

// Admin Billing API
export const adminBillingApi = {
  list: async (params?: AdminBillingListParams): Promise<PaginatedResponse<AdminBillingRecord>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.plan) searchParams.set('plan', params.plan);
    if (params?.search) searchParams.set('search', params.search);
    
    return apiFetch(`/admin/billing?${searchParams.toString()}`);
  },

  getById: async (id: string): Promise<{ data: AdminBillingRecord }> => {
    return apiFetch(`/admin/billing/${id}`);
  },

  updatePlan: async (id: string, plan: string): Promise<{ data: AdminBillingRecord }> => {
    return apiFetch(`/admin/billing/${id}/plan`, {
      method: 'PATCH',
      body: JSON.stringify({ plan }),
    });
  },

  cancelSubscription: async (id: string): Promise<{ data: AdminBillingRecord }> => {
    return apiFetch(`/admin/billing/${id}/cancel`, { method: 'POST' });
  },

  refund: async (id: string, amount: number): Promise<{ data: { message: string } }> => {
    return apiFetch(`/admin/billing/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
};

// Admin Reports API
export const adminReportsApi = {
  list: async (params?: AdminReportListParams): Promise<PaginatedResponse<AdminReport>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.search) searchParams.set('search', params.search);
    
    return apiFetch(`/admin/reports?${searchParams.toString()}`);
  },

  getById: async (id: string): Promise<{ data: AdminReport }> => {
    return apiFetch(`/admin/reports/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<{ data: AdminReport }> => {
    return apiFetch(`/admin/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  assign: async (id: string, assignedTo: string): Promise<{ data: AdminReport }> => {
    return apiFetch(`/admin/reports/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch(`/admin/reports/${id}`, { method: 'DELETE' });
  },
};

// Admin Stats API
export const adminStatsApi = {
  getOverview: async (): Promise<{ data: AdminStats }> => {
    return apiFetch('/admin/stats/overview');
  },

  getUserGrowth: async (period: 'week' | 'month' | 'year'): Promise<{ data: { date: string; count: number }[] }> => {
    return apiFetch(`/admin/stats/user-growth?period=${period}`);
  },

  getRevenueStats: async (period: 'week' | 'month' | 'year'): Promise<{ data: { date: string; amount: number }[] }> => {
    return apiFetch(`/admin/stats/revenue?period=${period}`);
  },

  getPlanDistribution: async (): Promise<{ data: { plan: string; count: number }[] }> => {
    return apiFetch('/admin/stats/plan-distribution');
  },
};

// Admin CORS API
export const adminCorsApi = {
  getConfig: async (): Promise<{ data: CorsConfig }> => {
    return apiFetch('/admin/cors');
  },

  enable: async (): Promise<{ data: CorsResponse }> => {
    return apiFetch('/admin/cors/enable', { method: 'POST' });
  },

  disable: async (): Promise<{ data: CorsResponse }> => {
    return apiFetch('/admin/cors/disable', { method: 'POST' });
  },

  updateOrigins: async (origins: string[]): Promise<{ data: CorsResponse }> => {
    return apiFetch('/admin/cors/origins', {
      method: 'PUT',
      body: JSON.stringify({ origins }),
    });
  },

  addOrigin: async (origin: string): Promise<{ data: CorsResponse }> => {
    return apiFetch('/admin/cors/origins', {
      method: 'POST',
      body: JSON.stringify({ origin }),
    });
  },

  removeOrigin: async (origin: string): Promise<{ data: CorsResponse }> => {
    return apiFetch(`/admin/cors/origins/${encodeURIComponent(origin)}`, {
      method: 'DELETE',
    });
  },

  reset: async (): Promise<{ data: CorsResponse }> => {
    return apiFetch('/admin/cors/reset', { method: 'POST' });
  },
};
