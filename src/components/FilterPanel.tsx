import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";
import { useDomains } from "@/hooks/use-domains";
import { useLanguage } from "@/hooks/use-language";
import { CategorySection } from "./filters/CategorySection";
import { LocationSection } from "./filters/LocationSection";
import { RatingSection } from "./filters/RatingSection";
import { AvailabilitySection } from "./filters/AvailabilitySection";
import { TagsSection } from "./filters/TagsSection";
import { OtherOptionsSection } from "./filters/OtherOptionsSection";

interface FilterPanelProps {
  filters: BusinessSearchFilters;
  onFiltersChange: (filters: BusinessSearchFilters) => void;
  onClearFilters: () => void;
}

const FilterPanel = ({ filters, onFiltersChange, onClearFilters }: FilterPanelProps) => {
  const { domains } = useDomains();
  const { t } = useLanguage();

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.domain || 
    filters.city || 
    filters.rating > 0 || 
    filters.languages?.length > 0 || 
    filters.verified || 
    filters.availability || 
    filters.has_photo ||
    (filters.subdomain && (Array.isArray(filters.subdomain) ? filters.subdomain.length > 0 : true)) ||
    (filters.tags && filters.tags.length > 0);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50" role="region" aria-label={t("filters")}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-primary" aria-hidden="true" />
            {t("filters")}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {t("active")}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} aria-label={t("clear") + " " + t("filters")}>
              <X className="w-4 h-4 mr-1" aria-hidden="true" />
              {t("clear")}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Category & Sub-specialties */}
        <CategorySection 
          filters={filters}
          domains={domains}
          onFilterChange={updateFilter}
        />

        {/* Location & Range */}
        <LocationSection 
          filters={filters}
          onFilterChange={updateFilter}
        />

        {/* Rating */}
        <RatingSection 
          filters={filters}
          onFilterChange={updateFilter}
        />

        {/* Availability */}
        <AvailabilitySection 
          filters={filters}
          onFilterChange={updateFilter}
        />

        {/* Tags */}
        <TagsSection 
          filters={filters}
          onFilterChange={updateFilter}
        />

        {/* Other Options (Verified + Photo) */}
        <OtherOptionsSection 
          filters={filters}
          onFilterChange={updateFilter}
        />
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
