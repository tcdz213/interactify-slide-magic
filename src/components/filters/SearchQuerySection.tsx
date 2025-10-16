import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, X } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";
import { Button } from "@/components/ui/button";

interface SearchQuerySectionProps {
  filters: BusinessSearchFilters;
  onFilterChange: (key: string, value: any) => void;
}

export const SearchQuerySection = ({ filters, onFilterChange }: SearchQuerySectionProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-xs sm:text-sm font-semibold">🔍 Search Query</Label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, description, tags..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10 pr-10 bg-background/50 h-11 text-sm"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange("search", "")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};