
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  index: number;
  isEven: boolean;
}

const StepCard = ({ icon: Icon, title, description, color, index, isEven }: StepCardProps) => {
  return (
    <motion.div 
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
          <div className={`h-16 w-16 rounded-full ${color} flex items-center justify-center mb-6`}>
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-3">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StepCard;
