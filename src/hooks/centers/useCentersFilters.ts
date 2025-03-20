
import { useAppDispatch } from '@/redux/hooks';
import { filterCenters, resetFilters } from '@/redux/slices/centersSlice';
import { useToast } from '@/components/ui/use-toast';

export const useCentersFilters = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Update filters and apply them
  const updateFilters = (newFilters: Partial<any>) => {
    try {
      dispatch(filterCenters({ 
        filters: { ...newFilters } 
      }));
    } catch (err) {
      toast({
        title: 'Error filtering centers',
        description: 'Failed to filter centers with the provided criteria',
        variant: 'destructive'
      });
    }
  };
  
  // Reset all filters to defaults
  const clearAllFilters = () => {
    dispatch(resetFilters());
  };

  return {
    updateFilters,
    clearAllFilters
  };
};
