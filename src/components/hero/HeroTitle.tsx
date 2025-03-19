
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';

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
      <div 
        className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 animate-fade-down"
        aria-hidden="true"
      >
        <Badge variant="outline" className="mr-2 border-primary/30 text-[10px] px-1.5 py-0">{t('hero.multilingual')}</Badge>
        {t('hero.tagline', 'Your Educational Journey Starts Here')}
      </div>
      <h1 
        className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6 text-balance animate-fade-up"
        tabIndex={0}
      >
        {t('hero.title', 'Discover Your Perfect Learning Path')}
      </h1>
      <p 
        className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto animate-fade-up" 
        style={{ animationDelay: '0.1s' }}
        tabIndex={0}
      >
        {t('hero.description', 'Explore verified training programs, connect with expert educators, and advance your skills through our comprehensive educational platform.')}
      </p>
    </div>
  );
};

export default memo(HeroTitle);
