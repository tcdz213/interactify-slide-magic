
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FilterState } from "@/components/filters";
import { useFilteredCenters } from "@/components/centers";
import { useCourseComparison } from "@/hooks/centers";
import { useCourseComparison as useCoursesComparison } from "@/hooks/courses";
import { addNotification } from "@/redux/slices/searchSlice";

export const useDiscoverFilters = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [resultsType, setResultsType] = useState<"centers" | "courses">("centers");
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    category: "all",
    subcategory: null,
    subcategories: [],
    location: "all",
    rating: "any",
    priceRange: [0, 1000],
    sort: "featured",
    features: [],
  });

  const { filteredCenters, applyFilters } = useFilteredCenters(filters);
  const { compareCourses, removeFromComparison, clearComparison } = useCourseComparison();
  const {
    compareCourses: courseComparisons,
    removeFromComparison: removeCourseFromComparison,
    clearComparison: clearCourseComparison,
  } = useCoursesComparison();
  
  const dispatch = useDispatch();

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      category: "all",
      subcategory: null,
      subcategories: [],
      location: "all",
      rating: "any",
      priceRange: [0, 1000],
      sort: "featured",
      features: [],
    });
  };

  // Mock function to show how alerts would be triggered when user searches
  const handleSearch = () => {
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      applyFilters();
      setIsLoading(false);

      // This is where you'd normally ask the user if they want to save the search
      // For demo purposes, we'll add a notification to show how alerts would look
      if (filters.searchQuery && Math.random() > 0.5) {
        setTimeout(() => {
          dispatch(
            addNotification({
              type: "new_course",
              title: "New search alert",
              message: `Would you like to save "${filters.searchQuery}" and get notified when new courses are available?`,
            })
          );
        }, 2000);
      }
    }, 1500);
  };

  // Initial loading effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return {
    viewMode,
    setViewMode,
    isLoading,
    resultsType,
    setResultsType,
    filters,
    handleFilterChange,
    clearFilters,
    handleSearch,
    filteredCenters,
    compareCourses,
    removeFromComparison,
    clearComparison,
    courseComparisons,
    removeCourseFromComparison,
    clearCourseComparison,
  };
};
