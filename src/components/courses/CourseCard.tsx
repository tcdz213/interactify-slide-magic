
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ExternalLink, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { BookingModal } from "@/components/BookingModal";
import { useCourseComparison } from "@/hooks/courses";
import CompareButton from "./CompareButton";
import ShareButton from "./ShareButton";
import FavoriteButton from "./FavoriteButton";
import { useCourseWishlist } from "@/hooks/courses/useCourseWishlist";

// Define the Course type with minimal required properties
interface Course {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  duration: string;
  image: string;
  price: string;
  featured: boolean;
  description: string;
  centerId: number;
  centerName: string;
  centerLocation: string;
}

interface CourseCardProps {
  course: Course;
  viewMode: "grid" | "list";
  isLoading?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  viewMode,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { addToComparison, removeFromComparison, isInComparison } = useCourseComparison();
  const { isFavorite, toggleFavoriteItem } = useCourseWishlist();
  const isCompared = isInComparison(course.id);
  const isInFavorites = isFavorite(course.id);
  const [isToggling, setIsToggling] = useState(false);

  // Show skeleton if loading
  if (isLoading) {
    return <CourseSkeleton viewMode={viewMode} />;
  }

  const handleViewCourseDetails = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const handleViewCenterDetails = (e: React.MouseEvent, centerId: number) => {
    e.stopPropagation();
    navigate(`/center/${centerId}`);
    toast(`Viewing details for center #${centerId}`);
  };
  
  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookingModalOpen(true);
  };

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(course.id);
    } else {
      addToComparison(course);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);

    try {
      // Simulate network delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 300));
      toggleFavoriteItem(course.id, course.name);
    } catch (err) {
      toast.error("Failed to update favorites");
    } finally {
      setIsToggling(false);
    }
  };

  if (viewMode === "grid") {
    return (
      <>
        <Card 
          className="overflow-hidden border-0 rounded-xl shadow-sm hover-card-effect cursor-pointer"
          onClick={() => handleViewCourseDetails(course.id)}
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={course.image}
              alt={course.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
            {course.featured && (
              <Badge className="absolute top-3 left-3 bg-primary text-white">
                Featured
              </Badge>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
              <Badge
                variant="outline"
                className="bg-black/40 text-white border-none backdrop-blur-sm"
              >
                {course.category}
              </Badge>
              <div className="flex items-center bg-black/40 text-white text-sm px-2 py-1 rounded-md backdrop-blur-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{course.rating}</span>
              </div>
            </div>
            <div className="absolute top-3 right-3 z-10 flex space-x-2">
              <FavoriteButton
                isFavorite={isInFavorites}
                onToggle={handleToggleFavorite}
                isToggling={isToggling}
                showLabel={false}
                className="bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm"
              />
              <ShareButton
                courseId={course.id}
                courseName={course.name}
                showLabel={false}
                className="bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm"
              />
              <CompareButton
                isCompared={isCompared}
                onToggle={handleToggleComparison}
                showLabel={false}
                className="bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm"
              />
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2 line-clamp-1">{course.name}</h3>
            
            <div 
              className="flex items-center text-muted-foreground text-sm mb-3 hover:text-primary cursor-pointer"
              onClick={(e) => handleViewCenterDetails(e, course.centerId)}
            >
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{course.centerName} - {course.centerLocation}</span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{course.duration}</span>
              </div>
              <div className="text-primary font-medium">{course.price}</div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-1/2 group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCourseDetails(course.id);
                }}
              >
                <span>Details</span>
                <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button
                className="w-1/2 group"
                onClick={handleBookNow}
              >
                <span>Book</span>
                <Calendar className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          centerName={course.centerName}
          courses={[
            {
              name: course.name,
              price: course.price,
              duration: course.duration
            }
          ]}
        />
      </>
    );
  }

  return (
    <>
      <Card
        className="overflow-hidden border-0 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleViewCourseDetails(course.id)}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
            <img
              src={course.image}
              alt={course.name}
              className="w-full h-full object-cover"
            />
            {course.featured && (
              <Badge className="absolute top-3 left-3 bg-primary text-white">
                Featured
              </Badge>
            )}
            <div className="absolute top-3 right-3 flex space-x-2">
              <FavoriteButton
                isFavorite={isInFavorites}
                onToggle={handleToggleFavorite}
                isToggling={isToggling}
                showLabel={false}
                className="bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm"
              />
              <ShareButton
                courseId={course.id}
                courseName={course.name}
                showLabel={false}
                className="bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm"
              />
              <CompareButton
                isCompared={isCompared}
                onToggle={handleToggleComparison}
                showLabel={false}
                className="bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm"
              />
            </div>
          </div>
          
          <div className="p-5 md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-medium">{course.name}</h3>
                  <div 
                    className="flex items-center text-muted-foreground text-sm mt-1 hover:text-primary cursor-pointer"
                    onClick={(e) => handleViewCenterDetails(e, course.centerId)}
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{course.centerName} - {course.centerLocation}</span>
                    <Badge variant="outline" className="ml-3 bg-primary/5">
                      {course.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center bg-primary/5 text-primary text-sm px-2 py-1 rounded-md">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>
                    {course.rating} ({course.reviews} reviews)
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground mt-3 mb-4 line-clamp-2">{course.description}</p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{course.duration}</span>
              </div>
              <div className="text-primary font-medium text-lg">{course.price}</div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <ShareButton
                courseId={course.id}
                courseName={course.name}
                size="default"
              />
              <CompareButton
                isCompared={isCompared}
                onToggle={handleToggleComparison}
                size="default"
              />
              
              <Button
                variant="outline"
                className="group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCourseDetails(course.id);
                }}
              >
                <span>View Details</span>
                <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button
                className="group"
                onClick={handleBookNow}
              >
                <span>Book Now</span>
                <Calendar className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        centerName={course.centerName}
        courses={[
          {
            name: course.name,
            price: course.price,
            duration: course.duration
          }
        ]}
      />
    </>
  );
};

// Skeleton loader for course cards
const CourseSkeleton: React.FC<{viewMode: 'grid' | 'list'}> = ({ viewMode }) => {
  return (
    <Card className="overflow-hidden border-0 rounded-xl shadow-sm">
      {viewMode === 'grid' ? (
        <div className="animate-pulse">
          <div className="h-48 bg-muted"></div>
          <div className="p-4">
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-muted rounded w-full mb-3"></div>
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-9 bg-muted rounded"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row animate-pulse">
          <div className="md:w-1/3 h-48 md:h-auto bg-muted"></div>
          <div className="p-5 md:w-2/3">
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-9 bg-muted rounded w-1/3"></div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CourseCard;
