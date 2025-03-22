
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Center } from "@/types/center.types";
import { CentersList, FavoritesTab, RecommendationsSection, CourseComparisonTable } from "@/components/centers";
import { CoursesListWithFilters } from "@/components/courses";
import { FilterState } from "@/components/filters/types";
import SavedSearches from "@/components/filters/SavedSearches";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";

interface DiscoverTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (value: "grid" | "list") => void;
  filteredCenters: Center[];
  resultsType: "centers" | "courses";
  filters: FilterState;
  clearFilters: () => void;
  isLoading: boolean;
  compareCourses: Center[];
  removeFromComparison: (id: number) => void;
  clearComparison: () => void;
}

const DiscoverTabs: React.FC<DiscoverTabsProps> = ({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  filteredCenters,
  resultsType,
  filters,
  clearFilters,
  isLoading,
  compareCourses,
  removeFromComparison,
  clearComparison,
}) => {
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
          {compareCourses.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {compareCourses.length}
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
        <CourseComparisonTable 
          courses={compareCourses}
          onRemove={removeFromComparison}
          onClear={clearComparison}
        />
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
