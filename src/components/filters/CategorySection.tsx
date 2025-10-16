import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";
import { Domain } from "@/services/domainsApi";
import { MultiSelectSubcategories } from "@/components/MultiSelectSubcategories";
import { getDomainIcon } from "@/utils/categoryIcons";
interface CategorySectionProps {
  filters: BusinessSearchFilters;
  domains: Domain[];
  onFilterChange: (key: string, value: any) => void;
}
export const CategorySection = ({
  filters,
  domains,
  onFilterChange
}: CategorySectionProps) => {
  const currentDomain = domains.find(d => d.key === filters.domain);
  return <div className="space-y-4">
      {/* Service Category - Visual Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Icon name="homeServices" className="w-4 h-4" />
          Service Category
        </Label>
        
        
        {domains.length > 5 && <Select value={filters.domain || "all"} onValueChange={value => {
        onFilterChange("domain", value === "all" ? "" : value);
        onFilterChange("subdomain", "");
      }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {domains.map(domain => <SelectItem key={domain.key} value={domain.key}>
                  {domain.fr}
                </SelectItem>)}
            </SelectContent>
          </Select>}
      </div>

      {/* Sub-specialties - Multiple selection */}
      {currentDomain && currentDomain.subcategories.length > 0 && <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <span className="text-lg">⚡</span>
            Sub-specialties
          </Label>
          <MultiSelectSubcategories subcategories={currentDomain.subcategories} selectedSubcategories={Array.isArray(filters.subdomain) ? filters.subdomain : filters.subdomain ? [filters.subdomain] : []} onSelectionChange={selected => onFilterChange("subdomain", selected.length > 0 ? selected : "")} language="fr" placeholder="Select specialties..." />
        </div>}
    </div>;
};