
import { motion } from "framer-motion";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorksBanner = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useVisibilityObserver({ threshold: 0.1 });
  const navigate = useNavigate();
  
  const steps = [
    {
      number: "01",
      title: t('howItWorks.step1.title', 'Discover'),
      description: t('howItWorks.step1.description', 'Find training programs that match your interests and goals')
    },
    {
      number: "02",
      title: t('howItWorks.step2.title', 'Connect'),
      description: t('howItWorks.step2.description', 'Reach out to training centers and explore their offerings')
    },
    {
      number: "03",
      title: t('howItWorks.step3.title', 'Enroll'),
      description: t('howItWorks.step3.description', 'Secure your spot in your chosen programs with easy enrollment')
    },
    {
      number: "04",
      title: t('howItWorks.step4.title', 'Learn'),
      description: t('howItWorks.step4.description', 'Start your educational journey and track your progress')
    }
  ];

  return (
    <section 
      ref={elementRef}
      className="py-16 md:py-24 relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 z-0" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('howItWorks.title', 'How It Works')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.subtitle', 'Our platform makes finding and enrolling in training programs simple and efficient')}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {/* Step number */}
              <div className="text-5xl font-bold text-primary/10 mb-2">{step.number}</div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              
              {/* Connector line - only for the first 3 steps */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 w-full h-px bg-border">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary transform translate-x-1/2" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button 
            size="lg" 
            className="rounded-full gap-2"
            onClick={() => navigate('/get-started')}
          >
            {t('howItWorks.getStarted', 'Get Started Today')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksBanner;
