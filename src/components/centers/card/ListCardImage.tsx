
import React from 'react';
import { FavoriteButton } from './';
import { Center } from '../types';
import { cn } from '@/lib/utils';

interface ListCardImageProps {
  center: Center;
  isInFavorites: boolean;
  handleToggleFavorite: (e: React.MouseEvent) => void;
  isToggling: boolean;
}

const ListCardImage: React.FC<ListCardImageProps> = ({
  center,
  isInFavorites,
  handleToggleFavorite,
  isToggling
}) => {
  return (
    <div className="relative md:w-1/3 h-[200px] md:h-auto overflow-hidden">
      <img
        src={center.image || 'https://placehold.co/600x400?text=Training+Center'}
        alt={center.name}
        className={cn(
          "w-full h-full object-cover transition-transform",
          "group-hover:scale-105 duration-700"
        )}
      />
      
      {center.featured && (
        <div className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-md">
          Featured
        </div>
      )}
      
      <div className="absolute top-2 right-2">
        <FavoriteButton
          isFavorite={isInFavorites}
          onToggle={handleToggleFavorite}
          isToggling={isToggling}
          variant="ghost"
        />
      </div>
    </div>
  );
};

export default ListCardImage;
