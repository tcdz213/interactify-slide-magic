import { delay } from './delay';
import type { UserRole } from './types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

const mockUsers: AuthUser[] = [
  { id: 'sa1', name: 'Admin Jawda', email: 'admin@jawda.dz', role: 'super_admin', avatar: '' },
  { id: 'mgr1', name: 'Rachid Benmoussa', email: 'rachid@mamafoods.com', role: 'manager', tenantId: 't1' },
  { id: 'drv1', name: 'Yacine Belkacem', email: 'yacine@mamafoods.com', role: 'driver', tenantId: 't1' },
  { id: 'sr1', name: 'Karim Meziane', email: 'karim@mamafoods.com', role: 'sales_rep', tenantId: 't1' },
  { id: 'acc1', name: 'Nadia Cherif', email: 'nadia@mamafoods.com', role: 'accountant', tenantId: 't1' },
  { id: 'ret1', name: 'Superette El Baraka', email: 'baraka@email.com', role: 'retailer', tenantId: 't1' },
];

export async function login(req: LoginRequest): Promise<LoginResponse> {
  await delay(500);
  const user = mockUsers.find((u) => u.email === req.email);
  if (!user) throw new Error('Invalid credentials');
  return { token: `fake-jwt-${user.id}-${Date.now()}`, user };
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  await delay(200);
  const idMatch = token.match(/fake-jwt-(\w+)-/);
  const user = mockUsers.find((u) => u.id === idMatch?.[1]);
  if (!user) throw new Error('Invalid token');
  return user;
}

export async function forgotPassword(email: string): Promise<{ success: boolean }> {
  await delay(400);
  return { success: true };
}

export async function resetPassword(_token: string, _newPassword: string): Promise<{ success: boolean }> {
  await delay(400);
  return { success: true };
}

export function getMockUsers() {
  return mockUsers;
}
