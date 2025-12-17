// User Settings Types

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  weekStartsOn: 0 | 1 | 6;
  emailNotifications: boolean;
  pushNotifications: boolean;
  compactMode: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  title?: string;
  bio?: string;
}

export interface NotificationPreferences {
  taskAssigned: boolean;
  taskCompleted: boolean;
  bugReported: boolean;
  bugResolved: boolean;
  featureApproved: boolean;
  releaseDeployed: boolean;
  sprintStarted: boolean;
  sprintCompleted: boolean;
  mentionedInComment: boolean;
  weeklyDigest: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export type UpdateUserSettingsRequest = Partial<UserSettings>;
export type UpdateUserProfileRequest = Partial<Omit<UserProfile, 'email'>>;
export type UpdateNotificationPreferencesRequest = Partial<NotificationPreferences>;
