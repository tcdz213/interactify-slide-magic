
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Center } from "@/types/center.types"; // Use the unified Center type
import InstagramStoryCard from "./InstagramStoryCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface VIPCenterCarouselProps {
  centers: Center[];
  isVisible: boolean;
  isLoading?: boolean;
}

const VIPCenterCarousel = ({ 
  centers, 
  isVisible, 
  isLoading = false 
}: VIPCenterCarouselProps) => {
  const navigate = useNavigate();
  const [loadingPlaceholders, setLoadingPlaceholders] = useState<number[]>([]);

  useEffect(() => {
    // Create an array of placeholder items while loading
    if (isLoading) {
      setLoadingPlaceholders(Array.from({ length: 6 }, (_, i) => i));
    }
  }, [isLoading]);

  const handleViewDetails = (centerId: number) => {
    navigate(`/center/${centerId}`);
  };

  return (
    <Carousel 
      className={`w-full ${isVisible ? "animate-fade-up animate-delay-150" : "opacity-0"}`}
      opts={{ loop: true }}
    >
      <CarouselContent className="-ml-4 md:-ml-6">
        {isLoading 
          ? loadingPlaceholders.map((index) => (
              <CarouselItem key={`loading-${index}`} className="pl-4 md:pl-6 md:basis-1/3 lg:basis-1/4">
                <div className="flex justify-center w-full">
                  <InstagramStoryCard
                    center={{ 
                      id: 0, 
                      name: "", 
                      rating: 0, 
                      reviews: 0, 
                      category: "General", 
                      location: "", 
                      image: "", 
                      price: "", 
                      currency: "USD", 
                      featured: false, 
                      description: "", 
                      features: [],
                      status: "inactive",
                      verified: false
                    }}
                    onViewDetails={() => {}}
                    isLoading={true}
                  />
                </div>
              </CarouselItem>
            ))
          : centers.map((center: Center) => (
              <CarouselItem key={center.id} className="pl-4 md:pl-6 md:basis-1/3 lg:basis-1/4">
                <div className="flex justify-center w-full">
                  <InstagramStoryCard
                    center={center as any}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              </CarouselItem>
            ))
        }
      </CarouselContent>
      <CarouselPrevious className="-left-6 md:-left-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md" />
      <CarouselNext className="-right-6 md:-right-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md" />
    </Carousel>
  );
};

export default VIPCenterCarousel;
