import { createContext } from 'react';
import { DEFAULT_SETTINGS } from '../config/defaults';

/**
 * Kept in its own file so the provider module only exports components —
 * react-refresh/only-export-components.
 */
export const SettingsContext = createContext(DEFAULT_SETTINGS);
