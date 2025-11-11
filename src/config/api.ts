// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  ENDPOINTS: {
    // Auth
    AUTH: {
      GOOGLE: '/api/v1/auth/google',
      LOGIN: '/api/v1/auth/login',
      REGISTER: '/api/v1/auth/register',
      LOGOUT: '/api/v1/auth/logout',
      REFRESH: '/api/v1/auth/refresh',
      ME: '/api/v1/user/me',
    },
    // Admin
    ADMIN: {
      CHECK_ROLE: '/api/v1/admin/check-role',
      DASHBOARD_STATS: '/api/v1/admin/dashboard/stats',
      USERS: '/api/v1/admin/users',
      CARDS: '/api/v1/admin/cards',
      SUBSCRIPTIONS: '/api/v1/admin/subscriptions',
    },
    // User Profile
    PROFILE: {
      GET: '/api/v1/user/profile',
      UPDATE: '/api/v1/user/profile',
    },
    // Verification
    VERIFICATION: {
      UPLOAD: '/api/v1/verification/upload',
      STATUS: '/api/v1/verification/status',
    },
    // Products
    PRODUCTS: {
      LIST: '/api/v1/products',
      CREATE: '/api/v1/products',
      GET: (id: string) => `/api/v1/products/${id}`,
      UPDATE: (id: string) => `/api/v1/products/${id}`,
      DELETE: (id: string) => `/api/v1/products/${id}`,
      UPLOAD_IMAGE: (id: string) => `/api/v1/products/${id}/images`,
    },
    // Orders
    ORDERS: {
      LIST: '/api/v1/orders',
      GET: (id: string) => `/api/v1/orders/${id}`,
      UPDATE_STATUS: (id: string) => `/api/v1/orders/${id}/status`,
      STATS: '/api/v1/orders/stats',
    },
    // Analytics
    ANALYTICS: {
      SALES: '/api/v1/analytics/sales',
      REVENUE: '/api/v1/analytics/revenue',
      PRODUCTS: '/api/v1/analytics/products',
      CUSTOMERS: '/api/v1/analytics/customers',
    },
    // Subscriptions
    SUBSCRIPTIONS: {
      PLANS: '/api/v1/subscriptions/plans',
      CURRENT: '/api/v1/subscriptions/current',
      SUBSCRIBE: '/api/v1/subscriptions/subscribe',
      CANCEL: '/api/v1/subscriptions/cancel',
    },
  },
};

export default API_CONFIG;
