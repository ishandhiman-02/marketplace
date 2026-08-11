import { useEffect } from 'react';
import { DarkModeProvider } from '../context/DarkModeContext';
import { SettingsProvider } from '../context/SettingsContext';
import { CatalogProvider } from '../context/CatalogContext';
import { useDark } from '../context/useDark';
import { useSettings } from '../context/useSettings';
import { useCatalog } from '../context/useCatalog';
import { hideAppLoader } from '../lib/appLoader';
import { Navbar } from '../components/sections/Navbar';
import { HeroSection } from '../components/sections/HeroSection';
import { DealCarousel } from '../components/sections/DealCarousel';
import { TrustBanner } from '../components/sections/TrustBanner';
import { StatsSection } from '../components/sections/StatsSection';
import { CategoriesSection } from '../components/sections/CategoriesSection';
import { DealsSection } from '../components/sections/DealsSection';
import { OffersSection } from '../components/sections/OffersSection';
import { ProofSection } from '../components/sections/ProofSection';
import { ContactSection } from '../components/sections/ContactSection';
import { Footer } from '../components/sections/Footer';
import { FloatingInstagramButton } from '../components/sections/FloatingInstagramButton';
import { OrderToast } from '../components/sections/OrderToast';
import { ProofsSection } from '../components/sections/ProofsSection';
import { OrderModal } from '../components/OrderModal';

/**
 * Holds the first-paint loader until the storefront has something real to show.
 *
 * Both providers render immediately with fallbacks, so without this gate the
 * visitor would watch the default brand and the bundled catalogue get replaced
 * by the live ones a moment later. Waiting costs nothing and removes the pop.
 */
function SiteReady() {
  const { ready } = useSettings();
  const { loading } = useCatalog();

  useEffect(() => {
    if (ready && !loading) hideAppLoader();
  }, [ready, loading]);

  return null;
}

function HomeInner() {
  const { dark } = useDark();
  const { sections } = useSettings();

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
      <SiteReady />

      {/* inset canvas — the whole site sits inside one rounded card.
          keep overflow: clip — hidden breaks the sticky navbar */}
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
        {sections.hero && <HeroSection />}
        {sections.dealCarousel && <DealCarousel />}
        {sections.trustBanner && <TrustBanner />}
        {sections.stats && <StatsSection />}
        {sections.categories && <CategoriesSection />}
        {sections.deals && <DealsSection />}
        {sections.offers && <OffersSection />}
        {sections.proofs && <ProofsSection />}
        {sections.testimonials && <ProofSection />}
        {sections.contact && <ContactSection />}
        <Footer />
      </div>
      <FloatingInstagramButton />
      <OrderModal />
      <OrderToast />
    </div>
  );
}

export default function Home() {
  return (
    <SettingsProvider>
      <CatalogProvider>
        <DarkModeProvider>
          <HomeInner />
        </DarkModeProvider>
      </CatalogProvider>
    </SettingsProvider>
  );
}
