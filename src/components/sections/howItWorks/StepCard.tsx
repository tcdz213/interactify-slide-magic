
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  index: number;
}

const StepCard = ({ icon: Icon, title, description, color, index }: StepCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className={`relative ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16 md:translate-y-24'}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connector dot */}
      <div 
        className="absolute top-12 h-4 w-4 rounded-full bg-primary hidden md:block" 
        style={{ 
          right: index % 2 === 0 ? '-8px' : 'auto', 
          left: index % 2 === 0 ? 'auto' : '-8px' 
        }}
      />
        
      <Card className={`border-0 shadow-md rounded-xl overflow-hidden transition-all duration-300 ${isHovered ? 'shadow-lg transform scale-105' : ''}`}>
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className={`h-16 w-16 rounded-full ${color} flex items-center justify-center mb-6 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-medium mb-3">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          
          {isHovered && (
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
  );
};

export default StepCard;
