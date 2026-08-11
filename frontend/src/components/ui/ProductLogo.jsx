import { mediaUrl } from '../../lib/api';
import { BRAND_ICONS } from '../../data/brandIcons';

/**
 * The brand mark on a product card.
 *
 * Three sources, in order:
 *   1. a logo uploaded in the admin — always wins, so any product can be given
 *      artwork the client actually holds the rights to;
 *   2. the service's official mark, for the brands that publish one;
 *   3. the product's initials on its brand colour.
 *
 * The badge used to be a lucide icon from a short list, which meant all six VPNs
 * showed the same shield and all four streaming services the same TV — the cards
 * were impossible to tell apart.
 *
 * Trademarks belong to their owners and are shown to identify the service being
 * resold; see data/brandIcons.js.
 */

/** "Prime Video" → "PV", "Spotify" → "SP". */
function initials(title = '') {
  const words = String(title).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function ProductLogo({ product, size = 32, className = '' }) {
  const { logo, title, color = '#4f46e5' } = product ?? {};
  const brand = BRAND_ICONS[title];

  const shell = `rounded-full flex items-center justify-center shrink-0 overflow-hidden ${className}`;

  // 1. Uploaded logo — on white, since most logos assume a light background.
  if (logo) {
    return (
      <span className={`${shell} bg-white`} style={{ width: size, height: size }}>
        <img
          src={mediaUrl(logo)}
          alt={title ? `${title} logo` : ''}
          className="object-contain"
          style={{ width: size * 0.68, height: size * 0.68 }}
        />
      </span>
    );
  }

  // 2. Official brand mark, drawn in white on the brand's own colour. The glyphs
  //    are single-path and monochrome by design, so tinting them is intended use.
  if (brand) {
    return (
      <span
        className={shell}
        style={{ width: size, height: size, background: brand.hex }}
        title={brand.title}
      >
        <svg
          viewBox="0 0 24 24"
          width={size * 0.56}
          height={size * 0.56}
          fill="#ffffff"
          role="img"
          aria-label={`${brand.title} logo`}
        >
          <path d={brand.path} />
        </svg>
      </span>
    );
  }

  // 3. Initials, so a product with no mark still reads as its own thing.
  return (
    <span
      aria-hidden="true"
      className={`${shell} font-bold`}
      style={{
        width: size,
        height: size,
        background: color,
        color: '#ffffff',
        fontSize: Math.round(size * 0.36),
        letterSpacing: '-0.02em',
      }}
    >
      {initials(title)}
    </span>
  );
}
