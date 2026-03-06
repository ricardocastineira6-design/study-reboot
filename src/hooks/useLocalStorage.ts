import { useState, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Debounce para reducir escrituras frecuentes al localStorage
  const timeoutRef = useRef<number | null>(null);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Use functional update to avoid stale storedValue from closure
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? (value as (v: T) => T)(prev) : value;

        // Debounce la escritura al localStorage
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (e) {
            console.error(`Error writing localStorage key "${key}":`, e);
          }
        }, 500); // 500ms de debounce

        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}
