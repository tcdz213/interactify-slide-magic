
import { motion } from "framer-motion";
import { Book, GraduationCap, Globe, Users, Search, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";

const FeatureGrid = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useVisibilityObserver({ threshold: 0.1 });
  
  const features = [
    {
      icon: Search,
      title: t('features.discovery.title', 'Smart Program Discovery'),
      description: t('features.discovery.description', 'Find the perfect training program using our advanced search and filtering system.')
    },
    {
      icon: GraduationCap,
      title: t('features.learning.title', 'Personalized Learning'),
      description: t('features.learning.description', 'Tailored recommendations based on your goals, preferences, and past activity.')
    },
    {
      icon: Globe,
      title: t('features.languages.title', 'Multilingual Support'),
      description: t('features.languages.description', 'Browse and learn in multiple languages, including Arabic, English, and French.')
    },
    {
      icon: Users,
      title: t('features.community.title', 'Learning Community'),
      description: t('features.community.description', 'Connect with fellow students and educators to enhance your learning experience.')
    },
    {
      icon: Star,
      title: t('features.verified.title', 'Verified Programs'),
      description: t('features.verified.description', 'All training programs undergo a thorough verification process to ensure quality.')
    },
    {
      icon: Book,
      title: t('features.tracking.title', 'Progress Tracking'),
      description: t('features.tracking.description', 'Monitor your advancement with comprehensive progress tracking and analytics.')
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <section className="py-16 bg-muted/30" ref={elementRef}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">{t('home.features.title', 'Platform Features')}</h2>
          <p className="text-muted-foreground text-lg">
            {t('home.features.subtitle', 'Discover the tools and features designed to enhance your educational journey')}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={container}
          initial="hidden"
          animate={isVisible ? "show" : "hidden"}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div 
                key={index}
                className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
                variants={item}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;
