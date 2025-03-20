
import { useState, useEffect } from "react";

// Set this to false to disable the tour by default
const TOUR_ENABLED = true;

export const useTour = () => {
  const [showTour, setShowTour] = useState(false);
  
  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    
    if (!hasSeenTour && TOUR_ENABLED) {
      // Wait a moment before showing the tour
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem("hasSeenTour", "true");
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem("hasSeenTour");
  };

  const openTour = () => {
    setShowTour(true);
  };

  const closeTour = () => {
    setShowTour(false);
  };

  return { 
    showTour, 
    setShowTour,
    completeTour,
    resetTour,
    openTour,
    closeTour
  };
};
