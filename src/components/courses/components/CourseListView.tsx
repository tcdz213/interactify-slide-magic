
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ExternalLink, Calendar } from "lucide-react";

interface CourseListViewProps {
  course: {
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
  };
  onViewCenter: (e: React.MouseEvent, centerId: number) => void;
  onViewCourse: (e: React.MouseEvent) => void;
  onBookNow: (e: React.MouseEvent) => void;
}

const CourseListView: React.FC<CourseListViewProps> = ({
  course,
  onViewCenter,
  onViewCourse,
  onBookNow
}) => {
  return (
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
      </div>
      
      <div className="p-5 md:w-2/3 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-medium">{course.name}</h3>
              <div 
                className="flex items-center text-muted-foreground text-sm mt-1 hover:text-primary cursor-pointer"
                onClick={(e) => onViewCenter(e, course.centerId)}
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
        
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="group"
            onClick={onViewCourse}
          >
            <span>View Details</span>
            <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <Button
            className="group"
            onClick={onBookNow}
          >
            <span>Book Now</span>
            <Calendar className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseListView;
