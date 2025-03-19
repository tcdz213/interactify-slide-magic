
import { Users, School, GraduationCap, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";

const StatsDisplaySection = () => {
  const { t } = useTranslation();
  const { isVisible, elementRef } = useVisibilityObserver({ threshold: 0.1 });
  
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: t('stats.students', 'Active Learners'),
      color: "text-blue-500",
    },
    {
      icon: School,
      value: "500+",
      label: t('stats.centers', 'Training Centers'),
      color: "text-purple-500",
    },
    {
      icon: GraduationCap,
      value: "2,000+",
      label: t('stats.courses', 'Available Courses'),
      color: "text-green-500",
    },
    {
      icon: Globe,
      value: "3",
      label: t('stats.languages', 'Supported Languages'),
      color: "text-amber-500",
    },
  ];

  return (
    <section 
      ref={elementRef}
      className="py-12 md:py-20 bg-muted/20"
    >
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-background border border-border/50 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <div className={`mb-4 ${stat.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</h3>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsDisplaySection;
