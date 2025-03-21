
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Calendar, BriefcaseBusiness, DollarSign } from "lucide-react";
import { useJobComparison } from "@/hooks/teachers/useJobComparison";

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

const JobComparisonTable = () => {
  const { compareJobs, removeFromComparison, clearComparison } = useJobComparison();
  
  if (compareJobs.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold mb-2">No jobs to compare</h3>
        <p className="text-muted-foreground mb-6">
          Add jobs to comparison by clicking the "Compare" button on job cards
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Job Comparison</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearComparison}
          className="text-muted-foreground"
        >
          Clear All
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] bg-muted/50">Job Details</TableHead>
              {compareJobs.map((job: TeacherJob) => (
                <TableHead key={job.id} className="min-w-[200px]">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{job.title}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground" 
                        onClick={() => removeFromComparison(job.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {job.centerName}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Location */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </TableCell>
              {compareJobs.map((job: TeacherJob) => (
                <TableCell key={`${job.id}-location`}>
                  {job.location}
                </TableCell>
              ))}
            </TableRow>

            {/* Specialization */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20 flex items-center gap-1">
                <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                Specialization
              </TableCell>
              {compareJobs.map((job: TeacherJob) => (
                <TableCell key={`${job.id}-specialization`}>
                  {job.specialization}
                </TableCell>
              ))}
            </TableRow>

            {/* Experience */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Experience</TableCell>
              {compareJobs.map((job: TeacherJob) => (
                <TableCell key={`${job.id}-experience`} className="font-semibold">
                  {job.experience}
                </TableCell>
              ))}
            </TableRow>

            {/* Salary */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20 flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Salary
              </TableCell>
              {compareJobs.map((job: TeacherJob) => (
                <TableCell key={`${job.id}-salary`}>
                  {job.salary}
                </TableCell>
              ))}
            </TableRow>

            {/* Posted Date */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Posted Date
              </TableCell>
              {compareJobs.map((job: TeacherJob) => (
                <TableCell key={`${job.id}-postedDate`}>
                  {job.postedDate}
                </TableCell>
              ))}
            </TableRow>

            {/* Description */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Description</TableCell>
              {compareJobs.map((job: TeacherJob) => (
                <TableCell key={`${job.id}-description`} className="max-w-[300px]">
                  <p className="line-clamp-3 text-sm">{job.description}</p>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JobComparisonTable;
