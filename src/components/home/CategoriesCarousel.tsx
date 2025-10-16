import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "@/components/ui/icon";
import { getDomainIcon } from "@/utils/categoryIcons";
import { useLanguage } from "@/hooks/use-language";
import { Domain } from "@/services/domainsApi";
import { cn } from "@/lib/utils";

interface CategoriesCarouselProps {
  domains: Domain[];
  selectedDomain: string;
  onCategoryClick: (domainId: string) => void;
  onAllClick?: () => void;
}

export const CategoriesCarousel = ({ 
  domains, 
  selectedDomain, 
  onCategoryClick, 
  onAllClick 
}: CategoriesCarouselProps) => {
  const { t } = useLanguage();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    categoriesRef.current?.setAttribute('data-start-x', touch.clientX.toString());
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = parseFloat(categoriesRef.current?.getAttribute('data-start-x') || '0');
    const deltaX = touch.clientX - startX;
    
    if (Math.abs(deltaX) > 50) {
      categoriesRef.current?.removeAttribute('data-start-x');
    }
  };

  return (
    <section className="px-3 py-2 sm:px-4 sm:py-3 md:py-4 lg:px-6">
      <div 
        ref={categoriesRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 sm:gap-3" 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove}
      >
        <Button 
          variant={!selectedDomain ? "default" : "outline"} 
          onClick={() => onAllClick ? onAllClick() : onCategoryClick("")}
          className={cn(
            "flex-shrink-0 h-auto p-2 flex flex-col items-center gap-1 min-w-[60px] rounded-lg transition-all active:scale-95 sm:p-3 sm:min-w-[70px] sm:rounded-xl",
            !selectedDomain 
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" 
              : "hover:bg-accent/10 hover:border-accent"
          )}
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] sm:text-xs">{t("all")}</span>
        </Button>

        {domains.slice(0, 10).map(domain => (
          <Button 
            key={domain.key} 
            variant={selectedDomain === domain.key ? "default" : "outline"} 
            onClick={() => onCategoryClick(domain.key)}
            className={cn(
              "flex-shrink-0 h-auto p-2 flex flex-col items-center gap-1 min-w-[60px] rounded-lg transition-all active:scale-95 sm:p-3 sm:min-w-[70px] sm:rounded-xl",
              selectedDomain === domain.key 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" 
                : "hover:bg-accent/10 hover:border-accent"
            )}
          >
            {getDomainIcon(domain.key)}
            <span className="text-[10px] text-center leading-tight sm:text-xs">{domain.fr.split(' ')[0]}</span>
          </Button>
        ))}
      </div>
    </section>
  );
};
