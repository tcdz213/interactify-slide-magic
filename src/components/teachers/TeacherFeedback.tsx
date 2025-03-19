
import React from 'react';
import { Star } from "lucide-react";

export interface Rating {
  id: number;
  rating: number;
  review: string;
  from: string;
  date: string;
}

interface TeacherFeedbackProps {
  ratings: Rating[];
}

export const TeacherFeedback = ({ ratings }: TeacherFeedbackProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Student Feedback</h3>
      {ratings.map((rating) => (
        <div key={rating.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < Math.floor(rating.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="font-medium">{rating.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">{rating.date}</span>
          </div>
          <p className="mb-2">{rating.review}</p>
          <p className="text-sm text-muted-foreground">- {rating.from}</p>
        </div>
      ))}
    </div>
  );
};
