
import { useState } from "react";
import { Star, GraduationCap, Clock, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InstructorProfileModal } from "../InstructorProfileModal";

export type Teacher = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  specialties: string[];
  experience: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: string;
  bio?: string;
  education?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  schedule?: string;
  certifications?: string[];
};

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const [showModal, setShowModal] = useState(false);

  // Get teacher initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const instructor = {
    name: teacher.name,
    role: teacher.role,
    image: teacher.avatar,
    bio: teacher.bio,
    specialties: teacher.specialties,
    experience: teacher.experience,
    education: teacher.education,
    contact: teacher.contact,
    schedule: teacher.schedule,
    certifications: teacher.certifications,
    rating: teacher.rating
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={teacher.avatar} alt={teacher.name} />
              <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{teacher.name}</h3>
                  <p className="text-muted-foreground text-sm">{teacher.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{teacher.rating}</span>
                  <span className="text-muted-foreground text-sm">({teacher.reviewCount})</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {teacher.specialties.slice(0, 3).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    {specialty}
                  </Badge>
                ))}
                {teacher.specialties.length > 3 && (
                  <Badge variant="outline" className="font-normal">
                    +{teacher.specialties.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.experience}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.availability}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="font-semibold">${teacher.hourlyRate}</span>
                  <span className="text-muted-foreground text-sm"> /hour</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowModal(true)}
                  >
                    View Profile
                  </Button>
                  <Button size="sm">Contact Teacher</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <InstructorProfileModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        instructor={instructor}
      />
    </>
  );
}
