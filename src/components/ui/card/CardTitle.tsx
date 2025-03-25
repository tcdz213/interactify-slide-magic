
import React from 'react';
import { cn } from '@/lib/utils';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = ({ className, children, as = 'h3', ...props }: CardTitleProps) => {
  const Component = as;
  
  return (
    <Component 
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
};

export default CardTitle;
