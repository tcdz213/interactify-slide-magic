import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserProfileUpdate } from '@/types/user';
import { authApi } from '@/services/authApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = authApi.getToken();
    const storedUser = authApi.getStoredUser();

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Use stored user data immediately for faster UI
    if (storedUser) {
      setUser(storedUser);
    }

    // Fetch fresh user data in the background
    try {
      const freshUser = await authApi.fetchUserProfile();
      setUser(freshUser);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If fetch fails and we don't have stored data, clear auth
      if (!storedUser) {
        authApi.clearAuth();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (googleToken: string) => {
    setIsLoading(true);
    try {
      const authResponse = await authApi.loginWithGoogle(googleToken);
      setUser(authResponse.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    
    // Disable Google auto-select
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const refreshUser = async () => {
    if (!authApi.isAuthenticated()) return;
    
    try {
      const freshUser = await authApi.fetchUserProfile();
      setUser(freshUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!authApi.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    try {
      const updatedUser = await authApi.updateProfile(updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
