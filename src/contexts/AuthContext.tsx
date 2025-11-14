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

  // Initialize auth state on mount and handle OAuth callback
  useEffect(() => {
    const initAuth = async () => {
      // Check for OAuth tokens in URL (Google OAuth redirect)
      // Backend redirects to: https://yourdomain.com/?access_token=xxx&refresh_token=yyy
      const urlParams = new URLSearchParams(window.location.search);
      const urlAccessToken = urlParams.get('access_token');
      const urlRefreshToken = urlParams.get('refresh_token');

      if (urlAccessToken && urlRefreshToken) {
        // Store tokens from OAuth callback
        localStorage.setItem('access_token', urlAccessToken);
        localStorage.setItem('refresh_token', urlRefreshToken);
        
        // Clean URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Fetch user data
        try {
          await refreshUser();
          toast.success('تم تسجيل الدخول بنجاح');
        } catch (error) {
          console.error('Failed to fetch user after OAuth:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        // Regular initialization - check if we have tokens
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            await refreshUser();
          } catch (error: any) {
            // If token is invalid (401), silently clear and continue
            if (error.response?.status === 401) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            } else {
              console.error('Failed to refresh user:', error);
            }
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      // GET /api/v1/user/me
      // Headers: Authorization: Bearer <access_token>
      // Response: { success: true, data: { user: { id, email, name, avatar, role, isVerified, ... } } }
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      const userData = response.data.data?.user || response.data.data;
      
      if (!userData || !userData.id || !userData.email) {
        throw new Error('Invalid user data from server');
      }
      
      // Map backend response to frontend User type
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        role: userData.role || 'user',
        isVerified: userData.isVerified,
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
      // POST /api/v1/auth/login
      // Request: { "email": "user@example.com", "password": "password123" }
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      // Response: { success: true, data: { user: {...}, access_token, refresh_token, expires_in } }
      const responseData = response.data.data;
      const { access_token, refresh_token, user: userData } = responseData;

      if (!access_token || !refresh_token || !userData) {
        throw new Error('Invalid response format from server');
      }

      // Save tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Map backend response to frontend User type
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        role: userData.role || 'user',
        isVerified: userData.isVerified,
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
      // GET /api/v1/auth/google
      // Redirects to Google OAuth, then backend redirects back to:
      // https://yourdomain.com/?access_token=xxx&refresh_token=yyy
      window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`;
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // POST /api/v1/auth/register
      // Request: { "email": "user@example.com", "password": "password123", "name": "User Name" }
      await api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        email,
        password,
        name,
      });

      // Response: { success: true, data: { user: {...} }, message: "User registered successfully" }
      // Note: Register endpoint does NOT return tokens, user must login after registration
      
      toast.success('تم التسجيل بنجاح، جاري تسجيل الدخول...');
      
      // Automatically login after successful registration
      await login(email, password);
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // POST /api/v1/auth/logout
      // Headers: Authorization: Bearer <access_token>
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
    // Don't make API calls if there's no token
    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }

    try {
      // GET /api/v1/admin/check-role
      // Response: { "is_admin": true }
      const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN.CHECK_ROLE);
      return response.data.is_admin === true;
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
