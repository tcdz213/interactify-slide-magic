
import { Role } from "@/utils/roles";

export interface User {
  id?: string | number;
  fullName?: string;
  email?: string;
  userType?: "learner" | "center" | "teacher";
  emailVerified?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentRole: Role;
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  isSessionPersisted: boolean;
}

export interface LoginCredentials {
  email: string; 
  password: string;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  userType: "learner" | "center" | "teacher";
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}
