import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BusinessCard from "@/components/BusinessCard";
import { BusinessCardSkeleton } from "@/components/BusinessCardSkeleton";
import { AnimatedHeart } from "@/components/AnimatedHeart";
import { AnimatedLoading } from "@/components/AnimatedLoading";
import { AnimatedNoResults } from "@/components/AnimatedNoResults";
import { businessApi, BusinessCardDisplay } from "@/services/businessApi";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/use-language";
import { getSEOText, SupportedLanguage } from "@/utils/seoTranslations";
import { useProtectedRoute } from "@/hooks/use-protected-route";

const Favorites = () => {
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute('/profile');
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [businesses, setBusinesses] = useState<BusinessCardDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('business_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
    setLoading(false);
  }, []);

  // Load favorite businesses
  useEffect(() => {
    const loadFavoriteBusinesses = async () => {
      if (favorites.length === 0) {
        setBusinesses([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch all businesses and filter by favorites
        const featuredData = await businessApi.getFeaturedBusinesses();
        const favoriteBusinesses = featuredData.featured.filter(b => 
          favorites.includes(b._id)
        );
        setBusinesses(favoriteBusinesses);
      } catch (error) {
        console.error('Failed to load favorite businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteBusinesses();
  }, [favorites]);

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
