import { Badge } from "@/components/ui/badge";
import { X } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";
import { useDomains } from "@/hooks/use-domains";

interface ActiveFiltersChipsProps {
  filters: BusinessSearchFilters;
  onRemoveFilter: (key: string) => void;
}

export const ActiveFiltersChips = ({
  filters,
  onRemoveFilter,
}: ActiveFiltersChipsProps) => {
  const { domains } = useDomains();

  const activeFilters: Array<{ key: string; label: string; value: any }> = [];

  // Search query
  if (filters.search) {
    activeFilters.push({
      key: "search",
      label: `Search: "${filters.search}"`,
      value: filters.search,
    });
  }

  // Domain
  if (filters.domain) {
    const domain = domains.find((d) => d.key === filters.domain);
    activeFilters.push({
      key: "domain",
      label: domain?.en || filters.domain,
      value: filters.domain,
    });
  }

  // Subdomain
  if (filters.subdomain) {
    const subdomains = Array.isArray(filters.subdomain)
      ? filters.subdomain
      : [filters.subdomain];
    if (subdomains.length > 0) {
      activeFilters.push({
        key: "subdomain",
        label: `${subdomains.length} sub-categor${subdomains.length > 1 ? "ies" : "y"}`,
        value: filters.subdomain,
      });
    }
  }

  // City
  if (filters.city && filters.city !== "Selected Location") {
    activeFilters.push({
      key: "city",
      label: `City: ${filters.city}`,
      value: filters.city,
    });
  }

  // Rating
  if (filters.rating && filters.rating > 0) {
    activeFilters.push({
      key: "rating",
      label: `${filters.rating}+ Stars`,
      value: filters.rating,
    });
  }

  // Languages
  if (filters.languages && filters.languages.length > 0) {
    activeFilters.push({
      key: "languages",
      label: `${filters.languages.length} Language${filters.languages.length > 1 ? "s" : ""}`,
      value: filters.languages,
    });
  }

  // Availability
  if (filters.availability) {
    activeFilters.push({
      key: "availability",
      label: filters.availability === "open_now" ? "Open Now" : filters.availability,
      value: filters.availability,
    });
  }

  // Verified
  if (filters.verified) {
    activeFilters.push({
      key: "verified",
      label: "Verified Only",
      value: filters.verified,
    });
  }

  // Public
  if (filters.is_public !== undefined) {
    activeFilters.push({
      key: "is_public",
      label: filters.is_public ? "Public Only" : "Private Only",
      value: filters.is_public,
    });
  }

  // Tags
  if (filters.tags && filters.tags.length > 0) {
    activeFilters.push({
      key: "tags",
      label: `${filters.tags.length} Tag${filters.tags.length > 1 ? "s" : ""}`,
      value: filters.tags,
    });
  }

  // Has photo
  if (filters.has_photo && filters.has_photo !== "any") {
    activeFilters.push({
      key: "has_photo",
      label: filters.has_photo === "with" ? "With Photo" : "Without Photo",
      value: filters.has_photo,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="h-8 px-3 gap-1.5 text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() => onRemoveFilter(filter.key)}
        >
          {filter.label}
          <X className="w-3 h-3" />
        </Badge>
      ))}
    </div>
  );
};