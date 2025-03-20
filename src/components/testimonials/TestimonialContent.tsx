
import React from 'react';
import { Testimonial } from '@/hooks/useTestimonials';

interface TestimonialContentProps {
  testimonials: Testimonial[];
  activeIndex: number;
}

const TestimonialContent = ({ testimonials, activeIndex }: TestimonialContentProps) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm p-6 md:p-10 shadow-lg">
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
              <div className="text-lg md:text-xl leading-relaxed italic mb-8">
                "{testimonial.text}"
              </div>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-primary-foreground/70">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialContent;
