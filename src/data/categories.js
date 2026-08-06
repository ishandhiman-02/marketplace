import { COURSES } from './products';

// counts COURSES se derive hote hain — haath se likhne pe har product add
// karne ke baad galat ho jaate the (Learning pe 3 likha tha, asal mein 2 hai)
const CATEGORY_META = [
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
