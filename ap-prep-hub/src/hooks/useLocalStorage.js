import { useState, useCallback } from 'react';
import errorLogger from '../utils/errorLogger';

/**
 * useLocalStorage — Typed localStorage hook with JSON parsing and error handling.
 *
 * @param {string} key — localStorage key
 * @param {*} initialValue — Default value if key doesn't exist or parse fails
 * @returns {[value, setValue, removeValue]} — Tuple of current value, setter, and remover
 *
 * Usage:
 *   const [theme, setTheme, removeTheme] = useLocalStorage('apex.theme', 'dark');
 *   setTheme('light');  // Persists to localStorage
 *   removeTheme();      // Removes from localStorage, resets to initialValue
 */
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return initialValue;
      // Try to parse as JSON; if it fails, return raw string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (e) {
      errorLogger.debug(`useLocalStorage: failed to read "${key}"`, { error: e?.message });
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof valueToStore === 'string') {
        localStorage.setItem(key, valueToStore);
      } else {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (e) {
      errorLogger.debug(`useLocalStorage: failed to write "${key}"`, { error: e?.message });
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (e) {
      errorLogger.debug(`useLocalStorage: failed to remove "${key}"`, { error: e?.message });
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
