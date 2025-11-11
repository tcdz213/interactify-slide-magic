import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Analytics configuration
const ANALYTICS_CONFIG = {
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID || '',
  PLAUSIBLE_DOMAIN: import.meta.env.VITE_PLAUSIBLE_DOMAIN || '',
  ENABLED: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
};

// Google Analytics pageview tracking
export const trackPageView = (path: string) => {
  if (!ANALYTICS_CONFIG.ENABLED) return;
  
  if (ANALYTICS_CONFIG.GA_TRACKING_ID && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', ANALYTICS_CONFIG.GA_TRACKING_ID, {
      page_path: path,
    });
  }

  // Plausible pageview
  if (ANALYTICS_CONFIG.PLAUSIBLE_DOMAIN && typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible('pageview');
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (!ANALYTICS_CONFIG.ENABLED) return;

  // Google Analytics
  if (ANALYTICS_CONFIG.GA_TRACKING_ID && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }

  // Plausible custom events
  if (ANALYTICS_CONFIG.PLAUSIBLE_DOMAIN && typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(eventName, { props: parameters });
  }
};

// Hook to automatically track page views
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
};

// Predefined event tracking functions
export const analytics = {
  // User events
  trackSignUp: (method: string) => trackEvent('sign_up', { method }),
  trackLogin: (method: string) => trackEvent('login', { method }),
  trackLogout: () => trackEvent('logout'),

  // Product events
  trackProductView: (productId: string, productName: string) =>
    trackEvent('view_product', { product_id: productId, product_name: productName }),
  trackProductCreate: (productId: string) =>
    trackEvent('create_product', { product_id: productId }),
  trackProductUpdate: (productId: string) =>
    trackEvent('update_product', { product_id: productId }),
  trackProductDelete: (productId: string) =>
    trackEvent('delete_product', { product_id: productId }),

  // Order events
  trackOrderView: (orderId: string) =>
    trackEvent('view_order', { order_id: orderId }),
  trackOrderStatusUpdate: (orderId: string, status: string) =>
    trackEvent('update_order_status', { order_id: orderId, status }),

  // Subscription events
  trackSubscriptionView: (plan: string) =>
    trackEvent('view_subscription', { plan }),
  trackSubscriptionPurchase: (plan: string, price: number) =>
    trackEvent('purchase_subscription', { plan, price }),
  trackSubscriptionCancel: (plan: string) =>
    trackEvent('cancel_subscription', { plan }),

  // Search events
  trackSearch: (query: string, results: number) =>
    trackEvent('search', { search_term: query, results }),

  // Error tracking
  trackError: (error: string, location: string) =>
    trackEvent('error', { error_message: error, error_location: location }),
};
