import { User, AuthResponse, UserProfileUpdate } from '@/types/user';
import { API_CONFIG } from '@/config/api';
import { errorHandler } from '@/utils/errorHandler';

class AuthApiService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'userData';

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Store auth token and user data
   */
  private storeAuth(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear auth data
   */
  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Login with Google credential
   */
  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: googleToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Authentication failed');
    }

    const apiResponse = await response.json();
    
    // API returns {success: true, data: {access_token, refresh_token, user}}
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error('Invalid response format from server');
    }

    const { access_token, refresh_token, user } = apiResponse.data;
    
    // Store the access token and user data
    this.storeAuth(access_token, user);
    
    // Store refresh token separately if provided
    if (refresh_token) {
      localStorage.setItem('refreshToken', refresh_token);
    }
    
    return {
      token: access_token,
      refreshToken: refresh_token,
      user,
    };
  }

  /**
   * Fetch current user profile
   */
  async fetchUserProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_CONFIG.baseURL}/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear auth data
        this.clearAuth();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error('Failed to fetch user profile');
    }

    const user: User = await response.json();
    // Update stored user data
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: UserProfileUpdate): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Convert camelCase to snake_case for API
    const requestBody: any = {};
    if (updates.firstName !== undefined) requestBody.first_name = updates.firstName;
    if (updates.lastName !== undefined) requestBody.last_name = updates.lastName;
    if (updates.phone !== undefined) requestBody.phone = updates.phone;
    if (updates.avatar !== undefined) requestBody.avatar_url = updates.avatar;
    if (updates.domainKey !== undefined) requestBody.domain_key = updates.domainKey;
    if (updates.subcategoryKey !== undefined) requestBody.subcategory_key = updates.subcategoryKey;

    const response = await fetch(`${API_CONFIG.baseURL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const apiResponse = await response.json();
    
    // API returns {success: true, data: {user object}}
    const user = apiResponse.success ? apiResponse.data : apiResponse;
    
    // Update stored user data
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }

  /**
   * Submit domain verification for user profile
   */
  async submitDomainVerification(data: { domainKey: string; subcategoryKey: string; documentUrl: string; documentType: string }): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/user/domain-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain_key: data.domainKey,
          subcategory_key: data.subcategoryKey,
          document_url: data.documentUrl,
          document_type: data.documentType,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update stored user with verification status
        const user = this.getStoredUser();
        if (user) {
          user.domainKey = data.domainKey;
          user.subcategoryKey = data.subcategoryKey;
          user.domainDocumentUrl = data.documentUrl;
          user.verificationStatus = 'pending';
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        return { success: true };
      } else {
      return { success: false, error: result.message || 'Failed to submit verification' };
      }
    } catch (error) {
      errorHandler.logError('authApi.submitDomainVerification', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuth();
    localStorage.removeItem('refreshToken');
  }
}

export const authApi = new AuthApiService();
