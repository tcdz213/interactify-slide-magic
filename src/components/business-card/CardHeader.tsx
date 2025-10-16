import { Badge } from "@/components/ui/badge";
import { Verified } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { getDomainIcon, getDomainColor } from "@/utils/categoryIcons";
import { BusinessCardDisplay } from "@/types/business-card";

interface CardHeaderProps {
  card: BusinessCardDisplay;
  variant?: "compact" | "full";
}

export const CardHeader = ({ card, variant = "compact" }: CardHeaderProps) => {
  const subdomainDisplay = Array.isArray(card.subdomain_key) 
    ? card.subdomain_key.join(', ').replace(/_/g, ' ')
    : card.subdomain_key.replace(/_/g, ' ');

  if (variant === "compact") {
    return (
      <div className="pb-3 px-4 sm:px-6 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {getDomainIcon(card.domain_key)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                  {card.title}
                </h3>
                {card.verified && (
                  <div className="flex-shrink-0 bg-primary rounded-full p-0.5">
                    <Verified 
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" 
                      fill="currentColor"
                      aria-label="Verified"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {card.company}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-3 px-4 sm:px-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-primary rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-glow">
            {getDomainIcon(card.domain_key)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {card.title}
              </h2>
              {card.verified && (
                <div className="flex-shrink-0 bg-primary rounded-full p-1">
                  <Verified 
                    className="w-4 h-4 text-primary-foreground" 
                    fill="currentColor"
                    aria-label="Verified"
                  />
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground truncate mt-0.5">
              {card.company}
            </p>
            <Badge className={cn("mt-2 text-xs", getDomainColor(card.domain_key))}>
              {subdomainDisplay}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
