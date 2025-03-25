
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SearchInput from './search/SearchInput';
import LocationFilter from './search/LocationFilter';
import AdvancedFilter from './search/AdvancedFilter';
import PopularTags from './search/PopularTags';
import { popularTags } from '@/data/searchData';

interface SearchBoxProps {
  className?: string;
  onSearch?: (searchValue: string) => void;
}

const SearchBox = ({ className, onSearch }: SearchBoxProps) => {
  const [searchValue, setSearchValue] = useState('');
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
          <SearchInput 
            value={searchValue}
            onChange={setSearchValue}
            onKeyDown={handleKeyDown}
            placeholder={t('hero.searchPlaceholder')}
          />
          
          <div className="flex flex-col md:flex-row gap-3">
            <LocationFilter locationLabel={t('hero.location')} />
            <AdvancedFilter 
              filtersLabel={t('hero.filters')} 
              onApplyFilters={handleSearch}
            />
            
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
      
      <PopularTags label={t('hero.popular')} tags={popularTags} />
    </div>
  );
};

export default SearchBox;
