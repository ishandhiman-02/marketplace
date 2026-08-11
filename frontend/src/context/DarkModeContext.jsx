import { useState } from 'react';
import { DarkModeContext } from './darkModeContextObject';

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('substore-dark') === 'true'; } catch { return false; }
  });

  const toggle = () => setDark((d) => {
    const next = !d;
    try { localStorage.setItem('substore-dark', String(next)); } catch { /* private mode */ }
    return next;
  });

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}