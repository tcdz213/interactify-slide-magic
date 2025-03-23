import React, { useState, useEffect } from 'react';
import { coursesData } from './coursesData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import FilterBar from "@/components/filters/FilterBar";
import { FilterState, availableFeatures } from "@/components/filters/types";
import CoursesList from "./CoursesList";
import { FavoritesTab } from '@/components/courses';
import { cn } from "@/lib/utils";
import { Grid2X2, List } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CoursesListWithFiltersProps {
  initialTab?: string;
  className?: string;
}

const CoursesListWithFilters: React.FC<CoursesListWithFiltersProps> = ({ 
  initialTab = "all",
  className 
}) => {
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
  const [filteredCourses, setFilteredCourses] = useState(coursesData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    applyFilters();
  }, []);

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
      let results = [...coursesData];

      if (filters.searchQuery) {
        results = results.filter((course) =>
          course.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
        );
      }

      if (filters.category !== "all") {
        results = results.filter((course) => course.category === filters.category);
      }

      if (filters.location !== "all") {
        results = results.filter((course) =>
          course.centerLocation.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      setFilteredCourses(results);
      setIsLoading(false);
    }, 500);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Add state for view mode (grid or list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Function to toggle view mode
  const toggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs defaultValue={initialTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList className="h-auto p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Courses</TabsTrigger>
            <TabsTrigger value="popular" className="text-xs sm:text-sm">Popular</TabsTrigger>
            <TabsTrigger value="new" className="text-xs sm:text-sm">New</TabsTrigger>
            <TabsTrigger value="recommended" className="text-xs sm:text-sm">Recommended</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs sm:text-sm">Favorites</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              className="h-8 w-8 p-0"
              onClick={() => toggleViewMode('grid')}
            >
              <Grid2X2 className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              className="h-8 w-8 p-0"
              onClick={() => toggleViewMode('list')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>
        
        <Separator className="mb-4" />
        
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={applyFilters}
          totalResults={filteredCourses.length}
          activeTab={initialTab}
        />
        
        <TabsContent value="all" className="mt-6">
          <CoursesList 
            isLoading={isLoading} 
            viewMode={viewMode} 
          />
        </TabsContent>
        
        <TabsContent value="popular" className="mt-6">
          <CoursesList 
            filterCategory="popular" 
            isLoading={isLoading} 
            viewMode={viewMode} 
          />
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <CoursesList 
            filterCategory="new" 
            isLoading={isLoading} 
            viewMode={viewMode} 
          />
        </TabsContent>
        
        <TabsContent value="recommended" className="mt-6">
          <CoursesList 
            filterCategory="recommended" 
            isLoading={isLoading} 
            viewMode={viewMode} 
          />
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          <FavoritesTab viewMode={viewMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoursesListWithFilters;
