
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StepListItem from './StepListItem';

interface UserTypeCardWithImageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  route: string;
  buttonText: string;
  isActive: boolean;
  steps: { title: string }[];
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
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
    >
      {/* Image Side */}
      <div className="order-2 lg:order-1">
        <div className="relative rounded-xl overflow-hidden shadow-md dark:shadow-none dark:ring-1 dark:ring-border">
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-auto object-cover aspect-video" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent dark:from-black/70"></div>
        </div>
      </div>
      
      {/* Content Side */}
      <div className="order-1 lg:order-2">
        <Card className="border dark:border-border shadow-md dark:shadow-none">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-14 w-14 rounded-full ${color} flex items-center justify-center`}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">{title}</h3>
                <p className="text-muted-foreground font-medium">{description}</p>
              </div>
            </div>
            
            <ul className="space-y-3 my-6">
              {steps.map((step, index) => (
                <StepListItem key={index} step={step.title} index={index} />
              ))}
            </ul>
            
            <Button asChild size="lg" className="w-full mt-4">
              <Link to={route} className="group">
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default UserTypeCardWithImage;
