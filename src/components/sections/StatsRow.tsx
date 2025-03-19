
import { motion } from "framer-motion";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import { useTranslation } from "react-i18next";
import { Users, School, GraduationCap, Globe } from "lucide-react";

const StatsRow = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useVisibilityObserver({ threshold: 0.1 });
  
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: t('stats.users', 'Active Learners'),
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
      label: t('stats.courses', 'Available Programs'),
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
      className="py-12 bg-muted/10 border-y border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <div className={`mb-3 ${stat.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsRow;
