import { useState, useEffect, useCallback } from 'react';
import { favoritesApi } from '@/services/favoritesApi';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Fetch from API
        const serverFavorites = await favoritesApi.getFavorites();
        setFavorites(serverFavorites);
      } else {
        // Use localStorage for non-authenticated users
        const saved = localStorage.getItem('business_favorites');
        setFavorites(saved ? JSON.parse(saved) : []);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = useCallback(async (businessId: string) => {
    const isFavorited = favorites.includes(businessId);

    // Optimistic update
    setFavorites(prev => 
      isFavorited 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );

    try {
      if (isAuthenticated) {
        // Use API
        const result = isFavorited
          ? await favoritesApi.removeFromFavorites(businessId)
          : await favoritesApi.addToFavorites(businessId);

        if (!result.success) {
          // Revert on error
          setFavorites(prev => 
            isFavorited 
              ? [...prev, businessId]
              : prev.filter(id => id !== businessId)
          );
          toast({
            title: 'Error',
            description: result.error || 'Failed to update favorites',
            variant: 'destructive',
          });
        }
      } else {
        // Update localStorage for non-authenticated users
        const newFavorites = isFavorited
          ? favorites.filter(id => id !== businessId)
          : [...favorites, businessId];
        localStorage.setItem('business_favorites', JSON.stringify(newFavorites));
      }
    } catch (error) {
      // Revert on error
      setFavorites(prev => 
        isFavorited 
          ? [...prev, businessId]
          : prev.filter(id => id !== businessId)
      );
      console.error('Failed to toggle favorite:', error);
    }
  }, [favorites, isAuthenticated]);

  const isFavorited = useCallback((businessId: string) => {
    return favorites.includes(businessId);
  }, [favorites]);

  const syncFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      await favoritesApi.syncFavorites();
      await loadFavorites();
    } catch (error) {
      console.error('Failed to sync favorites:', error);
    }
  }, [isAuthenticated]);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorited,
    syncFavorites,
    refresh: loadFavorites,
  };
};
