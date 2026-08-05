import { TRUST_ITEMS } from '../../data/social';
import { CATEGORIES } from '../../data/products';
import { Marquee } from '../ui/Marquee';
import { IconChip } from '../ui/IconChip';

import codingImg from '../../assets/coding_course_laptop_dark.jpg';
import designImg from '../../assets/design_course_creative_dark.jpg';
import studentImg from '../../assets/student_learning_technology.jpg';

// f09: lime band, giant scrolling text + inline image chips + ✦ glyphs,
// bottom edge pe white icon chips half-overlap karte hue
const INLINE_IMAGES = [codingImg, designImg, studentImg];

export function MarqueeBand() {
  return (
    <section className="py-10 pb-14 bg-canvas">
      <div className="relative mx-3 md:mx-6">
        <div
          className="overflow-hidden py-8 md:py-11"
          style={{ background: '#DFF264', borderRadius: 28 }}
        >
          <Marquee>
            {TRUST_ITEMS.map((item, i) => (
              <span key={item.text} className="flex items-center gap-5 md:gap-7 mx-3 md:mx-5 shrink-0">
                <span
                  className="font-bold whitespace-nowrap"
                  style={{
                    color: '#0f172a',
                    fontSize: 'clamp(26px, 3.6vw, 52px)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {item.text}
                </span>
                {i % 2 === 0 ? (
                  <img
                    src={INLINE_IMAGES[(i / 2) % INLINE_IMAGES.length | 0]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="object-cover shrink-0"
                    style={{ width: 44, height: 44, borderRadius: 14 }}
                  />
                ) : (
                  <span style={{ color: '#0f172a', fontSize: 26, lineHeight: 1 }}>✦</span>
                )}
              </span>
            ))}
          </Marquee>
        </div>

        {/* band ke neeche ke kinare pe icon chips — decorative */}
        <div className="absolute left-0 right-0 -bottom-5 hidden md:flex justify-around px-14 pointer-events-none">
          {CATEGORIES.map((c) => (
            <IconChip key={c.label} icon={c.icon} size={42} />
          ))}
        </div>
      </div>
    </section>
  );
}
