
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, GraduationCap, ExternalLink } from "lucide-react";
import { useTeacherComparison } from "@/hooks/teachers/useTeacherComparison";
import { CompareButton } from "@/components/centers/card";

// Update the interface to match both the Teacher type and what's being passed to the component
interface TeacherBrowserCardProps {
  teacher: {
    id: number | string;
    name: string;
    image?: string;
    avatar?: string; // Support both image and avatar properties
    specialization?: string;
    role?: string; // Add role as optional since it's required by Teacher type
    subjects?: string[];
    specialties?: string[]; // Support both subjects and specialties
    experience: string;
    location: string;
    rating: number;
    availability: string;
    bio: string;
    reviewCount?: number;
    hourlyRate?: number;
  };
  onContactClick: (teacherId: number | string) => void;
}

export const TeacherBrowserCard = ({ teacher, onContactClick }: TeacherBrowserCardProps) => {
  const { addToComparison, removeFromComparison, isInComparison } = useTeacherComparison();
  const isCompared = isInComparison(teacher.id);

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(teacher.id);
    } else {
      // Convert the teacher to match the Teacher type expected by addToComparison
      const teacherForComparison = {
        id: teacher.id,
        name: teacher.name,
        role: teacher.role || teacher.specialization || "Teacher", // Use role or specialization, fallback to "Teacher"
        specialties: teacher.specialties || teacher.subjects || [],
        experience: teacher.experience,
        location: teacher.location,
        rating: teacher.rating,
        availability: teacher.availability,
        bio: teacher.bio,
        image: teacher.image || teacher.avatar,
        avatar: teacher.avatar || teacher.image,
        reviewCount: teacher.reviewCount,
        hourlyRate: teacher.hourlyRate,
        subjects: teacher.subjects || teacher.specialties || []
      };
      
      addToComparison(teacherForComparison);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 h-full">
            <img 
              src={teacher.image || teacher.avatar || "/placeholder.svg"} 
              alt={teacher.name} 
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
          
          <div className="p-5 md:w-3/4">
            <div className="flex flex-col md:flex-row justify-between mb-2">
              <h3 className="font-semibold text-lg">{teacher.name}</h3>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{teacher.rating}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-muted-foreground">
              <div className="flex items-center">
                <GraduationCap className="h-4 w-4 mr-1" />
                <span>{teacher.specialization || teacher.role || "Teacher"}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{teacher.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{teacher.availability}</span>
              </div>
            </div>
            
            <p className="mb-3 text-sm">{teacher.bio}</p>
            
            <div className="mb-3">
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">Expertise</h4>
              <div className="flex flex-wrap gap-1">
                {(teacher.subjects || teacher.specialties || []).map((subject, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">{teacher.experience} experience</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 p-3 flex justify-end gap-2">
        <CompareButton 
          isCompared={isCompared} 
          onToggle={handleToggleComparison} 
          showLabel={true}
        />
        <Button 
          onClick={() => onContactClick(teacher.id)} 
          size="sm"
          className="flex items-center"
        >
          Contact Teacher <ExternalLink className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};
