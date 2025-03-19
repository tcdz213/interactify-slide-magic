
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, BriefcaseBusiness, Info } from "lucide-react";

interface JobProps {
  job: {
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
  };
}

export const TeacherJobCard = ({ job }: JobProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-start">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{job.title}</h3>
                <p className="text-muted-foreground mb-2">{job.centerName}</p>
              </div>
              <Badge className="bg-primary text-primary-foreground">{job.experience}</Badge>
            </div>
            
            <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {job.location}
              </div>
              <div className="flex items-center gap-1">
                <BriefcaseBusiness className="h-4 w-4" /> {job.specialization}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Posted {job.postedDate}
              </div>
            </div>
            
            <div className="mt-4">
              <p className="font-medium">Salary: {job.salary}</p>
              <p className="mt-2 line-clamp-2">{job.description}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 px-6 pb-6 pt-0">
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" /> Details
        </Button>
        <Button size="sm">Apply Now</Button>
      </CardFooter>
    </Card>
  );
};
