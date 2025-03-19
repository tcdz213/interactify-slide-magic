
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface HeroTitleProps {
  className?: string;
}

const HeroTitle = ({ className = '' }: HeroTitleProps) => {
  const { t } = useTranslation();
  
  return (
    <div 
      className={`max-w-3xl mx-auto text-center ${className}`}
      role="banner"
    >
      <motion.div 
        className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        aria-hidden="true"
      >
        {t('hero.tagline', 'Transform Your Learning Journey Today')}
      </motion.div>
      <motion.h1 
        className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        tabIndex={0}
      >
        {t('hero.title', 'Learn, Grow, and Master New Skills with Expert Guidance')}
      </motion.h1>
      <motion.p 
        className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        tabIndex={0}
      >
        {t('hero.description', 'Discover top-rated courses from verified centers, learn from industry experts, and advance your career with personalized educational pathways tailored to your goals.')}
      </motion.p>
    </div>
  );
};

export default memo(HeroTitle);
