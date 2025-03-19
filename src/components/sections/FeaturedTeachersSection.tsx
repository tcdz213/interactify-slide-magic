
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Mock data for featured teachers
const teachers = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialty: "Fitness Instructor",
    rating: 4.9,
    reviews: 48,
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    available: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    specialty: "Programming Instructor",
    rating: 4.8,
    reviews: 36,
    experience: "6 years",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    available: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    specialty: "Language Teacher",
    rating: 4.7,
    reviews: 42,
    experience: "5 years",
    image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    available: false,
  },
  {
    id: 4,
    name: "David Wilson",
    specialty: "Business Coach",
    rating: 4.9,
    reviews: 56,
    experience: "12 years",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    available: true,
  },
];

const FeaturedTeachersSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleViewProfile = (teacherId: number) => {
    navigate(`/teachers/${teacherId}`);
  };

  const handleViewAllTeachers = () => {
    navigate('/teachers');
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Expert Teachers</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Learn from industry professionals with proven expertise and outstanding teaching skills. Book sessions directly with our top-rated instructors.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <Card
                className="overflow-hidden border-0 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {teacher.available ? (
                    <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                      Available
                    </Badge>
                  ) : (
                    <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground">
                      Unavailable
                    </Badge>
                  )}
                  
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <Badge
                      variant="outline"
                      className="bg-black/40 text-white border-none backdrop-blur-sm"
                    >
                      {teacher.specialty}
                    </Badge>
                    <div className="flex items-center bg-black/40 text-white text-sm px-2 py-1 rounded-md backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{teacher.rating}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-2">{teacher.name}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{teacher.experience} experience</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Star className="h-3.5 w-3.5 mr-1" />
                    <span>{teacher.reviews} reviews</span>
                  </div>
                  
                  <motion.div
                    animate={hoveredIndex === index ? { y: 0, opacity: 1 } : { y: 10, opacity: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full group"
                      onClick={() => handleViewProfile(teacher.id)}
                    >
                      <span>View Profile</span>
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={handleViewAllTeachers}
          >
            View All Teachers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTeachersSection;
