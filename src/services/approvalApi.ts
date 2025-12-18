// Approval Workflow API Service
import { api } from '@/lib/apiClient';

export interface ApprovalGate {
  id: string;
  type: string;
  label: string;
  order: number;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  changesRequestedBy?: string;
  changesRequestedByName?: string;
  changesRequestedAt?: string;
  changesRequestedComment?: string;
}

export interface ApprovalWorkflow {
  featureId: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'changes_requested';
  currentGateIndex: number;
  gates: ApprovalGate[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGateRequest {
  type: string;
  label: string;
  order: number;
}

export interface ApprovalResponse {
  data: ApprovalWorkflow;
}

export interface MessageResponse {
  data: { message: string };
}

// Approval Workflow API
export const approvalApi = {
  // Get workflow for a feature
  async getWorkflow(featureId: string): Promise<ApprovalResponse> {
    return api.get<ApprovalResponse>(`/features/${featureId}/approval-workflow`);
  },

  // Initialize workflow with optional custom gates
  async initWorkflow(featureId: string, gates?: CreateGateRequest[]): Promise<ApprovalResponse> {
    return api.post<ApprovalResponse>(`/features/${featureId}/approval-workflow`, gates ? { gates } : undefined);
  },

  // Approve a gate
  async approveGate(featureId: string, gateId: string): Promise<ApprovalResponse> {
    return api.post<ApprovalResponse>(`/features/${featureId}/approval-workflow/approve`, { gateId });
  },

  // Reject a gate
  async rejectGate(featureId: string, gateId: string, reason: string): Promise<ApprovalResponse> {
    return api.post<ApprovalResponse>(`/features/${featureId}/approval-workflow/reject`, { gateId, reason });
  },

  // Request changes on a gate
  async requestChanges(featureId: string, gateId: string, comment: string): Promise<ApprovalResponse> {
    return api.post<ApprovalResponse>(`/features/${featureId}/approval-workflow/request-changes`, { gateId, comment });
  },

  // Reset a gate (admin only)
  async resetGate(featureId: string, gateId: string): Promise<ApprovalResponse> {
    return api.post<ApprovalResponse>(`/features/${featureId}/approval-workflow/reset`, { gateId });
  },

  // Update gate order
  async updateGateOrder(featureId: string, gateOrders: { gateId: string; order: number }[]): Promise<ApprovalResponse> {
    return api.patch<ApprovalResponse>(`/features/${featureId}/approval-workflow/reorder`, { gateOrders });
  },

  // Add a new gate
  async addGate(featureId: string, gate: CreateGateRequest): Promise<ApprovalResponse> {
    return api.post<ApprovalResponse>(`/features/${featureId}/approval-workflow/gates`, gate);
  },

  // Remove a gate
  async removeGate(featureId: string, gateId: string): Promise<MessageResponse> {
    return api.delete<MessageResponse>(`/features/${featureId}/approval-workflow/gates/${gateId}`);
  },
};

// React Query hooks for approval workflow
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export function useApprovalWorkflow(featureId: string) {
  return useQuery({
    queryKey: ['approval-workflow', featureId],
    queryFn: () => approvalApi.getWorkflow(featureId),
    enabled: !!featureId,
  });
}

export function useInitWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureId, gates }: { featureId: string; gates?: CreateGateRequest[] }) =>
      approvalApi.initWorkflow(featureId, gates),
    onSuccess: (_, { featureId }) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflow', featureId] });
      toast({ title: 'Workflow initialized', description: 'Approval workflow has been set up.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useApproveGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureId, gateId }: { featureId: string; gateId: string }) =>
      approvalApi.approveGate(featureId, gateId),
    onSuccess: (_, { featureId }) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflow', featureId] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast({ title: 'Gate approved', description: 'The approval gate has been approved.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRejectGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureId, gateId, reason }: { featureId: string; gateId: string; reason: string }) =>
      approvalApi.rejectGate(featureId, gateId, reason),
    onSuccess: (_, { featureId }) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflow', featureId] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast({ title: 'Gate rejected', description: 'The approval gate has been rejected.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureId, gateId, comment }: { featureId: string; gateId: string; comment: string }) =>
      approvalApi.requestChanges(featureId, gateId, comment),
    onSuccess: (_, { featureId }) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflow', featureId] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast({ title: 'Changes requested', description: 'Changes have been requested for this gate.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export default approvalApi;
