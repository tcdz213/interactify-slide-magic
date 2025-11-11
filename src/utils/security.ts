// Security utilities for frontend

// Generate CSRF token (should be synced with backend)
export const generateCSRFToken = (): string => {
  const token = localStorage.getItem('csrf_token');
  if (token) return token;

  const newToken = crypto.randomUUID();
  localStorage.setItem('csrf_token', newToken);
  return newToken;
};

// Get CSRF token for requests
export const getCSRFToken = (): string => {
  return generateCSRFToken();
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

// Validate URL to prevent open redirect attacks
export const isValidRedirectUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    // Only allow same-origin redirects
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

// Content Security Policy violation reporter
export const reportCSPViolation = (violation: SecurityPolicyViolationEvent) => {
  const violationData = {
    'document-uri': violation.documentURI,
    'violated-directive': violation.violatedDirective,
    'effective-directive': violation.effectiveDirective,
    'original-policy': violation.originalPolicy,
    'blocked-uri': violation.blockedURI,
    'status-code': violation.statusCode,
    timestamp: new Date().toISOString(),
  };

  // In production, send to your logging service
  if (import.meta.env.PROD) {
    console.error('CSP Violation:', violationData);
    // fetch('/api/v1/security/csp-report', {
    //   method: 'POST',
    //   body: JSON.stringify(violationData),
    // });
  } else {
    console.warn('CSP Violation (dev):', violationData);
  }
};

// Rate limiting for client-side actions
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts outside the time window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string) {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Setup CSP violation reporting
if (typeof window !== 'undefined') {
  document.addEventListener('securitypolicyviolation', reportCSPViolation);
}
