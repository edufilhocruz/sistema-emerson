import { useEffect, useRef, useState } from 'react';

// Custom hook for intersection observer animations
export const useIntersectionAnimation = <T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = {}
) => {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Hook for staggered animations
export const useStaggeredAnimation = (itemCount: number, delay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const { ref, isVisible } = useIntersectionAnimation();

  useEffect(() => {
    if (isVisible) {
      const timeouts: NodeJS.Timeout[] = [];
      
      for (let i = 0; i < itemCount; i++) {
        const timeout = setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * delay);
        
        timeouts.push(timeout);
      }

      return () => timeouts.forEach(clearTimeout);
    }
  }, [isVisible, itemCount, delay]);

  return { ref, visibleItems };
};

// Hook for number animation
export const useCountAnimation = (
  target: number,
  duration: number = 1000,
  start: boolean = true
) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!start) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(target * easeOut));

      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, start]);

  return current;
};