
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { FilterState, availableFeatures, categories, locations, ratings } from './types';

type ActiveFiltersProps = {
  filters: FilterState;
  removeFilter: (filterKey: keyof FilterState, value?: string) => void;
  hasActiveFilters: () => boolean;
  clearFilters: () => void;
};

const ActiveFilters = ({ filters, removeFilter, hasActiveFilters, clearFilters }: ActiveFiltersProps) => {
  if (!hasActiveFilters()) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {filters.searchQuery && (
        <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 flex items-center gap-1">
          Search: {filters.searchQuery}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 rounded-full ml-1 p-0 hover:bg-primary/10"
            onClick={() => removeFilter('searchQuery')}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      )}
      
      {filters.category !== 'all' && (
        <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 flex items-center gap-1">
          Category: {categories.find(c => c.value === filters.category)?.label}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 rounded-full ml-1 p-0 hover:bg-primary/10"
            onClick={() => removeFilter('category')}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      )}
      
      {filters.location !== 'all' && (
        <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 flex items-center gap-1">
          Location: {locations.find(l => l.value === filters.location)?.label}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 rounded-full ml-1 p-0 hover:bg-primary/10"
            onClick={() => removeFilter('location')}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      )}
      
      {filters.rating !== 'any' && (
        <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 flex items-center gap-1">
          Rating: {ratings.find(r => r.value === filters.rating)?.label}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 rounded-full ml-1 p-0 hover:bg-primary/10"
            onClick={() => removeFilter('rating')}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      )}
      
      {(filters.priceRange[0] > 0 || (filters.priceRange.length > 1 && filters.priceRange[1] < 1000)) && (
        <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 flex items-center gap-1">
          Price: ${filters.priceRange[0]} - ${filters.priceRange.length > 1 ? filters.priceRange[1] : 1000}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 rounded-full ml-1 p-0 hover:bg-primary/10"
            onClick={() => removeFilter('priceRange')}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      )}
      
      {filters.features.map(feature => {
        const featureLabel = availableFeatures.find(f => f.id === feature)?.label;
        return (
          <Badge key={feature} variant="outline" className="rounded-full px-3 py-1 bg-primary/5 flex items-center gap-1">
            {featureLabel}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 rounded-full ml-1 p-0 hover:bg-primary/10"
              onClick={() => removeFilter('features', feature)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove filter</span>
            </Button>
          </Badge>
        );
      })}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs ml-2 h-7 px-2"
        onClick={clearFilters}
      >
        Clear All
      </Button>
    </div>
  );
};

export default ActiveFilters;
