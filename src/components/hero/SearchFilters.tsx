
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';

interface SearchFiltersProps {
  onSearch: () => void;
}

const SearchFilters = ({ onSearch }: SearchFiltersProps) => {
  const [priceRange, setPriceRange] = useState([0]);
  const { t } = useTranslation();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="h-12 rounded-lg px-4 flex justify-between items-center w-full md:w-auto gap-2"
          aria-label="Open filters"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          <span className="text-muted-foreground">{t('hero.filters')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4" role="group" aria-label="Search filters">
          <h3 className="font-medium" id="filter-heading">Refine Results</h3>
          
          <div className="space-y-2">
            <Label htmlFor="training-type" id="type-label" className="text-sm font-medium">Training Type</Label>
            <Select>
              <SelectTrigger id="training-type" aria-labelledby="type-label">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fitness">Fitness & Health</SelectItem>
                <SelectItem value="professional">Professional Skills</SelectItem>
                <SelectItem value="technical">Technical Training</SelectItem>
                <SelectItem value="language">Language Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="price-slider" id="price-label" className="text-sm font-medium">Price Range</Label>
              <span className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
                ${priceRange[0]} - $1000
              </span>
            </div>
            <Slider
              id="price-slider"
              defaultValue={[0]}
              max={1000}
              step={50}
              onValueChange={setPriceRange}
              aria-labelledby="price-label"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rating-select" id="rating-label" className="text-sm font-medium">Rating</Label>
            <Select defaultValue="4">
              <SelectTrigger id="rating-select" aria-labelledby="rating-label">
                <SelectValue placeholder="Minimum rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="w-full" onClick={onSearch}>Apply Filters</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchFilters;
