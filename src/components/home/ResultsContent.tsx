import { RefObject } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LazyBusinessCard } from "@/components/LazyBusinessCard";
import { AnimatedLoading } from "@/components/AnimatedLoading";
import { AnimatedError } from "@/components/AnimatedError";
import { AnimatedNoResults } from "@/components/AnimatedNoResults";
import { BusinessMapView } from "@/components/BusinessMapView";
import { BusinessCardDisplay } from "@/services/businessApi";
import { useLanguage } from "@/hooks/use-language";

interface ResultsContentProps {
  viewMode: 'list' | 'map';
  loading: boolean;
  error: string | null;
  cards: BusinessCardDisplay[];
  showFavorites: boolean;
  onCardClick: (card: BusinessCardDisplay) => void;
  onAdjustFilters: () => void;
  hasMore: boolean;
  observerTarget: RefObject<HTMLDivElement>;
}

export const ResultsContent = ({
  viewMode,
  loading,
  error,
  cards,
  showFavorites,
  onCardClick,
  onAdjustFilters,
  hasMore,
  observerTarget
}: ResultsContentProps) => {
  const { t } = useLanguage();

  if (loading && cards.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <AnimatedLoading size={80} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <AnimatedError size={80} className="mb-4 mx-auto" />
          <h3 className="text-lg font-semibold mb-2">{t("something_went_wrong")}</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">
            {t("try_again")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (cards.length === 0) {
    const message = showFavorites 
      ? {
          title: t("no_favorites_yet"),
          description: t("tap_heart_favorites")
        }
      : {
          title: t("no_results_found"),
          description: loading 
            ? "Loading professionals in your area..." 
            : "No professionals match your current search criteria. Try adjusting your filters or search terms to find what you're looking for."
        };

    return (
      <Card className="text-center py-12 animate-fade-in">
        <CardContent>
          <div className="animate-bounce-in">
            <AnimatedNoResults size={100} className="mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">
              {message.title}
            </h3>
            <div className="flex gap-2 justify-center my-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_ease-in-out_0.1s_infinite]" />
              <div className="w-2 h-2 bg-accent rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
            </div>
          </div>
          <p className="text-muted-foreground mb-4 text-sm max-w-md mx-auto">
            {message.description}
          </p>
          {!showFavorites && (
            <Button onClick={onAdjustFilters} size="sm">
              {t("adjust_filters")}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'map') {
    return (
      <div className="animate-fade-in">
        <BusinessMapView businesses={cards} onBusinessClick={onCardClick} />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile-First Grid: 1 col on mobile, 2 on sm, 3 on lg, 4 on xl */}
      <div className="grid grid-cols-1 gap-3 animate-fade-in sm:grid-cols-2 sm:gap-3.5 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div 
            key={card._id} 
            className="animate-slide-up h-full" 
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="relative active:scale-[0.98] transition-transform h-full">
              <div onClick={() => onCardClick(card)} className="cursor-pointer h-full">
                <LazyBusinessCard card={card} variant="compact" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Loader */}
      {!showFavorites && hasMore && (
        <div ref={observerTarget} className="flex justify-center py-6 sm:py-8">
          {loading && <AnimatedLoading size={40} />}
        </div>
      )}

      {!showFavorites && !hasMore && cards.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-3 sm:text-sm sm:py-4">
          No more results
        </p>
      )}
    </div>
  );
};
