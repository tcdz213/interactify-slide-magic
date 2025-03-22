
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  Building, 
  ArrowRight
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { CarouselApi } from "@/components/ui/carousel";
import UserTypeCard from './UserTypeCard';
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
      buttonText: "Find Courses",
      steps: [
        { title: "Browse courses by category", description: "Explore our extensive catalog of courses" },
        { title: "Compare training centers", description: "Read reviews and compare features" },
        { title: "Book your preferred course", description: "Secure your spot with our easy booking system" }
      ]
    },
    {
      id: "teachers",
      icon: Users,
      title: "For Teachers",
      description: "Share your expertise and connect with students around the world. Create your teaching profile today.",
      color: "bg-emerald-50 text-emerald-600",
      route: "/teacher-job-post",
      buttonText: "Start Teaching",
      steps: [
        { title: "Create your teacher profile", description: "Showcase your skills and experience" },
        { title: "Browse teaching opportunities", description: "Find positions that match your expertise" },
        { title: "Apply and connect", description: "Connect with training centers looking for your skills" }
      ]
    },
    {
      id: "centers",
      icon: Building,
      title: "For Training Centers",
      description: "Expand your reach and attract more students to your programs. List your courses on our platform.",
      color: "bg-amber-50 text-amber-600",
      route: "/for-training-centers",
      buttonText: "Register Center",
      steps: [
        { title: "Register your training center", description: "Create your center's profile" },
        { title: "Add your courses and programs", description: "List all your offerings with details" },
        { title: "Manage bookings and grow", description: "Track applications and expand your reach" }
      ]
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
            {userTypes.map((type, index) => (
              <CarouselItem key={type.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                <UserTypeCard
                  icon={type.icon}
                  title={type.title}
                  description={type.description}
                  color={type.color}
                  route={type.route}
                  buttonText={type.buttonText}
                  isActive={activeIndex === index}
                  steps={type.steps}
                />
              </CarouselItem>
            ))}
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
