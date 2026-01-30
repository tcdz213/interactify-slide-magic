import { useState, useEffect } from 'react';

interface GameDimensions {
  width: number;
  height: number;
  scale: number;
}

// Base dimensions the game was designed for
const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

export function useGameDimensions(): GameDimensions {
  const [dimensions, setDimensions] = useState<GameDimensions>(() => {
    if (typeof window === 'undefined') {
      return { width: BASE_WIDTH, height: BASE_HEIGHT, scale: 1 };
    }
    return calculateDimensions();
  });

  useEffect(() => {
    function handleResize() {
      setDimensions(calculateDimensions());
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Initial calculation
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return dimensions;
}

function calculateDimensions(): GameDimensions {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // For mobile, use full screen
  const isMobile = viewportWidth < 768 || 'ontouchstart' in window;
  
  if (isMobile) {
    // Use full viewport, maintaining aspect ratio
    const aspectRatio = BASE_WIDTH / BASE_HEIGHT;
    const viewportAspect = viewportWidth / viewportHeight;
    
    let width: number;
    let height: number;
    
    if (viewportAspect > aspectRatio) {
      // Viewport is wider than game - fit to height
      height = viewportHeight;
      width = height * aspectRatio;
    } else {
      // Viewport is taller than game - fit to width
      width = viewportWidth;
      height = width / aspectRatio;
    }
    
    // For immersive experience, stretch to fill
    width = viewportWidth;
    height = viewportHeight;
    
    const scaleX = width / BASE_WIDTH;
    const scaleY = height / BASE_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    
    return { width, height, scale };
  }
  
  // Desktop - use base dimensions
  return { width: BASE_WIDTH, height: BASE_HEIGHT, scale: 1 };
}

export { BASE_WIDTH, BASE_HEIGHT };
