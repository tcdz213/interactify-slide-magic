
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Minus, Star, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface CourseComparisonTableProps {
  courses: Course[];
  onRemove: (courseId: number) => void;
  onClear: () => void;
}

const CourseComparisonTable: React.FC<CourseComparisonTableProps> = ({ 
  courses, 
  onRemove,
  onClear
}) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold mb-2">No courses to compare</h3>
        <p className="text-muted-foreground mb-6">
          Add courses to comparison by clicking the "Compare" button on course cards
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Course Comparison</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear}
          className="text-muted-foreground"
        >
          Clear All
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] bg-muted/50">Course Details</TableHead>
              {courses.map((course) => (
                <TableHead key={course.id} className="min-w-[200px]">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{course.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground" 
                        onClick={() => onRemove(course.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {course.category}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Training Center */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Training Center</TableCell>
              {courses.map((course) => (
                <TableCell key={`${course.id}-center`}>
                  {course.centerName}
                </TableCell>
              ))}
            </TableRow>

            {/* Location */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Location</TableCell>
              {courses.map((course) => (
                <TableCell key={`${course.id}-location`}>
                  {course.centerLocation}
                </TableCell>
              ))}
            </TableRow>

            {/* Duration */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Duration</TableCell>
              {courses.map((course) => (
                <TableCell key={`${course.id}-duration`}>
                  {course.duration}
                </TableCell>
              ))}
            </TableRow>

            {/* Price */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Price</TableCell>
              {courses.map((course) => (
                <TableCell key={`${course.id}-price`} className="font-semibold">
                  {course.price}
                </TableCell>
              ))}
            </TableRow>

            {/* Rating */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Rating</TableCell>
              {courses.map((course) => (
                <TableCell key={`${course.id}-rating`}>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                    <span className="text-muted-foreground text-xs">({course.reviews})</span>
                  </div>
                </TableCell>
              ))}
            </TableRow>

            {/* Featured */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">
                <div className="flex items-center gap-1">
                  Featured Course
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Featured courses are specially selected by our team for their quality and popularity
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
              {courses.map((course) => (
                <TableCell key={`${course.id}-featured`}>
                  {course.featured ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Minus className="h-5 w-5 text-gray-300" />
                  )}
                </TableCell>
              ))}
            </TableRow>

            {/* Description */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Description</TableCell>
              {courses.map((course) => (
                <TableCell key={`${course.id}-description`} className="max-w-[300px]">
                  <p className="line-clamp-3 text-sm">{course.description}</p>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseComparisonTable;
