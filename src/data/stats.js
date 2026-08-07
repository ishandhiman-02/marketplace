import { COURSES, MIN_PRICE } from './products';

export const STATS = [
  // both numbers are derived from COURSES — they stay correct on their own
  // when products are added or removed
  { value: `${COURSES.length}`, label: 'Premium Deals', icon: 'Tag', color: '#4f46e5' },
  { value: `Rs.${MIN_PRICE}`, label: 'Starts From', icon: 'Wallet', color: '#06b6d4' },
  { value: '100%', label: 'Verified Accounts', icon: 'ShieldCheck', color: '#10b981' },
  { value: '24/7', label: 'Support via DM', icon: 'MessageCircle', color: '#f59e0b' },
];

export const TRUST_ITEMS = [
  { icon: 'ShieldCheck', text: 'Trusted by 500+ students' },
  { icon: 'Star', text: '4.9 / 5 average rating' },
  { icon: 'Clock', text: 'Delivery within 30 minutes' },
  { icon: 'RefreshCw', text: 'Replacement guarantee' },
  { icon: 'Zap', text: 'Instant activation' },
];
