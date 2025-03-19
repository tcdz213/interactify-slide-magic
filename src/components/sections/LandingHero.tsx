
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GraduationCap, Globe, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/hero";

const LandingHero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const features = [
    { id: 'multilingual', text: t('hero.features.multilingual', 'Multiple Languages'), icon: Globe },
    { id: 'verified', text: t('hero.features.verified', 'Verified Programs'), icon: CheckCircle2 },
    { id: 'personalized', text: t('hero.features.personalized', 'Personalized Learning'), icon: GraduationCap }
  ];
  
  return (
    <div className="pt-10 pb-20 md:py-24 relative z-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-6">
            <span className="text-sm font-medium">{t('hero.tagline', 'Your Educational Journey Starts Here')}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            {t('hero.title', 'Discover Your Perfect Learning Path')}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {t('hero.description', 'Find top-rated training programs tailored to your goals and advance your skills through verified courses.')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="group rounded-full gap-2"
              onClick={() => navigate('/discover')}
            >
              <Search className="h-4 w-4" />
              {t('hero.actions.findCourses')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full"
              onClick={() => navigate('/for-training-centers')}
            >
              {t('hero.actions.forEducators')}
            </Button>
          </div>
          
          <SearchBox className="max-w-2xl mx-auto" />
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                className="flex items-center bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <feature.icon className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingHero;
