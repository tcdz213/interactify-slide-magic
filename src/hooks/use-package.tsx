import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packageApi } from '@/services/packageApi';
import { CreatePackageData, UpdatePackageData } from '@/types/package';
import { toast } from 'sonner';

export const usePackages = () => {
  return useQuery({
    queryKey: ['packages'],
    queryFn: () => packageApi.getAvailablePackages(),
  });
};

export const useAdminPackages = () => {
  return useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => packageApi.getAllPackages(),
  });
};

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ['current-subscription'],
    queryFn: () => packageApi.getCurrentSubscription(),
    retry: false,
  });
};

export const usePackageUsage = () => {
  return useQuery({
    queryKey: ['package-usage'],
    queryFn: () => packageApi.getPackageUsage(),
  });
};

export const useActiveBoosts = () => {
  return useQuery({
    queryKey: ['active-boosts'],
    queryFn: () => packageApi.getActiveBoosts(),
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePackageData) => packageApi.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create package: ${error.message}`);
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageData }) =>
      packageApi.updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update package: ${error.message}`);
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => packageApi.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete package: ${error.message}`);
    },
  });
};

export const useSubscribeToPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ packageId, paymentMethodId }: { packageId: string; paymentMethodId?: string }) =>
      packageApi.subscribeToPackage(packageId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['package-usage'] });
      toast.success('Successfully subscribed to package');
    },
    onError: (error: Error) => {
      toast.error(`Failed to subscribe: ${error.message}`);
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => packageApi.cancelSubscription(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      toast.success('Subscription will be cancelled at period end');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel subscription: ${error.message}`);
    },
  });
};

export const useBoostCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, duration }: { cardId: string; duration: number }) =>
      packageApi.boostCard(cardId, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-boosts'] });
      queryClient.invalidateQueries({ queryKey: ['package-usage'] });
      toast.success('Card boosted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to boost card: ${error.message}`);
    },
  });
};
