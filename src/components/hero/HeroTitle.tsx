
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

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
        className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 animate-fade-down"
        aria-hidden="true"
      >
        {t('hero.tagline', 'Transform Your Learning Journey')}
      </div>
      <h1 
        className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6 text-balance animate-fade-up"
        tabIndex={0}
      >
        {t('hero.title', 'Learn, Grow, and Excel with Expert-Led Training')}
      </h1>
      <p 
        className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto animate-fade-up" 
        style={{ animationDelay: '0.1s' }}
        tabIndex={0}
      >
        {t('hero.description', 'Discover top-rated courses from verified centers, learn from industry experts, and advance your career with personalized educational pathways.')}
      </p>
    </div>
  );
};

export default memo(HeroTitle);
