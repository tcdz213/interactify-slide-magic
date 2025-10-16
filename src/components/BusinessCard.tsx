import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Globe, MapPin, QrCode, Clock, ExternalLink, Edit, X, Share2 } from "@/components/ui/icon";
import { Languages } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { BusinessCardDisplay, getPrimaryPhone } from "@/types/business-card";
import { AnimatedHeart } from "@/components/AnimatedHeart";
import { ExportCardMenu } from "@/components/ExportCardMenu";
import { subscriptionApi } from "@/services/subscriptionApi";
import { useLanguage } from "@/hooks/use-language";
import { QuickActions } from "@/components/business-card/QuickActions";
import { CardHeader as BusinessCardHeader } from "@/components/business-card/CardHeader";
import { CardStats } from "@/components/business-card/CardStats";

interface BusinessCardProps {
  card: BusinessCardDisplay;
  variant?: "compact" | "full" | "preview";
  showStats?: boolean;
  className?: string;
}
const BusinessCard = ({
  card,
  variant = "compact",
  showStats = true,
  className
}: BusinessCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const { t } = useLanguage();
  const currentUserId = localStorage.getItem('userId');
  const isOwner = card.user_id === currentUserId;

  useEffect(() => {
    const checkPro = async () => {
      const proStatus = await subscriptionApi.checkProStatus();
      setIsPro(proStatus);
    };
    checkPro();
  }, []);
  
  const primaryPhone = getPrimaryPhone(card);

  if (variant === "compact") {
    return (
      <Card className={cn(
        "group relative overflow-hidden bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer shadow-card hover:shadow-glow h-full",
        className
      )}>
        <BusinessCardHeader card={card} variant="compact" />

        <CardContent className="space-y-3 px-4 sm:px-6 pb-4">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {card.description}
          </p>

          {card.address && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">{card.address}</span>
            </div>
          )}

          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 h-5">
                  {tag}
                </Badge>
              ))}
              {card.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 h-5">
                  +{card.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {showStats && (
            <CardStats 
              scans={card.scans || 0}
              views={card.views || 0}
              subdomainKey={card.subdomain_key}
              domainKey={card.domain_key}
            />
          )}

          <QuickActions 
            primaryPhone={primaryPhone}
            cardTitle={card.title}
            cardDescription={card.description}
            isLiked={isLiked}
            onLikeToggle={() => setIsLiked(!isLiked)}
            variant="compact"
            className="pt-3 mt-3 border-t border-border/50"
            businessId={card._id}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden bg-card border-border shadow-card",
      className
    )}>
      <BusinessCardHeader card={card} variant="full" />

      <CardContent className="space-y-5 px-4 sm:px-6 pb-6">
        {/* Owner Actions - Only visible to card owner */}
        {isOwner && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-foreground">Active</span>
              </div>
              <Badge variant="outline" className="text-xs font-medium">Owner</Badge>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 text-xs hover:bg-muted transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  // Toggle active/inactive state
                }}
              >
                <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                Pause
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 text-xs hover:bg-muted transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  window.location.href = `/edit/${card._id}`;
                }}
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 text-xs hover:bg-muted transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: card.title,
                      text: `Check out ${card.company} - ${card.description}`,
                      url: `${window.location.origin}/card/${card._id}`
                    });
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/card/${card._id}`);
                  }
                }}
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete "${card.title}"? This action cannot be undone.`)) {
                    // Delete card functionality
                  }
                }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
        
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {card.description}
        </p>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="justify-start text-sm h-12 hover:bg-muted transition-colors"
            asChild
          >
            <a href={`mailto:${card.email}`}>
              <Mail className="w-4 h-4 mr-3 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{card.email}</span>
            </a>
          </Button>

          {card.website && (
            <Button 
              variant="outline" 
              className="justify-start text-sm h-12 hover:bg-muted transition-colors"
              asChild
            >
              <a href={card.website} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                <Globe className="w-4 h-4 mr-3 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">Website</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-muted-foreground" />
              </a>
            </Button>
          )}

          {card.address && (
            <Button 
              variant="outline" 
              className="justify-start text-sm h-12 col-span-full sm:col-span-2 hover:bg-muted transition-colors"
            >
              <MapPin className="w-4 h-4 mr-3 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{card.address}</span>
            </Button>
          )}
        </div>

        {/* Additional Info */}
        {(card.work_hours || card.languages) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
            {card.work_hours && (
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground mb-1">Working Hours</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.work_hours}</p>
                </div>
              </div>
            )}

            {card.languages && card.languages.length > 0 && (
              <div className="flex items-start space-x-3">
                <Languages className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground mb-1">Languages</p>
                  <p className="text-sm text-muted-foreground">
                    {card.languages.join(" • ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Services & Specialties</p>
            <div className="flex flex-wrap gap-2">
              {card.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-3 py-1.5 font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats & Actions */}
        <div className="space-y-4 pt-4 border-t border-border">
          {showStats && (
            <CardStats 
              scans={card.scans || 0}
              views={card.views || 0}
              subdomainKey={card.subdomain_key}
              domainKey={card.domain_key}
              showBadge={false}
            />
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <ExportCardMenu 
                card={card} 
                isPro={isPro}
                variant="outline"
                size="sm"
              />
              <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                <AnimatedHeart 
                  isFavorite={isLiked} 
                  onClick={() => setIsLiked(!isLiked)} 
                  size={16}
                  className="mr-2"
                />
                Favorite
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
          </div>
        </div>

        <QuickActions 
          primaryPhone={primaryPhone}
          cardTitle={card.title}
          cardDescription={card.description}
          isLiked={isLiked}
          onLikeToggle={() => setIsLiked(!isLiked)}
          variant="full"
          className="pt-4 border-t border-border"
          businessId={card._id}
        />
      </CardContent>
    </Card>
  );
};

export default BusinessCard;