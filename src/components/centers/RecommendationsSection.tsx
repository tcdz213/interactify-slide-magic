
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Center } from './types';
import { centersData } from './centersData';
import InstagramStyleCard from './InstagramStyleCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useIsMobile } from '@/hooks/use-mobile';

interface RecommendationsSectionProps {
  currentCenterId?: number;
  title?: string;
  className?: string;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  currentCenterId,
  title = "You May Also Like",
  className = "",
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const getRecommendations = (): Center[] => {
    const filteredCenters = currentCenterId 
      ? centersData.filter(center => center.id !== currentCenterId)
      : centersData;
      
    return [...filteredCenters]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
  };
  
  const [recommendations] = useState<Center[]>(getRecommendations());
  
  const handleCardClick = (centerId: number) => {
    navigate(`/center/${centerId}`);
    toast.info(`Viewing details for center #${centerId}`);
  };
  
  if (recommendations.length === 0) return null;
  
  return (
    <Card 
      className={`border-none shadow-none bg-gradient-to-b from-muted/30 to-background/50 ${className}`}
      aria-labelledby="recommendations-title"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2" id="recommendations-title">
          <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {recommendations.map((center) => (
              <CarouselItem 
                key={center.id} 
                className="pl-2 md:pl-4 basis-full xs:basis-4/5 sm:basis-2/3 md:basis-1/2 lg:basis-1/3"
              >
                <InstagramStyleCard 
                  center={center}
                  onViewDetails={handleCardClick}
                  className="w-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious 
            className={`${isMobile ? 'hidden' : 'left-0'} bg-background/80 backdrop-blur-sm hover:bg-background`} 
            aria-label="Previous recommendation"
          />
          <CarouselNext 
            className={`${isMobile ? 'hidden' : 'right-0'} bg-background/80 backdrop-blur-sm hover:bg-background`} 
            aria-label="Next recommendation"
          />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
