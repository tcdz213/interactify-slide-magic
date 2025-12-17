import { apiFetch } from '@/lib/api';
import type { 
  Release, 
  CreateReleaseRequest, 
  UpdateReleaseRequest, 
  ReleasesQueryParams,
  PipelineStep,
  RollbackLog,
  RollbackRequest,
  DeployRequest,
  ApprovalRequest,
  Approver
} from '@/types/release';

const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const releaseApi = {
  getAll: async (params?: ReleasesQueryParams) => {
    return apiFetch<{ data: Release[]; pagination: any }>(`/releases${buildQueryString(params)}`);
  },

  getById: async (id: string) => {
    const response = await apiFetch<{ data: Release }>(`/releases/${id}`);
    return response.data;
  },

  create: async (data: CreateReleaseRequest) => {
    const response = await apiFetch<{ data: Release }>('/releases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: UpdateReleaseRequest) => {
    const response = await apiFetch<{ data: Release }>(`/releases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    await apiFetch(`/releases/${id}`, { method: 'DELETE' });
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiFetch<{ data: Release }>(`/releases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  // Pipeline
  getPipeline: async (id: string) => {
    const response = await apiFetch<{ data: PipelineStep[] }>(`/releases/${id}/pipeline`);
    return response.data;
  },

  startPipelineStage: async (id: string, stage: string) => {
    const response = await apiFetch<{ data: PipelineStep }>(`/releases/${id}/pipeline/${stage}/start`, {
      method: 'POST',
    });
    return response.data;
  },

  completePipelineStage: async (id: string, stage: string, success: boolean, notes?: string) => {
    const response = await apiFetch<{ data: PipelineStep }>(`/releases/${id}/pipeline/${stage}/complete`, {
      method: 'POST',
      body: JSON.stringify({ success, notes }),
    });
    return response.data;
  },

  retryPipelineStage: async (id: string, stage: string) => {
    const response = await apiFetch<{ data: PipelineStep }>(`/releases/${id}/pipeline/${stage}/retry`, {
      method: 'POST',
    });
    return response.data;
  },

  // Deployment
  deploy: async (id: string, data: DeployRequest) => {
    const response = await apiFetch<{ data: { message: string } }>(`/releases/${id}/deploy`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  rollback: async (id: string, data: RollbackRequest) => {
    const response = await apiFetch<{ data: Release }>(`/releases/${id}/rollback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  getRollbackHistory: async (id: string) => {
    const response = await apiFetch<{ data: RollbackLog[] }>(`/releases/${id}/rollbacks`);
    return response.data;
  },

  // Release Notes
  updateNotes: async (id: string, notes: string) => {
    const response = await apiFetch<{ data: Release }>(`/releases/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
    return response.data;
  },

  generateNotes: async (id: string) => {
    const response = await apiFetch<{ data: { data: { notes: string } } }>(`/releases/${id}/notes/generate`, {
      method: 'POST',
    });
    return response.data.data.notes;
  },

  exportNotes: async (id: string, format: 'markdown' | 'html' | 'pdf') => {
    const response = await apiFetch<{ data: { data: { downloadUrl: string; expiresAt: string } } }>(`/releases/${id}/notes/export${buildQueryString({ format })}`);
    return response.data.data;
  },

  // Features & Bugs
  linkFeature: async (id: string, featureId: string) => {
    return apiFetch(`/releases/${id}/features`, {
      method: 'POST',
      body: JSON.stringify({ featureId }),
    });
  },

  unlinkFeature: async (id: string, featureId: string) => {
    await apiFetch(`/releases/${id}/features/${featureId}`, { method: 'DELETE' });
  },

  linkBug: async (id: string, bugId: string) => {
    return apiFetch(`/releases/${id}/bugs`, {
      method: 'POST',
      body: JSON.stringify({ bugId }),
    });
  },

  unlinkBug: async (id: string, bugId: string) => {
    await apiFetch(`/releases/${id}/bugs/${bugId}`, { method: 'DELETE' });
  },

  // Approvals
  requestApproval: async (id: string, data: ApprovalRequest) => {
    return apiFetch(`/releases/${id}/approval/request`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  approve: async (id: string, comment?: string) => {
    return apiFetch(`/releases/${id}/approval/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  reject: async (id: string, reason: string) => {
    return apiFetch(`/releases/${id}/approval/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  getApprovalStatus: async (id: string) => {
    const response = await apiFetch<{ data: { data: { status: string; approvers: Approver[] } } }>(`/releases/${id}/approval`);
    return response.data.data;
  },
};
