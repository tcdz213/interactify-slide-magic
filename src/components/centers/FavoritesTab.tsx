
import React from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { centersData } from './centersData';
import CenterCard from './CenterCard';
import { Button } from '@/components/ui/button';
import { HeartOff } from 'lucide-react';

interface FavoritesTabProps {
  viewMode: 'grid' | 'list';
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ viewMode }) => {
  const { favorites, clearAllFavorites } = useWishlist();
  
  // Filter centers that are in favorites
  const favoritesCenters = centersData.filter(center => 
    favorites.includes(center.id)
  );

  if (favoritesCenters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <HeartOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
        <p className="text-muted-foreground mb-4">
          Start saving courses you're interested in by clicking the heart icon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Your Favorite Courses</h3>
        {favoritesCenters.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFavorites}>
            Clear All
          </Button>
        )}
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritesCenters.map((center) => (
            <CenterCard key={center.id} center={center} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {favoritesCenters.map((center) => (
            <CenterCard key={center.id} center={center} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;
