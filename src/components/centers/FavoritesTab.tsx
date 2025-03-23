
import React, { useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCoursesWishlist } from '@/hooks/useCoursesWishlist';
import { centersData } from './centersData';
import { coursesData } from '@/components/courses/coursesData';
import CenterCard from './CenterCard';
import CourseCard from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import { HeartOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FavoritesTabProps {
  viewMode: 'grid' | 'list';
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ viewMode }) => {
  const { favorites, clearAllFavorites } = useWishlist();
  const { favorites: courseFavorites, clearAllFavorites: clearAllCourseFavorites } = useCoursesWishlist();
  const [activeTab, setActiveTab] = useState<string>("centers");
  
  // Filter centers that are in favorites
  const favoritesCenters = centersData.filter(center => 
    favorites.includes(center.id)
  );

  // Filter courses that are in favorites
  const favoritesCourses = coursesData.filter(course => 
    courseFavorites.includes(course.id)
  );

  const renderEmptyState = (type: 'centers' | 'courses') => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <HeartOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No favorite {type} yet</h3>
      <p className="text-muted-foreground mb-4">
        Start saving {type} you're interested in by clicking the heart icon.
      </p>
    </div>
  );

  return (
    <div>
      <Tabs defaultValue="centers" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="centers" className="relative">
              Training Centers
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="courses" className="relative">
              Courses
              {courseFavorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {courseFavorites.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "centers" && favoritesCenters.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFavorites}>
              Clear All Centers
            </Button>
          )}
          
          {activeTab === "courses" && favoritesCourses.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllCourseFavorites}>
              Clear All Courses
            </Button>
          )}
        </div>
        
        <TabsContent value="centers">
          {favoritesCenters.length === 0 ? (
            renderEmptyState('centers')
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritesCenters.map((center) => (
                <CenterCard key={center.id} center={center} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {favoritesCenters.map((center) => (
                <CenterCard key={center.id} center={center} viewMode="list" />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="courses">
          {favoritesCourses.length === 0 ? (
            renderEmptyState('courses')
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritesCourses.map((course) => (
                <CourseCard key={course.id} course={course} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {favoritesCourses.map((course) => (
                <CourseCard key={course.id} course={course} viewMode="list" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FavoritesTab;
