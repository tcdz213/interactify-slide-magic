
import React, { useEffect, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { teachersData } from "@/data/teachersData";
import SectionTitle from "./common/SectionTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Teacher {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
  years: number;
  featured: boolean;
}

const TeacherCard = memo(({ teacher, index }: { teacher: Teacher; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden h-full shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-[3/2] overflow-hidden">
              <img
                src={teacher.image}
                alt={`Portrait of ${teacher.name}`}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                loading="lazy"
              />
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="font-medium">
                {teacher.specialty}
              </Badge>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center mb-3">
              <Avatar className="h-10 w-10 mr-3 border-2 border-primary/10">
                <AvatarImage src={teacher.image} alt={teacher.name} />
                <AvatarFallback>{teacher.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{teacher.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="flex items-center mr-2" aria-label={`Rating: ${teacher.rating} out of 5`}>
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>{teacher.rating}</span>
                  </div>
                  <span>({teacher.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {teacher.years} years of experience
            </div>
            <Button 
              variant="outline" 
              className="w-full hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
              aria-label={`View ${teacher.name}'s profile`}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

TeacherCard.displayName = 'TeacherCard';

// Skeleton component for loading state
const TeacherCardSkeleton = memo(({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="animate-pulse"
  >
    <div className="bg-muted rounded-xl overflow-hidden h-full">
      <div className="aspect-[3/2] bg-muted-foreground/10"></div>
      <div className="p-5">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-muted-foreground/10 mr-3"></div>
          <div>
            <div className="h-4 w-24 bg-muted-foreground/10 rounded mb-2"></div>
            <div className="h-3 w-16 bg-muted-foreground/10 rounded"></div>
          </div>
        </div>
        <div className="h-3 bg-muted-foreground/10 rounded w-3/4 mb-4"></div>
        <div className="h-9 bg-muted-foreground/10 rounded w-full"></div>
      </div>
    </div>
  </motion.div>
));

TeacherCardSkeleton.displayName = 'TeacherCardSkeleton';

const FeaturedTeachers = () => {
  const [featuredTeachers, setFeaturedTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with delay for better UX demonstration
    const timer = setTimeout(() => {
      // Filter teachers who are featured
      const featured = teachersData.filter(teacher => teacher.featured);
      setFeaturedTeachers(featured);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const renderTeacherCards = useCallback(() => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <TeacherCardSkeleton key={`skeleton-${index}`} index={index} />
      ));
    }
    
    if (featuredTeachers.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">No featured teachers available at the moment.</p>
        </div>
      );
    }
    
    return featuredTeachers.map((teacher, index) => (
      <TeacherCard key={teacher.id} teacher={teacher} index={index} />
    ));
  }, [isLoading, featuredTeachers]);

  return (
    <section 
      id="featured-teachers" 
      aria-labelledby="featured-teachers-title" 
      className="py-12 md:py-16"
    >
      <div className="container-custom mx-auto px-4">
        <SectionTitle
          title="Learn from the Best"
          description="Our featured teachers bring years of expertise to help you achieve your goals"
          id="featured-teachers-title"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 stagger-group">
          {renderTeacherCards()}
        </div>
      </div>
    </section>
  );
};

export default memo(FeaturedTeachers);
