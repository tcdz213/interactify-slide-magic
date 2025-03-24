
import { useState, useEffect, RefObject } from 'react';

interface SectionInViewOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * A hook that detects when a section is in the viewport
 * Useful for triggering animations or updating navigation state
 */
const useSectionInView = (
  ref: RefObject<HTMLElement>,
  options: SectionInViewOptions = {}
) => {
  const [isInView, setIsInView] = useState(false);
  const { threshold = 0.2, rootMargin = '0px' } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    const currentRef = ref.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, rootMargin, threshold]);

  return isInView;
};

export default useSectionInView;
