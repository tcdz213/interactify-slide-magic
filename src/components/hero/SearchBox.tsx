
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <motion.div 
      className={`max-w-4xl mx-auto ${className}`} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      role="search"
      aria-label="Training center search"
    >
      <motion.div 
        className="bg-card/80 backdrop-blur-md rounded-2xl shadow-xl p-3 md:p-4 border border-border/30 hover:shadow-2xl transition-shadow duration-300"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
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
              className="h-12 rounded-lg px-6 transition-all duration-300 hover:shadow-md bg-gradient-to-r from-primary to-primary/90"
              onClick={handleSearch}
              aria-label="Search"
            >
              {t('hero.search')}
            </Button>
          </div>
        </div>
      </motion.div>
      
      <PopularTags label={t('hero.popular')} tags={popularTags} />
    </motion.div>
  );
};

export default SearchBox;
