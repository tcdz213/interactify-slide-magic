
import React from "react";
import { FilterBar, FilterState, ResultsCount } from "@/components/filters";
import { DiscoverHeader as CentersDiscoverHeader } from "@/components/centers";
import { BrowseCategoryButton } from "@/components/centers";
import VIPCenters from "@/components/sections/VIPCenters";

interface DiscoverHeaderProps {
  filters: FilterState;
  handleFilterChange: (newFilters: FilterState) => void;
  handleSearch: () => void;
  totalResults: number;
  sort: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  resultsType: "centers" | "courses";
  onResultsTypeChange: (type: "centers" | "courses") => void;
}

const DiscoverHeader = ({
  filters,
  handleFilterChange,
  handleSearch,
  totalResults,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultsType,
  onResultsTypeChange,
}: DiscoverHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <CentersDiscoverHeader />
        <BrowseCategoryButton />
      </div>

      <div className="mb-8">
        <VIPCenters showFullBackground={false} className="py-8 md:py-12 my-0" />
      </div>

      <div className="mb-8">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          totalResults={totalResults}
        />
      </div>
      <div className="mb-8">
        <ResultsCount
          totalResults={totalResults}
          sort={sort}
          onSortChange={onSortChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          resultsType={resultsType}
          onResultsTypeChange={onResultsTypeChange}
        />
      </div>
    </>
  );
};

export default DiscoverHeader;
