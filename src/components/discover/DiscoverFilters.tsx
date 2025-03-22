
import React from "react";
import { FilterBar } from "@/components/filters";
import { FilterState } from "@/components/filters/types";

interface DiscoverFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onSearch: () => void;
  totalResults: number;
}

const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  totalResults,
}) => {
  return (
    <div className="mb-8">
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        onSearch={onSearch}
        totalResults={totalResults}
      />
    </div>
  );
};

export default DiscoverFilters;
