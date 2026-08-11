import { createContext } from 'react';

export const DarkModeContext = createContext({ dark: false, toggle: () => {} });