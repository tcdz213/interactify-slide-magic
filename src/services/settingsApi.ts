import { apiFetch } from '@/lib/api';
import type {
  UserSettings,
  UserProfile,
  NotificationPreferences,
  UpdateUserSettingsRequest,
  UpdateUserProfileRequest,
  UpdateNotificationPreferencesRequest,
  ChangePasswordRequest,
  TwoFactorSetup,
} from '@/types/settings';

const BASE = '/users/me';

export const settingsApi = {
  // User Settings
  async getSettings(): Promise<{ data: UserSettings }> {
    return apiFetch<{ data: UserSettings }>(`${BASE}/settings`);
  },

  async updateSettings(data: UpdateUserSettingsRequest): Promise<{ data: UserSettings }> {
    return apiFetch<{ data: UserSettings }>(`${BASE}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // User Profile
  async getProfile(): Promise<{ data: UserProfile }> {
    return apiFetch<{ data: UserProfile }>(`${BASE}/profile`);
  },

  async updateProfile(data: UpdateUserProfileRequest): Promise<{ data: UserProfile }> {
    return apiFetch<{ data: UserProfile }>(`${BASE}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Notification Preferences
  async getNotificationPreferences(): Promise<{ data: NotificationPreferences }> {
    return apiFetch<{ data: NotificationPreferences }>(`${BASE}/notifications`);
  },

  async updateNotificationPreferences(
    data: UpdateNotificationPreferencesRequest
  ): Promise<{ data: NotificationPreferences }> {
    return apiFetch<{ data: NotificationPreferences }>(`${BASE}/notifications`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Security - Password
  async changePassword(data: ChangePasswordRequest): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE}/password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Two-Factor Authentication
  async enable2FA(): Promise<{ data: TwoFactorSetup }> {
    return apiFetch<{ data: TwoFactorSetup }>(`${BASE}/2fa/enable`, {
      method: 'POST',
    });
  },

  async verify2FA(code: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE}/2fa/verify`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async disable2FA(password: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE}/2fa/disable`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};
