
import React from 'react';
import { cn } from '@/lib/utils';

export interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader = ({ className, children }: CardHeaderProps) => {
  return (
    <div className={cn("p-6 flex flex-col space-y-1.5", className)}>
      {children}
    </div>
  );
};

export default CardHeader;
