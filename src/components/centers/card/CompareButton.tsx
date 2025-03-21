
import React from 'react';
import { Button } from "@/components/ui/button";
import { SplitSquareVertical, Check } from "lucide-react";

interface CompareButtonProps {
  isCompared: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const CompareButton: React.FC<CompareButtonProps> = ({
  isCompared,
  onToggle,
  size = 'sm',
  variant,
  className = ''
}) => {
  return (
    <Button 
      size={size} 
      variant={isCompared ? "default" : "outline"}
      className={`px-3 py-1 h-auto text-xs rounded-md ${isCompared ? 'bg-primary' : ''} ${className}`}
      onClick={onToggle}
    >
      {isCompared ? (
        <Check className="h-3.5 w-3.5 mr-1" />
      ) : (
        <SplitSquareVertical className="h-3.5 w-3.5 mr-1" />
      )}
      {isCompared ? 'Added to compare' : 'Compare'}
    </Button>
  );
};

export default CompareButton;
