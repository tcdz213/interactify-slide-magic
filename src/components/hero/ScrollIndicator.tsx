
import React, { memo } from 'react';
import { motion } from 'framer-motion';

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
    <motion.div 
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      <motion.a 
        href={`#${targetId}`} 
        aria-label="Scroll down to content"
        className="hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
        onClick={handleClick}
        role="button"
        animate={{ y: [0, 10, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 2.5,
          ease: "easeInOut"
        }}
      >
        <div className="w-10 h-16 border border-primary/40 rounded-full flex justify-center pt-3 backdrop-blur-sm bg-background/30">
          <motion.div 
            className="w-1.5 h-3 bg-primary rounded-full will-change-opacity"
            animate={{ 
              opacity: [0.4, 1, 0.4],
              y: [0, 12, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.a>
    </motion.div>
  );
};

export default memo(ScrollIndicator);
