
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

type CTAVariant = 'primary' | 'secondary' | 'outline';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: CTAVariant;
  arrow?: boolean;
  className?: string;
}

const CTAButton: React.FC<CTAButtonProps> = ({
  children,
  variant = 'primary',
  arrow = false,
  className,
  ...props
}) => {
  const baseClasses = {
    'primary': 'cta-button',
    'secondary': 'cta-button-secondary',
    'outline': 'cta-button-outline',
  };

  return (
    <button
      className={cn(
        baseClasses[variant],
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
        {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
      </span>
    </button>
  );
};

export default CTAButton;
