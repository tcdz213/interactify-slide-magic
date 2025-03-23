
import React from 'react';
import { useCourseWishlist } from '@/hooks/courses/useCourseWishlist';
import { useWishlist } from '@/hooks/useWishlist';
import { coursesData } from './coursesData';
import CourseCard from './CourseCard';
import { centersData } from '../centers/centersData';
import CenterCard from '../centers/CenterCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeartOff } from 'lucide-react';

interface FavoritesTabProps {
  viewMode: 'grid' | 'list';
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ viewMode }) => {
  const { favorites: courseFavorites, clearAllFavorites: clearAllCourseFavorites } = useCourseWishlist();
  const { favorites: centerFavorites, clearAllFavorites: clearAllCenterFavorites } = useWishlist();
  
  // Filter courses that are in favorites
  const favoritesCourses = coursesData.filter(course => 
    courseFavorites.includes(course.id)
  );

  // Filter centers that are in favorites
  const favoritesCenters = centersData.filter(center => 
    centerFavorites.includes(center.id)
  );

  const hasFavorites = favoritesCourses.length > 0 || favoritesCenters.length > 0;
  
  if (!hasFavorites) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <HeartOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
        <p className="text-muted-foreground mb-4">
          Start saving items you're interested in by clicking the heart icon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue={favoritesCourses.length > 0 ? "courses" : "centers"} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="courses" disabled={favoritesCourses.length === 0}>
              Courses ({favoritesCourses.length})
            </TabsTrigger>
            <TabsTrigger value="centers" disabled={favoritesCenters.length === 0}>
              Centers ({favoritesCenters.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            {favoritesCourses.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllCourseFavorites}
                className="text-xs"
              >
                Clear Course Favorites
              </Button>
            )}
            {favoritesCenters.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllCenterFavorites}
                className="text-xs"
              >
                Clear Center Favorites
              </Button>
            )}
          </div>
        </div>
        
        <TabsContent value="courses">
          {favoritesCourses.length > 0 ? (
            viewMode === "grid" ? (
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
            )
          ) : (
            <div className="text-center py-8">
              <p>No favorite courses yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="centers">
          {favoritesCenters.length > 0 ? (
            viewMode === "grid" ? (
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
            )
          ) : (
            <div className="text-center py-8">
              <p>No favorite centers yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FavoritesTab;
