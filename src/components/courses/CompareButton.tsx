
import React from "react";
import { Button } from "@/components/ui/button";
import { SplitSquareVertical, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareButtonProps {
  isCompared: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showLabel?: boolean;
}

const CompareButton: React.FC<CompareButtonProps> = ({
  isCompared,
  onToggle,
  size = "sm",
  variant,
  className = "",
  showLabel = true,
}) => {
  return (
    <Button
      size={size}
      variant={isCompared ? "default" : "outline"}
      className={cn("flex items-center gap-1", className)}
      onClick={onToggle}
    >
      {isCompared ? (
        <Check className="h-4 w-4 mr-1" />
      ) : (
        <SplitSquareVertical className="h-4 w-4 mr-1" />
      )}
      {showLabel && (isCompared ? "Added to compare" : "Compare")}
    </Button>
  );
};

export default CompareButton;
