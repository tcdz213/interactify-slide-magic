
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TestimonialNavigationProps {
  totalCount: number;
  activeIndex: number;
  isAnimating: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

const TestimonialNavigation = ({ 
  totalCount, 
  activeIndex, 
  isAnimating, 
  onPrevious, 
  onNext, 
  onSelect 
}: TestimonialNavigationProps) => {
  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20"
        onClick={onPrevious}
        disabled={isAnimating}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalCount }).map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/40'
            }`}
            onClick={() => onSelect(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20"
        onClick={onNext}
        disabled={isAnimating}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default TestimonialNavigation;
