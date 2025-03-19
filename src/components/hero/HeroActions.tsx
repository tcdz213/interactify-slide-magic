
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, GraduationCap, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface HeroActionsProps {
  className?: string;
}

const HeroActions = ({ className = '' }: HeroActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleFindCourses = useCallback(() => {
    navigate('/discover');
  }, [navigate]);
  
  const handleForTeachers = useCallback(() => {
    navigate('/for-training-centers');
  }, [navigate]);

  const handleGetStarted = useCallback(() => {
    navigate('/get-started');
  }, [navigate]);

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className={`flex flex-col sm:flex-row gap-4 justify-center ${className}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <Button 
          size="lg" 
          className="group rounded-full px-6 py-6 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] relative overflow-hidden w-full sm:w-auto"
          onClick={handleFindCourses}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <Search className="mr-2 h-5 w-5 relative z-10" />
          <span className="relative z-10">{t('hero.actions.findCourses')}</span>
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
        </Button>
      </motion.div>
      
      <motion.div variants={item}>
        <Button 
          size="lg"
          className="group rounded-full px-6 py-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] bg-secondary hover:bg-secondary/90 w-full sm:w-auto"
          onClick={handleGetStarted}
        >
          <GraduationCap className="mr-2 h-5 w-5" />
          {t('hero.actions.enroll')}
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </motion.div>
      
      <motion.div variants={item}>
        <Button 
          variant="outline" 
          size="lg"
          className="group rounded-full px-6 py-6 border-2 transition-all duration-300 hover:bg-primary/5 hover:shadow-md w-full sm:w-auto"
          onClick={handleForTeachers}
        >
          <Globe className="mr-2 h-5 w-5" />
          {t('hero.actions.forEducators')}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default memo(HeroActions);
