import { api } from "../apiConfig";
import {
  getUserFromStorage,
  storeAuthData,
  clearAuthData,
  isAuthenticated,
} from "../tokenManager";

import { LoginCredentials, RegistrationData } from "@/redux/types/authTypes";

// Auth service functions
export const authService = {
  // Register new user
  register: async (userData: RegistrationData) => {
    const response = await api.post("/api/user/register", userData);
    return response.data;
  },

  // Verify email with verification token
  verifyEmail: async (token: string) => {
    const response = await api.post("/auth/verify-email", { token });
    return response.data;
  },

  // Request email verification link
  requestEmailVerification: async (email: string) => {
    const response = await api.post("/auth/request-verification", { email });
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/api/user/login", credentials);
    storeAuthData(response.data);
    return response.data;
  },

  // Logout user
  logout: () => {
    clearAuthData();
  },

  // Get current user profile
  getCurrentUser: async () => {
    // First try to get from localStorage to avoid unnecessary API call
    const storedUser = getUserFromStorage();

    // If we have a token but no stored user (or want fresh data), fetch from API
    if (localStorage.getItem("token") && !storedUser) {
      try {
        const response = await api.get("/auth/me");
        // Update localStorage with fresh user data
        if (response.data) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      } catch (error) {
        console.error("Error fetching current user:", error);
        // In case of error (e.g., expired token), clear auth data
        clearAuthData();
        throw error;
      }
    }

    return storedUser;
  },

  // Check if user is authenticated (token exists and is valid)
  isAuthenticated,

  // Reset password request (sends email)
  requestPasswordReset: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  // Get stored user without API call
  getStoredUser: getUserFromStorage,

  // Get user role from storage
  getStoredRole: () => localStorage.getItem("userRole") || "guest",
};

export default authService;
