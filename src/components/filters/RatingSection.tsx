import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";

interface RatingSectionProps {
  filters: BusinessSearchFilters;
  onFilterChange: (key: string, value: any) => void;
}

export const RatingSection = ({ filters, onFilterChange }: RatingSectionProps) => {
  const ratings = [
    { value: 0, label: "Any" },
    { value: 3, label: "3+ ⭐" },
    { value: 4, label: "4+ ⭐" },
    { value: 4.5, label: "4.5+ ⭐" }
  ];

  return (
    <div className="space-y-2.5">
      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        ⭐ Minimum Rating
      </Label>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {ratings.map(({ value, label }) => (
          <Button
            key={value}
            variant={filters.rating === value ? "secondary" : "outline"}
            onClick={() => onFilterChange("rating", value)}
            className="text-[10px] sm:text-xs h-10 sm:h-11 font-medium active:scale-95"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
