
import { useRef, useEffect } from 'react';

interface ScrollableGalleryProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  gap?: number;
}

const ScrollableGallery = ({ 
  children, 
  className = '',
  direction = 'horizontal',
  gap = 6 
}: ScrollableGalleryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;
    
    let isDown = false;
    let startPosition: number;
    let scrollPosition: number;
    
    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      slider.classList.add('cursor-grabbing');
      const position = 'touches' in e 
        ? e.touches[0][direction === 'horizontal' ? 'pageX' : 'pageY']
        : e[direction === 'horizontal' ? 'pageX' : 'pageY'];
      startPosition = position - (direction === 'horizontal' ? slider.offsetLeft : slider.offsetTop);
      scrollPosition = direction === 'horizontal' ? slider.scrollLeft : slider.scrollTop;
    };
    
    const handleEnd = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
    };
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const position = 'touches' in e 
        ? e.touches[0][direction === 'horizontal' ? 'pageX' : 'pageY']
        : e[direction === 'horizontal' ? 'pageX' : 'pageY'];
      const x = position - (direction === 'horizontal' ? slider.offsetLeft : slider.offsetTop);
      const walk = (x - startPosition) * 2;
      if (direction === 'horizontal') {
        slider.scrollLeft = scrollPosition - walk;
      } else {
        slider.scrollTop = scrollPosition - walk;
      }
    };
    
    // Mouse events
    slider.addEventListener('mousedown', handleStart);
    slider.addEventListener('mouseleave', handleEnd);
    slider.addEventListener('mouseup', handleEnd);
    slider.addEventListener('mousemove', handleMove);
    
    // Touch events
    slider.addEventListener('touchstart', handleStart);
    slider.addEventListener('touchend', handleEnd);
    slider.addEventListener('touchmove', handleMove);
    
    return () => {
      slider.removeEventListener('mousedown', handleStart);
      slider.removeEventListener('mouseleave', handleEnd);
      slider.removeEventListener('mouseup', handleEnd);
      slider.removeEventListener('mousemove', handleMove);
      slider.removeEventListener('touchstart', handleStart);
      slider.removeEventListener('touchend', handleEnd);
      slider.removeEventListener('touchmove', handleMove);
    };
  }, [direction]);
  
  return (
    <div 
      ref={scrollRef}
      className={`flex ${direction === 'horizontal' ? 'overflow-x-auto' : 'flex-col overflow-y-auto'} 
        gap-${gap} cursor-grab scrollbar-hide ${className}`}
      style={{ 
        scrollBehavior: 'smooth', 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        scrollSnapType: `${direction} mandatory` 
      }}
    >
      {children}
    </div>
  );
};

export default ScrollableGallery;
