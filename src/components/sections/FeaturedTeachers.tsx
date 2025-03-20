
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const teachers = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialty: "Fitness Instructor",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80",
    years: 7,
    featured: true,
  },
  {
    id: 2,
    name: "David Chen",
    specialty: "Software Development",
    rating: 4.8,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    years: 12,
    featured: true,
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    specialty: "Language Tutor",
    rating: 4.7,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80",
    years: 9,
    featured: false,
  },
  {
    id: 4,
    name: "James Wilson",
    specialty: "Business Coach",
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    years: 15,
    featured: true,
  },
];

const FeaturedTeachers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hoveredTeacher, setHoveredTeacher] = useState<number | null>(null);

  const handleViewProfile = (teacherId: number) => {
    navigate(`/teacher/${teacherId}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="section-padding bg-gradient-to-b from-background to-muted/20">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            {t('teachers.featuredTitle', 'Expert Instructors')}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t('teachers.description', 'Learn from industry professionals with years of experience and proven teaching methods.')}
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {teachers.map((teacher) => (
            <motion.div 
              key={teacher.id} 
              variants={item}
              className="group"
              onMouseEnter={() => setHoveredTeacher(teacher.id)}
              onMouseLeave={() => setHoveredTeacher(null)}
            >
              <Card className="overflow-hidden border-0 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {teacher.featured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-white">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <Badge
                      variant="outline"
                      className="bg-black/40 text-white border-none backdrop-blur-sm"
                    >
                      {teacher.years}+ years exp.
                    </Badge>
                    <div className="flex items-center bg-black/40 text-white text-sm px-2 py-1 rounded-md backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{teacher.rating}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-1">{teacher.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{teacher.specialty}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">
                      {teacher.reviews} student reviews
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full group"
                    onClick={() => handleViewProfile(teacher.id)}
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-2"
            onClick={() => navigate("/teachers")}
          >
            Browse All Instructors
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTeachers;
