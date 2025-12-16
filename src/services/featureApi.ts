import type { Feature, FeatureListParams, FeatureListResponse } from '@/types/feature';
import { apiFetch } from '@/lib/api';

const BASE_URL = '/features';

export const featuresApi = {
  async list(params: FeatureListParams = {}): Promise<FeatureListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.status) searchParams.append('status', params.status);
    if (params.priority) searchParams.append('priority', params.priority);
    if (params.productId) searchParams.append('productId', params.productId);
    if (params.platform) searchParams.append('platform', params.platform);
    if (params.assigneeId) searchParams.append('assigneeId', params.assigneeId);
    if (params.sprintId) searchParams.append('sprintId', params.sprintId);
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return apiFetch<FeatureListResponse>(`${BASE_URL}${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<{ data: Feature }> {
    return apiFetch<{ data: Feature }>(`${BASE_URL}/${id}`);
  },
};
