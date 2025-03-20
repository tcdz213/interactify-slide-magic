
import React from 'react';
import HowItWorksComponents from './howItWorks';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <HowItWorksComponents.Header />
        <HowItWorksComponents.Steps />
      </div>
    </section>
  );
};

export default HowItWorks;
