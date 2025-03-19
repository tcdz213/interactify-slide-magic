
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface FeedbackFormProps {
  onSubmit: (rating: number, feedback: string) => void;
}

export const FeedbackForm = ({ onSubmit }: FeedbackFormProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback);
    }
  };
  
  return (
    <div className="space-y-4 p-3">
      <h3 className="font-medium">Rate your experience</h3>
      
      <div className="flex justify-center gap-1 py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-colors focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoveredRating || rating) 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      
      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Share your feedback or suggestions (optional)"
        className="resize-none"
        rows={3}
      />
      
      <Button 
        onClick={handleSubmit}
        disabled={rating === 0}
        className="w-full"
      >
        Submit Feedback
      </Button>
    </div>
  );
};
