
import { FilterState } from "../types";

/**
 * Checks if there are any active filters
 */
export const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    filters.searchQuery !== "" ||
    filters.category !== "all" ||
    filters.subcategories.length > 0 ||
    filters.location !== "all" ||
    filters.rating !== "any" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    filters.features.length > 0
  );
};

/**
 * Create default reset filters state
 */
export const getResetFilters = (): FilterState => {
  return {
    searchQuery: "",
    category: "all",
    subcategory: null,
    subcategories: [],
    location: "all",
    rating: "any",
    priceRange: [0, 1000],
    sort: "featured",
    features: [],
  };
};
