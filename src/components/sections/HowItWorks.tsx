
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Search, Calendar, CreditCard, Award } from "lucide-react";
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";

const HowItWorks = () => {
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
    <section id="how-it-works" className="section-padding py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/5 translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block mb-5"
          >
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
              <Lightbulb className="h-8 w-8" />
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            {t('howItWorks.title')}
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-lg max-w-3xl mx-auto"
          >
            {t('howItWorks.description')}
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
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
      </div>
    </section>
  );
};

export default HowItWorks;
