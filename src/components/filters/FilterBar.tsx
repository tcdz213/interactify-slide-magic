import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { FilterState } from "./types";
import SearchInput from "./SearchInput";
import CategorySelect from "./CategorySelect";
import LocationSelect from "./LocationSelect";
import SortSelect from "./SortSelect";
import ActiveFilters from "./ActiveFilters";
import MobileFilterSheet from "./MobileFilterSheet";
import DesktopMoreFilters from "./DesktopMoreFilters";
import SaveSearchDialog from "./SaveSearchDialog";
import ResultsCount from "./ResultsCount";
import { useIsMobile } from "@/hooks/use-mobile";

type FilterBarProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onSearch: () => void;
  totalResults: number;
};

const FilterBar = ({
  filters,
  onFilterChange,
  onSearch,
  totalResults,
}: FilterBarProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const isMobile = useIsMobile();
  const [activeFeatures, setActiveFeatures] = useState<string[]>(
    filters.features || []
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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
    } else if (filterKey === "priceRange") {
      newFilters.priceRange = [0, 1000];
    } else {
      if (filterKey === "category") newFilters.category = "all";
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
      localFilters.location !== "all" ||
      localFilters.rating !== "any" ||
      localFilters.priceRange[0] > 0 ||
      localFilters.priceRange[1] < 1000 ||
      localFilters.features.length > 0
    );
  };

  return (
    <div className="w-full space-y-2 md:space-y-4">
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <SearchInput
            value={localFilters.searchQuery}
            onChange={(value) => handleInputChange("searchQuery", value)}
          />

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            {isMobile ? (
              <MobileFilterSheet
                filters={localFilters}
                onChange={handleInputChange}
                activeFeatures={activeFeatures}
                setActiveFeatures={setActiveFeatures}
                applyFilters={applyFilters}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            ) : (
              <>
                <CategorySelect
                  value={localFilters.category}
                  onChange={(value) => {
                    handleInputChange("category", value);
                    onFilterChange({ ...localFilters, category: value });
                  }}
                />

                <LocationSelect
                  value={localFilters.location}
                  onChange={(value) => {
                    handleInputChange("location", value);
                    onFilterChange({ ...localFilters, location: value });
                  }}
                />

                <MobileFilterSheet
                  filters={localFilters}
                  onChange={handleInputChange}
                  activeFeatures={activeFeatures}
                  setActiveFeatures={setActiveFeatures}
                  applyFilters={applyFilters}
                  clearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                />

                <Button
                  className="py-5 md:py-6 rounded-lg"
                  onClick={applyFilters}
                >
                  Search
                </Button>
              </>
            )}
          </div>
        </div>

        <ActiveFilters
          filters={localFilters}
          removeFilter={removeFilter}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {hasActiveFilters() && (
          <div className="mt-3 md:mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Save this search</span>
            </Button>
          </div>
        )}
      </div>

      <ResultsCount
        totalResults={totalResults}
        sort={localFilters.sort}
        onSortChange={(value) => {
          handleInputChange("sort", value);
          onFilterChange({ ...localFilters, sort: value });
        }}
      />

      <SaveSearchDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
      />
    </div>
  );
};

export default FilterBar;
