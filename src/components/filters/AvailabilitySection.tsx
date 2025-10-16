import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";

interface AvailabilitySectionProps {
  filters: BusinessSearchFilters;
  onFilterChange: (key: string, value: any) => void;
}

export const AvailabilitySection = ({ filters, onFilterChange }: AvailabilitySectionProps) => {
  return (
    <div className="space-y-2.5">
      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        📅 Availability
      </Label>
      <Select 
        value={filters.availability || "any"} 
        onValueChange={(value) => onFilterChange("availability", value === "any" ? "" : value)}
      >
        <SelectTrigger className="bg-background/50 h-11 text-sm">
          <SelectValue placeholder="Any time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Time</SelectItem>
          <SelectItem value="today">Aujourd'hui</SelectItem>
          <SelectItem value="this_week">Cette Semaine</SelectItem>
          <SelectItem value="weekend">Week-end</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
