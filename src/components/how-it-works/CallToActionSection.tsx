
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CallToActionSection = () => {
  return (
    <motion.div 
      className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Begin Your Learning Journey?</h3>
      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
        Find the perfect training center or course that matches your goals, interests, and schedule. Start your journey today!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link to="/discover" className="group">
            Find Centers 
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/courses" className="group">
            Browse Courses
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default CallToActionSection;
