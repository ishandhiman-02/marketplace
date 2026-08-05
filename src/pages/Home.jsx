import * as Icons from 'lucide-react';

import { DarkModeProvider } from '../context/DarkModeContext';
import { useDark } from '../context/useDark';
import { TRUST_ITEMS } from '../data/social';
import { Navbar } from '../components/sections/Navbar';
import { HeroSection } from '../components/sections/HeroSection';
import { MarketplaceSection } from '../components/sections/MarketplaceSection';
import { DealCarousel } from '../components/sections/DealCarousel';
import { OffersBento } from '../components/sections/OffersBento';
import { PricingFan } from '../components/sections/PricingFan';
import { StatementSection } from '../components/sections/StatementSection';
import { CategorySplit } from '../components/sections/CategorySplit';
import { BrandCloud } from '../components/sections/BrandCloud';
import { OrderCta } from '../components/sections/OrderCta';
import { Footer } from '../components/sections/Footer';
import { FloatingInstagramButton } from '../components/sections/FloatingInstagramButton';

// ─── TRUST BANNER ────────────────────────────────────────────────────────────

function TrustBanner() {
  const { dark } = useDark();
  // seamless loop ke liye list do baar — marquee-track -50% shift karta hai
  const row = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <section className="py-6 md:py-10" style={{ background: dark ? '#0f172a' : '#FAFAFA' }}>
      <div
        className="mx-3 md:mx-6 rounded-3xl overflow-hidden py-5 md:py-7"
        style={{ background: '#DFF264' }}
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

// ─── HOME ────────────────────────────────────────────────────────────────────

function HomeInner() {
  const { dark } = useDark();

  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      style={{
        background: dark ? '#070F0E' : '#E7E8E4',
        minHeight: '100vh',
        padding: 'clamp(0px, 2.2vw, 30px)',
        transition: 'background 0.3s',
      }}
    >
      {/* inset canvas — poori site ek rounded card ke andar.
          overflow: clip hi rakhna — hidden sticky navbar tod deta hai */}
      <div
        style={{
          background: dark ? '#0f172a' : '#FAFAFA',
          maxWidth: 1720,
          margin: '0 auto',
          borderRadius: 'clamp(0px, 2.2vw, 30px)',
          overflow: 'clip',
          boxShadow: dark ? '0 24px 70px rgba(0,0,0,0.55)' : '0 24px 70px rgba(15,23,42,0.10)',
          transition: 'background 0.3s',
        }}
      >
        <Navbar />
        <HeroSection />
        <DealCarousel />
        <StatementSection />
        <CategorySplit />
        <BrandCloud />
        <OffersBento />
        <MarketplaceSection />
        <PricingFan />
        <TrustBanner />
        <OrderCta />
        <Footer />
      </div>
      <FloatingInstagramButton />
    </div>
  );
}

export default function Home() {
  return (
    <DarkModeProvider>
      <HomeInner />
    </DarkModeProvider>
  );
}
