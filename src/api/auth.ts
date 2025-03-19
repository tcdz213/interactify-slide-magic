
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Base API URL - replace with your actual API URL in production
const API_URL = 'https://api.example.com'; // Change this to your actual API URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh configuration
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRY_MARGIN = 5 * 60 * 1000; // 5 minutes before token expires

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
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
        console.error('Token validation error:', error);
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token function
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // If refresh fails, log out user
    authService.logout();
    return null;
  }
};

// Auth service functions
export const authService = {
  // Register new user
  register: async (userData: { 
    fullName: string; 
    email: string; 
    password: string;
    userType: 'learner' | 'center' | 'teacher';
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verify email with verification token
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Request email verification link
  requestEmailVerification: async (email: string) => {
    const response = await api.post('/auth/request-verification', { email });
    return response.data;
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    
    // Store tokens in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      
      if (response.data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      }
    }
    
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  // Check if user is authenticated (token exists and is valid)
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp ? decoded.exp * 1000 : 0;
      
      // Check if token is expired
      if (expiryTime && Date.now() > expiryTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  },
  
  // Reset password request (sends email)
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  // Reset password with token
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },
};

// Export the api instance for other services to use
export default api;
