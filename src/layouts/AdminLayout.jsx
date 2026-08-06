import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { signOut } from '../services/auth';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', end: true },
  { to: '/admin/products', label: 'Products', icon: 'Tag' },
  { to: '/admin/offers', label: 'Daily Offers', icon: 'Flame' },
  { to: '/admin/proofs', label: 'Proofs', icon: 'Image' },
  { to: '/admin/leads', label: 'Leads', icon: 'Users' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {LINKS.map(({ to, label, icon, end }) => {
        const Icon = Icons[icon] || Icons.Circle;
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-ink text-canvas' : 'text-muted hover:text-ink hover:bg-surface-2'
              }`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div data-theme="light" className="min-h-screen flex" style={{ background: '#FAFAFA' }}>
      {/* desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col justify-between p-5 border-r border-line bg-surface">
        <div>
          <div className="flex items-center gap-2.5 mb-8 px-1">
            <div className="w-8 h-8 rounded-[10px] bg-ink flex items-center justify-center">
              <Icons.Zap size={15} className="text-canvas" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-ink">SubStore</span>
          </div>
          {nav}
        </div>
        <div className="flex flex-col gap-1">
          <a href="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-ink hover:bg-surface-2 transition-colors">
            <Icons.ExternalLink size={16} />
            View site
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer text-left"
          >
            <Icons.LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 bg-surface border-b border-line">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
            <Icons.Zap size={13} className="text-canvas" />
          </div>
          <span className="font-bold text-sm text-ink">SubStore</span>
        </div>
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="text-ink cursor-pointer">
          {open ? <Icons.X size={20} /> : <Icons.Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed top-14 inset-x-0 z-40 p-4 bg-surface border-b border-line">
          {nav}
          <button
            onClick={logout}
            className="mt-1 w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted cursor-pointer"
          >
            <Icons.LogOut size={16} />
            Logout
          </button>
        </div>
      )}

      <main className="flex-1 min-w-0 p-5 md:p-8 pt-19 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
