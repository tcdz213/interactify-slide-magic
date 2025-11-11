import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { handleApiError } from '@/services/api';
import { API_CONFIG } from '@/config/api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'seller' | 'user';
  isVerified?: boolean;
  domain?: string;
  subcategory?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to refresh user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      const userData = response.data;
      
      // Convert snake_case to camelCase if needed
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.full_name,
        avatar: userData.avatar || userData.avatar_url,
        role: userData.role,
        isVerified: userData.is_verified || userData.isVerified,
        domain: userData.domain,
        subcategory: userData.subcategory,
      };
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Save tokens
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }

      // Set user data
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        role: userData.role,
        isVerified: userData.is_verified,
        domain: userData.domain,
        subcategory: userData.subcategory,
      };
      
      setUser(user);
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`;
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        email,
        password,
        name,
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Save tokens
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }

      // Set user data
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        role: userData.role || 'seller',
        isVerified: false,
      };
      
      setUser(user);
      toast.success('تم التسجيل بنجاح');
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      toast.success('تم تسجيل الخروج بنجاح');
    }
  };

  const checkAdminRole = async (): Promise<boolean> => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN.CHECK_ROLE);
      return response.data.isAdmin || response.data.is_admin;
    } catch (error) {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    checkAdminRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
