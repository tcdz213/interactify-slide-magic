
import React from 'react';
import HowItWorksHeader from './HowItWorksHeader';
import HowItWorksUserTypes from './HowItWorksUserTypes';
import CallToActionSection from './CallToActionSection';
import { cn } from '@/lib/utils';

interface HowItWorksProps {
  className?: string;
  showBackground?: boolean;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ 
  className = "", 
  showBackground = true 
}) => {
  return (
    <section 
      id="how-it-works" 
      className={cn(
        "section-padding py-24 relative overflow-hidden",
        showBackground ? "bg-gradient-to-br from-gray-50 to-white" : "",
        className
      )}
    >
      {/* Background Elements */}
      {showBackground && (
        <>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/5 translate-x-1/3 translate-y-1/3"></div>
        </>
      )}
      
      <div className="container-custom relative z-10">
        {/* Header Section */}
        <HowItWorksHeader />

        {/* User Types with Steps */}
        <HowItWorksUserTypes />
        
        {/* Call to Action Section */}
        <CallToActionSection />
      </div>
    </section>
  );
};

export default HowItWorks;
