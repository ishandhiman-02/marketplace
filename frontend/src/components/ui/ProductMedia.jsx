import { mediaUrl } from '../../lib/api';
import { BRAND_ICONS } from '../../data/brandIcons';

/**
 * The large artwork on a product card.
 *
 * What a shopper needs here is "which service is this?", and a big brand mark
 * answers that instantly where a stock photograph does not — the catalogue ships
 * seven generic gradients shared across twenty-one products.
 *
 * Precedence, and the reason for it:
 *   1. an uploaded image (/uploads/…) — someone chose it deliberately, it wins;
 *   2. the official brand mark, on a solid wash of the brand's own colour;
 *   3. an uploaded logo, same treatment;
 *   4. the shipped stock photo — still better than an empty box;
 *   5. the product's initials.
 *
 * Only the shipped placeholders lose to a brand mark. Anything uploaded is kept.
 *
 * Every branch fills its parent with `absolute inset-0` and an OPAQUE
 * background. Both matter: the hero fans these tiles over a dark page, so a
 * translucent wash let the cards behind show straight through, and a percentage
 * size on the mark could not resolve against a parent sized only by aspect-ratio,
 * which blew the logos up past the edge of the card.
 */

const isUploaded = (src) => typeof src === 'string' && src.startsWith('/uploads/');

function initials(title = '') {
  const words = String(title).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const FILL = 'absolute inset-0 w-full h-full';
const CENTRE = `${FILL} flex items-center justify-center overflow-hidden`;

/**
 * A pale but fully OPAQUE wash of the brand colour.
 *
 * Blended here rather than with `color-mix` or an alpha suffix on purpose: both
 * of those depend on whatever sits behind the element, and in the hero the cards
 * are fanned over each other. The result has to be a solid colour.
 */
function wash(hex, dark) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  const base = dark ? [17, 28, 26] : [255, 255, 255];
  if (!m) return dark ? '#111c1a' : '#ffffff';

  const n = parseInt(m[1], 16);
  const brand = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const amount = dark ? 0.22 : 0.12;

  const mix = brand.map((c, i) => Math.round(c * amount + base[i] * (1 - amount)));
  return `rgb(${mix.join(',')})`;
}

export function ProductMedia({ product, dark = false, className = '', imgClassName = '' }) {
  const { image, logo, title, color = '#4f46e5' } = product ?? {};
  const brand = BRAND_ICONS[title];

  // 1. A deliberately uploaded photo always wins.
  if (isUploaded(image)) {
    return <img src={mediaUrl(image)} alt={title} className={`${FILL} object-cover ${imgClassName}`} />;
  }

  // 2. Official brand mark. Sized in a way that cannot overflow: the mark is
  //    capped on both axes and centred, with breathing room around it.
  if (brand) {
    return (
      <div className={`${CENTRE} ${className}`} style={{ background: wash(brand.hex, dark) }}>
        <svg
          viewBox="0 0 24 24"
          fill={brand.hex}
          role="img"
          aria-label={`${brand.title} logo`}
          className="max-w-[44%] max-h-[44%] w-[44%] h-auto"
        >
          <path d={brand.path} />
        </svg>
      </div>
    );
  }

  // 3. An uploaded logo, same treatment. object-contain keeps a wide wordmark
  //    from being stretched or cropped.
  if (logo) {
    return (
      <div className={`${CENTRE} ${className}`} style={{ background: wash(color, dark) }}>
        <img
          src={mediaUrl(logo)}
          alt={title ? `${title} logo` : ''}
          className="max-w-[66%] max-h-[46%] object-contain"
        />
      </div>
    );
  }

  // 4. Whatever shipped image there is.
  if (image) {
    return <img src={mediaUrl(image)} alt={title} className={`${FILL} object-cover ${imgClassName}`} />;
  }

  // 5. Nothing at all — initials, so a card is never an empty box.
  return (
    <div className={`${CENTRE} ${className}`} style={{ background: wash(color, dark) }}>
      <span className="font-bold text-[2.4rem] leading-none" style={{ color, letterSpacing: '-0.03em' }}>
        {initials(title)}
      </span>
    </div>
  );
}
