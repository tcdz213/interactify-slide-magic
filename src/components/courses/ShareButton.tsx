
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useShareTracking } from '@/hooks/useShareTracking';

interface ShareButtonProps {
  courseId: number;
  courseName: string;
  className?: string;
  showLabel?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'subtle';
  trackShare?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  courseId,
  courseName,
  className,
  showLabel = false,
  size = 'sm',
  variant = 'outline',
  trackShare = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackCourseShare } = useShareTracking();
  
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/course/${courseId}`;
  };
  
  const getShareText = () => {
    return `Check out this course: ${courseName} on TrainingFinder!`;
  };

  const handleShareTracking = (platform: string) => {
    if (!trackShare) return;
    trackCourseShare(courseId, platform);
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
    const subject = `Check out this course: ${courseName}`;
    const body = `I thought you might be interested in this course: ${getShareUrl()}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    handleShareTracking('email');
    toast.success("Email client opened");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    handleShareTracking('copy-link');
    toast.success("Link copied to clipboard");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant === 'subtle' ? "outline" : variant} 
          size={showLabel ? size : "icon"}
          className={cn(
            "transition-all flex items-center", 
            variant === 'subtle' ? "hover:bg-primary/5" : "",
            showLabel ? "" : "h-9 w-9",
            className
          )}
        >
          <Share2 className={cn("h-4 w-4")} />
          {showLabel && <span className="ml-2">Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook h-4 w-4 mr-2 text-blue-600"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter h-4 w-4 mr-2 text-sky-500"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          <span>Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLinkedInShare} className="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin h-4 w-4 mr-2 text-blue-700"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          <span>LinkedIn</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail h-4 w-4 mr-2 text-gray-600 dark:text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <span>Email</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-4 w-4 mr-2 text-gray-600 dark:text-gray-400"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>Copy Link</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
