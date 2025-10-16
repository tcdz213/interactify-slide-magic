import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaTelegram } from "react-icons/fa";

interface SocialShareProps {
  cardId: string;
  cardTitle: string;
  cardDescription?: string;
}

export const SocialShare = ({ cardId, cardTitle, cardDescription }: SocialShareProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/card/${cardId}`;
  const shareText = cardDescription 
    ? `Check out ${cardTitle} - ${cardDescription}`
    : `Check out ${cardTitle}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: cardTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2">
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        
        {navigator.share && (
          <DropdownMenuItem onClick={nativeShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            Share via...
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={shareToWhatsApp} className="gap-2">
          <FaWhatsapp className="w-4 h-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToFacebook} className="gap-2">
          <FaFacebook className="w-4 h-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToTwitter} className="gap-2">
          <FaTwitter className="w-4 h-4 text-blue-400" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToLinkedIn} className="gap-2">
          <FaLinkedin className="w-4 h-4 text-blue-700" />
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToTelegram} className="gap-2">
          <FaTelegram className="w-4 h-4 text-blue-500" />
          Telegram
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
