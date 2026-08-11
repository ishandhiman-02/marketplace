import * as Icons from 'lucide-react';
import { useSettings } from '../../context/useSettings';
import { mediaUrl } from '../../lib/api';

/**
 * The logo tile, in one place because the navbar and the footer must never
 * disagree about it.
 *
 * With no logo set the site draws its own mark — a primary-colour tile with a
 * bolt — so a brand-new store still looks finished. An uploaded logo replaces
 * the whole tile rather than sitting inside it: logos come with their own
 * padding and background, and boxing one in a coloured square is how you get
 * a white rectangle floating on the navbar.
 *
 * `object-contain` keeps a wide wordmark from being cropped to a square.
 */
export function BrandMark({
  size = 28,
  iconSize = 14,
  // The admin panel draws its fallback tile from its own theme tokens rather
  // than the storefront's primary colour, so both can be overridden. An
  // uploaded logo ignores them entirely — it replaces the tile.
  background,
  iconColor = '#fff',
}) {
  const { brand } = useSettings();

  if (brand.logoUrl) {
    return (
      <img
        src={mediaUrl(brand.logoUrl)}
        alt={brand.name}
        className="object-contain shrink-0"
        style={{ height: size, maxWidth: size * 3.5 }}
      />
    );
  }

  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: background ?? brand.primaryColor }}
    >
      <Icons.Zap size={iconSize} color={iconColor} />
    </div>
  );
}
