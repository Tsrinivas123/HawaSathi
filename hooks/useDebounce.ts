/**
 * @file useDebounce.ts
 * @description Custom React hook to debounce high-frequency state updates.
 * Improves efficiency by throttling search query execution and preventing unnecessary re-renders.
 */

import { useState, useEffect } from 'react';
import { SYSTEM_LIMITS } from '@/lib/constants';

/**
 * Returns a debounced version of the provided value after delayMs.
 * @param value The reactive value to debounce (e.g., search text)
 * @param delayMs Delay in milliseconds (defaults to 300ms)
 */
export function useDebounce<T>(value: T, delayMs: number = SYSTEM_LIMITS.DEFAULT_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Clean up timer on value change or unmount to avoid memory leaks
    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
