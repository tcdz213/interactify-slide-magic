
import React from 'react';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
  id?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  description,
  className = '',
  centered = true,
  id,
}) => {
  return (
    <div 
      className={`${centered ? 'text-center' : ''} mb-8 ${className}`}
      data-testid="section-title"
    >
      <motion.h2 
        className="text-3xl md:text-4xl font-semibold mb-4" 
        tabIndex={0} 
        id={id}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        aria-label={title}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p 
          className="text-muted-foreground max-w-3xl mx-auto" 
          tabIndex={0}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          aria-label={description}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default SectionTitle;
