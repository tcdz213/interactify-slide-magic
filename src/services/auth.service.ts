// Auth Service Layer - Real API Implementation
import type {
  User,
  UserWithRole,
  Tokens,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  RefreshTokenResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserRole,
} from '@/types/auth';
import { tokenStorage } from '@/lib/tokenStorage';

const API_BASE = 'http://localhost:3000/api/v1/auth';

// Track if a token refresh is in progress to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<RefreshTokenResponse | null> | null = null;

// Generic fetch wrapper for auth endpoints
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = false
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (includeAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - attempt token refresh
  if (response.status === 401 && includeAuth) {
    const refreshed = await authService.tryRefreshToken();
    if (refreshed) {
      // Retry the request with new token
      const newToken = tokenStorage.getAccessToken();
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      
      const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({ error: { message: 'Request failed' } }));
        throw new Error(error.error?.message || `HTTP ${retryResponse.status}`);
      }
      
      if (retryResponse.status === 204) {
        return {} as T;
      }
      
      return retryResponse.json();
    }
    
    // Refresh failed - clear session and throw
    tokenStorage.clearSession();
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Decode JWT to check token type (RS256 = Google, HS256 = backend)
function decodeJwtHeader(token: string): { alg: string } | null {
  try {
    const [headerBase64] = token.split('.');
    if (!headerBase64) return null;
    const header = JSON.parse(atob(headerBase64));
    return header;
  } catch {
    return null;
  }
}

// === AUTH SERVICE FUNCTIONS ===

export const authService = {
  // POST /login
  async login(request: LoginRequest): Promise<{ success: true; data: LoginResponse } | { success: false; error: string }> {
    try {
      const response = await authFetch<{ data: LoginResponse }>('/login', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      // Verify we got backend tokens (HS256), not Google tokens (RS256)
      const header = decodeJwtHeader(response.data.tokens.accessToken);
      if (header?.alg === 'RS256') {
        return { success: false, error: 'Invalid token type received' };
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  },

  // POST /signup
  async signup(request: SignupRequest): Promise<{ success: true; data: SignupResponse } | { success: false; error: string }> {
    try {
      const response = await authFetch<{ data: SignupResponse }>('/signup', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
    }
  },

  // GET /me
  async getCurrentUser(): Promise<{ success: true; data: UserWithRole } | { success: false; error: string }> {
    try {
      const response = await authFetch<{ data: UserWithRole }>('/me', {}, true);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get user' };
    }
  },

  // GET /me/roles
  async getUserRoles(): Promise<{ success: true; data: { id: string; userId: string; role: string; createdAt: string }[] } | { success: false; error: string }> {
    try {
      const response = await authFetch<{ data: { id: string; userId: string; role: string; createdAt: string }[] }>('/me/roles', {}, true);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get roles' };
    }
  },

  // PATCH /me
  async updateProfile(request: UpdateProfileRequest): Promise<{ success: true; data: User } | { success: false; error: string }> {
    try {
      const response = await authFetch<{ data: User }>('/me', {
        method: 'PATCH',
        body: JSON.stringify(request),
      }, true);
      
      // Update stored session with new user data
      const session = tokenStorage.getSession();
      if (session) {
        tokenStorage.saveSession({ ...session.user, ...response.data } as UserWithRole, session.tokens);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' };
    }
  },

  // POST /password/change
  async changePassword(request: ChangePasswordRequest): Promise<{ success: true; message: string } | { success: false; error: string }> {
    try {
      await authFetch<{ data: { message: string } }>('/password/change', {
        method: 'POST',
        body: JSON.stringify(request),
      }, true);
      
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to change password' };
    }
  },

  // POST /refresh - with deduplication
  async refreshToken(refreshToken: string): Promise<{ success: true; data: RefreshTokenResponse } | { success: false; error: string }> {
    try {
      const response = await authFetch<{ data: RefreshTokenResponse }>('/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to refresh token' };
    }
  },

  // Attempt token refresh with deduplication
  async tryRefreshToken(): Promise<boolean> {
    // If already refreshing, wait for the existing promise
    if (isRefreshing && refreshPromise) {
      const result = await refreshPromise;
      return result !== null;
    }
    
    const currentRefreshToken = tokenStorage.getRefreshToken();
    if (!currentRefreshToken) {
      return false;
    }
    
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const result = await this.refreshToken(currentRefreshToken);
        
        if (result.success) {
          tokenStorage.updateTokens({
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            expiresIn: result.data.expiresIn,
          });
          return result.data;
        }
        
        return null;
      } catch {
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
    
    const result = await refreshPromise;
    return result !== null;
  },

  // Proactive token refresh - call this periodically or before critical operations
  async ensureFreshToken(): Promise<boolean> {
    if (tokenStorage.isTokenExpired()) {
      return this.tryRefreshToken();
    }
    return true;
  },

  // POST /password/reset-request
  async requestPasswordReset(email: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
    try {
      await authFetch<{ data: { message: string } }>('/password/reset-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      // Always return success for security (don't reveal if email exists)
      return { success: true, message: 'If an account exists with this email, a reset link will be sent.' };
    }
  },

  // POST /password/reset
  async resetPassword(token: string, newPassword: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
    try {
      await authFetch<{ data: { message: string } }>('/password/reset', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      
      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to reset password' };
    }
  },

  // POST /verify-email
  async verifyEmail(token: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
    try {
      await authFetch<{ data: { message: string } }>('/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to verify email' };
    }
  },

  // POST /logout
  async logout(): Promise<void> {
    try {
      // Attempt to notify server (best effort)
      await authFetch<void>('/logout', { method: 'POST' }, true);
    } catch {
      // Ignore errors - still clear local session
    } finally {
      tokenStorage.clearSession();
    }
  },

  // Session management using tokenStorage
  saveSession(user: UserWithRole, tokens: Tokens): void {
    tokenStorage.saveSession(user, tokens);
  },

  getStoredSession(): { user: UserWithRole; tokens: Tokens } | null {
    return tokenStorage.getSession();
  },

  clearSession(): void {
    tokenStorage.clearSession();
  },

  // Role checking
  hasPermission(user: UserWithRole, permission: string): boolean {
    return user.permissions?.includes(permission) ?? false;
  },

  hasRole(user: UserWithRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = { owner: 4, admin: 3, moderator: 2, user: 1 };
    return (roleHierarchy[user.role] ?? 0) >= (roleHierarchy[requiredRole] ?? 0);
  },
};
