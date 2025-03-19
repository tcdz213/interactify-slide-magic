
import { useState } from 'react';
import { Star, MapPin, Users, Heart } from 'lucide-react';
import { Center } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/home';

interface InstagramStyleCardProps {
  center: Center;
  onViewDetails: (id: number) => void;
  className?: string;
}

const InstagramStyleCard = ({ center, onViewDetails, className }: InstagramStyleCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };
  
  return (
    <Card 
      className={cn("flex-shrink-0 w-[280px] border-0 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300", className)}
      onClick={() => onViewDetails(center.id)}
    >
      <div className="relative h-[280px] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted/30 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        )}
        <img 
          src={center.image} 
          alt={center.name} 
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {center.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-white">
            VIP
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white rounded-full h-8 w-8 p-0"
          onClick={handleLikeToggle}
        >
          <Heart className={cn("h-4 w-4", isLiked ? "fill-red-500 text-red-500" : "text-white")} />
        </Button>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-medium text-lg mb-1">{center.name}</h3>
          <div className="flex items-center text-white/80 text-sm mb-3">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{center.location}</span>
          </div>
          <Button 
            variant="outline" 
            className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(center.id);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 font-medium">{center.rating}</span>
            <span className="text-muted-foreground text-xs ml-1">({center.reviews})</span>
          </div>
          <div className="text-primary font-medium">
            <CurrencyDisplay amount={center.price} currency={center.currency} />
          </div>
        </div>
        <div className="flex items-center text-muted-foreground text-sm mt-1">
          <Users className="h-3.5 w-3.5 mr-1" />
          <span>{center.reviews} enrolled</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramStyleCard;
