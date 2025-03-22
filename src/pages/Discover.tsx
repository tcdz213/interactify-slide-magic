
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import { FilterState } from "@/components/filters/types";
import { useFilteredCenters } from "@/components/centers";
import { useCourseComparison } from "@/hooks/centers";
import { addNotification } from "@/redux/slices/searchSlice";
import VIPCenters from "@/components/sections/VIPCenters";
import { 
  DiscoverTabs, 
  DiscoverResultsHeader, 
  DiscoverPageHeader, 
  DiscoverFilters 
} from "@/components/discover";

const Discover = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<string>("results");
  const [isLoading, setIsLoading] = useState(false);
  const [resultsType, setResultsType] = useState<"centers" | "courses">("centers");
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    category: "all",
    subcategory: null,
    subcategories: [],
    location: "all",
    rating: "any",
    priceRange: [0, 1000],
    sort: "featured",
    features: [],
  });

  const { filteredCenters, applyFilters } = useFilteredCenters(filters);
  const { compareCourses, removeFromComparison, clearComparison } = useCourseComparison();
  const dispatch = useDispatch();

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      category: "all",
      subcategory: null,
      subcategories: [],
      location: "all",
      rating: "any",
      priceRange: [0, 1000],
      sort: "featured",
      features: [],
    });
  };

  // Mock function to show how alerts would be triggered when user searches
  const handleSearch = () => {
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      applyFilters();
      setIsLoading(false);

      // This is where you'd normally ask the user if they want to save the search
      // For demo purposes, we'll add a notification to show how alerts would look
      if (filters.searchQuery && Math.random() > 0.5) {
        setTimeout(() => {
          dispatch(
            addNotification({
              type: "new_course",
              title: "New search alert",
              message: `Would you like to save "${filters.searchQuery}" and get notified when new courses are available?`,
            })
          );
        }, 2000);
      }
    }, 1500);
  };

  useEffect(() => {
    // Simulate initial loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const totalResults = resultsType === "centers" ? filteredCenters.length : 6; // Use actual course count here

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <DiscoverPageHeader />

          <div className="mb-8">
            <VIPCenters showFullBackground={false} className="py-8 md:py-12 my-0" />
          </div>

          <DiscoverFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            totalResults={totalResults}
          />

          {activeTab === "results" && (
            <DiscoverResultsHeader
              totalResults={totalResults}
              filters={filters}
              handleFilterChange={handleFilterChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultsType={resultsType}
              onResultsTypeChange={setResultsType}
            />
          )}

          <DiscoverTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filteredCenters={filteredCenters}
            resultsType={resultsType}
            filters={filters}
            clearFilters={clearFilters}
            isLoading={isLoading}
            compareCourses={compareCourses}
            removeFromComparison={removeFromComparison}
            clearComparison={clearComparison}
          />
        </div>
      </main>
      <Sponsors />
      <Footer />
    </div>
  );
};

export default Discover;
