
import React from 'react';
import { Trophy } from "lucide-react";

interface Course {
  id: number;
  name: string;
  progress: number;
  lastAccessed: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  date: string;
}

interface LearnerProgressProps {
  courses: Course[];
  achievements: Achievement[];
}

export const LearnerProgress = ({ courses, achievements }: LearnerProgressProps) => {
  // Calculate overall progress
  const overallProgress = courses.reduce((acc, course) => acc + course.progress, 0) / courses.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Learning Progress</h3>
        <div className="p-4 border rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{Math.round(overallProgress)}%</div>
            <p className="text-muted-foreground">Overall Progress</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Achievements</h3>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="p-4 border rounded-lg flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">{achievement.name}</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  {achievement.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  Achieved on: {achievement.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
