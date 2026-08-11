/**
 * Everything the admin can change about the public site, with the values the
 * site ships with.
 *
 * This is the contract for the settings document. The database stores only
 * what the admin actually changed; the frontend merges that over this object,
 * so a missing key — or a database that is completely unreachable — always
 * falls back to a working site rather than a blank one.
 *
 * Adding a setting: add it here, then add a field for it in
 * pages/admin/AdminSettings.jsx. Nothing else needs to change.
 */
export const DEFAULT_SETTINGS = {
  brand: {
    name: 'SubStore',
    tagline: 'Premium subscriptions & tools',
    // Empty means the site draws its own mark — the primary-colour tile with a
    // bolt in it. Set from Settings → Brand, either by uploading a file or by
    // pasting a URL.
    logoUrl: '',
    // Empty means every order button leads nowhere — this is the one setting
    // the site genuinely cannot work without.
    instagramHandle: '',
    // The lime marquee band and the navbar accent.
    accentColor: '#DFF264',
    primaryColor: '#4f46e5',
  },

  hero: {
    eyebrow: 'For students · Order via Instagram DM',
    ctaLabel: 'Order on Instagram',
  },

  trustBanner: {
    items: [
      { icon: 'ShieldCheck', text: 'Trusted by 500+ students' },
      { icon: 'Star', text: '4.9 / 5 average rating' },
      { icon: 'Clock', text: 'Delivery within 30 minutes' },
      { icon: 'RefreshCw', text: 'Replacement guarantee' },
      { icon: 'Zap', text: 'Instant activation' },
    ],
  },

  stats: {
    // An empty `value` means "work it out from the catalogue" — that is how
    // the deal count and lowest price stay correct without anyone editing them.
    items: [
      { value: '', label: 'Premium Deals', icon: 'Tag', color: '#4f46e5', auto: 'productCount' },
      { value: '', label: 'Starts From', icon: 'Wallet', color: '#06b6d4', auto: 'minPrice' },
      { value: '100%', label: 'Verified Accounts', icon: 'ShieldCheck', color: '#10b981', auto: '' },
      { value: '24/7', label: 'Support via DM', icon: 'MessageCircle', color: '#f59e0b', auto: '' },
    ],
  },

  nav: {
    links: [
      { label: 'Deals', id: 'deals' },
      { label: 'Offers', id: 'offers' },
      { label: 'Daily Deals', id: 'daily-deals' },
      { label: 'Contact', id: 'contact' },
    ],
  },

  /** Show or hide each block of the home page, top to bottom. */
  sections: {
    hero: true,
    dealCarousel: true,
    trustBanner: true,
    stats: true,
    categories: true,
    deals: true,
    offers: true,
    proofs: true,
    testimonials: true,
    contact: true,
  },

  order: {
    // Shown above the name/username form in the order modal.
    modalTitle: 'Almost there',
    modalNote: 'Fill in your details so we can recognise you in the DM.',
    // Prefix of the message copied to the clipboard before the DM opens.
    messagePrefix: "Hi! I'd like to order:",
  },

  footer: {
    note: 'All subscriptions are shared/family plan accounts. Prices are subject to availability.',
  },
};

/**
 * Deep-merges a stored settings document over the defaults.
 * Arrays are replaced wholesale, never merged item by item — otherwise
 * deleting the last nav link would silently bring the default back.
 */
export function mergeSettings(stored) {
  const merge = (base, override) => {
    if (!override || typeof override !== 'object' || Array.isArray(override)) {
      return override === undefined ? base : override;
    }
    const out = { ...base };
    for (const [k, v] of Object.entries(override)) {
      out[k] = (base?.[k] && typeof base[k] === 'object' && !Array.isArray(base[k]))
        ? merge(base[k], v)
        : v;
    }
    return out;
  };
  return merge(DEFAULT_SETTINGS, stored || {});
}
