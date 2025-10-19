import { create } from 'zustand';

interface ErrorState {
  errors: Map<string, { message: string; title?: string; timestamp: number }>;
  setError: (key: string, message: string, title?: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  getError: (key: string) => { message: string; title?: string } | null;
}

export const useInlineError = create<ErrorState>((set, get) => ({
  errors: new Map(),
  
  setError: (key: string, message: string, title?: string) => {
    set((state) => {
      const newErrors = new Map(state.errors);
      newErrors.set(key, { message, title, timestamp: Date.now() });
      return { errors: newErrors };
    });
  },
  
  clearError: (key: string) => {
    set((state) => {
      const newErrors = new Map(state.errors);
      newErrors.delete(key);
      return { errors: newErrors };
    });
  },
  
  clearAllErrors: () => {
    set({ errors: new Map() });
  },
  
  getError: (key: string) => {
    const error = get().errors.get(key);
    return error ? { message: error.message, title: error.title } : null;
  },
}));
