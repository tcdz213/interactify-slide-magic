
import * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Check, MapPin, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Define the step interface
interface TourStep {
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  position?: "top" | "right" | "bottom" | "left";
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuidedTour({
  steps,
  onComplete,
  isOpen,
  onOpenChange,
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Highlight the current element
  useEffect(() => {
    if (!isOpen) return;

    const currentElement = steps[currentStep]?.element;
    if (!currentElement) return;

    const element = document.querySelector(currentElement);
    if (!element) return;

    // Add highlight class
    element.classList.add("ring-2", "ring-primary", "ring-offset-2");

    // Scroll element into view if needed
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    return () => {
      // Remove highlight
      element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
    };
  }, [currentStep, isOpen, steps]);

  // Handle next step
  const handleNext = () => {
    setHasUserInteracted(true);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
      onOpenChange(false);
      setCurrentStep(0); // Reset for next time
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setHasUserInteracted(true);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle skip
  const handleSkip = () => {
    setHasUserInteracted(true);
    onComplete?.();
    onOpenChange(false);
    setCurrentStep(0); // Reset for next time
  };

  // Calculate progress
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {steps[currentStep]?.title || "Welcome to the Tour"}
          </DialogTitle>
          <Progress value={progress} className="h-1 mt-2" />
        </DialogHeader>

        <DialogDescription className="py-4">
          {steps[currentStep]?.description || "Let's get started!"}
        </DialogDescription>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <div className="flex justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              {currentStep === steps.length - 1 ? "Close" : "Skip tour"}
            </Button>
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="mr-2"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    Complete <Check className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
