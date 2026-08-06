import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOffers from './pages/admin/AdminOffers';
import AdminProofs from './pages/admin/AdminProofs';
import AdminLeads from './pages/admin/AdminLeads';

export default function App() {
  return (
    <Routes>
      {/* public site — bilkul waisi hi */}
      <Route path="/" element={<Home />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={(
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="proofs" element={<AdminProofs />} />
        <Route path="leads" element={<AdminLeads />} />
      </Route>
    </Routes>
  );
}
