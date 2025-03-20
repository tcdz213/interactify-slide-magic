
import { useAppDispatch } from '@/redux/hooks';
import { 
  addCenter, 
  updateCenter, 
  deleteCenter, 
  toggleVerification
} from '@/redux/slices/centersSlice';
import { CenterFormData } from '@/types/center.types';
import { useToast } from '@/components/ui/use-toast';

export const useCentersCRUD = (
  formData: CenterFormData, 
  resetForm: () => void,
  setIsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
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
      
      toast({
        title: 'Center verification updated',
        description: 'The center verification status has been updated.',
      });
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
    handleAddCenter,
    handleEditCenter,
    handleDeleteCenter,
    handleVerifyCenter
  };
};
