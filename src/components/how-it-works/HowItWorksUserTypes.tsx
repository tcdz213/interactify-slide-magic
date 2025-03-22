
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  Building, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { CarouselApi } from "@/components/ui/carousel";
import StepsProcess from './StepsProcess';

const HowItWorksUserTypes = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  
  const userTypes = [
    {
      id: "learners",
      icon: GraduationCap,
      title: "For Learners",
      description: "Discover thousands of courses and training programs that match your interests and career goals.",
      color: "bg-blue-50 text-blue-600",
      route: "/discover",
      buttonText: "Find Courses"
    },
    {
      id: "teachers",
      icon: Users,
      title: "For Teachers",
      description: "Share your expertise and connect with students around the world. Create your teaching profile today.",
      color: "bg-emerald-50 text-emerald-600",
      route: "/teacher-job-post",
      buttonText: "Start Teaching"
    },
    {
      id: "centers",
      icon: Building,
      title: "For Training Centers",
      description: "Expand your reach and attract more students to your programs. List your courses on our platform.",
      color: "bg-amber-50 text-amber-600",
      route: "/for-training-centers",
      buttonText: "Register Center"
    },
  ];
  
  // Set up event listeners for the carousel
  useEffect(() => {
    if (!carouselApi) return;
    
    const onChange = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on("select", onChange);
    
    // Initialize the index
    setActiveIndex(carouselApi.selectedScrollSnap());
    
    return () => {
      carouselApi.off("select", onChange);
    };
  }, [carouselApi]);

  return (
    <>
      {/* User Types Carousel */}
      <div className="mb-20">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
          setApi={setCarouselApi}
        >
          <CarouselContent>
            {userTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <CarouselItem key={type.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <Card className={cn(
                    "border-0 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-500 h-full",
                    activeIndex === index ? "ring-2 ring-primary ring-offset-2" : ""
                  )}>
                    <CardContent className="p-8 flex flex-col items-center text-center h-full">
                      <div className={`h-16 w-16 rounded-full ${type.color} flex items-center justify-center mb-6`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-3">{type.title}</h3>
                      <p className="text-muted-foreground mb-8 flex-grow">{type.description}</p>
                      <Button asChild className="mt-auto group">
                        <Link to={type.route}>
                          {type.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex items-center justify-center mt-8">
            <CarouselPrevious className="relative static transform-none mx-2" />
            <div className="flex space-x-2">
              {userTypes.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    activeIndex === index ? "bg-primary w-8" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <CarouselNext className="relative static transform-none mx-2" />
          </div>
        </Carousel>
      </div>
      
      {/* Steps Process */}
      <StepsProcess />
    </>
  );
};

export default HowItWorksUserTypes;
