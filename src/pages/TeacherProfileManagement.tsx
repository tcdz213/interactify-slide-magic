
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { FileEdit, ArrowLeft, Briefcase } from "lucide-react";
import { TeacherProfileHeader } from "@/components/teachers/TeacherProfileHeader";
import { TeacherQualifications } from "@/components/teachers/TeacherQualifications";
import { TeacherSpecialties } from "@/components/teachers/TeacherSpecialties";
import { TeacherAvailability } from "@/components/teachers/TeacherAvailability";
import { TeacherFeedback } from "@/components/teachers/TeacherFeedback";
import { TeacherJobApplications } from "@/components/teachers/TeacherJobApplications";

// Mock data for job applications
const mockJobApplications = [
  {
    id: 1,
    center: "Tech Training Hub",
    position: "Programming Instructor",
    status: "Applied",
    date: "2024-03-15"
  },
  {
    id: 2,
    center: "Language Academy",
    position: "English Teacher",
    status: "Interviewed",
    date: "2024-03-10"
  },
  {
    id: 3,
    center: "Creative Arts Workshop",
    position: "Art Instructor",
    status: "Rejected",
    date: "2024-03-01"
  }
];

// Mock profile data with the correct structure for TeacherQualifications component
const mockTeacherProfile = {
  name: "Jane Smith",
  title: "Certified Math and Science Teacher",
  bio: "Passionate educator with 10+ years of experience teaching mathematics and science to students of all ages.",
  avatar: "/placeholder.svg",
  specialties: ["Mathematics", "Physics", "Chemistry", "Computer Science"],
  // Updated to match the Experience[] type
  experience: [
    { 
      id: 1, 
      role: "Senior Math Teacher", 
      company: "Lincoln High School", 
      period: "2018-Present",
      description: "Teaching advanced mathematics to high school students."
    },
    { 
      id: 2, 
      role: "Science Teacher", 
      company: "Washington Middle School", 
      period: "2015-2018",
      description: "Teaching physics and chemistry to middle school students."
    },
    { 
      id: 3, 
      role: "Math Tutor", 
      company: "Education First", 
      period: "2012-2015",
      description: "One-on-one tutoring in mathematics for students of all levels."
    }
  ],
  // Updated to match the Education[] type
  education: [
    { 
      id: 1, 
      degree: "Master of Education", 
      institution: "State University", 
      year: "2014" 
    },
    { 
      id: 2, 
      degree: "Bachelor of Science in Mathematics", 
      institution: "City College", 
      year: "2010" 
    }
  ],
  // Updated to match the Certification[] type
  certifications: [
    { 
      id: 1, 
      name: "Teaching Certification", 
      issuer: "State Board of Education", 
      year: "2012" 
    },
    { 
      id: 2, 
      name: "Advanced Mathematics Instruction", 
      issuer: "Mathematics Association", 
      year: "2016" 
    }
  ],
  // Updated to match the Availability[] type
  availability: [
    { 
      id: 1, 
      day: "Monday", 
      slots: ["9:00 AM - 12:00 PM", "1:00 PM - 5:00 PM"] 
    },
    { 
      id: 2, 
      day: "Tuesday", 
      slots: ["9:00 AM - 12:00 PM", "1:00 PM - 5:00 PM"] 
    },
    { 
      id: 3, 
      day: "Wednesday", 
      slots: ["1:00 PM - 5:00 PM", "6:00 PM - 8:00 PM"] 
    },
    { 
      id: 4, 
      day: "Thursday", 
      slots: ["9:00 AM - 12:00 PM"] 
    },
    { 
      id: 5, 
      day: "Friday", 
      slots: ["9:00 AM - 12:00 PM", "1:00 PM - 5:00 PM"] 
    }
  ],
  // Updated to match the Rating[] type
  ratings: [
    { 
      id: 1, 
      rating: 5, 
      review: "Excellent teaching methods. Really helped improve my understanding of calculus.", 
      from: "Sarah Johnson", 
      date: "2023-10-15" 
    },
    { 
      id: 2, 
      rating: 4, 
      review: "Very knowledgeable and patient teacher.", 
      from: "Michael Brown", 
      date: "2023-09-22" 
    },
    { 
      id: 3, 
      rating: 5, 
      review: "Highly recommend! Great at explaining complex concepts.", 
      from: "Emily Davis", 
      date: "2023-08-10" 
    }
  ]
};

const TeacherProfileManagement = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(mockTeacherProfile);
  const [specialties, setSpecialties] = useState(mockTeacherProfile.specialties);
  const [newSpecialty, setNewSpecialty] = useState("");
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };
  
  const handleRemoveSpecialty = (index: number) => {
    const updatedSpecialties = [...specialties];
    updatedSpecialties.splice(index, 1);
    setSpecialties(updatedSpecialties);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" asChild size="sm">
              <Link to="/" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/teacher-job-listings" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Find Teaching Jobs
                </Link>
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="profile" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="applications">Job Applications</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="flex justify-end mb-4">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setEditMode(!editMode)}>
                  <FileEdit className="h-4 w-4" />
                  {editMode ? "Save Profile" : "Edit Profile"}
                </Button>
              </div>
              
              <div className="space-y-8">
                <TeacherProfileHeader 
                  profile={mockTeacherProfile} 
                  editMode={editMode} 
                  editProfile={editProfile} 
                  setEditProfile={setEditProfile}
                  getInitials={getInitials}
                />
                <TeacherQualifications 
                  experience={mockTeacherProfile.experience}
                  education={mockTeacherProfile.education}
                  certifications={mockTeacherProfile.certifications}
                  editMode={editMode}
                />
                <TeacherSpecialties 
                  editMode={editMode}
                  specialties={specialties}
                  onRemoveSpecialty={handleRemoveSpecialty}
                  newSpecialty={newSpecialty}
                  setNewSpecialty={setNewSpecialty}
                  onAddSpecialty={handleAddSpecialty}
                />
                <TeacherAvailability 
                  availability={mockTeacherProfile.availability}
                  editMode={editMode}
                  onUpdateAvailability={() => {}}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="applications">
              <TeacherJobApplications applications={mockJobApplications} />
            </TabsContent>
            
            <TabsContent value="feedback">
              <TeacherFeedback ratings={mockTeacherProfile.ratings} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeacherProfileManagement;
