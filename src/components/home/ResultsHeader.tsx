import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { BsMap } from "react-icons/bs";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
const LayoutList = AiOutlineUnorderedList;
const MapIcon = BsMap;
interface ResultsHeaderProps {
  showFavorites: boolean;
  hasActiveFilters: boolean;
  resultsCount: number;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  sortBy: 'relevance' | 'popular' | 'rating' | 'nearest' | 'newest';
  onSortChange: (sort: 'relevance' | 'popular' | 'rating' | 'nearest' | 'newest') => void;
}
export const ResultsHeader = ({
  showFavorites,
  hasActiveFilters,
  resultsCount,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange
}: ResultsHeaderProps) => {
  const {
    t
  } = useLanguage();
  return <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between sm:mb-4 md:gap-4">
      <div className="min-w-0">
        <h2 className="text-base font-semibold truncate sm:text-lg">
          {showFavorites ? t("your_favorites") : hasActiveFilters ? t("filtered_results") : t("featured_professionals")}
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          <span className="text-accent font-semibold">{resultsCount}</span> {t("professionals_found")}
        </p>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* View Mode Toggle - Mobile First */}
        <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5 sm:gap-1 sm:rounded-lg sm:p-1">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => onViewModeChange('list')} 
            className={cn(
              "h-7 px-2 sm:h-8 sm:px-3",
              viewMode === 'list' && "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <LayoutList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <Button 
            variant={viewMode === 'map' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => onViewModeChange('map')} 
            className={cn(
              "h-7 px-2 sm:h-8 sm:px-3",
              viewMode === 'map' && "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Sort Dropdown - Mobile First */}
        {!showFavorites && viewMode === 'list' && (
          <Select value={sortBy} onValueChange={(value: any) => onSortChange(value)}>
            <SelectTrigger className="w-[120px] h-8 text-xs sm:w-[140px] sm:h-9 sm:text-sm md:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t("relevance")}</SelectItem>
              <SelectItem value="popular">{t("most_popular")}</SelectItem>
              <SelectItem value="rating">{t("highest_rated")}</SelectItem>
              <SelectItem value="nearest">{t("nearest")}</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>;
};