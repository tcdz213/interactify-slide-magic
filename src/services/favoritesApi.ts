import { API_CONFIG, getAuthHeaders } from '@/config/api';
import { BusinessCardDisplay } from '@/types/business-card';
import { errorHandler } from '@/utils/errorHandler';

export interface Favorite {
  business_id: string;
  created_at: string;
}

export interface FavoriteBusinessesResponse {
  businesses: BusinessCardDisplay[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_favorites: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

class FavoritesApiService {
  /**
   * Get all favorite business IDs for the authenticated user
   */
  async getFavorites(): Promise<string[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/favorites`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      return data.success ? data.data.favorites.map((f: Favorite) => f.business_id) : [];
    } catch (error) {
      errorHandler.logError('favoritesApi.getFavorites', error);
      // Fallback to localStorage for offline support
      const saved = localStorage.getItem('business_favorites');
      return saved ? JSON.parse(saved) : [];
    }
  }

  /**
   * Get full business details for all favorites with pagination
   */
  async getFavoriteBusinesses(page: number = 1, limit: number = 20): Promise<FavoriteBusinessesResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_CONFIG.baseURL}/favorites/businesses?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorite businesses');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      errorHandler.logError('favoritesApi.getFavoriteBusinesses', error);
      return {
        businesses: [],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_favorites: 0,
          limit: 20,
          has_next: false,
          has_prev: false,
        },
      };
    }
  }

  /**
   * Add a business to favorites
   */
  async addToFavorites(businessId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/favorites`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ business_id: businessId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to add to favorites' };
      }

      // Update localStorage for offline support
      this.updateLocalStorage('add', businessId);

      return { success: true };
    } catch (error) {
      errorHandler.logError('favoritesApi.addToFavorites', error);
      // Fallback to localStorage only
      this.updateLocalStorage('add', businessId);
      return { success: true }; // Return success for offline mode
    }
  }

  /**
   * Remove a business from favorites
   */
  async removeFromFavorites(businessId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/favorites/${businessId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to remove from favorites' };
      }

      // Update localStorage for offline support
      this.updateLocalStorage('remove', businessId);

      return { success: true };
    } catch (error) {
      errorHandler.logError('favoritesApi.removeFromFavorites', error);
      // Fallback to localStorage only
      this.updateLocalStorage('remove', businessId);
      return { success: true }; // Return success for offline mode
    }
  }

  /**
   * Check if a business is favorited
   */
  async isFavorited(businessId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/favorites/check/${businessId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to check favorite status');
      }

      const data = await response.json();
      return data.data.is_favorite;
    } catch (error) {
      errorHandler.logError('favoritesApi.isFavorited', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('business_favorites');
      const favorites = saved ? JSON.parse(saved) : [];
      return favorites.includes(businessId);
    }
  }

  /**
   * Sync local favorites with server
   */
  async syncFavorites(): Promise<void> {
    try {
      const localFavorites = this.getLocalFavorites();
      const serverFavorites = await this.getFavorites();

      // Find differences
      const toAdd = localFavorites.filter(id => !serverFavorites.includes(id));
      const toRemove = serverFavorites.filter(id => !localFavorites.includes(id));

      // Sync to server
      await Promise.all([
        ...toAdd.map(id => this.addToFavorites(id)),
        ...toRemove.map(id => this.removeFromFavorites(id)),
      ]);

      // Update localStorage with server state
      localStorage.setItem('business_favorites', JSON.stringify(serverFavorites));
    } catch (error) {
      errorHandler.logError('favoritesApi.syncFavorites', error);
    }
  }

  /**
   * Get favorites from localStorage
   */
  private getLocalFavorites(): string[] {
    const saved = localStorage.getItem('business_favorites');
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * Update localStorage favorites
   */
  private updateLocalStorage(action: 'add' | 'remove', businessId: string): void {
    const favorites = this.getLocalFavorites();
    
    if (action === 'add' && !favorites.includes(businessId)) {
      favorites.push(businessId);
    } else if (action === 'remove') {
      const index = favorites.indexOf(businessId);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }

    localStorage.setItem('business_favorites', JSON.stringify(favorites));
  }
}

export const favoritesApi = new FavoritesApiService();
