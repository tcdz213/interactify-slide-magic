
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  isToggling?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  isToggling = false,
  size = 'sm',
  variant = 'ghost',
  showLabel = false,
  className
}) => {
  return (
    <Button
      size={showLabel ? size : "icon"}
      variant={variant}
      className={cn(
        "transition-all", 
        isToggling ? "opacity-50" : "",
        !showLabel && "h-9 w-9 rounded-full",
        className
      )}
      onClick={onToggle}
      disabled={isToggling}
    >
      <Heart className={cn(
        isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground",
        size === 'sm' ? "h-4 w-4" : "h-5 w-5",
        showLabel && "mr-2"
      )} />
      {showLabel && (isFavorite ? 'Remove from favorites' : 'Add to favorites')}
    </Button>
  );
};

export default FavoriteButton;
