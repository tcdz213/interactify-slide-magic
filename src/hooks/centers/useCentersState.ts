
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Center, CenterFormData } from '@/types/center.types';

const defaultFormData: CenterFormData = {
  name: '',
  location: '',
  description: '',
  status: 'active',
  category: '',
};

export const useCentersState = (initialSearchTerm: string = '') => {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { items, filteredItems, status, error, filters } = useAppSelector(state => state.centers);
  
  // Initialize form state
  const [formData, setFormData] = useState<CenterFormData>(defaultFormData);
  
  // Clear error state when error is resolved
  useEffect(() => {
    if (status !== 'failed' && isError) {
      setIsError(false);
      setErrorMessage(null);
    }
  }, [status]);

  // Reset form helper
  const resetForm = () => {
    setFormData(defaultFormData);
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
    resetForm,
    setIsError,
    setErrorMessage
  };
};
