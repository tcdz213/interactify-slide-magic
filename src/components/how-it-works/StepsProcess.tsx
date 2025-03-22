
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Users, Building, ArrowRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const StepsProcess = () => {
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
        {steps.map((step, index) => {
          // Alternate the cards between left and right of the vertical line
          const isEven = index % 2 === 0;
          const Icon = step.icon;
          
          return (
            <motion.div 
              key={index}
              className={`relative ${isEven ? 'md:pr-16' : 'md:pl-16 md:translate-y-24'}`}
              initial={{ opacity: 0, y: 20, x: isEven ? -20 : 20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              {/* Mobile step number indicator */}
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold mb-4 md:hidden">
                {index + 1}
              </div>
                
              <Card className="border-0 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-500">
                <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
                  <div className={`h-16 w-16 rounded-full ${step.color} flex items-center justify-center mb-6`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default StepsProcess;
