
import { useState, useEffect } from 'react';

/**
 * A hook that debounces a value change to reduce unnecessary re-renders
 * @param value The value to debounce
 * @param delay The delay in ms (default: 300ms)
 * @returns The debounced value
 */
export function useDebounceValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * A hook that throttles a value change to reduce unnecessary re-renders
 * @param value The value to throttle
 * @param limit The time limit in ms (default: 300ms)
 * @returns The throttled value
 */
export function useThrottleValue<T>(value: T, limit = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      if (now - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = now;
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}
