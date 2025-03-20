import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, CreditCard, Award, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { useState } from "react";

const HowItWorks = () => {
  const { t } = useTranslation();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  
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
    <section id="how-it-works" className="section-padding py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">{t('howItWorks.title')}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t('howItWorks.description')}
          </p>
        </div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-12 bottom-12 w-0.5 bg-border hidden md:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 relative">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className={`relative ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16 md:translate-y-24'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Connector dot */}
                <div className="absolute top-12 -right-2 h-4 w-4 rounded-full bg-primary hidden md:block" 
                     style={{ 
                       right: index % 2 === 0 ? '-8px' : 'auto', 
                       left: index % 2 === 0 ? 'auto' : '-8px' 
                     }}></div>
                     
                <Card className={`border-0 shadow-md rounded-xl overflow-hidden transition-all duration-300 ${hoveredStep === index ? 'shadow-lg transform scale-105' : ''}`}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={`h-16 w-16 rounded-full ${step.color} flex items-center justify-center mb-6 transition-transform duration-300 ${hoveredStep === index ? 'scale-110' : ''}`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                    
                    {hoveredStep === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-primary flex items-center font-medium text-sm"
                      >
                        Learn more <ArrowRight className="h-4 w-4 ml-1" />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
