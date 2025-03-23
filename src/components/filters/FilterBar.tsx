
import { useState, useEffect } from "react";
import { FilterState } from "./types";
import ActiveFilters from "./ActiveFilters";
import ResultsCount from "./ResultsCount";
import FilterInputs from "./FilterInputs";
import FilterActions from "./FilterActions";

type FilterBarProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onSearch: () => void;
  totalResults: number;
  activeTab?: string;
};

const FilterBar = ({
  filters,
  onFilterChange,
  onSearch,
  totalResults,
  activeTab,
}: FilterBarProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>({
    ...filters,
    subcategories: filters.subcategories || [],
  });
  const [activeFeatures, setActiveFeatures] = useState<string[]>(
    filters.features || []
  );

  useEffect(() => {
    setLocalFilters(filters);
    setActiveFeatures(filters.features || []);
  }, [filters]);

  const handleInputChange = (field: keyof FilterState, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    onFilterChange({
      ...localFilters,
      features: activeFeatures,
    });
    onSearch();
  };

  const clearFilters = () => {
    const resetFilters: FilterState = {
      searchQuery: "",
      category: "all",
      subcategory: null,
      subcategories: [],
      location: "all",
      rating: "any",
      priceRange: [0, 1000],
      sort: "featured",
      features: [],
    };
    setLocalFilters(resetFilters);
    setActiveFeatures([]);
    onFilterChange(resetFilters);
  };

  const removeFilter = (filterKey: keyof FilterState, value?: string) => {
    let newFilters = { ...localFilters };

    if (filterKey === "features" && value) {
      newFilters.features = newFilters.features.filter(
        (feature) => feature !== value
      );
      setActiveFeatures((prev) => prev.filter((feature) => feature !== value));
    } else if (filterKey === "subcategories" && value) {
      newFilters.subcategories = newFilters.subcategories.filter(
        (subcategory) => subcategory !== value
      );
    } else if (filterKey === "priceRange") {
      newFilters.priceRange = [0, 1000];
    } else {
      if (filterKey === "category") {
        newFilters.category = "all";
        newFilters.subcategory = null;
        newFilters.subcategories = [];
      }
      if (filterKey === "location") newFilters.location = "all";
      if (filterKey === "rating") newFilters.rating = "any";
      if (filterKey === "searchQuery") newFilters.searchQuery = "";
    }

    onFilterChange(newFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.searchQuery !== "" ||
      localFilters.category !== "all" ||
      localFilters.subcategories.length > 0 ||
      localFilters.location !== "all" ||
      localFilters.rating !== "any" ||
      localFilters.priceRange[0] > 0 ||
      localFilters.priceRange[1] < 1000 ||
      localFilters.features.length > 0
    );
  };

  return (
    <div className="w-full space-y-2 md:space-y-4">
      {activeTab !== "favorites" && (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md p-3 md:p-4">
          <FilterInputs
            filters={localFilters}
            onChange={handleInputChange}
            onFilterChange={onFilterChange}
            activeFeatures={activeFeatures}
            setActiveFeatures={setActiveFeatures}
            applyFilters={applyFilters}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <ActiveFilters
            filters={localFilters}
            removeFilter={removeFilter}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />

          <FilterActions
            hasActiveFilters={hasActiveFilters()}
            onSaveSearch={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default FilterBar;
