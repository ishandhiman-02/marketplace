import * as Icons from 'lucide-react';
import { useDark } from '../../context/useDark';
import { useSettings } from '../../context/useSettings';

export function TrustBanner() {
  const { dark } = useDark();
  const { trustBanner, brand } = useSettings();
  const items = trustBanner.items.filter((i) => i.text?.trim());
  if (items.length === 0) return null;
  // list rendered twice for a seamless loop — marquee-track shifts by -50%
  const row = [...items, ...items];

  return (
    <section className="py-6 md:py-10" style={{ background: dark ? '#0f172a' : '#FAFAFA' }}>
      <div
        className="mx-3 md:mx-6 rounded-3xl overflow-hidden py-5 md:py-7"
        style={{ background: brand.accentColor }}
      >
        <div className="marquee-track flex items-center gap-8 md:gap-12 w-max">
          {row.map(({ icon, text }, i) => {
            const Icon = Icons[icon] || Icons.HelpCircle;
            return (
              <div key={`${text}-${i}`} className="flex items-center gap-3 shrink-0">
                <div
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#ffffff' }}
                >
                  <Icon size={17} style={{ color: '#0f172a' }} />
                </div>
                <span
                  className="text-lg md:text-2xl font-semibold whitespace-nowrap"
                  style={{ color: '#0f172a', letterSpacing: '-0.5px' }}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
