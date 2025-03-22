
import React from "react";
import { ResultsCount } from "@/components/filters";
import { FilterState } from "@/components/filters/types";

interface DiscoverResultsHeaderProps {
  totalResults: number;
  filters: FilterState;
  handleFilterChange: (filters: FilterState) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  resultsType: "centers" | "courses";
  onResultsTypeChange: (type: "centers" | "courses") => void;
}

const DiscoverResultsHeader: React.FC<DiscoverResultsHeaderProps> = ({
  totalResults,
  filters,
  handleFilterChange,
  viewMode,
  onViewModeChange,
  resultsType,
  onResultsTypeChange,
}) => {
  return (
    <div className="mb-8">
      <ResultsCount
        totalResults={totalResults}
        sort={filters.sort}
        onSortChange={(value) => {
          handleFilterChange({ ...filters, sort: value });
        }}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        resultsType={resultsType}
        onResultsTypeChange={onResultsTypeChange}
      />
    </div>
  );
};

export default DiscoverResultsHeader;
