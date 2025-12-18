import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import type { UserWithRole, UserRole } from '@/types/auth';

interface AuthContextType {
  user: UserWithRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserWithRole }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; user?: UserWithRole }>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = authService.getStoredSession();
    if (session) {
      setUser(session.user);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: UserWithRole }> => {
    const result = await authService.login({ email, password });
    
    if (result.success) {
      // Save tokens first to enable authenticated requests
      authService.saveSession(result.data.user as UserWithRole, result.data.tokens);
      
      // Fetch user roles from /me/roles endpoint
      const rolesResult = await authService.getUserRoles();
      const userRole = rolesResult.success && rolesResult.data.length > 0 
        ? rolesResult.data[0].role as UserRole 
        : 'user';
      
      const userWithRole: UserWithRole = {
        ...result.data.user,
        role: userRole,
        permissions: [],
      };
      
      // Update session with role
      authService.saveSession(userWithRole, result.data.tokens);
      setUser(userWithRole);
      return { success: true, user: userWithRole };
    }

    return { success: false, error: 'error' in result ? result.error : 'Login failed' };
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string; user?: UserWithRole }> => {
    const result = await authService.signup({ email, password, name });

    if (result.success) {
      // Save tokens first
      authService.saveSession(result.data.user as UserWithRole, result.data.tokens);
      
      // Fetch user roles
      const rolesResult = await authService.getUserRoles();
      const userRole = rolesResult.success && rolesResult.data.length > 0 
        ? rolesResult.data[0].role as UserRole 
        : 'user';
      
      const userWithRole: UserWithRole = {
        ...result.data.user,
        role: userRole,
        permissions: [],
      };
      
      authService.saveSession(userWithRole, result.data.tokens);
      setUser(userWithRole);
      return { success: true, user: userWithRole };
    }

    return { success: false, error: 'error' in result ? result.error : 'Signup failed' };
  };

  const logout = () => {
    authService.clearSession();
    setUser(null);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return authService.hasRole(user, role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return authService.hasPermission(user, permission);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, hasRole, hasPermission }}>
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

// Re-export types for convenience
export type { UserRole, UserWithRole } from '@/types/auth';
