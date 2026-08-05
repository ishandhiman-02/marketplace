import { DarkModeProvider } from '../context/DarkModeContext';
import { useDark } from '../context/useDark';
import { Navbar } from '../components/sections/Navbar';
import { HeroSection } from '../components/sections/HeroSection';
import { DealCarousel } from '../components/sections/DealCarousel';
import { StatementSection } from '../components/sections/StatementSection';
import { CategorySplit } from '../components/sections/CategorySplit';
import { BrandCloud } from '../components/sections/BrandCloud';
import { OffersBento } from '../components/sections/OffersBento';
import { MarketplaceSection } from '../components/sections/MarketplaceSection';
import { PricingFan } from '../components/sections/PricingFan';
import { MarqueeBand } from '../components/sections/MarqueeBand';
import { OrderCta } from '../components/sections/OrderCta';
import { Footer } from '../components/sections/Footer';
import { FloatingInstagramButton } from '../components/sections/FloatingInstagramButton';

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
        className="bg-canvas"
        style={{
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
        <MarqueeBand />
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
