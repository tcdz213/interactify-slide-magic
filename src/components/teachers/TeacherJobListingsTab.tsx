
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TeacherJobCard } from "./TeacherJobCard";
import { TeacherJobListingFilter } from "./TeacherJobListingFilter";
import JobComparisonTable from "./JobComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SplitSquareVertical, List } from "lucide-react";

interface TeacherJob {
  id: number;
  title: string;
  location: string;
  specialization: string;
  experience: string;
  postedDate: string;
  image: string;
  centerName: string;
  salary: string;
  description: string;
}

interface TeacherJobListingsTabProps {
  filteredJobs: TeacherJob[];
  handleFilterChange: (filters: any) => void;
}

export const TeacherJobListingsTab = ({ filteredJobs, handleFilterChange }: TeacherJobListingsTabProps) => {
  const [activeTab, setActiveTab] = useState("listings");

  return (
    <>
      <Tabs defaultValue="listings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Job Listings
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <SplitSquareVertical className="h-4 w-4" />
            Compare Jobs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="listings">
          <TeacherJobListingFilter
            onFilterChange={handleFilterChange}
            totalResults={filteredJobs.length}
          />

          <div className="grid gap-6 mt-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <TeacherJobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No teaching positions found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="compare">
          <JobComparisonTable />
        </TabsContent>
      </Tabs>
    </>
  );
};
