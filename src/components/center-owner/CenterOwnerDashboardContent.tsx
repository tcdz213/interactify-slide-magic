
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardOverview from "./DashboardOverview";
import CentersManagement from "./CentersManagement";
import CoursesManagement from "./CoursesManagement";
import BookingsManagement from "./BookingsManagement";
import AnalyticsPanel from "./AnalyticsPanel";
import CenterOwnerProfile from "./CenterOwnerProfile";
import { TeacherJobManagement } from "./teacher-jobs";
import { LayoutGrid, Building2, BookOpen, Calendar, LineChart, UserCircle, Briefcase } from "lucide-react";

const CenterOwnerDashboardContent = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Center Owner Dashboard</h1>
      
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="centers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden md:inline">Centers</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden md:inline">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden md:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <DashboardOverview />
        </TabsContent>
        
        <TabsContent value="centers" className="mt-6">
          <CentersManagement />
        </TabsContent>
        
        <TabsContent value="courses" className="mt-6">
          <CoursesManagement />
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-6">
          <BookingsManagement />
        </TabsContent>
        
        <TabsContent value="jobs" className="mt-6">
          <TeacherJobManagement />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsPanel />
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <CenterOwnerProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CenterOwnerDashboardContent;
