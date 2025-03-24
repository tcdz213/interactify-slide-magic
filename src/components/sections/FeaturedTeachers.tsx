
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { teachersData } from "@/data/teachersData";
import SectionTitle from "./common/SectionTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TeacherCard = ({ teacher, index }: { teacher: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden h-full">
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-[3/2] overflow-hidden">
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
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
                  <div className="flex items-center mr-2">
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
            <Button variant="outline" className="w-full">View Profile</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FeaturedTeachers = () => {
  const [featuredTeachers, setFeaturedTeachers] = useState<any[]>([]);

  useEffect(() => {
    // Filter teachers who are featured
    const featured = teachersData.filter(teacher => teacher.featured);
    setFeaturedTeachers(featured);
  }, []);

  return (
    <section id="featured-teachers" aria-labelledby="featured-teachers-title" className="py-12 md:py-16">
      <div className="container-custom mx-auto px-4">
        <SectionTitle
          title="Learn from the Best"
          description="Our featured teachers bring years of expertise to help you achieve your goals"
          id="featured-teachers-title"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {featuredTeachers.map((teacher, index) => (
            <TeacherCard key={teacher.id} teacher={teacher} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTeachers;
