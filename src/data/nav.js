export const NAV_LINKS = ['Deals', 'Offers', 'Daily Deals', 'Contact'];

// Label → section id. This used to be `label.toLowerCase()`, which
// For 'Daily Deals' this produced '#daily deals' (with a space) — a broken anchor.
export const NAV_IDS = {
  'Deals': 'deals',
  'Offers': 'offers',
  'Daily Deals': 'daily-deals',
  'Contact': 'contact',
};