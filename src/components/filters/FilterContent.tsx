
import { Button } from "@/components/ui/button";
import { FilterState } from './types';
import CategorySelect from './CategorySelect';
import LocationSelect from './LocationSelect';
import RatingFilter from './RatingFilter';
import PriceRangeFilter from './PriceRangeFilter';
import FeaturesFilter from './FeaturesFilter';
import MultiSubcategorySelect from './MultiSubcategorySelect';
import { useState } from 'react';

type FilterContentProps = {
  filters: FilterState;
  onChange: (field: keyof FilterState, value: any) => void;
  activeFeatures: string[];
  setActiveFeatures: (features: string[]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
};

const FilterContent = ({ 
  filters, 
  onChange, 
  activeFeatures, 
  setActiveFeatures, 
  applyFilters, 
  clearFilters 
}: FilterContentProps) => {
  // State for tracking selected subcategories
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    filters.subcategories || []
  );
  
  // Update category when it changes
  const handleCategoryChange = (value: string) => {
    onChange('category', value);
    // Reset subcategories when category changes
    setSelectedSubcategories([]);
    onChange('subcategories', []);
  };
  
  // Update multiple subcategories when they change
  const handleMultiSubcategoryChange = (values: string[]) => {
    setSelectedSubcategories(values);
    onChange('subcategories', values);
  };

  // Update location when it changes
  const handleLocationChange = (value: string) => {
    onChange('location', value);
  };

  // Update rating when it changes
  const handleRatingChange = (value: string) => {
    onChange('rating', value);
  };

  // Update price range when it changes
  const handlePriceRangeChange = (value: number[]) => {
    onChange('priceRange', value);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium dark:text-gray-200">Category</h3>
        <CategorySelect 
          value={filters.category} 
          onChange={handleCategoryChange} 
        />
      </div>

      {filters.category && filters.category !== 'all' && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium dark:text-gray-200">Subcategories</h3>
          <MultiSubcategorySelect
            values={selectedSubcategories}
            categoryId={filters.category}
            onChange={handleMultiSubcategoryChange}
          />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium dark:text-gray-200">Location</h3>
        <LocationSelect 
          value={filters.location} 
          onChange={handleLocationChange}
        />
      </div>

      <RatingFilter 
        value={filters.rating} 
        onChange={handleRatingChange}
      />

      <PriceRangeFilter 
        value={filters.priceRange} 
        onChange={handlePriceRangeChange}
      />

      <FeaturesFilter 
        selectedFeatures={activeFeatures} 
        onChange={setActiveFeatures}
      />

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-200"
          onClick={clearFilters}
        >
          Clear All
        </Button>
        <Button 
          className="flex-1 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterContent;
