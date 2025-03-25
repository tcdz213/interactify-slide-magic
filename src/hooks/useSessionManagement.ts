
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCurrentUser } from '@/redux/slices/authSlice';
import { authService } from '@/api/auth';

export const useSessionManagement = () => {
  const dispatch = useAppDispatch();
  const { isSessionPersisted, user, loading, error } = useAppSelector(state => state.auth);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      // Only fetch user data if we have a valid token but no user data
      if (authService.isAuthenticated() && (!user || Object.keys(user).length === 0)) {
        await dispatch(fetchCurrentUser());
      }
    };
    
    checkAuth();
  }, [dispatch, user]);

  return {
    isAuthenticated: authService.isAuthenticated() && !!user,
    user,
    isLoading: loading,
    error
  };
};
