
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, PlusCircle, Sparkles } from 'lucide-react';
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
  
  const handleListCenter = useCallback(() => {
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
        staggerChildren: 0.15,
        delayChildren: 0.6
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
          className="group rounded-full px-6 py-6 transition-all duration-300 hover:shadow-xl shadow-sm hover:translate-y-[-2px] relative overflow-hidden w-full sm:w-auto"
          onClick={handleFindCenter}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/90 to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <Search className="mr-2 h-5 w-5 relative z-10" />
          <span className="relative z-10">Find a Training Center</span>
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
        </Button>
      </motion.div>
      
      <motion.div variants={item}>
        <Button 
          size="lg"
          className="group rounded-full px-6 py-6 transition-all duration-300 hover:shadow-lg shadow-sm hover:translate-y-[-2px] bg-secondary/90 hover:bg-secondary/80 w-full sm:w-auto"
          onClick={handleGetStarted}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          <span>Get Started</span>
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </motion.div>
      
      <motion.div variants={item}>
        <Button 
          variant="outline" 
          size="lg"
          className="group rounded-full px-6 py-6 border-1.5 transition-all duration-300 hover:bg-primary/5 shadow-sm hover:shadow-md w-full sm:w-auto bg-background/80 backdrop-blur-sm"
          onClick={handleListCenter}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          <span>List Your Center</span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default memo(HeroActions);
