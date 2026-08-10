import { useContext } from 'react';
import { SettingsContext } from './settingsContextObject';

/**
 * Site settings, already merged over the defaults.
 * Always returns a complete object, so callers never need to null-check —
 * before the fetch resolves, and if it fails outright, they get the
 * shipped defaults.
 */
export const useSettings = () => useContext(SettingsContext);
