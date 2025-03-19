
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, History, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { useDispatch, useSelector } from 'react-redux';
import LocationSelector from './LocationSelector';
import SearchFilters from './SearchFilters';
import PopularCategories from './PopularCategories';
import { setSearchQuery, clearRecentSearches } from '@/redux/slices/searchSlice';
import { RootState } from '@/redux/store';

interface SearchBoxProps {
  className?: string;
  onSearch?: (searchValue: string) => void;
}

const SearchBox = ({ className, onSearch }: SearchBoxProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const recentSearches = useSelector((state: RootState) => state.search.recentSearches);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLDivElement>(null);
  
  const handleSearch = () => {
    if (searchValue.trim()) {
      dispatch(setSearchQuery(searchValue));
      
      if (onSearch) {
        onSearch(searchValue);
      } else {
        navigate(`/discover?q=${encodeURIComponent(searchValue)}`);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowRecentSearches(false);
    }
  };

  const selectRecentSearch = (term: string) => {
    setSearchValue(term);
    dispatch(setSearchQuery(term));
    if (onSearch) {
      onSearch(term);
    } else {
      navigate(`/discover?q=${encodeURIComponent(term)}`);
    }
    setShowRecentSearches(false);
  };
  
  const handleClearAllSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(clearRecentSearches());
  };

  // Handle clicks outside the search box to close the recent searches dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div 
      className={`max-w-4xl mx-auto animate-zoom-in ${className}`} 
      style={{ animationDelay: '0.3s' }}
      role="search"
      aria-label="Training center search"
    >
      <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-xl p-3 md:p-5 border border-border/50 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow" ref={searchInputRef}>
            <Label htmlFor="search-input" className="sr-only">Search training centers</Label>
            <Input
              id="search-input"
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              className="pl-10 h-12 w-full rounded-lg text-base focus-visible:ring-offset-0 shadow-sm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowRecentSearches(true)}
              aria-label={t('hero.searchPlaceholder')}
              autoComplete="off"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-70" aria-hidden="true" />
            
            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border/70 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/70">
                  <div className="flex items-center text-sm text-muted-foreground font-medium">
                    <History className="h-4 w-4 mr-2" />
                    {t('search.recentSearches')}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs"
                    onClick={handleClearAllSearches}
                  >
                    {t('search.clearAll')}
                  </Button>
                </div>
                <ul>
                  {recentSearches.map((term, index) => (
                    <li key={`${term}-${index}`}>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-accent flex justify-between items-center"
                        onClick={() => selectRecentSearch(term)}
                      >
                        <span className="flex items-center gap-2">
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                          {term}
                        </span>
                        <X 
                          className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Here you could add a function to remove just this one search
                          }}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <LocationSelector />
            <SearchFilters onSearch={handleSearch} />
            
            <Button 
              className="h-12 rounded-lg px-6 transition-all duration-300 hover:shadow-md hover:bg-primary/90"
              onClick={handleSearch}
              aria-label="Search"
            >
              {t('hero.search')}
            </Button>
          </div>
        </div>
      </div>
      
      <PopularCategories />
    </div>
  );
};

export default SearchBox;
