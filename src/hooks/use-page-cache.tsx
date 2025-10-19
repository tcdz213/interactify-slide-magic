import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PageCache {
  data: Record<string, any>;
  timestamp: Record<string, number>;
  setCache: (key: string, value: any) => void;
  getCache: (key: string, maxAge?: number) => any | null;
  clearCache: (key?: string) => void;
}

const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes default

export const usePageCache = create<PageCache>()(
  persist(
    (set, get) => ({
      data: {},
      timestamp: {},
      
      setCache: (key: string, value: any) => {
        set((state) => ({
          data: { ...state.data, [key]: value },
          timestamp: { ...state.timestamp, [key]: Date.now() },
        }));
      },
      
      getCache: (key: string, maxAge: number = CACHE_MAX_AGE) => {
        const state = get();
        const timestamp = state.timestamp[key];
        
        if (!timestamp) return null;
        
        const age = Date.now() - timestamp;
        if (age > maxAge) {
          // Clear expired cache
          const { [key]: _, ...restData } = state.data;
          const { [key]: __, ...restTimestamp } = state.timestamp;
          set({ data: restData, timestamp: restTimestamp });
          return null;
        }
        
        return state.data[key] || null;
      },
      
      clearCache: (key?: string) => {
        if (key) {
          set((state) => {
            const { [key]: _, ...restData } = state.data;
            const { [key]: __, ...restTimestamp } = state.timestamp;
            return { data: restData, timestamp: restTimestamp };
          });
        } else {
          set({ data: {}, timestamp: {} });
        }
      },
    }),
    {
      name: 'page-cache-storage',
    }
  )
);
