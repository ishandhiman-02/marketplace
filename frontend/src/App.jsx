import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { hideAppLoader } from './lib/appLoader';
import { SmoothScroll } from './components/ui/SmoothScroll';
import { ProtectedRoute } from './components/ProtectedRoute';
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
 * Dismisses the first-paint loader for every route except the storefront.
 *
 * The storefront hides it itself, once its settings and catalogue land — see
 * SiteReady in pages/Home. Every admin screen already has its own skeletons and
 * a sign-in redirect, so holding a splash over them would only delay the thing
 * that is about to render anyway.
 */
function AppLoaderController() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== '/') hideAppLoader();
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <AppLoaderController />

      {/* Mounted above the router so scrolling stays smooth across
          navigations instead of being torn down and rebuilt each time. */}
      <SmoothScroll />

      <Routes>
        {/* public site — unchanged */}
        <Route path="/" element={<Home />} />

        {/* The theme provider wraps both admin entry points — the login screen
            is outside AdminLayout, and it should not flash the wrong theme
            before you are even signed in. */}
        <Route
          path="/admin/login"
          element={(
            <AdminThemeProvider>
              <AdminLogin />
            </AdminThemeProvider>
          )}
        />
        <Route
          path="/admin"
          element={(
            <AdminThemeProvider>
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            </AdminThemeProvider>
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
