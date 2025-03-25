
import { jwtDecode } from "jwt-decode";
import axios from "axios"; // Add axios import
import { api, API_URL } from "./apiConfig";

// Token storage keys
export const TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_KEY = "user";
export const USER_ROLE_KEY = "userRole";
export const TOKEN_EXPIRY_MARGIN = 5 * 60 * 1000; // 5 minutes before token expires

// Refresh token function
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
      refreshToken,
    });
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    // Clear auth data on refresh failure
    clearAuthData();
    return null;
  }
};

// Check if token is valid
export const isTokenValid = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    const expiryTime = decoded.exp ? decoded.exp * 1000 : 0;
    return expiryTime && Date.now() < expiryTime;
  } catch (error) {
    return false;
  }
};

// Store auth data in localStorage
export const storeAuthData = (response: any) => {
  if (response.token) {
    localStorage.setItem(TOKEN_KEY, response.token);
    
    const userRole = response.user?.userType || "learner";
    localStorage.setItem(USER_ROLE_KEY, userRole);
    
    // Store user data
    if (response.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
  }
};

// Clear auth data from localStorage
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Get user from localStorage
export const getUserFromStorage = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      return null;
    }
  }
  return null;
};

// Add auth token interceptor
export const setupAuthInterceptor = () => {
  api.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        // Check if token is about to expire and refresh if needed
        try {
          const decoded = jwtDecode(token);
          const expiryTime = decoded.exp ? decoded.exp * 1000 : 0;

          if (expiryTime && Date.now() > expiryTime - TOKEN_EXPIRY_MARGIN) {
            // Token is about to expire, refresh it
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshToken) {
              const newTokens = await refreshAccessToken(refreshToken);
              if (newTokens) {
                config.headers.Authorization = `Bearer ${newTokens.token}`;
                return config;
              }
            }
          }
        } catch (error) {
          console.error("Token validation error:", error);
        }

        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  return isTokenValid(token);
};
