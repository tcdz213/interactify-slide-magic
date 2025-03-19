
import React, { useState } from "react";
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import UserProfileManagement from "@/components/users/UserProfileManagement";
import TeacherProfileManagement from "@/components/teachers/TeacherProfileManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// In a real app, this would come from a user context/auth
const mockUserRole = {
  isStudent: true,
  isTeacher: true // Set to true to see both tabs
};

const ProfilePage = () => {
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>(
    mockUserRole.isTeacher ? 'teacher' : 'student'
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          
          {mockUserRole.isStudent && mockUserRole.isTeacher ? (
            <Tabs 
              defaultValue={activeRole} 
              className="w-full mb-6"
              onValueChange={(value) => setActiveRole(value as 'student' | 'teacher')}
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="student">Student Profile</TabsTrigger>
                <TabsTrigger value="teacher">Teacher Profile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="student" className="mt-6">
                <UserProfileManagement />
              </TabsContent>
              
              <TabsContent value="teacher" className="mt-6">
                <TeacherProfileManagement />
              </TabsContent>
            </Tabs>
          ) : mockUserRole.isTeacher ? (
            <TeacherProfileManagement />
          ) : (
            <UserProfileManagement />
          )}
        </div>
      </main>
      
      <Sponsors />
      <Footer />
    </div>
  );
};

export default ProfilePage;
