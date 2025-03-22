
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface CourseCardHeaderProps {
  image: string;
  name: string;
  category: string;
  featured: boolean;
  rating: number;
  onClick?: () => void;
}

const CourseCardHeader: React.FC<CourseCardHeaderProps> = ({
  image,
  name,
  category,
  featured,
  rating,
  onClick
}) => {
  return (
    <div className="relative h-48 overflow-hidden" onClick={onClick}>
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
      />
      {featured && (
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
          {category}
        </Badge>
        <div className="flex items-center bg-black/40 text-white text-sm px-2 py-1 rounded-md backdrop-blur-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
          <span>{rating}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCardHeader;
