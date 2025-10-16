import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const usePageTransition = (duration: number = 200) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Instant scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [location.pathname, duration]);

  return isTransitioning;
};
