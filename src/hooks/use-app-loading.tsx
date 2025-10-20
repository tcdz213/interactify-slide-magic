import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";

export const useAppLoading = (minLoadTime: number = 1000) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    const startTime = Date.now();

    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);

      // Wait for both page load AND auth check
      if (!isAuthLoading) {
        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      }
    };

    // Wait for all critical resources and auth
    if (document.readyState === 'complete' && !isAuthLoading) {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [minLoadTime, isAuthLoading]);

  return isLoading;
};
