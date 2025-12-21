import { apiFetch } from '@/lib/api';
import type { SystemHealthResponse } from '@/types/systemHealth';

export const systemHealthApi = {
  getHealth: async (): Promise<SystemHealthResponse> => {
    const response = await apiFetch<{ data: SystemHealthResponse }>('/admin/health');
    return response.data;
  },

  getHistoricalMetrics: async (hours: number = 24): Promise<{
    errorMetrics: { timestamp: string; count: number; errorRate: number }[];
    responseTimeMetrics: { timestamp: string; avg: number; p95: number; p99: number }[];
  }> => {
    const response = await apiFetch<{ data: {
      errorMetrics: { timestamp: string; count: number; errorRate: number }[];
      responseTimeMetrics: { timestamp: string; avg: number; p95: number; p99: number }[];
    } }>(`/admin/health/metrics?hours=${hours}`);
    return response.data;
  },

  triggerHealthCheck: async (): Promise<SystemHealthResponse> => {
    const response = await apiFetch<{ data: SystemHealthResponse }>('/admin/health/check', {
      method: 'POST',
    });
    return response.data;
  },
};
