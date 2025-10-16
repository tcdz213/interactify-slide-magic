import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Filter, MapPin } from "@/components/ui/icon";
import { Logo } from "@/components/Logo";
import { ScrollToTop } from "@/components/ScrollToTop";
import { cn } from "@/lib/utils";
import { SearchSection } from "@/components/home/SearchSection";
import { CategoriesCarousel } from "@/components/home/CategoriesCarousel";
import { ResultsHeader } from "@/components/home/ResultsHeader";
import { ResultsContent } from "@/components/home/ResultsContent";
import { CTASection } from "@/components/home/CTASection";
import { businessApi, BusinessCardDisplay, BusinessSearchFilters } from "@/services/businessApi";
import { useDomains } from "@/hooks/use-domains";
import { useLanguage } from "@/hooks/use-language";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useDebounce } from "@/hooks/use-debounce";
import { applySmartFilters, analyzeSearchQuery } from "@/utils/smartSearch";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { getSEOText, SupportedLanguage } from "@/utils/seoTranslations";
import { FilterSidebar } from "@/components/FilterSidebar";
import { QuickFiltersBar } from "@/components/QuickFiltersBar";
import { ActiveFiltersChips } from "@/components/ActiveFiltersChips";
import { parseFiltersFromURL, validateFilters, debugLogFilters } from "@/utils/filterHelpers";
const Home = () => {
  const locationState = useLocation();
  const {
    domains
  } = useDomains();
  const {
    t,
    language
  } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400); // Debounce search for 400ms
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessCardDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smartFilterApplied, setSmartFilterApplied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const {
    location,
    requestLocation
  } = useGeolocation();

  // Parse URL query parameters and merge with navigation state
  const getInitialFilters = (): BusinessSearchFilters => {
    const searchParams = new URLSearchParams(window.location.search);

    // Use centralized parser for URL params
    const urlFilters = parseFiltersFromURL(searchParams);

    // Start with defaults, then apply URL filters, then navigation state (prioritizing navigation state)
    const defaults: BusinessSearchFilters = {
      search: "",
      radius: 10,
      rating: 0,
      languages: [],
      verified: false,
      tags: []
    };
    const merged = {
      ...defaults,
      ...urlFilters,
      ...(locationState.state?.filters || {})
    };
    console.log("🏠 Home: Initial filters parsed from URL:", merged);
    return merged;
  };
  const [filters, setFilters] = useState<BusinessSearchFilters>(getInitialFilters());
  const [sortBy, setSortBy] = useState<"relevance" | "popular" | "rating" | "nearest" | "newest">("relevance");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Pagination state (separate from filters)
  const itemsPerPage = 10;

  // Update filters when navigation state or URL changes
  useEffect(() => {
    if (locationState.state?.filters) {
      setFilters(locationState.state.filters);
    } else {
      // Re-parse URL if no state (e.g., direct navigation)
      setFilters(getInitialFilters());
    }
  }, [locationState.state, locationState.search]);

  // Load businesses from API with infinite scroll - using debounced search
  useEffect(() => {
    const loadBusinesses = async () => {
      if (!hasMore && currentPage > 1) return;

      // Validate filters before sending
      const validatedFilters = validateFilters(filters);

      // Debug log for development
      debugLogFilters(validatedFilters, "Home: Sending to API");
      setLoading(true);
      setError(null);
      try {
        // Merge filters with location data (filters take priority if set)
        const searchParams = {
          ...validatedFilters,
          search: debouncedSearch || validatedFilters.search,
          sort_by: sortBy,
          page: currentPage,
          limit: itemsPerPage,
          // Use filter's lat/lng if available, otherwise fall back to geolocation
          latitude: validatedFilters.latitude ?? location?.latitude,
          longitude: validatedFilters.longitude ?? location?.longitude
        };
        console.log("📡 Home: Final API params:", searchParams);
        const searchData = await businessApi.searchBusinesses(searchParams);
        if (currentPage === 1) {
          setBusinesses(searchData.businesses);
        } else {
          setBusinesses(prev => [...prev, ...searchData.businesses]);
        }
        setTotalPages(searchData.pagination.total_pages);
        setTotalResults(searchData.pagination.total_businesses);
        setHasMore(searchData.pagination.has_next);
      } catch (error) {
        console.error("Failed to load businesses:", error);
        setError("Failed to load businesses. Please try again.");
        if (currentPage === 1) setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };
    loadBusinesses();
  }, [filters, sortBy, debouncedSearch, currentPage, itemsPerPage, location]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setCurrentPage(prev => prev + 1);
      }
    }, {
      threshold: 0.1
    });
    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, [filters, sortBy, debouncedSearch]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("business_favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("business_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Memoize filtered and displayed cards
  const displayedCards = useMemo(() => {
    if (showFavorites) {
      return businesses.filter(card => favorites.includes(card._id));
    }
    return businesses;
  }, [showFavorites, businesses, favorites]);
  const hasActiveFilters = useMemo(() => !!(filters.domain || filters.city || filters.rating > 0 || filters.languages.length > 0 || filters.verified || filters.availability), [filters]);

  // Callbacks
  const handleCategoryClick = useCallback((domainId: string) => {
    setFilters(prev => ({
      ...prev,
      domain: domainId,
      subdomain: ""
    }));
  }, []);
  const handleCardClick = useCallback(async (card: BusinessCardDisplay) => {
    await businessApi.recordView(card._id, "browse");
    window.location.href = `/card/${card._id}`;
  }, []);
  const handleSearchChange = useCallback((newQuery: string) => {
    setSearchQuery(newQuery);
    const smartFilters = applySmartFilters(newQuery, filters, domains);
    const analysis = analyzeSearchQuery(newQuery, domains);
    setSmartFilterApplied(analysis.confidence > 40);
    setFilters({
      ...smartFilters,
      search: newQuery
    });
  }, [filters, domains]);
  const clearAllFilters = useCallback(() => {
    console.log("🧹 Home: Clearing all filters, preserving location if available");
    setFilters({
      search: "",
      domain: "",
      subdomain: "",
      city: location?.city && location.city !== "Unknown" ? location.city : "",
      radius: 10,
      rating: 0,
      languages: [],
      availability: "",
      verified: false,
      tags: [],
      latitude: location?.latitude,
      longitude: location?.longitude
    });
    setSearchQuery("");
  }, [location]);
  const removeFilter = useCallback((key: string) => {
    const newFilters = {
      ...filters
    };
    switch (key) {
      case "search":
        newFilters.search = "";
        setSearchQuery("");
        break;
      case "domain":
        newFilters.domain = "";
        newFilters.subdomain = "";
        break;
      case "subdomain":
        newFilters.subdomain = "";
        break;
      case "city":
        newFilters.city = "";
        break;
      case "rating":
        newFilters.rating = 0;
        break;
      case "languages":
        newFilters.languages = [];
        break;
      case "availability":
        newFilters.availability = "";
        break;
      case "verified":
        newFilters.verified = false;
        break;
      case "is_public":
        newFilters.is_public = undefined;
        break;
      case "tags":
        newFilters.tags = [];
        break;
      case "has_photo":
        newFilters.has_photo = undefined;
        break;
    }
    setFilters(newFilters);
  }, [filters]);
  const handleQuickFilterChange = useCallback((updates: Partial<BusinessSearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }));
  }, []);
  const seoLang = language === "en" || language === "ar" || language === "fr" ? language as SupportedLanguage : "en";
  return <>
      <SEOHead title={getSEOText("homeTitle", seoLang)} description={getSEOText("homeDescription", seoLang)} url={window.location.href} type="website" />
      <div className="min-h-screen bg-gradient-hero pt-14 md:pt-16 lg:pt-[65px] flex flex-col">
        {/* Mobile-First Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-lg border-b border-border/50 px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
              <Logo iconSize="sm" asLink={true} />
              <p className="text-xs text-muted-foreground pl-8 truncate sm:text-sm">
                {t("find_professionals")}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              <FilterSidebar filters={filters} onFiltersChange={setFilters} onClearFilters={clearAllFilters} hasActiveFilters={hasActiveFilters}>
                <Button variant={hasActiveFilters ? "default" : "ghost"} size="sm" className={cn("relative active:scale-95 transition-transform h-9 px-3 gap-1 sm:h-10 sm:px-4 sm:gap-2", hasActiveFilters && "bg-primary hover:bg-primary/90 text-primary-foreground")}>
                  <span className="text-xs font-semibold sm:text-sm">
                    Filters
                  </span>
                  <Filter className="w-4 h-4" />
                  {hasActiveFilters && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full border-2 border-background animate-pulse"></span>}
                </Button>
              </FilterSidebar>
            </div>
          </div>
        </header>

        {/* Search Section */}
        <SearchSection searchQuery={searchQuery} onSearchChange={handleSearchChange} smartFilterApplied={smartFilterApplied && !!filters.domain} />

        {/* Categories Carousel */}
        <CategoriesCarousel domains={domains} selectedDomain={filters.domain || ""} onCategoryClick={handleCategoryClick} />

        {/* Quick Filters Bar */}
        <div className="px-3 pb-2 max-w-7xl mx-auto w-full sm:px-4 md:px-5 lg:px-6">
          <QuickFiltersBar filters={filters} onFilterChange={handleQuickFilterChange} />
        </div>

        {/* Results Section - Mobile First */}
        <section className="px-3 pb-6 max-w-7xl mx-auto w-full sm:px-4 md:px-5 lg:px-6 lg:pb-8">
          <ResultsHeader showFavorites={showFavorites} hasActiveFilters={hasActiveFilters} resultsCount={showFavorites ? displayedCards.length : totalResults} viewMode={viewMode} onViewModeChange={setViewMode} sortBy={sortBy} onSortChange={setSortBy} />

          {/* Active Filters Chips */}
          <ActiveFiltersChips filters={filters} onRemoveFilter={removeFilter} />

          <ResultsContent viewMode={viewMode} loading={loading} error={error} cards={displayedCards} showFavorites={showFavorites} onCardClick={handleCardClick} onAdjustFilters={() => {}} hasMore={hasMore} observerTarget={observerTarget} />
        </section>

        {/* CTA Section */}
        {!showFavorites && displayedCards.length > 0 && <CTASection />}

        {/* Footer */}
        <Footer />

        <ScrollToTop />
      </div>
    </>;
};
export default Home;