import { Button } from "@/components/ui/button";
import { Phone, Share2 } from "@/components/ui/icon";
import { MessageSquare } from "lucide-react";
import { AnimatedHeart } from "@/components/AnimatedHeart";
import { useLanguage } from "@/hooks/use-language";
import { useConversationManager } from "@/hooks/use-conversation-manager";
interface QuickActionsProps {
  primaryPhone: string;
  cardTitle: string;
  cardDescription: string;
  isLiked: boolean;
  onLikeToggle: () => void;
  variant?: "compact" | "full";
  className?: string;
  businessId: string;
}
export const QuickActions = ({
  primaryPhone,
  cardTitle,
  cardDescription,
  isLiked,
  onLikeToggle,
  variant = "compact",
  className = "",
  businessId
}: QuickActionsProps) => {
  const { t } = useLanguage();
  const { startOrContinueConversation, isLoading } = useConversationManager();

  const handleMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await startOrContinueConversation(businessId);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: cardTitle,
        text: cardDescription,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };
  const buttonHeight = variant === "compact" ? "h-10" : "h-14";
  const iconSize = variant === "compact" ? "w-3.5 h-3.5" : "w-5 h-5";
  const textSize = variant === "compact" ? "text-[10px]" : "text-xs";
  return <div className={`flex items-center gap-2 ${className}`} role="toolbar" aria-label="Quick actions">
      <Button size="sm" className={`${buttonHeight} flex-1 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm`} asChild>
        <a href={`tel:${primaryPhone}`} aria-label={`${t('call')} ${cardTitle}`}>
          <Phone className={`${iconSize}`} aria-hidden="true" />
          
        </a>
      </Button>
      
      <Button 
        size="sm" 
        className={`${buttonHeight} flex-1 gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm`} 
        onClick={handleMessage}
        disabled={isLoading}
        aria-label={`${t('message')} ${cardTitle}`}
      >
        <MessageSquare className={`${iconSize}`} aria-hidden="true" />
      </Button>
      
      <Button variant="outline" size="sm" className={`${buttonHeight} flex-1 gap-1.5`} onClick={e => {
      e.stopPropagation();
      onLikeToggle();
    }} aria-label={isLiked ? t('remove_from_favorites') : t('add_to_favorites')}>
        <AnimatedHeart isFavorite={isLiked} onClick={() => {}} size={variant === "compact" ? 16 : 20} className="p-0" />
      </Button>
      
      <Button variant="outline" size="sm" className={`${buttonHeight} flex-1 gap-1.5`} onClick={handleShare} aria-label={`${t('share')} ${cardTitle}`}>
        <Share2 className={`${iconSize}`} aria-hidden="true" />
      </Button>
    </div>;
};