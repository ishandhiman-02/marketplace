import { useContext } from 'react';
import { DarkModeContext } from './darkModeContextObject';

export function useDark() {
  return useContext(DarkModeContext);
}