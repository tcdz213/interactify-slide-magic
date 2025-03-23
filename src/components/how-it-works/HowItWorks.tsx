import React from 'react';
import HowItWorksHeader from './HowItWorksHeader';
import HowItWorksUserTypes from './HowItWorksUserTypes';
import CallToActionSection from './CallToActionSection';
export { HowItWorksHeader, HowItWorksUserTypes };
const HowItWorks = () => {
  return <section id="how-it-works" className="section-padding bg-gradient-to-br from-gray-50 to-white relative overflow-hidden bg-slate-900 py-0">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-1/3 translate-y-1/3 bg-amber-100"></div>
      
      <div className="container-custom relative z-10 my-0 py-[95px] bg-transparent">
        {/* Header Section */}
        <HowItWorksHeader />

        {/* User Types with Steps */}
        <HowItWorksUserTypes />
        
        {/* Call to Action Section */}
        <CallToActionSection />
      </div>
    </section>;
};
export default HowItWorks;