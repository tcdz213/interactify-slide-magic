
import { Button } from "@/components/ui/button";
import { FilterState } from './types';
import CategorySelect from './CategorySelect';
import SubcategorySelect from './SubcategorySelect';
import LocationSelect from './LocationSelect';
import RatingFilter from './RatingFilter';
import PriceRangeFilter from './PriceRangeFilter';
import FeaturesFilter from './FeaturesFilter';

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
  // Update category when it changes
  const handleCategoryChange = (value: string) => {
    onChange('category', value);
  };
  
  // Update subcategory when it changes
  const handleSubcategoryChange = (value: string) => {
    onChange('subcategory', value);
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
        <h3 className="text-sm font-medium">Category</h3>
        <CategorySelect 
          value={filters.category} 
          onChange={handleCategoryChange} 
        />
      </div>

      {filters.category && filters.category !== 'all' && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Subcategory</h3>
          <SubcategorySelect
            value={filters.subcategory}
            categoryId={filters.category}
            onChange={handleSubcategoryChange}
          />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Location</h3>
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
          className="flex-1"
          onClick={clearFilters}
        >
          Clear All
        </Button>
        <Button 
          className="flex-1"
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterContent;
