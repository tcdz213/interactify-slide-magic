
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const CallToActionSection = () => {
  return (
    <div className="mt-28 text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Begin Your Learning Journey?</h3>
        <p className="text-muted-foreground mb-8">
          Join thousands of learners, teachers, and training centers who are already part of our growing community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/get-started">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/about">
              Learn More About Us
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CallToActionSection;
