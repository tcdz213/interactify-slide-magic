
import React from 'react';

interface StepListItemProps {
  number: number;
  title: string;
  description?: string;
}

const StepListItem: React.FC<StepListItemProps> = ({ number, title, description }) => {
  return (
    <div className="flex items-start gap-3 mb-3 group">
      <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold group-hover:scale-110 transition-transform">
        {number}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
};

export default StepListItem;
