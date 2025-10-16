import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BusinessSearchFilters } from "@/services/businessApi";
interface OtherOptionsSectionProps {
  filters: BusinessSearchFilters;
  onFilterChange: (key: string, value: any) => void;
}
export const OtherOptionsSection = ({
  filters,
  onFilterChange
}: OtherOptionsSectionProps) => {
  return <div className="space-y-3">
      <Label className="text-xs sm:text-sm font-semibold">✅ Other Options</Label>
      
      {/* Verified Providers Only */}
      <div className="flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-accent/50 transition-colors active:bg-accent">
        <Checkbox id="verified" checked={filters.verified} onCheckedChange={checked => onFilterChange("verified", checked)} className="h-5 w-5" />
        <Label htmlFor="verified" className="text-xs sm:text-sm font-normal cursor-pointer flex-1">
          Verified Providers Only
        </Label>
      </div>

      {/* Public/Private Filter */}
      

      {/* Photo Filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground font-medium">
          Photo
        </Label>
        <Select value={filters.has_photo || "any"} onValueChange={value => onFilterChange("has_photo", value === "any" ? undefined : value)}>
          <SelectTrigger className="bg-background/50 h-11 text-sm">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="with">With Photo</SelectItem>
            <SelectItem value="without">Without Photo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>;
};