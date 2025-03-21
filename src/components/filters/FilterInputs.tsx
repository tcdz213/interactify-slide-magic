
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import SearchInput from "./SearchInput";
import CategorySelect from "./CategorySelect";
import LocationSelect from "./LocationSelect";
import MobileFilterSheet from "./MobileFilterSheet";
import { FilterState } from "./types";

interface FilterInputsProps {
  filters: FilterState;
  onChange: (field: keyof FilterState, value: any) => void;
  onFilterChange: (filters: FilterState) => void;
  activeFeatures: string[];
  setActiveFeatures: (features: string[]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

const FilterInputs = ({
  filters,
  onChange,
  onFilterChange,
  activeFeatures,
  setActiveFeatures,
  applyFilters,
  clearFilters,
  hasActiveFilters,
}: FilterInputsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
      <SearchInput
        value={filters.searchQuery}
        onChange={(value) => onChange("searchQuery", value)}
      />

      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        {isMobile ? (
          <MobileFilterSheet
            filters={filters}
            onChange={onChange}
            activeFeatures={activeFeatures}
            setActiveFeatures={setActiveFeatures}
            applyFilters={applyFilters}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        ) : (
          <>
            <CategorySelect
              value={filters.category}
              onChange={(value) => {
                onChange("category", value);
                onChange("subcategories", []);
                onFilterChange({
                  ...filters,
                  category: value,
                  subcategory: null,
                  subcategories: [],
                });
              }}
            />

            <LocationSelect
              value={filters.location}
              onChange={(value) => {
                onChange("location", value);
                onFilterChange({ ...filters, location: value });
              }}
            />

            <MobileFilterSheet
              filters={filters}
              onChange={onChange}
              activeFeatures={activeFeatures}
              setActiveFeatures={setActiveFeatures}
              applyFilters={applyFilters}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            <Button className="py-5 md:py-6 rounded-lg" onClick={applyFilters}>
              Search
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterInputs;
