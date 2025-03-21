
import React, { useState } from 'react';
import { Facebook, Twitter, Linkedin, Copy, Mail, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useShareTracking } from '@/hooks/useShareTracking';

interface ShareButtonsProps {
  centerId: number;
  centerName: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle';
  trackShare?: boolean;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  centerId,
  centerName,
  className,
  showLabel = false,
  size = 'md',
  variant = 'default',
  trackShare = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackCourseShare } = useShareTracking();
  
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/center/${centerId}`;
  };
  
  const getShareText = () => {
    return `Check out ${centerName} on TrainingFinder!`;
  };

  const handleShareTracking = (platform: string) => {
    if (!trackShare) return;
    trackCourseShare(centerId, platform);
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
    handleShareTracking('facebook');
    toast.success("Shared on Facebook");
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
    handleShareTracking('twitter');
    toast.success("Shared on Twitter");
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
    handleShareTracking('linkedin');
    toast.success("Shared on LinkedIn");
  };

  const handleEmailShare = () => {
    const subject = `Check out ${centerName}`;
    const body = `I thought you might be interested in this training center: ${getShareUrl()}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    handleShareTracking('email');
    toast.success("Email client opened");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    handleShareTracking('copy-link');
    toast.success("Link copied to clipboard");
  };

  const getButtonSize = () => {
    switch(size) {
      case 'sm': return 'h-8 px-3 text-xs';
      case 'lg': return 'h-10 px-4 text-base';
      default: return 'h-9 px-3 text-sm';
    }
  };

  const getIconSize = () => {
    switch(size) {
      case 'sm': return 'h-3.5 w-3.5';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant === 'subtle' ? "outline" : "outline"} 
          size={showLabel ? undefined : "icon"}
          className={cn(
            "transition-all flex items-center", 
            variant === 'subtle' ? "hover:bg-primary/5" : "",
            showLabel ? getButtonSize() : "h-9 w-9",
            className
          )}
        >
          <Share2 className={getIconSize()} />
          {showLabel && <span className="ml-2">Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-sky-500" />
          <span>Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLinkedInShare} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          <span>LinkedIn</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
          <span>Email</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
          <span>Copy Link</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
