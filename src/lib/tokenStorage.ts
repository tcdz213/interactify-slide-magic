// Secure Token Storage Utilities
import type { Tokens, UserWithRole } from '@/types/auth';

const STORAGE_KEY = 'devcycle_auth';
const TOKEN_EXPIRY_KEY = 'devcycle_token_expiry';

interface StoredSession {
  user: UserWithRole;
  tokens: Tokens;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Encode data before storing (basic obfuscation, not encryption)
const encode = (data: string): string => {
  if (!isBrowser) return data;
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
};

// Decode stored data
const decode = (data: string): string => {
  if (!isBrowser) return data;
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data;
  }
};

export const tokenStorage = {
  // Save session with expiry tracking
  saveSession(user: UserWithRole, tokens: Tokens): void {
    if (!isBrowser) return;
    
    const session: StoredSession = { user, tokens };
    const encoded = encode(JSON.stringify(session));
    localStorage.setItem(STORAGE_KEY, encoded);
    
    // Store token expiry time
    const expiryTime = Date.now() + (tokens.expiresIn * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));
  },

  // Get stored session
  getSession(): StoredSession | null {
    if (!isBrowser) return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const decoded = decode(stored);
      return JSON.parse(decoded);
    } catch {
      // Clear corrupted data
      this.clearSession();
      return null;
    }
  },

  // Get access token
  getAccessToken(): string | null {
    const session = this.getSession();
    return session?.tokens?.accessToken || null;
  },

  // Get refresh token
  getRefreshToken(): string | null {
    const session = this.getSession();
    return session?.tokens?.refreshToken || null;
  },

  // Update tokens only (keep user data)
  updateTokens(tokens: Tokens): void {
    const session = this.getSession();
    if (!session) return;
    
    this.saveSession(session.user, tokens);
  },

  // Check if token is expired or about to expire (within 5 minutes)
  isTokenExpired(bufferSeconds: number = 300): boolean {
    if (!isBrowser) return true;
    
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry, 10);
    const bufferMs = bufferSeconds * 1000;
    
    return Date.now() >= (expiryTime - bufferMs);
  },

  // Clear all auth data
  clearSession(): void {
    if (!isBrowser) return;
    
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  // Check if session exists
  hasSession(): boolean {
    return this.getSession() !== null;
  },
};
