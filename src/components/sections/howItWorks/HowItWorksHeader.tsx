
import React from 'react';
import { useTranslation } from 'react-i18next';

const HowItWorksHeader = () => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-semibold mb-4">{t('howItWorks.title')}</h2>
      <p className="text-muted-foreground max-w-3xl mx-auto">
        {t('howItWorks.description')}
      </p>
    </div>
  );
};

export default HowItWorksHeader;
