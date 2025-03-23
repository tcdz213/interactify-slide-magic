import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import { FilterBar, FilterState, ResultsCount } from "@/components/filters";
import SavedSearches from "@/components/filters/SavedSearches";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import {
  CentersList,
  DiscoverHeader,
  BrowseCategoryButton,
  useFilteredCenters,
  FavoritesTab,
  RecommendationsSection,
  CourseComparisonTable,
} from "@/components/centers";
import { useCourseComparison } from "@/hooks/centers";
import { addNotification } from "@/redux/slices/searchSlice";
import VIPCenters from "@/components/sections/VIPCenters";
import { CoursesListWithFilters } from "@/components/courses";
import { CourseComparisonTable as CourseComparison } from "@/components/courses";
import { useCourseComparison as useCoursesComparison } from "@/hooks/courses";

const Discover = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<string>("results");
  const [isLoading, setIsLoading] = useState(false);
  const [resultsType, setResultsType] = useState<"centers" | "courses">(
    "centers"
  );
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
  const { compareCourses, removeFromComparison, clearComparison } =
    useCourseComparison();
  const {
    compareCourses: courseComparisons,
    removeFromComparison: removeCourseFromComparison,
    clearComparison: clearCourseComparison,
  } = useCoursesComparison();
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

  // Calculate total comparison count
  const totalComparisonCount =
    resultsType === "centers"
      ? compareCourses.length
      : courseComparisons.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <DiscoverHeader />
            <BrowseCategoryButton />
          </div>

          <div className="mb-8">
            <VIPCenters
              showFullBackground={false}
              className="py-8 md:py-12 my-0"
            />
          </div>

          <div className="mb-8">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              totalResults={
                resultsType === "centers" ? filteredCenters.length : 6
              } // Use actual course count here
            />
          </div>
          <div className="mb-8">
            <ResultsCount
              totalResults={
                resultsType === "centers" ? filteredCenters.length : 6
              } // Use actual course count here
              sort={filters.sort}
              onSortChange={(value) => {
                handleFilterChange({ ...filters, sort: value });
              }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultsType={resultsType}
              onResultsTypeChange={setResultsType}
            />
          </div>
          <Tabs
            defaultValue="results"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="results">Search Results</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="compare" className="relative">
                Compare
                {totalComparisonCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalComparisonCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="saved">Saved Searches</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              {resultsType === "centers" ? (
                <CentersList
                  centers={filteredCenters}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  clearFilters={clearFilters}
                  isLoading={isLoading}
                />
              ) : (
                <CoursesListWithFilters
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  clearFilters={clearFilters}
                  isLoading={isLoading}
                  filters={filters}
                />
              )}

              {/* Add Recommendations Section */}
              {filteredCenters.length > 0 && !isLoading && (
                <div className="mt-12">
                  <RecommendationsSection />
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              <FavoritesTab viewMode={viewMode} />
            </TabsContent>

            <TabsContent value="compare">
              {resultsType === "centers" ? (
                <CourseComparisonTable
                  courses={compareCourses}
                  onRemove={removeFromComparison}
                  onClear={clearComparison}
                />
              ) : (
                <CourseComparison
                  courses={courseComparisons}
                  onRemove={removeCourseFromComparison}
                  onClear={clearCourseComparison}
                />
              )}

              {/* Toggle between centers and courses comparison */}
              <div className="flex justify-center mt-8">
                <div className="bg-muted rounded-lg p-1 inline-flex">
                  <Button
                    variant={resultsType === "centers" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setResultsType("centers")}
                    className="rounded-md"
                  >
                    Training Centers
                  </Button>
                  <Button
                    variant={resultsType === "courses" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setResultsType("courses")}
                    className="rounded-md"
                  >
                    Courses
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saved">
              <SavedSearches />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Sponsors />
      <Footer />
    </div>
  );
};

export default Discover;
