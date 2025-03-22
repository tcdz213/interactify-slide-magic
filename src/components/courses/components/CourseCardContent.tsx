
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ExternalLink, Calendar } from "lucide-react";

interface CourseCardContentProps {
  name: string;
  centerName: string;
  centerLocation: string;
  centerId: number;
  duration: string;
  price: string;
  courseId: number;
  onViewCenter: (e: React.MouseEvent, centerId: number) => void;
  onViewCourse: (e: React.MouseEvent) => void;
  onBookNow: (e: React.MouseEvent) => void;
}

const CourseCardContent: React.FC<CourseCardContentProps> = ({
  name,
  centerName,
  centerLocation,
  centerId,
  duration,
  price,
  courseId,
  onViewCenter,
  onViewCourse,
  onBookNow
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2 line-clamp-1">{name}</h3>
      
      <div 
        className="flex items-center text-muted-foreground text-sm mb-3 hover:text-primary cursor-pointer"
        onClick={(e) => onViewCenter(e, centerId)}
      >
        <MapPin className="h-3.5 w-3.5 mr-1" />
        <span>{centerName} - {centerLocation}</span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{duration}</span>
        </div>
        <div className="text-primary font-medium">{price}</div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="w-1/2 group"
          onClick={onViewCourse}
        >
          <span>Details</span>
          <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
        
        <Button
          className="w-1/2 group"
          onClick={onBookNow}
        >
          <span>Book</span>
          <Calendar className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default CourseCardContent;
