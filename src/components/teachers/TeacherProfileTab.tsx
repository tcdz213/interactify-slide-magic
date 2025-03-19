
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, GraduationCap, Star } from "lucide-react";

export const TeacherProfileTab = () => {
  const [hasProfile, setHasProfile] = useState(false);
  
  // Example profile data
  const exampleProfile = {
    name: "John Peterson",
    title: "Web Development Instructor",
    specialization: "Frontend Development",
    subjects: ["JavaScript", "React", "HTML/CSS", "UI/UX Design"],
    experience: "5+ years",
    location: "New York, NY",
    rating: 4.8,
    availability: "Weekdays & Evenings",
    bio: "Passionate web developer with extensive teaching experience. I specialize in modern JavaScript frameworks and enjoy helping students build real-world projects.",
    avatar: "/placeholder.svg"
  };
  
  const toggleProfile = () => {
    setHasProfile(!hasProfile);
  };

  if (hasProfile) {
    return (
      <Card className="p-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Teaching Profile</CardTitle>
          <Button variant="outline" onClick={toggleProfile}>
            View Empty Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <Avatar className="h-32 w-32 mx-auto">
                <AvatarImage src={exampleProfile.avatar} alt={exampleProfile.name} />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="md:w-3/4">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{exampleProfile.name}</h3>
                <p className="text-muted-foreground">{exampleProfile.title}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  <span>{exampleProfile.specialization}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{exampleProfile.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{exampleProfile.availability}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{exampleProfile.rating}</span>
                </div>
              </div>
              
              <p className="mb-4">{exampleProfile.bio}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium uppercase text-muted-foreground mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {exampleProfile.subjects.map((subject, idx) => (
                    <Badge key={idx} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button asChild>
                  <Link to="/teacher-job-listings">
                    Find Teaching Jobs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Your Teaching Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold mb-2">Create Your Teaching Profile</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Complete your profile to apply for teaching positions and be discovered by training centers
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg">
              <Link to="/teacher-job-post">
                Create Teaching Profile
              </Link>
            </Button>
            <Button variant="outline" onClick={toggleProfile}>
              View Example Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
