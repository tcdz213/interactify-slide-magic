import { useState } from "react";
import Lottie from "lottie-react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import heartAnimation from "@/assets/heart-animation.json";

interface AnimatedHeartProps {
  isFavorite: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
  size?: number;
  "aria-label"?: string;
}

export const AnimatedHeart = ({ 
  isFavorite, 
  onClick, 
  className,
  size = 24,
  "aria-label": ariaLabel
}: AnimatedHeartProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAnimating) {
      setIsAnimating(true);
      onClick?.(e);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all active:scale-95",
        className
      )}
      aria-label={ariaLabel || (isFavorite ? "Remove from favorites" : "Add to favorites")}
      aria-pressed={isFavorite}
      type="button"
    >
      {isAnimating && isFavorite ? (
        <div style={{ width: size, height: size }}>
          <Lottie
            animationData={heartAnimation}
            loop={false}
            autoplay={true}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        </div>
      ) : (
        <Heart
          className={cn(
            "transition-all",
            isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
          )}
          size={size}
          aria-hidden="true"
        />
      )}
    </button>
  );
};
