
import React, { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroBackgroundProps {
  className?: string;
  currentImage?: string;
}

const HeroBackground = ({ className = "", currentImage = "gradient-1" }: HeroBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Set loaded state after initial render
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create animated particles effect
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = event;
      const x = clientX / window.innerWidth;
      const y = clientY / window.innerHeight;
      
      // Subtle parallax effect on the orbs
      const orbs = containerRef.current.querySelectorAll('.orb');
      orbs.forEach((orb, index) => {
        const speed = 1 + (index * 0.2);
        (orb as HTMLElement).style.transform = `translate(${x * -10 * speed}px, ${y * -10 * speed}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Define the gradients for different backgrounds
  const gradients = {
    "gradient-1": "from-primary/30 to-primary/5",
    "gradient-2": "from-secondary/30 to-primary/10",
    "gradient-3": "from-blue-400/20 to-purple-500/20",
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Animated background transitions */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          {/* Main gradient orbs */}
          <div className={`orb absolute -top-[20%] -right-[10%] w-2/3 h-2/3 bg-gradient-to-br ${gradients[currentImage as keyof typeof gradients]} rounded-full blur-3xl will-change-transform transition-transform duration-1000`} />
          <div className="orb absolute -bottom-[20%] -left-[10%] w-1/2 h-1/2 bg-gradient-to-tr from-secondary/20 to-secondary/5 rounded-full blur-3xl will-change-transform transition-transform duration-1000" />
          
          {/* Smaller accent orbs */}
          <div className="orb absolute top-[25%] left-[15%] w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-2xl will-change-transform transition-transform duration-700" />
          <div className="orb absolute bottom-[30%] right-[10%] w-80 h-80 bg-gradient-to-l from-amber-300/10 to-rose-400/10 rounded-full blur-2xl will-change-transform transition-transform duration-700" />
        </motion.div>
      </AnimatePresence>
      
      {/* Floating elements with enhanced animation */}
      <div className="absolute top-[15%] right-[20%] w-3 h-3 bg-primary/30 rounded-full animate-pulse" />
      <div className="absolute top-[45%] left-[15%] w-2 h-2 bg-secondary/40 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[25%] right-[30%] w-2 h-2 bg-primary/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      
      {/* Enhanced grid pattern overlay with animation */}
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-background/80 opacity-80 transition-opacity duration-1000 ${isLoaded ? 'opacity-80' : 'opacity-0'}`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.01)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />
    </div>
  );
};

export default memo(HeroBackground);
