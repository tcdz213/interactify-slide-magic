
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

interface UserTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  route: string;
  buttonText: string;
  isActive: boolean;
  steps: Step[];
}

const UserTypeCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  route, 
  buttonText, 
  isActive,
  steps 
}: UserTypeCardProps) => {
  return (
    <Card className={cn(
      "border-0 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-500 h-full",
      isActive ? "ring-2 ring-primary ring-offset-2" : ""
    )}>
      <CardContent className="p-6 md:p-8 flex flex-col items-center text-center h-full">
        <div className={`h-16 w-16 rounded-full ${color} flex items-center justify-center mb-4`}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 text-sm">{description}</p>
        
        {/* Steps List */}
        <div className="w-full text-left mb-6">
          {steps.map((step, index) => (
            <StepListItem 
              key={index} 
              number={index + 1} 
              title={step.title} 
              description={step.description} 
            />
          ))}
        </div>
        
        <Button asChild className="mt-auto group">
          <Link to={route}>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserTypeCard;
