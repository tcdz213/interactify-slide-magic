
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, GraduationCap } from "lucide-react";

interface TeacherBrowserCardProps {
  teacher: {
    id: number;
    name: string;
    image: string;
    specialization: string;
    subjects: string[];
    experience: string;
    location: string;
    rating: number;
    availability: string;
    bio: string;
  };
  onContactClick: (teacherId: number) => void;
}

export const TeacherBrowserCard = ({ teacher, onContactClick }: TeacherBrowserCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 h-full">
            <img 
              src={teacher.image} 
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
                <span>{teacher.specialization}</span>
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
                {teacher.subjects.map((subject, idx) => (
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
      
      <CardFooter className="bg-muted/30 p-3 flex justify-end">
        <Button onClick={() => onContactClick(teacher.id)} size="sm">
          Contact Teacher
        </Button>
      </CardFooter>
    </Card>
  );
};
