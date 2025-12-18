// Enhanced API Client with retry logic, error handling, and CSRF protection
import { tokenStorage } from '@/lib/tokenStorage';
import { authService } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// CSRF Token management
let csrfToken: string | null = null;

export const getCsrfToken = (): string | null => csrfToken;

export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

// Fetch CSRF token from server
export const fetchCsrfToken = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/csrf-token`, {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.token;
    }
  } catch (error) {
    console.warn('Failed to fetch CSRF token:', error);
  }
};

// Error types for better handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryOn: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryOn: [408, 429, 500, 502, 503, 504],
};

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Request options interface
interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipCsrf?: boolean;
  retry?: Partial<RetryConfig>;
  showErrorToast?: boolean;
}

// Enhanced API fetch with retry logic
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    skipAuth = false,
    skipCsrf = false,
    retry = {},
    showErrorToast = true,
    ...fetchOptions
  } = options;

  const retryConfig = { ...defaultRetryConfig, ...retry };
  let lastError: Error | null = null;

  // Ensure token is fresh before making request
  if (!skipAuth) {
    await authService.ensureFreshToken();
  }

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const token = tokenStorage.getAccessToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };

      // Add auth token
      if (!skipAuth && token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }

      // Add CSRF token for mutating requests
      if (!skipCsrf && csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(fetchOptions.method || 'GET')) {
        (headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });

      // Handle 401 - attempt token refresh and retry
      if (response.status === 401 && !skipAuth) {
        const refreshed = await authService.tryRefreshToken();
        if (refreshed) {
          const newToken = tokenStorage.getAccessToken();
          if (newToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
          }
          
          const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
            ...fetchOptions,
            headers,
            credentials: 'include',
          });
          
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ error: { message: 'Request failed' } }));
            throw new ApiError(
              error.error?.message || `HTTP ${retryResponse.status}`,
              retryResponse.status,
              error.error?.code
            );
          }
          
          if (retryResponse.status === 204) {
            return {} as T;
          }
          
          return retryResponse.json();
        }
        
        // Refresh failed - session expired
        tokenStorage.clearSession();
        window.location.href = '/auth';
        throw new ApiError('Session expired. Please login again.', 401, 'SESSION_EXPIRED');
      }

      // Handle validation errors
      if (response.status === 422) {
        const error = await response.json().catch(() => ({ error: { message: 'Validation failed' } }));
        throw new ValidationError(
          error.error?.message || 'Validation failed',
          error.error?.details
        );
      }

      // Handle other errors
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
        
        // Check if should retry
        if (retryConfig.retryOn.includes(response.status) && attempt < retryConfig.maxRetries) {
          await sleep(retryConfig.retryDelay * Math.pow(2, attempt));
          continue;
        }
        
        throw new ApiError(
          error.error?.message || `HTTP ${response.status}`,
          response.status,
          error.error?.code,
          error.error?.details
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        lastError = new NetworkError();
        
        if (attempt < retryConfig.maxRetries) {
          await sleep(retryConfig.retryDelay * Math.pow(2, attempt));
          continue;
        }
      } else {
        lastError = error as Error;
        
        // Don't retry for client errors (4xx except those in retryOn)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          break;
        }
      }
    }
  }

  // Show error toast if enabled
  if (showErrorToast && lastError) {
    toast({
      title: 'Error',
      description: lastError.message,
      variant: 'destructive',
    });
  }

  throw lastError;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    
  put: <T>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
    
  patch: <T>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
    
  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
