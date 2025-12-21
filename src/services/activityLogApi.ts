import { apiFetch } from '@/lib/api';
import type { ActivityLogsQueryParams, ActivityLogsResponse } from '@/types/activityLog';

const buildQueryString = (params?: ActivityLogsQueryParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const activityLogApi = {
  getAll: async (params?: ActivityLogsQueryParams): Promise<ActivityLogsResponse> => {
    return apiFetch<ActivityLogsResponse>(`/admin/activity-logs${buildQueryString(params)}`);
  },

  getByUser: async (userId: string, params?: Omit<ActivityLogsQueryParams, 'userId'>): Promise<ActivityLogsResponse> => {
    return apiFetch<ActivityLogsResponse>(`/admin/users/${userId}/activity${buildQueryString(params as ActivityLogsQueryParams)}`);
  },

  exportLogs: async (params?: ActivityLogsQueryParams): Promise<{ downloadUrl: string; expiresAt: string }> => {
    const response = await apiFetch<{ data: { downloadUrl: string; expiresAt: string } }>(
      `/admin/activity-logs/export${buildQueryString(params)}`
    );
    return response.data;
  },
};
