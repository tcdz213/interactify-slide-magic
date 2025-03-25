
import { useEffect, useState, RefObject } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * A hook that applies CSS classes to elements when they enter the viewport
 */
const useScrollAnimation = (
  elementRef: RefObject<HTMLElement>,
  animationClass: string = 'in-view',
  options: ScrollAnimationOptions = {}
) => {
  const [isInView, setIsInView] = useState(false);
  
  const { threshold = 0.2, rootMargin = '0px', once = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          element.classList.add(animationClass);
          
          // Unobserve if the animation should only happen once
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
          element.classList.remove(animationClass);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [elementRef, animationClass, threshold, rootMargin, once]);

  return isInView;
};

export default useScrollAnimation;
