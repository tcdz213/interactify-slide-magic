
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import { DiscoverHeader, DiscoverTabs } from "@/components/discover";
import { useDiscoverFilters } from "@/hooks/discover/useDiscoverFilters";

const Discover = () => {
  const {
    viewMode,
    setViewMode,
    isLoading,
    resultsType,
    setResultsType,
    filters,
    handleFilterChange,
    clearFilters,
    handleSearch,
    filteredCenters,
    compareCourses,
    removeFromComparison,
    clearComparison,
    courseComparisons,
    removeCourseFromComparison,
    clearCourseComparison,
  } = useDiscoverFilters();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <DiscoverHeader
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleSearch={handleSearch}
            totalResults={
              resultsType === "centers" ? filteredCenters.length : 6
            }
            sort={filters.sort}
            onSortChange={(value) => {
              handleFilterChange({ ...filters, sort: value });
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            resultsType={resultsType}
            onResultsTypeChange={setResultsType}
          />

          <DiscoverTabs
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            handleSearch={handleSearch}
            filteredCenters={filteredCenters}
            isLoading={isLoading}
            viewMode={viewMode}
            setViewMode={setViewMode}
            compareCourses={compareCourses}
            removeFromComparison={removeFromComparison}
            clearComparison={clearComparison}
            courseComparisons={courseComparisons}
            removeCourseFromComparison={removeCourseFromComparison}
            clearCourseComparison={clearCourseComparison}
            resultsType={resultsType}
            setResultsType={setResultsType}
          />
        </div>
      </main>
      <Sponsors />
      <Footer />
    </div>
  );
};

export default Discover;
