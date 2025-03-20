
import { useAppDispatch } from '@/redux/hooks';
import { fetchCenters } from '@/redux/slices/centersSlice';
import { useToast } from '@/components/ui/use-toast';

export const useCentersFetch = (
  setIsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Load centers (would be from API in real app)
  const loadCenters = async () => {
    try {
      setIsError(false);
      setErrorMessage(null);
      await dispatch(fetchCenters()).unwrap();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load centers';
      setIsError(true);
      setErrorMessage(errorMsg);
      toast({
        title: 'Error loading centers',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };

  return {
    loadCenters
  };
};
