
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { LearnerProfileHeader } from "./LearnerProfileHeader";
import { LearnerCourses } from "./LearnerCourses";
import { LearnerProgress } from "./LearnerProgress";

// Mock learner profile data
const mockLearnerProfile = {
  id: 1,
  name: "Alex Johnson",
  avatar: "",
  email: "alex.johnson@example.com",
  bio: "Passionate about learning new technologies and skills. Currently focused on web development and digital marketing.",
  interests: ["Web Development", "Digital Marketing", "UI/UX Design"],
  enrolledCourses: [
    { id: 1, name: "Web Development Fundamentals", progress: 75, lastAccessed: "2024-03-15" },
    { id: 2, name: "Digital Marketing Basics", progress: 45, lastAccessed: "2024-03-14" }
  ],
  achievements: [
    { id: 1, name: "Quick Learner", description: "Completed 5 courses in first month", date: "2024-02-15" },
    { id: 2, name: "Perfect Score", description: "100% on Web Dev Basics final test", date: "2024-03-01" }
  ]
};

const LearnerProfileManagement = () => {
  const [profile, setProfile] = useState(mockLearnerProfile);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({...profile});
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Learner Profile</h2>
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? (
            "Cancel Editing"
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" /> Edit Profile
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="progress">Learning Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardContent className="pt-6">
              <LearnerProfileHeader 
                profile={profile}
                editMode={editMode}
                editProfile={editProfile}
                setEditProfile={setEditProfile}
                getInitials={getInitials}
              />
              
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
        
        <TabsContent value="courses">
          <Card>
            <CardContent className="pt-6">
              <LearnerCourses 
                courses={profile.enrolledCourses}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <Card>
            <CardContent className="pt-6">
              <LearnerProgress 
                courses={profile.enrolledCourses}
                achievements={profile.achievements}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearnerProfileManagement;
