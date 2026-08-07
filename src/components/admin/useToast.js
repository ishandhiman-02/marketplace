import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Small toast state for the admin pages.
 * Kept in its own file, away from the component — for react-refresh/only-export-components.
 */
export function useToast(ms = 2200) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback((message, tone = 'ok') => {
    clearTimeout(timer.current);
    setToast({ message, tone, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), ms);
  }, [ms]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, show };
}
