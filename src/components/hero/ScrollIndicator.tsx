
import React from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollIndicatorProps {
  className?: string;
  targetId?: string;
}

const ScrollIndicator = ({ className, targetId = "how-it-works" }: ScrollIndicatorProps) => {
  const handleScroll = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center animate-bounce cursor-pointer mt-12",
        className
      )}
      onClick={handleScroll}
      aria-label="Scroll down"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleScroll();
        }
      }}
    >
      <span className="text-sm text-muted-foreground mb-2">Scroll Down</span>
      <ArrowDown className="w-5 h-5 text-muted-foreground" />
    </div>
  );
};

export default ScrollIndicator;
