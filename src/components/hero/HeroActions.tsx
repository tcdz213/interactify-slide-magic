
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, BookOpen, User, PlusCircle } from 'lucide-react';
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
  
  const handleFindCenter = useCallback(() => {
    navigate('/discover');
  }, [navigate]);
  
  const handleGetStarted = useCallback(() => {
    navigate('/get-started');
  }, [navigate]);

  const handleListCenter = useCallback(() => {
    navigate('/for-training-centers');
  }, [navigate]);
  
  const handleTeacherSignup = useCallback(() => {
    navigate('/teacher-signup');
  }, [navigate]);

  return (
    <motion.div 
      className={`flex flex-wrap justify-center gap-4 ${className}`} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Button 
        size="lg" 
        className="group rounded-full px-6 py-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
        onClick={handleGetStarted}
      >
        <BookOpen className="mr-2 h-5 w-5" />
        Get Started Free
        <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
      </Button>
      
      <Button 
        variant="outline" 
        size="lg"
        className="group rounded-full px-6 py-6 border-2 transition-all duration-300 hover:bg-primary/5 hover:shadow-md"
        onClick={handleFindCenter}
      >
        <Search className="mr-2 h-5 w-5" />
        Explore Courses
      </Button>

      <div className="w-full flex flex-wrap justify-center gap-4 mt-4">
        <Button 
          variant="secondary" 
          size="lg"
          className="group rounded-full px-6 py-6 transition-all duration-300 hover:shadow-md"
          onClick={handleListCenter}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          List Your Center
        </Button>
        
        <Button 
          variant="ghost" 
          size="lg"
          className="group rounded-full px-6 py-6 border border-border transition-all duration-300 hover:bg-secondary/5"
          onClick={handleTeacherSignup}
        >
          <User className="mr-2 h-5 w-5" />
          Join as Teacher
        </Button>
      </div>
    </motion.div>
  );
};

export default memo(HeroActions);
