import { createContext } from 'react';

/** Separate file so the provider module only exports components. */
export const AdminThemeContext = createContext({
  dark: false,
  theme: 'admin',
  toggle: () => {},
});
