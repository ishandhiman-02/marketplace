import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
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

export default function App() {
  return (
    <>
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
