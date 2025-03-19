
import React, { useState } from 'react';
import { Heart, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Center } from '../types';

interface ListCardImageProps {
  center: Center;
  isInFavorites: boolean;
  handleToggleFavorite: (e: React.MouseEvent) => void;
  isToggling?: boolean;
}

const ListCardImage = ({ 
  center, 
  isInFavorites, 
  handleToggleFavorite,
  isToggling = false
}: ListCardImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className="md:w-1/3 aspect-video md:aspect-square relative bg-muted">
      {center.image && !imageError ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
          <img 
            src={center.image} 
            alt={center.name} 
            className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full bg-secondary/30 text-muted-foreground">
          {imageError && center.image ? (
            <>
              <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
              <span>Image failed to load</span>
            </>
          ) : (
            <span>No image available</span>
          )}
        </div>
      )}
      
      {center.featured && (
        <Badge variant="default" className="absolute top-2 left-2 bg-primary">
          Featured
        </Badge>
      )}
      
      <Button
        size="icon"
        variant="ghost"
        className={`absolute top-2 right-2 rounded-full backdrop-blur-sm ${
          isInFavorites 
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        onClick={handleToggleFavorite}
        disabled={isToggling}
      >
        {isToggling ? (
          <Skeleton className="h-5 w-5 rounded-full animate-pulse" />
        ) : (
          <Heart className={`h-5 w-5 ${isInFavorites ? 'fill-current' : ''}`} />
        )}
      </Button>
    </div>
  );
};

export default ListCardImage;
