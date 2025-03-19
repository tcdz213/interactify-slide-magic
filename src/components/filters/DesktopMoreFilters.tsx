
import { Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FilterContent from './FilterContent';
import { FilterState } from './types';

type DesktopMoreFiltersProps = {
  filters: FilterState;
  onChange: (field: keyof FilterState, value: any) => void;
  activeFeatures: string[];
  setActiveFeatures: (features: string[]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
};

const DesktopMoreFilters = ({
  filters,
  onChange,
  activeFeatures,
  setActiveFeatures,
  applyFilters,
  clearFilters
}: DesktopMoreFiltersProps) => {
  const hasAdditionalFilters = () => {
    return filters.rating !== 'any' || 
      filters.priceRange[0] > 0 || 
      (filters.priceRange.length > 1 && filters.priceRange[1] < 1000) || 
      filters.features.length > 0;
  };

  const getFilterCount = () => {
    return (filters.rating !== 'any' ? 1 : 0) + 
      ((filters.priceRange[0] > 0 || (filters.priceRange.length > 1 && filters.priceRange[1] < 1000)) ? 1 : 0) + 
      filters.features.length;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="py-6 rounded-lg px-4 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>More Filters</span>
          {hasAdditionalFilters() && (
            <Badge variant="secondary" className="ml-2 px-1.5 h-5 min-w-5 flex items-center justify-center rounded-full">
              {getFilterCount()}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <FilterContent 
          filters={filters}
          onChange={onChange}
          activeFeatures={activeFeatures}
          setActiveFeatures={setActiveFeatures}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DesktopMoreFilters;
