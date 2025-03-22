
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StepListItem from './StepListItem';

interface Step {
  title: string;
  description?: string;
}

interface UserTypeCardWithImageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  route: string;
  buttonText: string;
  isActive: boolean;
  steps: Step[];
  imageSrc: string;
}

const UserTypeCardWithImage = ({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  route, 
  buttonText, 
  isActive,
  steps,
  imageSrc
}: UserTypeCardWithImageProps) => {
  return (
    <Card className={cn(
      "border-0 shadow-lg hover:shadow-xl rounded-xl overflow-hidden transition-all duration-500 w-full",
      isActive ? "ring-2 ring-primary ring-offset-2" : ""
    )}>
      <CardContent className="p-0 flex flex-col md:flex-row h-full">
        {/* Left side with steps */}
        <div className="p-6 md:p-8 md:w-3/5 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
          
          <p className="text-muted-foreground mb-6 text-sm">{description}</p>
          
          {/* Steps List */}
          <div className="w-full text-left mb-6 flex-grow">
            {steps.map((step, index) => (
              <StepListItem 
                key={index} 
                number={index + 1} 
                title={step.title} 
                description={step.description} 
              />
            ))}
          </div>
          
          <Button asChild className="mt-auto group self-start">
            <Link to={route}>
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        
        {/* Right side with image */}
        <div className="md:w-2/5 bg-muted min-h-[200px] md:min-h-full">
          <img 
            src={imageSrc} 
            alt={`${title} illustration`} 
            className="w-full h-full object-cover" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTypeCardWithImage;
