import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { api, ApiError, NetworkError, ValidationError } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';

// Hook for GET requests with built-in error handling and retry
export function useApiQuery<T>(
  queryKey: QueryKey,
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
    showErrorToast?: boolean;
    onError?: (error: Error) => void;
  }
) {
  const { showErrorToast = true, onError, ...queryOptions } = options || {};

  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await api.get<T>(endpoint, { showErrorToast: false });
      } catch (error) {
        if (showErrorToast && error instanceof Error) {
          toast({
            title: 'Failed to load data',
            description: error.message,
            variant: 'destructive',
          });
        }
        if (onError && error instanceof Error) {
          onError(error);
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (except network errors)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions,
  });
}

// Hook for mutations with optimistic updates
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: QueryKey[];
    showSuccessToast?: boolean;
    successMessage?: string;
    showErrorToast?: boolean;
  }
) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    invalidateQueries = [],
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
    showErrorToast = true,
  } = options || {};

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }

      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      if (showErrorToast) {
        let description = error.message;
        
        if (error instanceof ValidationError && error.details) {
          const firstError = Object.values(error.details)[0];
          if (firstError?.length) {
            description = firstError[0];
          }
        }

        toast({
          title: 'Error',
          description,
          variant: 'destructive',
        });
      }

      onError?.(error, variables);
    },
  });
}

// Utility hook for handling loading states
export function useLoadingState(isLoading: boolean, minLoadingTime = 300) {
  const [showLoading, setShowLoading] = React.useState(false);
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
    } else {
      // Keep showing loading for minimum time to prevent flicker
      loadingTimeoutRef.current = setTimeout(() => {
        setShowLoading(false);
      }, minLoadingTime);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, minLoadingTime]);

  return showLoading;
}

import React from 'react';

// Error type guards
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

// Get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (isValidationError(error)) {
    if (error.details) {
      const firstError = Object.values(error.details)[0];
      if (firstError?.length) {
        return firstError[0];
      }
    }
    return error.message;
  }
  
  if (isApiError(error)) {
    switch (error.status) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}
