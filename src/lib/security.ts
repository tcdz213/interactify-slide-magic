// Request interceptor utilities for secure headers
import { getCsrfToken, fetchCsrfToken } from './apiClient';

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy directives
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' " + (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'),
  ].join('; '),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Initialize security features on app load
export async function initializeSecurity(): Promise<void> {
  try {
    // Fetch CSRF token
    await fetchCsrfToken();
  } catch (error) {
    console.warn('Failed to initialize security features:', error);
  }
}

// Rate limiting helper for client-side protection
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
    this.config = config;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    const timestamps = this.requests.get(key) || [];
    const recentRequests = timestamps.filter(t => t > windowStart);
    
    if (recentRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    const timestamps = this.requests.get(key) || [];
    const recentRequests = timestamps.filter(t => t > windowStart);
    
    return Math.max(0, this.config.maxRequests - recentRequests.length);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const apiRateLimiter = new RateLimiter();

// Request fingerprinting for abuse prevention
export function generateRequestFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width.toString(),
    screen.height.toString(),
  ];
  
  // Simple hash function
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

// Input sanitization for XSS prevention (used before sending to API)
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// URL validation for external links
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Secure storage wrapper
export const secureStorage = {
  set(key: string, value: string): void {
    try {
      // Could add encryption here for sensitive data
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to store data:', error);
    }
  },
  
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to retrieve data:', error);
      return null;
    }
  },
  
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove data:', error);
    }
  },
  
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  },
};
