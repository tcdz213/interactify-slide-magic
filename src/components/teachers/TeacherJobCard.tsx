
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, BriefcaseBusiness, Info, SplitSquareVertical, Check, ExternalLink } from "lucide-react";
import { useJobComparison } from "@/hooks/teachers/useJobComparison";

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
  const { addToComparison, removeFromComparison, isInComparison } = useJobComparison();
  const isCompared = isInComparison(job.id);

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(job.id);
    } else {
      addToComparison(job);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
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
        <Button 
          size="sm"
          variant={isCompared ? "default" : "outline"}
          className="flex items-center gap-1"
          onClick={handleToggleComparison}
        >
          {isCompared ? (
            <Check className="h-4 w-4 mr-1" />
          ) : (
            <SplitSquareVertical className="h-4 w-4 mr-1" />
          )}
          {isCompared ? 'Added to compare' : 'Compare'}
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Info className="h-4 w-4 mr-1" /> Details
        </Button>
        <Button size="sm" className="flex items-center gap-1">
          Apply Now <ExternalLink className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};
