
import React from 'react';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
  id?: string; // Added the id prop which can be optional
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  description,
  className = '',
  centered = true,
  id,
}) => {
  return (
    <div className={`${centered ? 'text-center' : ''} mb-8 ${className}`}>
      <motion.h2 
        className="text-3xl md:text-4xl font-semibold mb-4" 
        tabIndex={0} 
        id={id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p 
          className="text-muted-foreground max-w-3xl mx-auto" 
          tabIndex={0}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default SectionTitle;
