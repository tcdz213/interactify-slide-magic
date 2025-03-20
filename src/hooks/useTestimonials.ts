
import { useState, useEffect, useRef } from 'react';

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
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

export const useTestimonials = () => {
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

  const goToTestimonial = (index: number) => {
    if (isAnimating || index === activeIndex) return;
    
    setIsAnimating(true);
    setActiveIndex(index);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  return {
    testimonials,
    activeIndex,
    isAnimating,
    nextTestimonial,
    prevTestimonial,
    goToTestimonial
  };
};
