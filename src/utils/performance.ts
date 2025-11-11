// Performance monitoring utilities

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private marks: Map<string, number> = new Map();

  // Start measuring performance
  startMeasure(name: string) {
    this.marks.set(name, performance.now());
  }

  // End measuring and log performance
  endMeasure(name: string) {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetrics = {
      name,
      duration,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    this.marks.delete(name);

    // Log slow operations (> 1000ms)
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return metric;
  }

  // Get all metrics
  getMetrics() {
    return [...this.metrics];
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
    this.marks.clear();
  }

  // Get Web Vitals
  getWebVitals() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      // Time to First Byte
      ttfb: navigation?.responseStart - navigation?.requestStart,
      // First Contentful Paint
      fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
      // DOM Content Loaded
      dcl: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      // Load Complete
      load: navigation?.loadEventEnd - navigation?.loadEventStart,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React component performance wrapper
export const measureComponentRender = (componentName: string) => {
  return {
    onRenderStart: () => performanceMonitor.startMeasure(`render:${componentName}`),
    onRenderEnd: () => performanceMonitor.endMeasure(`render:${componentName}`),
  };
};

// API call performance tracking
export const measureApiCall = async <T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  performanceMonitor.startMeasure(`api:${apiName}`);
  try {
    const result = await apiCall();
    performanceMonitor.endMeasure(`api:${apiName}`);
    return result;
  } catch (error) {
    performanceMonitor.endMeasure(`api:${apiName}`);
    throw error;
  }
};

// Log performance metrics to console (development only)
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const vitals = performanceMonitor.getWebVitals();
      console.log('Web Vitals:', vitals);
    }, 0);
  });
}
