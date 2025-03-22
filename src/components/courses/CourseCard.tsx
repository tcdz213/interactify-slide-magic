
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookingModal } from "@/components/BookingModal";
import CourseCardHeader from "./components/CourseCardHeader";
import CourseCardContent from "./components/CourseCardContent";
import CourseListView from "./components/CourseListView";
import CourseSkeleton from "./components/CourseSkeleton";
import CompareButtonCourse from "./components/CompareButtonCourse";
import { useCourseComparison } from "@/hooks/centers/useCourseComparison";
import { Center } from "@/types/center.types";

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

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Convert Course to Center format for comparison
    const centerFormatCourse: Center = {
      id: course.id,
      name: course.name,
      location: course.centerLocation,
      status: "active", // Default value
      verified: true, // Default value
      description: course.description,
      category: course.category,
      image: course.image,
      featured: course.featured,
      rating: course.rating,
      reviews: course.reviews,
      price: course.price,
      currency: "USD", // Default value
      features: [] // Default empty features
    };
    
    if (isInComparison(course.id)) {
      removeFromComparison(course.id);
    } else {
      addToComparison(centerFormatCourse);
    }
  };

  if (viewMode === "grid") {
    return (
      <>
        <Card 
          className="overflow-hidden border-0 rounded-xl shadow-sm hover-card-effect cursor-pointer relative"
          onClick={() => handleViewCourseDetails(course.id)}
        >
          <div className="absolute top-3 right-3 z-10">
            <CompareButtonCourse
              isCompared={isInComparison(course.id)}
              onToggle={handleToggleCompare}
              showLabel={false}
              size="sm"
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm border-none"
            />
          </div>
          
          <CourseCardHeader 
            image={course.image}
            name={course.name}
            category={course.category}
            featured={course.featured}
            rating={course.rating}
          />

          <CourseCardContent 
            name={course.name}
            centerName={course.centerName}
            centerLocation={course.centerLocation}
            centerId={course.centerId}
            duration={course.duration}
            price={course.price}
            courseId={course.id}
            onViewCenter={handleViewCenterDetails}
            onViewCourse={(e) => {
              e.stopPropagation();
              handleViewCourseDetails(course.id);
            }}
            onBookNow={handleBookNow}
          />
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
        className="overflow-hidden border-0 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
        onClick={() => handleViewCourseDetails(course.id)}
      >
        <div className="absolute top-3 right-3 z-10">
          <CompareButtonCourse
            isCompared={isInComparison(course.id)}
            onToggle={handleToggleCompare}
            showLabel={true}
            size="sm"
          />
        </div>
        
        <CourseListView 
          course={course}
          onViewCenter={handleViewCenterDetails}
          onViewCourse={(e) => {
            e.stopPropagation();
            handleViewCourseDetails(course.id);
          }}
          onBookNow={handleBookNow}
        />
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

export default CourseCard;
