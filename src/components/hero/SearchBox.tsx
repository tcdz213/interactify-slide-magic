
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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

interface SearchBoxProps {
  className?: string;
  onSearch?: (searchValue: string) => void;
}

const SearchBox = ({ className, onSearch }: SearchBoxProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [priceRange, setPriceRange] = useState([0]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue);
    } else {
      navigate(`/discover?q=${encodeURIComponent(searchValue)}`);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div 
      className={`max-w-4xl mx-auto animate-zoom-in ${className}`} 
      style={{ animationDelay: '0.3s' }}
      role="search"
      aria-label="Training center search"
    >
      <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-3 md:p-4 border border-border/50 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Label htmlFor="search-input" className="sr-only">Search training centers</Label>
            <Input
              id="search-input"
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              className="pl-10 h-12 w-full rounded-lg text-base focus-visible:ring-offset-0"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={t('hero.searchPlaceholder')}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-12 rounded-lg px-4 flex justify-between items-center w-full md:w-auto gap-2"
                  aria-label="Select location"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span className="text-muted-foreground">{t('hero.location')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4">
                <div className="space-y-4">
                  <h3 className="font-medium" id="location-heading">Select Location</h3>
                  <Label htmlFor="location-input" className="sr-only">Enter location</Label>
                  <Input 
                    id="location-input" 
                    type="text" 
                    placeholder="Enter city or zip code" 
                    aria-labelledby="location-heading"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="distance-select" id="distance-label" className="text-sm font-medium">Distance</Label>
                    <Select defaultValue="10">
                      <SelectTrigger id="distance-select" aria-labelledby="distance-label">
                        <SelectValue placeholder="Select distance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Within 5 miles</SelectItem>
                        <SelectItem value="10">Within 10 miles</SelectItem>
                        <SelectItem value="25">Within 25 miles</SelectItem>
                        <SelectItem value="50">Within 50 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
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
                  
                  <Button className="w-full" onClick={handleSearch}>Apply Filters</Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              className="h-12 rounded-lg px-6 transition-all duration-300 hover:shadow-md"
              onClick={handleSearch}
              aria-label="Search"
            >
              {t('hero.search')}
            </Button>
          </div>
        </div>
      </div>
      
      <div 
        className="flex flex-wrap gap-2 mt-4 justify-center"
        aria-label="Popular categories"
      >
        <span className="text-sm">{t('hero.popular')}</span>
        {['Fitness', 'Business', 'IT & Software', 'Language', 'Arts', 'Professional Skills'].map((tag) => (
          <a
            key={tag}
            href={`/discover?category=${encodeURIComponent(tag)}`}
            className="text-sm px-3 py-1 rounded-full bg-background border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors"
            aria-label={`Search ${tag} category`}
          >
            {tag}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SearchBox;
