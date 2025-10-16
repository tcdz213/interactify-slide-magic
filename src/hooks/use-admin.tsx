import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/services/adminApi';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check admin role using real API
      const isAdminUser = await adminApi.checkAdminRole();
      
      setIsAdmin(isAdminUser);
      
      if (!isAdminUser) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
      toast({
        title: 'Error',
        description: 'Failed to verify admin access.',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
};
