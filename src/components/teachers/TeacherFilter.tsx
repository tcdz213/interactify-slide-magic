
import { useState } from "react";
import { FilterState } from "@/components/filters/types";
import { FilterBar } from "@/components/filters";

interface TeacherFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export function TeacherFilter({ onFilterChange }: TeacherFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    subcategory: null,
    subcategories: [],
    location: 'all',
    rating: 'any',
    priceRange: [0, 200],
    sort: 'featured',
    features: [],
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    // This would typically trigger an API call in a real app
    console.log("Searching with filters:", filters);
  };

  return (
    <FilterBar
      filters={filters}
      onFilterChange={handleFilterChange}
      onSearch={handleSearch}
      totalResults={50} // This would come from API in a real app
    />
  );
}
