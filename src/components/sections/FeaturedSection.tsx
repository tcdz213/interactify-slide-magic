
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import { ArrowRight, GraduationCap, BookOpen, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const TRANSITION_DURATION = 3000; // 3 seconds between image transitions

const images = [
  "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&h=600&fit=crop", // Students learning
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop", // Classroom
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop", // Study group
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop"  // Education concept
];

const FeaturedSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { isVisible, elementRef } = useVisibilityObserver({ threshold: 0.2 });
  const { t } = useTranslation();
  
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
      id="featured"
      ref={elementRef}
      className="py-16 md:py-24 overflow-hidden bg-gradient-to-b from-muted/30 to-background dark:from-gray-900/70 dark:to-gray-800/60"
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
              <h2 className="text-sm uppercase tracking-wider text-primary font-semibold flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('featured.tagline', 'Educational Excellence')}
              </h2>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {t('featured.title', 'Unlock your potential with our diverse learning programs')}
              </h3>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <p className="text-lg text-muted-foreground">
                {t('featured.description', 'Explore our curated selection of top-rated courses, with verified reviews and specialized programs in multiple languages tailored to your educational journey.')}
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col space-y-4 pt-2">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 shrink-0">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-base font-medium">{t('featured.benefits.certification')}</h4>
                  <p className="text-muted-foreground">{t('featured.benefits.certificationDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 shrink-0">
                  <Languages className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-base font-medium">{t('featured.benefits.multilingual')}</h4>
                  <p className="text-muted-foreground">{t('featured.benefits.multilingualDesc')}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="pt-4 flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="gap-2">
                {t('featured.browsePrograms')}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                {t('featured.viewCategories')}
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
                      alt={`Educational image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
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
