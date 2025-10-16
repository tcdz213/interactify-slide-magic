import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BusinessSearchFilters } from "@/services/businessApi";
import { useDomains } from "@/hooks/use-domains";
import { CategorySection } from "./filters/CategorySection";
import { LocationSection } from "./filters/LocationSection";
import { RatingSection } from "./filters/RatingSection";
import { AvailabilitySection } from "./filters/AvailabilitySection";
import { TagsSection } from "./filters/TagsSection";
import { OtherOptionsSection } from "./filters/OtherOptionsSection";
import { SearchQuerySection } from "./filters/SearchQuerySection";
import { LanguagesSection } from "./filters/LanguagesSection";
interface FilterSidebarProps {
  filters: BusinessSearchFilters;
  onFiltersChange: (filters: BusinessSearchFilters) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  children: React.ReactNode;
}
export const FilterSidebar = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  children
}: FilterSidebarProps) => {
  const {
    domains
  } = useDomains();
  const [isOpen, setIsOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(filters);

  // Sync local filters with parent when sheet opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);
  const updateFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleApplyFilters = () => {
    console.log('🎯 FilterSidebar: Applying filters:', localFilters);
    console.log('📍 Location in filters:', {
      latitude: localFilters.latitude,
      longitude: localFilters.longitude,
      city: localFilters.city,
      radius: localFilters.radius
    });
    onFiltersChange(localFilters);
    setIsOpen(false);
  };
  const handleClearFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };
  return <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        {/* Header - Sticky */}
        <SheetHeader className="px-4 sm:px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-primary" />
              Filters
              {hasActiveFilters && <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>}
            </SheetTitle>
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 px-2 text-xs">
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>}
          </div>
        </SheetHeader>

        {/* Filter Sections - Scrollable */}
        <ScrollArea className="flex-1 px-4 sm:px-6">
          <div className="space-y-4 py-4 pb-20">
            {/* Search Query */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-card">
              <SearchQuerySection filters={localFilters} onFilterChange={updateFilter} />
            </div>

            {/* Category & Sub-specialties */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-card">
              <CategorySection filters={localFilters} domains={domains} onFilterChange={updateFilter} />
            </div>

            {/* Location & Range */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-card">
              <LocationSection filters={localFilters} onFilterChange={updateFilter} />
            </div>

            {/* Rating */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-card">
              <RatingSection filters={localFilters} onFilterChange={updateFilter} />
            </div>

            {/* Availability */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-card">
              <AvailabilitySection filters={localFilters} onFilterChange={updateFilter} />
            </div>

            {/* Languages */}
            

            {/* Tags */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-card">
              <TagsSection filters={localFilters} onFilterChange={updateFilter} />
            </div>

            {/* Other Options (Verified + Photo + Public) */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 shadow-card">
              <OtherOptionsSection filters={localFilters} onFilterChange={updateFilter} />
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer with Apply Button */}
        <div className="sticky bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <Button className="w-full" size="lg" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>;
};