
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { memo } from 'react';

const CallToActionStep = memo(({ 
  number, 
  title, 
  description,
  delay 
}: { 
  number: number, 
  title: string, 
  description: string,
  delay: number 
}) => (
  <motion.div 
    className="flex items-start"
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 mr-3">
      <span className="text-sm font-medium">{number}</span>
    </div>
    <div>
      <h3 className="text-base font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-slate-800">{description}</p>
    </div>
  </motion.div>
));

CallToActionStep.displayName = 'CallToActionStep';

const CallToAction = () => {
  const { t } = useTranslation();
  
  return (
    <section 
      className="section-padding bg-muted/50"
      aria-labelledby="cta-title"
    >
      <div className="container-custom">
        <motion.div 
          className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-transparent">
              <motion.h2 
                id="cta-title"
                className="text-2xl md:text-3xl font-semibold mb-4 text-slate-800"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {t('callToAction.title')}
              </motion.h2>
              
              <motion.p 
                className="mb-6 text-slate-900"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t('callToAction.description')}
              </motion.p>
              
              <div className="space-y-4 bg-transparent">
                <CallToActionStep 
                  number={1} 
                  title={t('callToAction.steps.step1.title')} 
                  description={t('callToAction.steps.step1.description')}
                  delay={0.2}
                />
                <CallToActionStep 
                  number={2} 
                  title={t('callToAction.steps.step2.title')} 
                  description={t('callToAction.steps.step2.description')}
                  delay={0.3}
                />
                <CallToActionStep 
                  number={3} 
                  title={t('callToAction.steps.step3.title')} 
                  description={t('callToAction.steps.step3.description')}
                  delay={0.4}
                />
              </div>
              
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button size="lg" className="rounded-lg group shadow-sm hover:shadow-md transition-shadow" asChild>
                  <Link to="/get-started">
                    <span className="mr-1">{t('callToAction.getStarted')}</span>
                    <motion.div
                      className="inline-block"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-lg hover:bg-primary/5" asChild>
                  <Link to="/for-training-centers">
                    <span>{t('callToAction.forTrainingCenters')}</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
            <div className="hidden md:block relative overflow-hidden">
              <motion.img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="People learning together in a training center" 
                className="w-full h-full object-cover"
                loading="lazy"
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
              />
              <div className="absolute inset-0 bg-primary/20"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(CallToAction);
