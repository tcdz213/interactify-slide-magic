
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, CreditCard, Award } from "lucide-react";
import StepCard from './StepCard';

const StepsList = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: Search,
      title: t('howItWorks.steps.step1.title'),
      description: t('howItWorks.steps.step1.description'),
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Calendar,
      title: t('howItWorks.steps.step2.title'),
      description: t('howItWorks.steps.step2.description'),
      color: "bg-violet-50 text-violet-600",
    },
    {
      icon: CreditCard,
      title: t('howItWorks.steps.step3.title'),
      description: t('howItWorks.steps.step3.description'),
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Award,
      title: t('howItWorks.steps.step4.title'),
      description: t('howItWorks.steps.step4.description'),
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-1/2 top-12 bottom-12 w-0.5 bg-border hidden md:block"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 relative">
        {steps.map((step, index) => (
          <StepCard 
            key={index}
            index={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
            color={step.color}
          />
        ))}
      </div>
    </div>
  );
};

export default StepsList;
