
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  isToggling?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  isToggling = false,
  size = 'sm',
  variant = 'ghost'
}) => {
  return (
    <Button
      size={size}
      variant={variant}
      className={`h-auto rounded-full ${isToggling ? 'opacity-50' : ''}`}
      onClick={onToggle}
      disabled={isToggling}
    >
      <Heart className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} 
        ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`}
      />
      <span className="sr-only">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
    </Button>
  );
};

export default FavoriteButton;
