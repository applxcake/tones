
import { useRef, useState, useEffect } from 'react';

interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useInView = (options: InViewOptions = {}) => {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isEntryInView = entry.isIntersecting;
        
        // Set state based on whether the element is in view
        setIsInView(isEntryInView);
        
        // If it should only trigger once and is in view, disconnect
        if (isEntryInView && triggerOnce) {
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);
  
  return [ref, isInView] as const;
};

export default useInView;
