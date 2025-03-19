
import { useCentersRedux } from "@/hooks/useCentersRedux";
import type { Center } from "@/types/center.types";
import { filterCenters } from "@/redux/slices/centersSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useState, useEffect, useCallback } from "react";

export type { Center };

export const useCenters = (searchTerm: string) => {
  const centersData = useCentersRedux(searchTerm);
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // Initialize with search term
  useEffect(() => {
    if (searchTerm) {
      updateSearchResults(searchTerm, selectedCategory, selectedSubcategory);
    }
  }, [searchTerm]);
  
  // Update search results using the Redux filterCenters action
  const updateSearchResults = useCallback((
    term: string, 
    category: string | null = selectedCategory,
    subcategory: string | null = selectedSubcategory
  ) => {
    dispatch(filterCenters({ 
      filters: { 
        searchTerm: term,
        category,
        subcategory
      } 
    }));
  }, [dispatch, selectedCategory, selectedSubcategory]);
  
  // Handle category change
  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    // Reset subcategory when category changes
    setSelectedSubcategory(null);
    
    dispatch(filterCenters({ 
      filters: { 
        searchTerm: centersData.filters.searchTerm, 
        category,
        subcategory: null
      } 
    }));
  }, [centersData.filters.searchTerm, dispatch]);
  
  // Handle subcategory change
  const handleSubcategoryChange = useCallback((subcategory: string | null) => {
    setSelectedSubcategory(subcategory);
    
    dispatch(filterCenters({ 
      filters: { 
        searchTerm: centersData.filters.searchTerm, 
        category: selectedCategory,
        subcategory
      } 
    }));
  }, [centersData.filters.searchTerm, dispatch, selectedCategory]);
  
  return {
    ...centersData,
    selectedCategory,
    selectedSubcategory,
    updateSearchResults,
    handleCategoryChange,
    handleSubcategoryChange
  };
};
