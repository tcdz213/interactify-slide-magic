
import { useEffect } from 'react';
import { useCentersState, useCentersFilters, useCentersCRUD, useCentersFetch } from './centers';
import { useAppDispatch } from '@/redux/hooks';
import { filterCenters } from '@/redux/slices/centersSlice';

export const useCentersRedux = (initialSearchTerm: string = '') => {
  const dispatch = useAppDispatch();
  
  // Compose hooks
  const { centers, filteredCenters, filters, isLoading, isError, errorMessage, error, 
          formData, setFormData, resetForm, setIsError, setErrorMessage } = useCentersState();
  
  const { updateFilters, clearAllFilters } = useCentersFilters();
  
  const { handleAddCenter, handleEditCenter, handleDeleteCenter, handleVerifyCenter } = 
    useCentersCRUD(formData, resetForm, setIsError, setErrorMessage);
    
  const { loadCenters } = useCentersFetch(setIsError, setErrorMessage);

  // Initialize search term from Redux if provided
  useEffect(() => {
    if (initialSearchTerm && initialSearchTerm !== filters.searchTerm) {
      dispatch(filterCenters({ 
        filters: { searchTerm: initialSearchTerm } 
      }));
    }
  }, [initialSearchTerm]);
  
  return {
    centers,
    filteredCenters,
    filters,
    isLoading,
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
