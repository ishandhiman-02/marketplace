import { COURSES } from './products';

/**
 * The label, icon and colour for each category.
 * Counts are not here — they come from whatever the catalogue actually holds,
 * because hand-written ones went stale after every product added (Learning
 * said 3 when there were really 2). CatalogContext derives them from the live
 * product list; the CATEGORIES export below is the offline fallback and the
 * source for the admin's category dropdown.
 */
export const CATEGORY_META = [
  { icon: 'Tv', label: 'Streaming', color: '#e50914' },
  { icon: 'Music', label: 'Music', color: '#1db954' },
  { icon: 'Shield', label: 'VPN & Security', color: '#4f46e5' },
  { icon: 'Brain', label: 'AI Tools', color: '#10b981' },
  { icon: 'Code2', label: 'Developer Tools', color: '#f59e0b' },
  { icon: 'Palette', label: 'Design', color: '#ec4899' },
  { icon: 'BookOpen', label: 'Learning', color: '#06b6d4' },
  { icon: 'Briefcase', label: 'Productivity', color: '#8b5cf6' },
];

export const CATEGORIES = CATEGORY_META.map((c) => ({
  ...c,
  count: COURSES.filter((p) => p.category === c.label).length,
}));
