
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, Mail, Calendar, Award, Star } from "lucide-react";

interface Instructor {
  name: string;
  role: string;
  image: string;
  bio?: string;
  specialties?: string[];
  experience?: string;
  education?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  schedule?: string;
  certifications?: string[];
  rating?: number;
}

interface InstructorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor;
}

export function InstructorProfileModal({ 
  isOpen, 
  onClose, 
  instructor 
}: InstructorProfileModalProps) {
  // Get instructor initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Instructor Profile</DialogTitle>
          <DialogDescription>
            Learn more about this instructor's background and expertise.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={instructor.image} alt={instructor.name} />
              <AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>
            </Avatar>
            
            {instructor.rating && (
              <div className="flex items-center mt-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{instructor.rating} / 5</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{instructor.name}</h2>
            <p className="text-muted-foreground mb-4">{instructor.role}</p>
            
            {instructor.bio && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">About</h3>
                <p>{instructor.bio}</p>
              </div>
            )}
            
            {instructor.specialties && instructor.specialties.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((specialty, i) => (
                    <Badge key={i} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-6">
          {instructor.experience && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
              <p>{instructor.experience}</p>
            </div>
          )}
          
          {instructor.education && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Education</h3>
              <p>{instructor.education}</p>
            </div>
          )}
          
          {instructor.contact?.phone && (
            <div className="flex items-start space-x-2">
              <PhoneCall className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p>{instructor.contact.phone}</p>
              </div>
            </div>
          )}
          
          {instructor.contact?.email && (
            <div className="flex items-start space-x-2">
              <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{instructor.contact.email}</p>
              </div>
            </div>
          )}
          
          {instructor.schedule && (
            <div className="flex items-start space-x-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Schedule</h3>
                <p>{instructor.schedule}</p>
              </div>
            </div>
          )}
        </div>
        
        {instructor.certifications && instructor.certifications.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Certifications</h3>
            <div className="space-y-2">
              {instructor.certifications.map((cert, i) => (
                <div key={i} className="flex items-start">
                  <Award className="h-4 w-4 mt-0.5 mr-2 text-primary" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
