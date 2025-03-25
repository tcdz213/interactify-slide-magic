
import { Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import FilterContent from './FilterContent';
import { FilterState } from './types';

type MobileFilterSheetProps = {
  filters: FilterState;
  onChange: (field: keyof FilterState, value: any) => void;
  activeFeatures: string[];
  setActiveFeatures: (features: string[]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
};

const MobileFilterSheet = ({
  filters,
  onChange,
  activeFeatures,
  setActiveFeatures,
  applyFilters,
  clearFilters,
  hasActiveFilters
}: MobileFilterSheetProps) => {
  const getActiveFilterCount = () => {
    return (filters.category !== 'all' ? 1 : 0) + 
           (filters.location !== 'all' ? 1 : 0) + 
           (filters.rating !== 'any' ? 1 : 0) + 
           ((filters.priceRange[0] > 0 || (filters.priceRange.length > 1 && filters.priceRange[1] < 1000)) ? 1 : 0) + 
           filters.features.length;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="py-6 rounded-lg px-4 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters() && (
            <Badge variant="secondary" className="ml-2 px-1.5 h-5 min-w-5 flex items-center justify-center rounded-full">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <FilterContent 
          filters={filters}
          onChange={onChange}
          activeFeatures={activeFeatures}
          setActiveFeatures={setActiveFeatures}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
        />
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterSheet;
