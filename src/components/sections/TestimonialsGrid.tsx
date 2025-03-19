
import { motion } from "framer-motion";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import { useTranslation } from "react-i18next";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TestimonialsGrid = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useVisibilityObserver({ threshold: 0.1 });
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      content: "This platform made it incredibly easy to find a specialized coding bootcamp that perfectly aligned with my career goals. The verified reviews were particularly helpful.",
      avatar: "https://i.pravatar.cc/150?img=33",
      rating: 5
    },
    {
      name: "Mohammed Al-Farsi",
      role: "Business Student",
      content: "I love that I can access training programs in multiple languages. The Arabic interface is flawless, and the course recommendations are spot-on.",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 5
    },
    {
      name: "Marie Dubois",
      role: "Fitness Enthusiast",
      content: "The detailed filters helped me find exactly what I was looking for. Being able to compare different training centers side by side made my decision so much easier.",
      avatar: "https://i.pravatar.cc/150?img=29",
      rating: 4
    },
    {
      name: "David Chen",
      role: "Marketing Professional",
      content: "The booking process was seamless, and I particularly appreciated the instant confirmation. The platform's interface is intuitive and user-friendly.",
      avatar: "https://i.pravatar.cc/150?img=8",
      rating: 5
    }
  ];

  return (
    <section 
      ref={elementRef}
      className="py-16 md:py-24 bg-muted/20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.05),transparent_40%)] z-0" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Quote className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('testimonials.title', 'What Our Learners Say')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle', 'Discover how our platform has transformed educational journeys')}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-card border rounded-xl p-6 shadow-sm relative"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-muted-foreground/20" />
              
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-muted'}`}
                  />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
              
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsGrid;
