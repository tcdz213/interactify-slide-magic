
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCurrentUser } from '@/redux/slices/authSlice';

export const useSessionManagement = () => {
  const dispatch = useAppDispatch();
  const { isSessionPersisted, user, loading, error } = useAppSelector(state => state.auth);

  // Check authentication status on initial load
  useEffect(() => {
    if (isSessionPersisted && !user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isSessionPersisted, user, loading]);

  return {
    isAuthenticated: !!user,
    user,
    isLoading: loading,
    error
  };
};
