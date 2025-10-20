import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BusinessCard from "@/components/BusinessCard";
import { AnimatedHeart } from "@/components/AnimatedHeart";
import { AnimatedLoading } from "@/components/AnimatedLoading";
import { AnimatedNoResults } from "@/components/AnimatedNoResults";
import { favoritesApi } from "@/services/favoritesApi";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/use-language";
import { useFavorites } from "@/hooks/use-favorites";
import { getSEOText, SupportedLanguage } from "@/utils/seoTranslations";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { businessApi, BusinessCardDisplay } from "@/services/businessApi";

const Favorites = () => {
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute('/profile');
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessCardDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorite businesses from API
  useEffect(() => {
    const loadFavoriteBusinesses = async () => {
      if (authLoading || favoritesLoading) return;

      setLoading(true);
      try {
        if (isAuthenticated && favorites.length > 0) {
          // Use the favorites API to get full business details
          const response = await favoritesApi.getFavoriteBusinesses(1, 100);
          setBusinesses(response.businesses);
        } else {
          setBusinesses([]);
        }
      } catch (error) {
        console.error('Failed to load favorite businesses:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteBusinesses();
  }, [favorites, isAuthenticated, authLoading, favoritesLoading]);

  const handleCardClick = async (card: BusinessCardDisplay) => {
    await businessApi.recordView(card._id, 'favorites');
    window.location.href = `/card/${card._id}`;
  };

  const seoLang = (language === 'en' || language === 'ar' || language === 'fr') ? language as SupportedLanguage : 'en';

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <>
        <SEOHead
          title={getSEOText('favoritesTitle', seoLang)}
          description={getSEOText('favoritesDescription', seoLang)}
          url={window.location.href}
          type="website"
        />
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
          <AnimatedLoading size={60} />
        </div>
      </>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <SEOHead
        title={getSEOText('favoritesTitle', seoLang)}
        description={getSEOText('favoritesDescription', seoLang)}
        url={window.location.href}
        type="website"
      />
      <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/50 px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              My Favorites
            </h1>
            <p className="text-xs text-muted-foreground">
              {businesses.length} saved professional{businesses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <AnimatedHeart isFavorite={true} size={24} className="pointer-events-none" />
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 px-4 lg:px-6 py-6 max-w-7xl mx-auto w-full">
        {loading ? (
          // Loading animation
          <div className="flex justify-center items-center py-12">
            <AnimatedLoading size={80} />
          </div>
        ) : businesses.length === 0 ? (
          // Empty state
          <Card className="text-center py-12 animate-bounce-in">
            <CardContent>
              <AnimatedNoResults size={100} className="mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Tap the heart icon on business cards to save them here
              </p>
              <Button onClick={() => navigate('/home')} size="sm">
                Browse Professionals
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Favorites grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
            {businesses.map((card, index) => (
              <div
                key={card._id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative active:scale-[0.98] transition-transform">
                  <div onClick={() => handleCardClick(card)} className="cursor-pointer">
                    <BusinessCard card={card} variant="compact" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
      </div>
    </>
  );
};

export default Favorites;
