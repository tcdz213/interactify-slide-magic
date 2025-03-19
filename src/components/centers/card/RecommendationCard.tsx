
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Star } from 'lucide-react';
import { Center } from '../types';
import { CurrencyDisplay } from '@/components/home';

interface RecommendationCardProps {
  center: Center;
  onClick: (centerId: number) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  center, 
  onClick 
}) => {
  return (
    <Card 
      className="w-72 shrink-0 border shadow-sm hover:shadow-md transition-all cursor-pointer snap-start"
      onClick={() => onClick(center.id)}
    >
      <div className="relative h-32 overflow-hidden">
        <img 
          src={center.image} 
          alt={center.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-2 left-3 flex items-center space-x-1 text-white text-xs">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span>{center.rating}</span>
        </div>
        {center.featured && (
          <Badge className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-0.5">
            Featured
          </Badge>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1 mb-1">{center.name}</h3>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <span className="line-clamp-1">{center.category} • {center.location}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {center.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-primary text-sm font-medium">
            <CurrencyDisplay amount={center.price} currency={center.currency} />
          </div>
          <div className="flex items-center text-xs text-primary font-medium">
            <span>View</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecommendationCard;
