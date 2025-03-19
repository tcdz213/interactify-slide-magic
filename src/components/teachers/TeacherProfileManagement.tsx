
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { TeacherProfileHeader } from "./TeacherProfileHeader";
import { TeacherSpecialties } from "./TeacherSpecialties";
import { TeacherQualifications } from "./TeacherQualifications";
import { TeacherAvailability } from "./TeacherAvailability";
import { TeacherFeedback } from "./TeacherFeedback";
import { TeacherJobApplications } from "./TeacherJobApplications";

// Mock teacher profile data
const mockTeacherProfile = {
  id: 1,
  name: "Jane Smith",
  avatar: "",
  title: "Senior Web Development Instructor",
  bio: "Experienced web development instructor with 8+ years of teaching experience in JavaScript, React, and Node.js. I focus on practical, project-based learning for students of all levels.",
  specialties: ["JavaScript", "React", "Node.js", "Frontend Development", "Web Design"],
  experience: [
    { id: 1, role: "Senior Instructor", company: "Tech Training Hub", period: "2020 - Present", description: "Teaching advanced web development courses" },
    { id: 2, role: "Web Developer", company: "Digital Solutions Inc.", period: "2015 - 2020", description: "Full-stack development and mentoring junior developers" }
  ],
  education: [
    { id: 1, degree: "MSc Computer Science", institution: "Tech University", year: "2015" },
    { id: 2, degree: "BSc Software Engineering", institution: "State University", year: "2013" }
  ],
  certifications: [
    { id: 1, name: "Advanced React Development", issuer: "React Training Institute", year: "2021" },
    { id: 2, name: "AWS Certified Developer", issuer: "Amazon Web Services", year: "2020" },
    { id: 3, name: "Google Professional Web Developer", issuer: "Google", year: "2019" }
  ],
  availability: [
    { id: 1, day: "Monday", slots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"] },
    { id: 2, day: "Wednesday", slots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"] },
    { id: 3, day: "Friday", slots: ["9:00 AM - 12:00 PM"] }
  ],
  ratings: [
    { id: 1, rating: 4.8, review: "Excellent teacher, really helps you understand complex concepts", from: "John D.", date: "2023-06-15" },
    { id: 2, rating: 5.0, review: "Jane is the best instructor I've ever had. She makes learning fun!", from: "Sarah M.", date: "2023-04-22" }
  ],
  jobApplications: [
    { id: 1, center: "Digital Skills Academy", position: "React Instructor", status: "Applied", date: "2023-10-15" },
    { id: 2, center: "Learn Code Institute", position: "Senior JavaScript Trainer", status: "Interview", date: "2023-10-10" }
  ]
};

const TeacherProfileManagement = () => {
  const [profile, setProfile] = useState(mockTeacherProfile);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({...profile});
  const [newSpecialty, setNewSpecialty] = useState("");
  const [qualificationsEditMode, setQualificationsEditMode] = useState(false);
  const [availabilityEditMode, setAvailabilityEditMode] = useState(false);
  
  const { toast } = useToast();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const handleSaveProfile = () => {
    setProfile(editProfile);
    setEditMode(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };
  
  const handleAddSpecialty = () => {
    if (newSpecialty.trim()) {
      setEditProfile({
        ...editProfile,
        specialties: [...editProfile.specialties, newSpecialty]
      });
      setNewSpecialty("");
    }
  };
  
  const handleRemoveSpecialty = (index: number) => {
    const updatedSpecialties = [...editProfile.specialties];
    updatedSpecialties.splice(index, 1);
    setEditProfile({
      ...editProfile,
      specialties: updatedSpecialties
    });
  };

  const handleUpdateExperience = (updatedExperience: any[]) => {
    setProfile({
      ...profile,
      experience: updatedExperience
    });
    
    setQualificationsEditMode(false);
    toast({
      title: "Work experience updated",
      description: "Your experience details have been updated successfully.",
    });
  };
  
  const handleUpdateEducation = (updatedEducation: any[]) => {
    setProfile({
      ...profile,
      education: updatedEducation
    });
    
    toast({
      title: "Education updated",
      description: "Your education details have been updated successfully.",
    });
  };
  
  const handleUpdateCertifications = (updatedCertifications: any[]) => {
    setProfile({
      ...profile,
      certifications: updatedCertifications
    });
    
    toast({
      title: "Certifications updated",
      description: "Your certifications have been updated successfully.",
    });
  };
  
  const handleUpdateAvailability = (updatedAvailability: any[]) => {
    setProfile({
      ...profile,
      availability: updatedAvailability
    });
    
    setAvailabilityEditMode(false);
    toast({
      title: "Availability updated",
      description: "Your teaching availability has been updated successfully.",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teacher Profile</h2>
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel Editing" : "Edit Profile"}
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="applications">Job Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardContent className="pt-6">
              <TeacherProfileHeader 
                profile={profile}
                editMode={editMode}
                editProfile={editProfile}
                setEditProfile={setEditProfile}
                getInitials={getInitials}
              />
              
              <div className="mt-6">
                <TeacherSpecialties 
                  editMode={editMode}
                  specialties={editMode ? editProfile.specialties : profile.specialties}
                  onRemoveSpecialty={handleRemoveSpecialty}
                  newSpecialty={newSpecialty}
                  setNewSpecialty={setNewSpecialty}
                  onAddSpecialty={handleAddSpecialty}
                />
              </div>
              
              {editMode && (
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" /> Save Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="qualifications">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Qualifications</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setQualificationsEditMode(!qualificationsEditMode)}
                >
                  {qualificationsEditMode ? (
                    "Cancel"
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" /> Edit Qualifications
                    </>
                  )}
                </Button>
              </div>
              <TeacherQualifications 
                experience={profile.experience}
                education={profile.education}
                certifications={profile.certifications}
                editMode={qualificationsEditMode}
                onUpdateExperience={handleUpdateExperience}
                onUpdateEducation={handleUpdateEducation}
                onUpdateCertifications={handleUpdateCertifications}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="availability">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Teaching Availability</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setAvailabilityEditMode(!availabilityEditMode)}
                >
                  {availabilityEditMode ? (
                    "Cancel"
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" /> Edit Availability
                    </>
                  )}
                </Button>
              </div>
              <TeacherAvailability 
                availability={profile.availability} 
                editMode={availabilityEditMode}
                onUpdateAvailability={handleUpdateAvailability}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
          <Card>
            <CardContent className="pt-6">
              <TeacherFeedback ratings={profile.ratings} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardContent className="pt-6">
              <TeacherJobApplications applications={profile.jobApplications} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherProfileManagement;
