
import React from 'react';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  description,
  className = '',
  centered = true,
}) => {
  return (
    <div className={`${centered ? 'text-center' : ''} mb-8 ${className}`}>
      <h2 className="text-3xl md:text-4xl font-semibold mb-4" tabIndex={0}>{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-3xl mx-auto" tabIndex={0}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
