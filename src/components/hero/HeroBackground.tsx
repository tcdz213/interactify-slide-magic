
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
        const speed = 0.8 + (index * 0.15); // Reduced movement for softer effect
        (orb as HTMLElement).style.transform = `translate(${x * -8 * speed}px, ${y * -8 * speed}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Define the gradients for different backgrounds with softer colors
  const gradients = {
    "gradient-1": "from-primary/20 to-primary/5",
    "gradient-2": "from-secondary/20 to-primary/5",
    "gradient-3": "from-blue-400/15 to-purple-500/10",
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 overflow-hidden backdrop-blur-[100px] ${className}`}
      aria-hidden="true"
    >
      {/* Animated background transitions */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }} // Reduced opacity for softer look
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }} // Slower transition for softer effect
          className="absolute inset-0"
        >
          {/* Main gradient orbs - larger and with reduced opacity */}
          <div className={`orb absolute -top-[30%] -right-[15%] w-4/5 h-4/5 bg-gradient-to-br ${gradients[currentImage as keyof typeof gradients]} rounded-full blur-3xl will-change-transform transition-transform duration-1500`} />
          <div className="orb absolute -bottom-[30%] -left-[15%] w-3/5 h-3/5 bg-gradient-to-tr from-secondary/15 to-secondary/5 rounded-full blur-3xl will-change-transform transition-transform duration-1500" />
          
          {/* Softer accent orbs with reduced opacity */}
          <div className="orb absolute top-[25%] left-[20%] w-80 h-80 bg-gradient-to-r from-blue-400/5 to-purple-500/5 rounded-full blur-3xl will-change-transform transition-transform duration-1000" />
          <div className="orb absolute bottom-[35%] right-[15%] w-96 h-96 bg-gradient-to-l from-amber-300/5 to-rose-400/5 rounded-full blur-3xl will-change-transform transition-transform duration-1000" />
        </motion.div>
      </AnimatePresence>
      
      {/* Floating elements with softer animation */}
      <div className="absolute top-[15%] right-[20%] w-2 h-2 bg-primary/20 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute top-[45%] left-[15%] w-1.5 h-1.5 bg-secondary/20 rounded-full animate-ping" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[25%] right-[30%] w-1.5 h-1.5 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '5s' }} />
      
      {/* Softer grid pattern overlay with animation */}
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-background/60 opacity-80 transition-opacity duration-1000 ${isLoaded ? 'opacity-80' : 'opacity-0'}`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.005)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_30%,transparent_100%)]" />
    </div>
  );
};

export default memo(HeroBackground);
