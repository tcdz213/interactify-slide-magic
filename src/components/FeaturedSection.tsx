
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import { ArrowRight } from "lucide-react";

const TRANSITION_DURATION = 3000; // 3 seconds between image transitions

const images = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop"
];

const FeaturedSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { isVisible, elementRef } = useVisibilityObserver({ threshold: 0.2 });
  
  // Image transition effect
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, TRANSITION_DURATION);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section 
      ref={elementRef}
      className="py-16 md:py-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side: Content */}
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={containerVariants}
            className="flex flex-col space-y-6"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-sm uppercase tracking-wider text-primary font-semibold">
                Learn With Confidence
              </h2>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Find the perfect training center for your educational journey
              </h3>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <p className="text-lg text-muted-foreground">
                Browse our curated selection of top-rated training centers, with verified reviews and specialized programs tailored to your learning needs.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="pt-4 flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="gap-2">
                Get Started Today
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                View Categories
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Right Side: Image Gallery */}
          <div className="relative h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden shadow-xl">
            <AnimatePresence mode="wait">
              {images.map((src, index) => (
                index === activeIndex && (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={src}
                      alt={`Featured image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            
            {/* Image indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex 
                      ? "bg-white w-6" 
                      : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
