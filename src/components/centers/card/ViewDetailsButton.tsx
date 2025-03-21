
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewDetailsButtonProps {
  onClick: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  fullWidth?: boolean;
  className?: string;
}

const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({
  onClick,
  size = 'default',
  variant = 'default',
  fullWidth = false,
  className
}) => {
  return (
    <Button 
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-center gap-2",
        fullWidth && "w-full",
        className
      )}
    >
      <span>View Details</span>
      <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Button>
  );
};

export default ViewDetailsButton;
