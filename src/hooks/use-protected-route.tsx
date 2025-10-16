import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';

/**
 * Hook to protect routes that require authentication
 * Redirects to /profile if user is not authenticated
 * @param redirectTo - Optional custom redirect path (defaults to '/profile')
 * @returns Object with isAuthenticated and isLoading states
 */
export function useProtectedRoute(redirectTo: string = '/profile') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
  };
}
