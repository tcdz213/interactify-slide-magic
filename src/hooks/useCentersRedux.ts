
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  filterCenters, 
  resetFilters,
  addCenter, 
  updateCenter, 
  deleteCenter, 
  toggleVerification,
  fetchCenters
} from '@/redux/slices/centersSlice';
import { CenterFormData } from '@/types/center.types';
import { useToast } from '@/components/ui/use-toast';

export const useCentersRedux = (initialSearchTerm: string = '') => {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { items, filteredItems, status, error, filters } = useAppSelector(state => state.centers);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Default form state
  const [formData, setFormData] = useState<CenterFormData>({
    name: '',
    location: '',
    description: '',
    status: 'active',
    category: '',
  });
  
  // Initialize search term from Redux if provided
  useEffect(() => {
    if (initialSearchTerm && initialSearchTerm !== filters.searchTerm) {
      dispatch(filterCenters({ 
        filters: { searchTerm: initialSearchTerm } 
      }));
    }
  }, [initialSearchTerm]);
  
  // Clear error state when error is resolved
  useEffect(() => {
    if (status !== 'failed' && isError) {
      setIsError(false);
      setErrorMessage(null);
    }
  }, [status]);

  // Reset form helper
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      status: 'active',
      category: '',
    });
  };
  
  // Load centers (would be from API in real app)
  const loadCenters = async () => {
    try {
      setIsError(false);
      setErrorMessage(null);
      await dispatch(fetchCenters()).unwrap();
    } catch (err) {
      const errorMsg = error || 'Failed to load centers';
      setIsError(true);
      setErrorMessage(errorMsg);
      toast({
        title: 'Error loading centers',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };
  
  // Update filters and apply them
  const updateFilters = (newFilters: Partial<typeof filters>) => {
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
  
  // Add a new center
  const handleAddCenter = async () => {
    try {
      // Form validation
      if (!formData.name.trim()) {
        throw new Error('Center name is required');
      }
      
      if (!formData.location.trim()) {
        throw new Error('Center location is required');
      }
      
      // Using the local action for simplicity
      dispatch(addCenter(formData));
      resetForm();
      
      toast({
        title: 'Training center added',
        description: `${formData.name} has been added successfully.`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add training center';
      toast({
        title: 'Error adding center',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };
  
  // Update an existing center
  const handleEditCenter = async (id: number) => {
    try {
      // Form validation
      if (!formData.name.trim()) {
        throw new Error('Center name is required');
      }
      
      if (!formData.location.trim()) {
        throw new Error('Center location is required');
      }
      
      dispatch(updateCenter({ id, formData }));
      resetForm();
      
      toast({
        title: 'Training center updated',
        description: `${formData.name} has been updated successfully.`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update training center';
      toast({
        title: 'Error updating center',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };
  
  // Delete a center
  const handleDeleteCenter = async (id: number) => {
    try {
      if (!id) throw new Error('Invalid center ID');
      
      dispatch(deleteCenter(id));
      
      toast({
        title: 'Training center deleted',
        description: 'The center has been deleted successfully.',
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete training center';
      toast({
        title: 'Error deleting center',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };
  
  // Toggle center verification status
  const handleVerifyCenter = async (id: number) => {
    try {
      if (!id) throw new Error('Invalid center ID');
      
      dispatch(toggleVerification(id));
      const center = items.find(c => c.id === id);
      
      if (center) {
        toast({
          title: center.verified ? 'Center unverified' : 'Center verified',
          description: `${center.name} has been ${center.verified ? 'un' : ''}verified.`,
        });
      } else {
        throw new Error('Center not found');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update center verification status';
      toast({
        title: 'Error updating verification',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };
  
  return {
    centers: items,
    filteredCenters: filteredItems,
    filters,
    isLoading: status === 'loading',
    isError,
    errorMessage,
    error,
    formData,
    setFormData,
    updateFilters,
    clearAllFilters,
    handleAddCenter,
    handleEditCenter,
    handleDeleteCenter,
    handleVerifyCenter,
    resetForm,
    loadCenters
  };
};
