
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import { TeacherProfileTab, TeacherJobListingsTab } from "@/components/teachers";
import { mockJobListings } from "@/components/center-owner/teacher-jobs/mockData";

const TeacherJobPost = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [filters, setFilters] = useState({
    location: "all",
    specialization: "all",
    experience: "all",
    jobType: "all"
  });
  
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  // Mock filtered jobs - in a real app, this would filter based on the filters state
  const filteredJobs = mockJobListings;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Teaching Opportunities</h1>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
              <TabsTrigger value="applications">My Applications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <TeacherProfileTab />
            </TabsContent>
            
            <TabsContent value="browse" className="mt-6">
              <TeacherJobListingsTab 
                filteredJobs={filteredJobs}
                handleFilterChange={handleFilterChange}
              />
            </TabsContent>
            
            <TabsContent value="applications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">My Job Applications</h2>
                  <p className="text-muted-foreground">
                    You haven't applied to any teaching positions yet. Browse available jobs to start applying.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Sponsors />
      <Footer />
    </div>
  );
};

export default TeacherJobPost;
