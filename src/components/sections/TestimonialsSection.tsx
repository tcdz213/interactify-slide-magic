
import { memo } from "react";
import Testimonials from "@/components/Testimonials";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import { Quote } from "lucide-react";

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const { isVisible, elementRef } = useVisibilityObserver({ threshold: 0.2 });

  return (
    <section 
      ref={elementRef}
      className="py-16 md:py-24 bg-muted/30"
    >
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Quote className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('testimonials.title', 'What Our Learners Say')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle', 'Discover how our educational platform has transformed learning journeys and career paths')}
          </p>
        </motion.div>
        
        <Testimonials />
      </div>
    </section>
  );
};

export default memo(TestimonialsSection);
