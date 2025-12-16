// Auth Service Layer - Mock implementation ready for real API integration
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

const API_BASE = '/api/v1/auth';
const STORAGE_KEY = 'devcycle_auth';
const USERS_STORAGE_KEY = 'devcycle_users';

// Mock users database
const MOCK_USERS: Record<string, { password: string; user: UserWithRole }> = {
  'admin@devcycle.com': {
    password: 'Root@1234',
    user: {
      id: '1',
      email: 'admin@devcycle.com',
      name: 'Admin User',
      avatar: null,
      emailVerified: true,
      workspaceId: 'ws-1',
      role: 'admin',
      permissions: [
        'products:read', 'products:create', 'products:update', 'products:delete',
        'features:read', 'features:create', 'features:update', 'features:delete',
        'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete',
        'bugs:read', 'bugs:create', 'bugs:update', 'bugs:delete',
        'sprints:read', 'sprints:create', 'sprints:update', 'sprints:delete',
        'team:read', 'team:manage',
        'admin:access', 'roles:assign'
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
};

// Helper to generate mock tokens
const generateTokens = (): Tokens => ({
  accessToken: `mock_access_${crypto.randomUUID()}`,
  refreshToken: `mock_refresh_${crypto.randomUUID()}`,
  expiresIn: 3600,
});

// Helper to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get registered users from localStorage
const getRegisteredUsers = (): Record<string, { password: string; user: UserWithRole }> => {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

// Helper to save registered users to localStorage
const saveRegisteredUsers = (users: Record<string, { password: string; user: UserWithRole }>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// === AUTH SERVICE FUNCTIONS ===

export const authService = {
  // POST /login
  async login(request: LoginRequest): Promise<{ success: true; data: LoginResponse } | { success: false; error: string }> {
    await delay();
    
    const email = request.email.toLowerCase();
    const mockUser = MOCK_USERS[email];
    const registeredUsers = getRegisteredUsers();
    const registeredUser = registeredUsers[email];

    if (mockUser && mockUser.password === request.password) {
      const tokens = generateTokens();
      return { success: true, data: { user: mockUser.user, tokens } };
    }

    if (registeredUser && registeredUser.password === request.password) {
      const tokens = generateTokens();
      return { success: true, data: { user: registeredUser.user, tokens } };
    }

    return { success: false, error: 'Invalid email or password' };
  },

  // POST /signup
  async signup(request: SignupRequest): Promise<{ success: true; data: SignupResponse } | { success: false; error: string }> {
    await delay();
    
    const email = request.email.toLowerCase();
    
    if (MOCK_USERS[email]) {
      return { success: false, error: 'User with this email already exists' };
    }

    const registeredUsers = getRegisteredUsers();
    if (registeredUsers[email]) {
      return { success: false, error: 'User with this email already exists' };
    }

    const newUser: UserWithRole = {
      id: crypto.randomUUID(),
      email,
      name: request.name,
      avatar: null,
      emailVerified: false,
      workspaceId: crypto.randomUUID(),
      role: 'user',
      permissions: [
        'products:read', 'products:create',
        'features:read', 'features:create',
        'tasks:read', 'tasks:create', 'tasks:update',
        'bugs:read', 'bugs:create',
        'sprints:read'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    registeredUsers[email] = { password: request.password, user: newUser };
    saveRegisteredUsers(registeredUsers);

    const tokens = generateTokens();
    return { success: true, data: { user: newUser, tokens } };
  },

  // GET /me
  async getCurrentUser(accessToken: string): Promise<{ success: true; data: UserWithRole } | { success: false; error: string }> {
    await delay(200);
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { success: false, error: 'No token provided' };
    }

    try {
      const { user } = JSON.parse(stored);
      return { success: true, data: user };
    } catch {
      return { success: false, error: 'Invalid session' };
    }
  },

  // GET /me/roles
  async getUserRoles(accessToken: string): Promise<{ success: true; data: { id: string; userId: string; role: string; createdAt: string }[] } | { success: false; error: string }> {
    await delay(200);
    
    const userResult = await this.getCurrentUser(accessToken);
    if (!userResult.success) {
      return userResult;
    }

    return {
      success: true,
      data: [{
        id: crypto.randomUUID(),
        userId: userResult.data.id,
        role: userResult.data.role,
        createdAt: userResult.data.createdAt,
      }]
    };
  },

  // PATCH /me
  async updateProfile(accessToken: string, request: UpdateProfileRequest): Promise<{ success: true; data: User } | { success: false; error: string }> {
    await delay();
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const session = JSON.parse(stored);
      const updatedUser = {
        ...session.user,
        ...request,
        updatedAt: new Date().toISOString(),
      };
      session.user = updatedUser;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return { success: true, data: updatedUser };
    } catch {
      return { success: false, error: 'Failed to update profile' };
    }
  },

  // POST /password/change
  async changePassword(accessToken: string, request: ChangePasswordRequest): Promise<{ success: true; message: string } | { success: false; error: string }> {
    await delay();
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { success: false, error: 'Unauthorized' };
    }

    // In a real implementation, verify current password and update
    // For mock, just return success
    return { success: true, message: 'Password changed successfully' };
  },

  // POST /refresh
  async refreshToken(refreshToken: string): Promise<{ success: true; data: RefreshTokenResponse } | { success: false; error: string }> {
    await delay(200);
    
    // In mock, just generate new tokens
    const tokens = generateTokens();
    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      }
    };
  },

  // POST /password/reset-request
  async requestPasswordReset(email: string): Promise<{ success: true; message: string }> {
    await delay();
    // Always return success for security
    return { success: true, message: 'Password reset email sent' };
  },

  // POST /password/reset
  async resetPassword(token: string, newPassword: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
    await delay();
    // Mock implementation
    return { success: true, message: 'Password reset successful' };
  },

  // POST /verify-email
  async verifyEmail(token: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
    await delay();
    return { success: true, message: 'Email verified successfully' };
  },

  // POST /logout
  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Session management helpers
  saveSession(user: UserWithRole, tokens: Tokens): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
  },

  getStoredSession(): { user: UserWithRole; tokens: Tokens } | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Role checking
  hasPermission(user: UserWithRole, permission: string): boolean {
    return user.permissions.includes(permission);
  },

  hasRole(user: UserWithRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<string, number> = { admin: 3, moderator: 2, user: 1 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  },
};
