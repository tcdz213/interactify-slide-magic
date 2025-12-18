// Auth API Types matching the API documentation

export type UserRole = 'owner' | 'admin' | 'moderator' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  emailVerified: boolean;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRole extends User {
  role: UserRole;
  permissions: string[];
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserRoleRecord {
  id: string;
  userId: string;
  role: UserRole;
  workspaceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    requestId: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: Tokens;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  workspaceName?: string;
}

export interface SignupResponse {
  user: User;
  tokens: Tokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface AssignRoleRequest {
  userId: string;
  role: UserRole;
}
