
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TeacherJobCard } from "./TeacherJobCard";
import { TeacherJobListingFilter } from "./TeacherJobListingFilter";

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
  return (
    <>
      <TeacherJobListingFilter
        onFilterChange={handleFilterChange}
        totalResults={filteredJobs.length}
      />

      <div className="grid gap-6">
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
    </>
  );
};
