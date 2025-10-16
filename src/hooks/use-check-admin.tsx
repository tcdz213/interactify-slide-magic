import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';

/**
 * Hook to check if current user has admin role (non-blocking)
 * Use this for UI conditionals, not for route protection
 */
export const useCheckAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const isAdminUser = await adminApi.checkAdminRole();
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
};
