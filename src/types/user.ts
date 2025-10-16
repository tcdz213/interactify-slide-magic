/**
 * User Profile Type
 * Matches the backend API response structure
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Domain verification fields
  domainKey?: string;
  subcategoryKey?: string;
  domainVerified?: boolean;
  domainDocumentUrl?: string;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
}

/**
 * User Profile Update Data
 */
export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  domainKey?: string;
  subcategoryKey?: string;
}

/**
 * Domain Verification Submit Data
 */
export interface DomainVerificationSubmit {
  domainKey: string;
  subcategoryKey: string;
  documentUrl: string;
  documentType: string;
}

/**
 * Auth Response from Google Login
 */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}
