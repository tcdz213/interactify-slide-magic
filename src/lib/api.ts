// API Client for DevCycle Backend
import type { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductListParams, 
  ProductListResponse,
  ProductStats,
  ProductTeamMember 
} from '@/types/product';

import type {
  Feature,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  FeatureListParams,
  FeatureListResponse,
  FeatureStatus,
  ApprovalWorkflow,
} from '@/types/feature';

import { tokenStorage } from '@/lib/tokenStorage';
import { authService } from '@/services/auth.service';

// Use environment variable or default to localhost for development
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Generic fetch wrapper with auth and automatic token refresh
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Ensure token is fresh before making request
  await authService.ensureFreshToken();
  
  const token = tokenStorage.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - attempt token refresh and retry
  if (response.status === 401) {
    const refreshed = await authService.tryRefreshToken();
    if (refreshed) {
      // Retry with new token
      const newToken = tokenStorage.getAccessToken();
      if (newToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      }
      
      const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({ error: { message: 'Request failed' } }));
        throw new Error(error.error?.message || `HTTP ${retryResponse.status}`);
      }
      
      if (retryResponse.status === 204) {
        return {} as T;
      }
      
      return retryResponse.json();
    }
    
    // Refresh failed - session expired
    tokenStorage.clearSession();
    window.location.href = '/auth';
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Products API
export const productsApi = {
  async list(params?: ProductListParams): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.platform) searchParams.set('platform', params.platform);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    
    const query = searchParams.toString();
    return apiFetch<ProductListResponse>(`/products${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<{ data: Product }> {
    return apiFetch<{ data: Product }>(`/products/${id}`);
  },

  async create(data: CreateProductRequest): Promise<{ data: Product }> {
    return apiFetch<{ data: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateProductRequest): Promise<{ data: Product }> {
    return apiFetch<{ data: Product }>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/products/${id}`, { method: 'DELETE' });
  },

  async getStats(id: string): Promise<{ data: ProductStats }> {
    return apiFetch<{ data: ProductStats }>(`/products/${id}/stats`);
  },

  async getTeam(id: string): Promise<{ data: ProductTeamMember[] }> {
    return apiFetch<{ data: ProductTeamMember[] }>(`/products/${id}/team`);
  },

  async addTeamMember(productId: string, userId: string, role: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/products/${productId}/team`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  },

  async removeTeamMember(productId: string, userId: string): Promise<void> {
    await apiFetch<void>(`/products/${productId}/team/${userId}`, { method: 'DELETE' });
  },
};

// Features API
export const featuresApi = {
  async list(params?: FeatureListParams): Promise<FeatureListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.productId) searchParams.set('productId', params.productId);
    if (params?.platform) searchParams.set('platform', params.platform);
    if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId);
    if (params?.sprintId) searchParams.set('sprintId', params.sprintId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    
    const query = searchParams.toString();
    return apiFetch<FeatureListResponse>(`/features${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<{ data: Feature }> {
    return apiFetch<{ data: Feature }>(`/features/${id}`);
  },

  async create(data: CreateFeatureRequest): Promise<{ data: Feature }> {
    return apiFetch<{ data: Feature }>('/features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateFeatureRequest): Promise<{ data: Feature }> {
    return apiFetch<{ data: Feature }>(`/features/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/features/${id}`, { method: 'DELETE' });
  },

  async updateStatus(id: string, status: FeatureStatus): Promise<{ data: Feature }> {
    return apiFetch<{ data: Feature }>(`/features/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async vote(id: string): Promise<{ data: { votes: number; votedBy: string[] } }> {
    return apiFetch<{ data: { votes: number; votedBy: string[] } }>(`/features/${id}/vote`, {
      method: 'POST',
    });
  },

  async unvote(id: string): Promise<{ data: { votes: number; votedBy: string[] } }> {
    return apiFetch<{ data: { votes: number; votedBy: string[] } }>(`/features/${id}/vote`, {
      method: 'DELETE',
    });
  },

  async assignToSprint(featureId: string, sprintId: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/features/${featureId}/assign-sprint`, {
      method: 'POST',
      body: JSON.stringify({ sprintId }),
    });
  },

  async unassignFromSprint(featureId: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/features/${featureId}/assign-sprint`, {
      method: 'DELETE',
    });
  },

  // Approval Workflow
  async getWorkflow(featureId: string): Promise<{ data: ApprovalWorkflow }> {
    return apiFetch<{ data: ApprovalWorkflow }>(`/features/${featureId}/approval-workflow`);
  },

  async initWorkflow(featureId: string, gates?: { type: string; label: string; order: number }[]): Promise<{ data: ApprovalWorkflow }> {
    return apiFetch<{ data: ApprovalWorkflow }>(`/features/${featureId}/approval-workflow`, {
      method: 'POST',
      body: JSON.stringify(gates ? { gates } : {}),
    });
  },

  async approveGate(featureId: string, gateId: string): Promise<{ data: ApprovalWorkflow }> {
    return apiFetch<{ data: ApprovalWorkflow }>(`/features/${featureId}/approval-workflow/approve`, {
      method: 'POST',
      body: JSON.stringify({ gateId }),
    });
  },

  async rejectGate(featureId: string, gateId: string, reason: string): Promise<{ data: ApprovalWorkflow }> {
    return apiFetch<{ data: ApprovalWorkflow }>(`/features/${featureId}/approval-workflow/reject`, {
      method: 'POST',
      body: JSON.stringify({ gateId, reason }),
    });
  },

  async requestChanges(featureId: string, gateId: string, comment: string): Promise<{ data: ApprovalWorkflow }> {
    return apiFetch<{ data: ApprovalWorkflow }>(`/features/${featureId}/approval-workflow/request-changes`, {
      method: 'POST',
      body: JSON.stringify({ gateId, comment }),
    });
  },
};

// Export all APIs
export { apiFetch };
