
import React from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useTestimonials } from '@/hooks/useTestimonials';

const TestimonialHeader = () => {
  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="h-6 w-6 mx-1 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
      <p className="text-primary-foreground/90 max-w-2xl mx-auto text-lg">
        Don't just take our word for it. Here are some experiences from users who found 
        their perfect training centers through our platform.
      </p>
    </div>
  );
};

const TestimonialContent = ({ testimonials, activeIndex }) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm p-8 md:p-10 shadow-lg">
      <div className="relative">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="min-w-full px-4"
            >
              <div className="relative">
                <Quote className="h-10 w-10 text-primary-foreground/30 absolute -top-6 -left-6" />
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg md:text-xl leading-relaxed italic mb-8"
                >
                  "{testimonial.text}"
                </motion.div>
              </div>
              <div className="flex items-center mt-6">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white/50 shadow-lg mr-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-lg">{testimonial.author}</div>
                  <div className="text-primary-foreground/70">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TestimonialNavigation = ({ totalCount, activeIndex, isAnimating, onPrevious, onNext, onSelect }) => {
  return (
    <motion.div 
      className="flex justify-between items-center mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 h-12 w-12"
        onClick={onPrevious}
        disabled={isAnimating}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <div className="flex items-center space-x-3">
        {Array.from({ length: totalCount }).map((_, index) => (
          <button
            key={index}
            className={`h-3 transition-all duration-300 rounded-full ${
              index === activeIndex 
                ? 'w-10 bg-white' 
                : 'w-3 bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => onSelect(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 h-12 w-12"
        onClick={onNext}
        disabled={isAnimating}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </motion.div>
  );
};

const Testimonials = () => {
  const { 
    testimonials, 
    activeIndex, 
    isAnimating, 
    nextTestimonial, 
    prevTestimonial,
    goToTestimonial
  } = useTestimonials();

  return (
    <section className="section-padding py-20 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
      <div className="container-custom relative">
        <div className="absolute top-6 right-6 opacity-10">
          <Quote className="h-32 w-32" />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <TestimonialHeader />
          
          <div className="relative mt-16">
            <TestimonialContent 
              testimonials={testimonials} 
              activeIndex={activeIndex} 
            />
            
            <TestimonialNavigation 
              totalCount={testimonials.length}
              activeIndex={activeIndex}
              isAnimating={isAnimating}
              onPrevious={prevTestimonial}
              onNext={nextTestimonial}
              onSelect={goToTestimonial}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
export { TestimonialHeader, TestimonialContent, TestimonialNavigation };
