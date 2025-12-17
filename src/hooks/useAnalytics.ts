import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface AnalyticsOverview {
  totalFeatures: number;
  completedFeatures: number;
  totalBugs: number;
  resolvedBugs: number;
  totalTasks: number;
  completedTasks: number;
  activeSprintsCount: number;
  teamMembersCount: number;
  averageVelocity: number;
  averageBugResolutionTime: number;
}

export interface VelocityData {
  sprintId: string;
  sprintName: string;
  planned: number;
  completed: number;
  date: string;
}

export interface BurndownData {
  date: string;
  remaining: number;
  ideal: number;
  completed: number;
}

export interface BugResolutionData {
  period: string;
  opened: number;
  resolved: number;
  averageTime: number;
}

export interface FeatureCompletionData {
  period: string;
  completed: number;
  planned: number;
  completionRate: number;
}

export interface TeamWorkloadData {
  memberId: string;
  memberName: string;
  tasksCount: number;
  bugsCount: number;
  hoursLogged: number;
  utilizationPercent: number;
}

export interface ProductHealthData {
  productId: string;
  productName: string;
  healthScore: number;
  openBugs: number;
  criticalBugs: number;
  featuresInProgress: number;
  lastReleaseDate: string;
}

export const useAnalyticsOverview = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'overview', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiFetch<{ data: AnalyticsOverview }>(`/analytics/overview${query}`);
      return response.data;
    },
  });
};

export const useVelocityData = (limit = 10) => {
  return useQuery({
    queryKey: ['analytics', 'velocity', limit],
    queryFn: async () => {
      const response = await apiFetch<{ data: VelocityData[] }>(`/analytics/velocity?limit=${limit}`);
      return response.data;
    },
  });
};

export const useBurndownData = (sprintId: string) => {
  return useQuery({
    queryKey: ['analytics', 'burndown', sprintId],
    queryFn: async () => {
      const response = await apiFetch<{ data: BurndownData[] }>(`/analytics/burndown/${sprintId}`);
      return response.data;
    },
    enabled: !!sprintId,
  });
};

export const useBugResolutionData = (startDate?: string, endDate?: string, productId?: string) => {
  return useQuery({
    queryKey: ['analytics', 'bugs', 'resolution', startDate, endDate, productId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (productId) params.append('productId', productId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiFetch<{ data: BugResolutionData[] }>(`/analytics/bugs/resolution${query}`);
      return response.data;
    },
  });
};

export const useFeatureCompletionData = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'features', 'completion', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiFetch<{ data: FeatureCompletionData[] }>(`/analytics/features/completion${query}`);
      return response.data;
    },
  });
};

export const useTeamWorkloadData = () => {
  return useQuery({
    queryKey: ['analytics', 'team', 'workload'],
    queryFn: async () => {
      const response = await apiFetch<{ data: TeamWorkloadData[] }>('/analytics/team/workload');
      return response.data;
    },
  });
};

export const useProductHealthData = () => {
  return useQuery({
    queryKey: ['analytics', 'products', 'health'],
    queryFn: async () => {
      const response = await apiFetch<{ data: ProductHealthData[] }>('/analytics/products/health');
      return response.data;
    },
  });
};
