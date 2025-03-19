
import React, { memo } from 'react';

interface ScrollIndicatorProps {
  targetId: string;
  className?: string;
}

const ScrollIndicator = ({ targetId, className = '' }: ScrollIndicatorProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden md:block ${className}`}>
      <a 
        href={`#${targetId}`} 
        aria-label="Scroll down to content"
        className="hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
        onClick={handleClick}
        role="button"
      >
        <div className="w-8 h-12 border-2 border-primary rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse will-change-opacity" />
        </div>
      </a>
    </div>
  );
};

export default memo(ScrollIndicator);
