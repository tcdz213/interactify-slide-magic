// Bugs API Service
import { apiFetch } from '@/lib/api';
import type {
  Bug,
  BugFilters,
  BugsResponse,
  BugResponse,
  CreateBugData,
  UpdateBugData,
  BugStatus,
  RetestResult,
  RetestData,
  BugStatisticsResponse,
} from '@/types/bug';

export const bugsApi = {
  // Get all bugs with filters
  async list(params?: BugFilters): Promise<BugsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.severity) searchParams.set('severity', params.severity);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.productId) searchParams.set('productId', params.productId);
    if (params?.platform) searchParams.set('platform', params.platform);
    if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId);
    if (params?.reporterId) searchParams.set('reporterId', params.reporterId);
    if (params?.sprintId) searchParams.set('sprintId', params.sprintId);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return apiFetch<BugsResponse>(`/bugs${query ? `?${query}` : ''}`);
  },

  // Get bug by ID
  async getById(id: string): Promise<BugResponse> {
    return apiFetch<BugResponse>(`/bugs/${id}`);
  },

  // Create bug
  async create(data: CreateBugData): Promise<BugResponse> {
    return apiFetch<BugResponse>('/bugs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update bug
  async update(id: string, data: UpdateBugData): Promise<BugResponse> {
    return apiFetch<BugResponse>(`/bugs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Update bug status
  async updateStatus(id: string, status: BugStatus): Promise<BugResponse> {
    return apiFetch<BugResponse>(`/bugs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Delete bug
  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/bugs/${id}`, { method: 'DELETE' });
  },

  // Assign bug
  async assign(id: string, assigneeId: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/bugs/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId }),
    });
  },

  // Unassign bug
  async unassign(id: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/bugs/${id}/assign`, {
      method: 'DELETE',
    });
  },

  // Link to feature
  async linkFeature(id: string, featureId: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/bugs/${id}/link-feature`, {
      method: 'POST',
      body: JSON.stringify({ featureId }),
    });
  },

  // Unlink from feature
  async unlinkFeature(id: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/bugs/${id}/link-feature`, {
      method: 'DELETE',
    });
  },

  // Add to sprint
  async addToSprint(id: string, sprintId: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/bugs/${id}/add-to-sprint`, {
      method: 'POST',
      body: JSON.stringify({ sprintId }),
    });
  },

  // Remove from sprint
  async removeFromSprint(id: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/bugs/${id}/remove-from-sprint`, {
      method: 'DELETE',
    });
  },

  // Add retest result
  async addRetest(id: string, data: RetestData): Promise<{ data: RetestResult }> {
    return apiFetch<{ data: RetestResult }>(`/bugs/${id}/retest`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get retest history
  async getRetestHistory(id: string): Promise<{ data: RetestResult[] }> {
    return apiFetch<{ data: RetestResult[] }>(`/bugs/${id}/retest`);
  },

  // Get bug statistics
  async getStatistics(params?: {
    productId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<BugStatisticsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.productId) searchParams.set('productId', params.productId);
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);

    const query = searchParams.toString();
    return apiFetch<BugStatisticsResponse>(`/bugs/statistics${query ? `?${query}` : ''}`);
  },
};
