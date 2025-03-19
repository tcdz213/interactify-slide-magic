
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    text: "Finding the right fitness center used to be a struggle until I discovered this platform. The detailed profiles and verified reviews helped me make an informed decision. I've been training at Elite Fitness Academy for 3 months now, and it's exactly what I was looking for!",
    author: "Sarah Johnson",
    role: "Fitness Enthusiast",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    id: 2,
    text: "As someone looking to transition careers into tech, finding the right coding bootcamp was crucial. This platform made it easy to compare different centers based on curriculum, job placement rates, and alumni experiences. I couldn't be happier with my choice!",
    author: "Michael Chen",
    role: "Software Developer",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg"
  },
  {
    id: 3,
    text: "The comparison tools on this platform are exceptional. Being able to see side-by-side comparisons of language schools saved me hours of research. The booking process was seamless, and I even got a discount through the platform. Highly recommended!",
    author: "Emma Rodriguez",
    role: "Language Learner",
    avatar: "https://randomuser.me/api/portraits/women/62.jpg"
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Auto-rotate testimonials
    timeoutRef.current = window.setTimeout(() => {
      if (!isAnimating) {
        nextTestimonial();
      }
    }, 8000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeIndex, isAnimating]);

  const nextTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-custom relative">
        <div className="absolute top-6 right-6 opacity-10">
          <Quote className="h-24 w-24" />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">What Our Users Say</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Don't just take our word for it. Here are some experiences from users who found 
              their perfect training centers through our platform.
            </p>
          </div>
          
          <div className="relative">
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
            
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20"
                onClick={prevTestimonial}
                disabled={isAnimating}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/40'
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20"
                onClick={nextTestimonial}
                disabled={isAnimating}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
