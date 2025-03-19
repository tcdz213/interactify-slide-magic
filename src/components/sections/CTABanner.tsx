
import { motion } from "framer-motion";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTABanner = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useVisibilityObserver({ threshold: 0.1 });
  const navigate = useNavigate();

  return (
    <section 
      ref={elementRef}
      className="py-16 md:py-24 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl opacity-70" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full filter blur-3xl opacity-70" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('cta.title', 'Ready to Begin Your Educational Journey?')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 md:mb-10">
              {t('cta.description', 'Join thousands of learners who have found their perfect training programs through our platform.')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="rounded-full gap-2"
                onClick={() => navigate('/signup')}
              >
                {t('cta.getStarted', 'Get Started for Free')}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full"
                onClick={() => navigate('/discover')}
              >
                {t('cta.browse', 'Browse Programs')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
