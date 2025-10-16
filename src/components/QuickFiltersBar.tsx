import { Button } from "@/components/ui/button";
import { Star, Verified, Clock, MapPin } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";
import { useGeolocation } from "@/hooks/use-geolocation";
import { cn } from "@/lib/utils";

interface QuickFiltersBarProps {
  filters: BusinessSearchFilters;
  onFilterChange: (updates: Partial<BusinessSearchFilters>) => void;
}

export const QuickFiltersBar = ({ filters, onFilterChange }: QuickFiltersBarProps) => {
  const { location, requestLocation } = useGeolocation();

  const quickFilters = [
    {
      id: "verified",
      label: "Verified",
      icon: Verified,
      isActive: filters.verified === true,
      onClick: () => onFilterChange({ verified: !filters.verified }),
    },
    {
      id: "open_now",
      label: "Open Now",
      icon: Clock,
      isActive: filters.availability === "open_now",
      onClick: () =>
        onFilterChange({
          availability: filters.availability === "open_now" ? "" : "open_now",
        }),
    },
    {
      id: "top_rated",
      label: "Top Rated",
      icon: Star,
      isActive: filters.rating >= 4,
      onClick: () => onFilterChange({ rating: filters.rating >= 4 ? 0 : 4 }),
    },
    {
      id: "near_me",
      label: "Near Me",
      icon: MapPin,
      isActive: !!(location?.latitude && location?.longitude),
      onClick: () => {
        if (!location) {
          requestLocation();
        }
      },
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {quickFilters.map((filter) => (
        <Button
          key={filter.id}
          variant={filter.isActive ? "default" : "outline"}
          size="sm"
          onClick={filter.onClick}
          className={cn(
            "flex-shrink-0 h-9 gap-1.5 text-xs transition-all",
            filter.isActive && "bg-primary text-primary-foreground shadow-md"
          )}
        >
          <filter.icon className="w-3.5 h-3.5" />
          {filter.label}
        </Button>
      ))}
    </div>
  );
};