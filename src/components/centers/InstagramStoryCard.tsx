
import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Center } from "./types";
import { cn } from "@/lib/utils";

interface InstagramStoryCardProps {
  center: Center;
  onViewDetails: (id: number) => void;
  isLoading?: boolean;
}

const InstagramStoryCard = ({
  center,
  onViewDetails,
  isLoading = false,
}: InstagramStoryCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-shrink-0 flex flex-col items-center w-full max-w-[140px] mx-auto scroll-snap-align-start">
        <div className="relative rounded-full overflow-hidden w-28 h-28 sm:w-32 sm:h-32 mb-2 border-2 border-primary/30 p-[2px] bg-gradient-to-tr from-muted to-muted/50 animate-pulse">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-muted to-muted/50" />
          <div className="w-full h-full relative rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary/40 animate-spin" />
          </div>
        </div>
        <div className="h-4 w-20 bg-muted rounded animate-pulse mb-1" />
        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="flex-shrink-0 flex flex-col items-center w-full max-w-[140px] mx-auto transition-all duration-300 hover:scale-105 scroll-snap-align-start cursor-pointer"
      onClick={() => onViewDetails(center.id)}
    >
      <div className="relative rounded-full overflow-hidden w-28 h-28 sm:w-32 sm:h-32 mb-2 border-2 border-primary/30 p-[2px] bg-gradient-to-tr from-primary to-secondary hover:from-secondary hover:to-primary transition-all duration-300">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-secondary opacity-10" />
        <div className="w-full h-full relative rounded-full overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
          <img
            src={center.image}
            alt={center.name}
            className={cn(
              "w-full h-full object-cover rounded-full",
              imageLoaded 
                ? "opacity-100 animate-fade-in" 
                : "opacity-0",
              "transition-all duration-500"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
      </div>
      <span className="text-xs font-medium text-center line-clamp-1 w-full">
        {center.name}
      </span>
      <div className="flex items-center mt-0.5 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="ml-0.5 text-xs">{center.rating}</span>
      </div>
    </div>
  );
};

export default InstagramStoryCard;
