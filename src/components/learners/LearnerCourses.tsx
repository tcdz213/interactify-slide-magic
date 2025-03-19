
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

interface Course {
  id: number;
  name: string;
  progress: number;
  lastAccessed: string;
}

interface LearnerCoursesProps {
  courses: Course[];
}

export const LearnerCourses = ({ courses }: LearnerCoursesProps) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Enrolled Courses</h3>
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{course.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Last accessed: {course.lastAccessed}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <PlayCircle className="h-4 w-4 mr-2" /> Continue Learning
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
