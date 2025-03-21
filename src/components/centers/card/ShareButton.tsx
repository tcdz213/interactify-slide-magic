
import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareButtons from '../ShareButtons';

interface ShareButtonProps {
  centerId: number;
  centerName: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'subtle';
  showLabel?: boolean;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  centerId,
  centerName,
  size = 'sm',
  variant = 'outline',
  showLabel = false,
  className
}) => {
  return (
    <ShareButtons
      centerId={centerId}
      centerName={centerName}
      size={size}
      variant={variant}
      showLabel={showLabel}
      className={className}
    />
  );
};

export default ShareButton;
