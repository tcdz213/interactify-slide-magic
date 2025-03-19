
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
  images: { src: string; alt: string }[];
  autoSlideInterval?: number;
  className?: string;
}

const ImageSlider3D: React.FC<ImageSliderProps> = ({
  images,
  autoSlideInterval = 5000,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideTimerRef = useRef<number | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  
  // Auto-sliding functionality
  useEffect(() => {
    startSlideTimer();
    
    return () => {
      if (slideTimerRef.current) {
        window.clearTimeout(slideTimerRef.current);
      }
    };
  }, [currentIndex, autoSlideInterval]);
  
  const startSlideTimer = () => {
    if (slideTimerRef.current) {
      window.clearTimeout(slideTimerRef.current);
    }
    
    slideTimerRef.current = window.setTimeout(() => {
      nextSlide();
    }, autoSlideInterval);
  };
  
  const resetSlideTimer = () => {
    if (slideTimerRef.current) {
      window.clearTimeout(slideTimerRef.current);
      startSlideTimer();
    }
  };
  
  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match this to your transition duration
    
    resetSlideTimer();
  };
  
  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match this to your transition duration
    
    resetSlideTimer();
  };
  
  // Touch handlers for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Swipe threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };
  
  // Lazy loading of images
  const getImagesForLoading = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const nextIndex = (currentIndex + 1) % images.length;
    
    return [prevIndex, currentIndex, nextIndex];
  };
  
  return (
    <div 
      className={cn("relative mx-auto overflow-hidden rounded-xl", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={slideContainerRef}
    >
      {/* 3D Image Container */}
      <div className="relative h-full w-full perspective-1000">
        <div 
          className="relative h-full w-full" 
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
          }}
        >
          {images.map((image, index) => {
            const shouldLoad = getImagesForLoading().includes(index);
            
            return (
              <div 
                key={index} 
                className="relative min-w-full h-full transform-style-3d transition-transform duration-500"
                style={{
                  transform: index === currentIndex 
                    ? 'rotateY(0deg) scale(1)' 
                    : `rotateY(${index < currentIndex ? -20 : 20}deg) scale(0.9)`,
                  zIndex: index === currentIndex ? 2 : 1,
                  opacity: index === currentIndex ? 1 : 0.7,
                }}
              >
                {shouldLoad && (
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-opacity duration-300"
                    loading="lazy"
                    style={{ 
                      opacity: shouldLoad ? 1 : 0,
                      filter: index !== currentIndex ? 'brightness(0.8)' : 'none' 
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <button
        className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-all hover:bg-white hover:shadow-lg focus:outline-none"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-all hover:bg-white hover:shadow-lg focus:outline-none"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      
      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentIndex 
                ? "bg-white w-6" 
                : "bg-white/50 hover:bg-white/80"
            )}
            onClick={() => {
              setCurrentIndex(index);
              resetSlideTimer();
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider3D;
