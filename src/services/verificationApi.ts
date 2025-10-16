import { API_CONFIG, getAuthHeaders } from '@/config/api';

export interface VerificationRequest {
  user_id: string;
  user_name: string;
  user_email: string;
  domain_key: string;
  subcategory_key: string;
  document_url: string;
  document_type: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  domain_verified: boolean;
  submitted_at: string;
  reviewed_at?: string;
  verification_notes?: string;
}

export const verificationApi = {
  // Submit domain verification
  async submitDomainVerification(data: {
    domain_key: string;
    subcategory_key: string;
    document_url: string;
    document_type: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/user/domain-verification`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Failed to submit verification' };
      }
    } catch (error) {
      console.error('Verification submission error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Admin: Get all pending verification requests
  async getPendingVerifications(): Promise<VerificationRequest[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/verifications/pending`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.verifications || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
      return [];
    }
  },

  // Admin: Get all verification requests
  async getAllVerifications(): Promise<VerificationRequest[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/verifications`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.verifications || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
      return [];
    }
  },

  // Admin: Approve user verification
  async approveUserVerification(userId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/users/${userId}/verify/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to approve verification' };
      }
    } catch (error) {
      console.error('Approve verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Admin: Reject user verification
  async rejectUserVerification(userId: string, notes: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/users/${userId}/verify/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to reject verification' };
      }
    } catch (error) {
      console.error('Reject verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },
};
