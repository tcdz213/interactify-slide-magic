
import { Quote } from 'lucide-react';
import { useTestimonials } from '@/hooks/useTestimonials';
import { 
  TestimonialHeader, 
  TestimonialContent, 
  TestimonialNavigation 
} from '@/components/testimonials';

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
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-custom relative">
        <div className="absolute top-6 right-6 opacity-10">
          <Quote className="h-24 w-24" />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <TestimonialHeader />
          
          <div className="relative">
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
