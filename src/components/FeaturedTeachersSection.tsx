
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Trophy, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const FeaturedTeachersSection = () => {
  const teachers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Data Science & AI",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      rating: 4.9,
      reviews: 127,
      badge: "Top Rated",
      icon: Trophy
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      specialty: "Business & Leadership",
      imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      rating: 4.8,
      reviews: 98,
      badge: "Expert",
      icon: GraduationCap
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      specialty: "Language & Communication",
      imageUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      rating: 4.9,
      reviews: 156,
      badge: "Featured",
      icon: Sparkles
    }
  ];

  return (
    <section id="featured-teachers" className="section-padding py-20 bg-gradient-to-b from-accent/10 to-background">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Expert Educators
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn From World-Class Teachers</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect with industry experts, academics, and professionals who are passionate about 
            sharing their knowledge and helping you achieve your goals.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teachers.map((teacher, index) => (
            <motion.div 
              key={teacher.id} 
              className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="relative h-48 bg-primary/5 flex items-center justify-center overflow-hidden">
                {teacher.imageUrl ? (
                  <img 
                    src={teacher.imageUrl} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xl font-bold">{teacher.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/90 text-white text-xs font-medium flex items-center gap-1">
                  <teacher.icon className="h-3 w-3" />
                  <span>{teacher.badge}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">{teacher.name}</h3>
                <p className="text-muted-foreground mb-4">{teacher.specialty}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(teacher.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">{teacher.rating} ({teacher.reviews} reviews)</span>
                  </div>
                  <Button variant="ghost" size="sm" className="group">
                    View Profile
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button variant="outline" className="rounded-full px-6 py-6">
            Browse All Teachers <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedTeachersSection;
