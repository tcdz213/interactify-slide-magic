
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface StepListItemProps {
  step?: string;
  index?: number;
  number?: number;
  title?: string;
  description?: string;
}

const StepListItem = ({ step, index, number, title, description }: StepListItemProps) => {
  // Use the appropriate content based on which props are provided
  const displayTitle = title || step;
  const displayIndex = number !== undefined ? number : index;
  
  return (
    <motion.li 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * (displayIndex || 0), duration: 0.4 }}
      className="flex items-start gap-3"
    >
      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0 dark:text-primary/90" />
      <div>
        <span className="text-muted-foreground">{displayTitle}</span>
        {description && <p className="text-sm text-muted-foreground/80 mt-1">{description}</p>}
      </div>
    </motion.li>
  );
};

export default StepListItem;
