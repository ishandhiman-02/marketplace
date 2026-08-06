import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Admin pages ka chhota toast state.
 * Component se alag file mein hai — react-refresh/only-export-components ke liye.
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
