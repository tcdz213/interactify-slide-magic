import api, { handleApiError } from './api';
import { API_CONFIG } from '@/config/api';

export interface ProfileData {
  name?: string;
  avatar?: string;
  domain?: string;
  subcategory?: string;
  phone?: string;
  address?: string;
}

export interface VerificationUpload {
  domain: string;
  subcategory: string;
  documentFile: File;
}

export const profileService = {
  async getProfile(): Promise<ProfileData> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.PROFILE.GET);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateProfile(data: ProfileData): Promise<ProfileData> {
    try {
      // Convert camelCase to snake_case for backend
      const snakeCaseData = {
        name: data.name,
        avatar: data.avatar,
        domain: data.domain,
        subcategory: data.subcategory,
        phone: data.phone,
        address: data.address,
      };

      const response = await api.put(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, snakeCaseData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async uploadVerificationDocument(data: VerificationUpload): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('domain', data.domain);
      formData.append('subcategory', data.subcategory);
      formData.append('document', data.documentFile);

      await api.post(API_CONFIG.ENDPOINTS.VERIFICATION.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getVerificationStatus(): Promise<{
    status: 'pending' | 'approved' | 'rejected';
    note?: string;
  }> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.VERIFICATION.STATUS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
