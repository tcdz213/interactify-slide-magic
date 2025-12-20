import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalApi } from '@/services/approvalApi';
import { toast } from '@/hooks/use-toast';

export function useResetGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureId, gateId }: { featureId: string; gateId: string }) =>
      approvalApi.resetGate(featureId, gateId),
    onSuccess: (_, { featureId }) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflow', featureId] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast({ title: 'Gate reset', description: 'The approval gate has been reset to pending.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
