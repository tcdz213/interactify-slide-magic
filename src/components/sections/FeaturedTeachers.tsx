
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionTitle from "./common/SectionTitle";
import { teachersData } from "@/data/teachersData";

const FeaturedTeachers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hoveredTeacher, setHoveredTeacher] = useState<number | null>(null);

  const handleViewProfile = useCallback((teacherId: number) => {
    navigate(`/teacher/${teacherId}`);
  }, [navigate]);

  const handleBrowseAll = useCallback(() => {
    navigate("/teachers");
  }, [navigate]);

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
    <section 
      className="section-padding bg-gradient-to-b from-background to-muted/20"
      aria-labelledby="expert-instructors-title"
    >
      <div className="container-custom">
        <SectionTitle
          title={t('teachers.featuredTitle', 'Expert Instructors')}
          description={t('teachers.description', 'Learn from industry professionals with years of experience and proven teaching methods.')}
          id="expert-instructors-title"
        />

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {teachersData.map((teacher) => (
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
                    loading="lazy"
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
                    aria-label={`View profile of ${teacher.name}`}
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
            onClick={handleBrowseAll}
            aria-label="Browse all instructors"
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
