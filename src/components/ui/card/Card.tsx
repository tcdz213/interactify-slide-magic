
import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'bordered' | 'borderless';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className,
  children,
  onClick,
  variant = 'default',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-card rounded-lg overflow-hidden",
        variant === 'default' && "border border-border shadow-sm hover:shadow-md transition-shadow duration-300",
        variant === 'bordered' && "border border-border",
        variant === 'borderless' && "shadow-none border-0",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;
