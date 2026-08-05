import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { IgIcon } from './IgIcon';
import { openInstagram } from '../../lib/instagram';

// Padded-frame card — reference ka signature treatment:
// card ke andar image inset baithti hai apne rounded corners ke saath.
export function ProductCard({ product, className = '', style }) {
  const Icon = Icons[product.icon] || Icons.HelpCircle;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`group cursor-pointer flex flex-col h-full bg-surface border border-line ${className}`}
      style={{ borderRadius: 26, padding: 10, ...style }}
    >
      <div className="relative overflow-hidden" style={{ borderRadius: 18, aspectRatio: '4 / 3' }}>
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <span
          className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.92)', color: '#0f172a', backdropFilter: 'blur(8px)' }}
        >
          {product.tag}
        </span>
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white">
          <Icon size={15} style={{ color: product.color }} />
        </div>
      </div>

      <div className="px-3 pt-4 pb-2 flex flex-col flex-1">
        <div className="text-[10px] font-semibold uppercase mb-2 text-faint" style={{ letterSpacing: '0.12em' }}>
          {product.category}
        </div>

        <h3 className="font-semibold text-[17px] leading-tight mb-1 text-ink" style={{ letterSpacing: '-0.4px' }}>
          {product.title}
        </h3>
        <p className="text-xs mb-2.5 text-muted">{product.subtitle}</p>
        <p className="text-xs leading-relaxed mb-4 line-clamp-2 text-faint">{product.description}</p>

        {product.variants && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.variants.map((v) => (
              <span key={v.label} className="text-[11px] px-2.5 py-1 rounded-full bg-surface-2 text-muted">
                {v.label} · Rs.{v.price}
              </span>
            ))}
          </div>
        )}

        {/* bada price numeral — reference ke pricing cards jaisa */}
        <div className="flex items-end justify-between mt-auto pt-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[13px] font-semibold text-faint">Rs.</span>
              <span className="text-[30px] font-bold leading-none text-ink" style={{ letterSpacing: '-1.5px' }}>
                {product.price}
              </span>
            </div>
            <div className="text-[11px] mt-1 text-faint">{product.duration}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={openInstagram}
            className="px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' }}
          >
            <IgIcon size={12} />
            Order
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
