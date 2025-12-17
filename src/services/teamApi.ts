import { apiFetch } from '@/lib/api';
import type {
  TeamMember,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  InviteTeamMemberRequest,
  TeamStats,
  TeamListParams,
  TeamListResponse,
} from '@/types/team';

export const teamApi = {
  async list(params?: TeamListParams): Promise<TeamListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return apiFetch<TeamListResponse>(`/team${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<{ data: TeamMember }> {
    return apiFetch<{ data: TeamMember }>(`/team/${id}`);
  },

  async getStats(): Promise<{ data: TeamStats }> {
    return apiFetch<{ data: TeamStats }>('/team/stats');
  },

  async invite(data: InviteTeamMemberRequest): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>('/team/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateTeamMemberRequest): Promise<{ data: TeamMember }> {
    return apiFetch<{ data: TeamMember }>(`/team/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/team/${id}`, { method: 'DELETE' });
  },

  async resendInvite(id: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`/team/${id}/resend-invite`, {
      method: 'POST',
    });
  },
};
