
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Building, ArrowRight } from "lucide-react";
import StepCard from './StepCard';

const HowItWorksSteps = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: GraduationCap,
      title: t('howItWorks.steps.step1.title'),
      description: t('howItWorks.steps.step1.description'),
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Users,
      title: t('howItWorks.steps.step2.title'),
      description: t('howItWorks.steps.step2.description'),
      color: "bg-violet-50 text-violet-600",
    },
    {
      icon: Building,
      title: t('howItWorks.steps.step3.title'),
      description: t('howItWorks.steps.step3.description'),
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: ArrowRight,
      title: t('howItWorks.steps.step4.title'),
      description: t('howItWorks.steps.step4.description'),
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="relative mt-24">
      <h3 className="text-2xl font-semibold text-center mb-12">How to Get Started</h3>
      
      {/* Connecting line - vertical on mobile, diagonal on desktop */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 hidden md:block"></div>
      
      {/* Step numbers that overlap the line */}
      <div className="absolute left-1/2 top-12 -translate-x-1/2 h-9 w-9 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center font-bold hidden md:flex">1</div>
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-9 w-9 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center font-bold hidden md:flex">2</div>
      <div className="absolute left-1/2 top-2/3 -translate-x-1/2 h-9 w-9 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center font-bold hidden md:flex">3</div>
      <div className="absolute left-1/2 bottom-12 -translate-x-1/2 h-9 w-9 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center font-bold hidden md:flex">4</div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {steps.map((step, index) => (
          <StepCard
            key={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
            color={step.color}
            index={index}
            isEven={index % 2 === 0}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default HowItWorksSteps;
