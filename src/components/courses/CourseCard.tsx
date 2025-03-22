
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookingModal } from "@/components/BookingModal";
import CourseCardHeader from "./components/CourseCardHeader";
import CourseCardContent from "./components/CourseCardContent";
import CourseListView from "./components/CourseListView";
import CourseSkeleton from "./components/CourseSkeleton";

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

  if (viewMode === "grid") {
    return (
      <>
        <Card 
          className="overflow-hidden border-0 rounded-xl shadow-sm hover-card-effect cursor-pointer"
          onClick={() => handleViewCourseDetails(course.id)}
        >
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
        className="overflow-hidden border-0 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleViewCourseDetails(course.id)}
      >
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
