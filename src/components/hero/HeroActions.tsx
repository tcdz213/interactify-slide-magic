
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, PlusCircle, BookOpen, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { memo, useCallback } from 'react';

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

  return (
    <div 
      className={`flex flex-col sm:flex-row gap-4 justify-center animate-fade-up ${className}`} 
      style={{ animationDelay: '0.2s' }}
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

      <Button 
        variant="secondary" 
        size="lg"
        className="group rounded-full px-6 py-6 transition-all duration-300 hover:shadow-md"
        onClick={handleListCenter}
      >
        <User className="mr-2 h-5 w-5" />
        For Teachers
      </Button>
    </div>
  );
};

export default memo(HeroActions);
