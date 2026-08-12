import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { hideAppLoader } from './lib/appLoader';
import { TopProgress } from './components/ui/TopProgress';
import { SmoothScroll } from './components/ui/SmoothScroll';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SettingsProvider } from './context/SettingsContext';
import { AdminThemeProvider } from './context/AdminThemeContext';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOffers from './pages/admin/AdminOffers';
import AdminProofs from './pages/admin/AdminProofs';
import AdminLeads from './pages/admin/AdminLeads';
import AdminSettings from './pages/admin/AdminSettings';

/**
 * Fallback dismissal of the first-paint loader.
 *
 * The two routes that matter hand it off themselves, so the splash lifts only
 * when there is something finished to show:
 *   /        — SiteReady, once settings and the catalogue have landed;
 *   /admin*  — the session check, so no spinner and no flash of the login form.
 *
 * Anything else has nothing to wait for and drops it on arrival. The timer in
 * index.html is still the backstop if a route ever forgets.
 */
function AppLoaderController() {
  const { pathname } = useLocation();

  useEffect(() => {
    // The storefront hides it when its data lands (SiteReady), and the admin
    // when its session check settles. Anything else has nothing to wait for.
    const owned = pathname === '/' || pathname.startsWith('/admin');
    if (!owned) hideAppLoader();
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <AppLoaderController />
      <TopProgress />

      {/* Mounted above the router so scrolling stays smooth across
          navigations instead of being torn down and rebuilt each time. */}
      <SmoothScroll />

      <Routes>
        {/* public site — unchanged */}
        <Route path="/" element={<Home />} />

        {/* The theme provider wraps both admin entry points — the login screen
            is outside AdminLayout, and it should not flash the wrong theme
            before you are even signed in. */}
        {/* SettingsProvider wraps the admin too, so the panel carries the
            client's own logo and name rather than the shipped placeholder. */}
        <Route
          path="/admin/login"
          element={(
            <SettingsProvider>
              <AdminThemeProvider>
                <AdminLogin />
              </AdminThemeProvider>
            </SettingsProvider>
          )}
        />
        <Route
          path="/admin"
          element={(
            <SettingsProvider>
              <AdminThemeProvider>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </AdminThemeProvider>
            </SettingsProvider>
          )}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="proofs" element={<AdminProofs />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}
