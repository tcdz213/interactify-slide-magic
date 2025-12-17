import { apiFetch } from '@/lib/api';
import type { 
  DashboardStats, 
  ActivityFeedResponse, 
  SprintSummaryResponse 
} from '@/types/dashboard';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiFetch<{ data: DashboardStats }>('/dashboard/stats');
    return response.data;
  },

  getActivityFeed: async (params?: { 
    page?: number; 
    limit?: number; 
    type?: 'task' | 'bug' | 'feature' | 'sprint' | 'release';
  }): Promise<ActivityFeedResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const response = await apiFetch<{ data: ActivityFeedResponse }>(`/dashboard/activity${query}`);
    return response.data;
  },

  getSprintSummary: async (): Promise<SprintSummaryResponse> => {
    const response = await apiFetch<{ data: SprintSummaryResponse }>('/dashboard/sprint-summary');
    return response.data;
  },
};
