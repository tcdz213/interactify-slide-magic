
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface HeroTitleProps {
  className?: string;
}

const HeroTitle = ({ className = '' }: HeroTitleProps) => {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      className={`max-w-3xl mx-auto text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      role="banner"
    >
      <motion.div 
        className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        aria-hidden="true"
      >
        {t('hero.tagline')}
      </motion.div>
      <motion.h1 
        className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6 text-balance bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text"
        style={{ textShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        tabIndex={0}
      >
        {t('hero.title', 'Your Journey to Success Starts Here')}
      </motion.h1>
      <motion.p 
        className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        tabIndex={0}
      >
        {t('hero.description', 'Browse verified training centers, enroll in top courses, and advance your career with expert guidance.')}
      </motion.p>
    </motion.div>
  );
};

export default memo(HeroTitle);
