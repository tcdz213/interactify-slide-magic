
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FilterBar, FilterState } from "@/components/filters";
import SavedSearches from "@/components/filters/SavedSearches";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import {
  CentersList,
  CourseComparisonTable,
  FavoritesTab,
  RecommendationsSection,
} from "@/components/centers";
import { CoursesListWithFilters } from "@/components/courses";
import { CourseComparisonTable as CourseComparison } from "@/components/courses";

interface DiscoverTabsProps {
  filters: FilterState;
  handleFilterChange: (newFilters: FilterState) => void;
  clearFilters: () => void;
  handleSearch: () => void;
  filteredCenters: any[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  compareCourses: any[];
  removeFromComparison: (id: number) => void;
  clearComparison: () => void;
  courseComparisons: any[];
  removeCourseFromComparison: (id: number) => void;
  clearCourseComparison: () => void;
  resultsType: "centers" | "courses";
  setResultsType: (type: "centers" | "courses") => void;
}

const DiscoverTabs = ({
  filters,
  handleFilterChange,
  clearFilters,
  handleSearch,
  filteredCenters,
  isLoading,
  viewMode,
  setViewMode,
  compareCourses,
  removeFromComparison,
  clearComparison,
  courseComparisons,
  removeCourseFromComparison,
  clearCourseComparison,
  resultsType,
  setResultsType,
}: DiscoverTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("results");
  
  // Calculate total comparison count
  const totalComparisonCount =
    resultsType === "centers"
      ? compareCourses.length
      : courseComparisons.length;

  return (
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
  );
};

export default DiscoverTabs;
