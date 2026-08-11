import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { signOut } from '../services/auth';
import { useAdminTheme } from '../context/useAdminTheme';
import { ThemeToggle } from '../components/admin/ThemeToggle';
import { leadStats } from '../services/leads';
import { BrandMark } from '../components/ui/BrandMark';
import { useSettings } from '../context/useSettings';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'LayoutGrid', end: true },
  { to: '/admin/products', label: 'Products', icon: 'Tag' },
  { to: '/admin/offers', label: 'Daily Offers', icon: 'Flame' },
  { to: '/admin/proofs', label: 'Proofs', icon: 'Image' },
  { to: '/admin/leads', label: 'Leads', icon: 'Users', badge: 'newLeads' },
  { to: '/admin/settings', label: 'Global Settings', icon: 'Settings' },
];

function Brand({ compact = false }) {
  const { brand } = useSettings();

  return (
    <div className="flex items-center gap-3 px-1">
      <BrandMark
        size={compact ? 30 : 38}
        iconSize={compact ? 15 : 18}
        background="var(--admin-highlight)"
        iconColor="var(--admin-sidebar-active-text)"
      />
      <div className="min-w-0">
        <div className="font-bold text-white leading-tight" style={{ fontSize: compact ? 14 : 16, letterSpacing: '-0.3px' }}>
          {brand.name}
        </div>
        {!compact && (
          <div className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--admin-sidebar-text)' }}>
            Subscription store
          </div>
        )}
      </div>
    </div>
  );
}

function NavList({ counts, onNavigate = undefined }) {
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map(({ to, label, icon, end, badge }) => {
        const Icon = Icons[icon] || Icons.Circle;
        const count = badge ? counts[badge] : 0;
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors"
            style={({ isActive }) => ({
              background: isActive ? 'var(--admin-sidebar-active)' : 'transparent',
              color: isActive ? 'var(--admin-sidebar-active-text)' : 'var(--admin-sidebar-text)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[19px] text-center"
                    style={isActive
                      ? { background: 'var(--admin-sidebar-active-text)', color: 'var(--admin-highlight)' }
                      : { background: 'var(--admin-highlight)', color: 'var(--admin-sidebar-active-text)' }}
                  >
                    {count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const { theme } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ newLeads: 0 });

  // The sidebar badge is the only place the client sees "something is waiting"
  // without opening a page, so it refreshes on every navigation.
  useEffect(() => {
    let alive = true;
    leadStats()
      .then((s) => alive && setCounts({ newLeads: s.newCount ?? 0 }))
      .catch(() => { /* a failed badge must never break the page */ });
    return () => { alive = false; };
  }, [location.pathname]);

  // close the mobile drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const logout = () => {
    signOut();
    navigate('/admin/login', { replace: true });
  };

  const sidebarStyle = { background: 'var(--admin-sidebar)' };

  const footer = (
    <div className="flex flex-col gap-1">
      <ThemeToggle />
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-colors hover:bg-[var(--admin-sidebar-hover)]"
        style={{ color: 'var(--admin-sidebar-text)' }}
      >
        <Icons.ExternalLink size={17} />
        View site
      </a>
      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-left transition-colors hover:bg-[var(--admin-sidebar-hover)]"
        style={{ color: 'var(--admin-sidebar-text)' }}
      >
        <Icons.LogOut size={17} />
        Log out
      </button>
    </div>
  );

  return (
    <div data-theme={theme} className="min-h-screen flex bg-canvas">
      {/* desktop sidebar */}
      <aside
        className="hidden lg:flex w-[248px] shrink-0 flex-col justify-between p-4 fixed inset-y-0 left-0"
        style={sidebarStyle}
      >
        <div>
          <div className="py-3 mb-6"><Brand /></div>
          <NavList counts={counts} />
        </div>
        {footer}
      </aside>

      {/* mobile top bar */}
      <header
        className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14"
        style={sidebarStyle}
      >
        <Brand compact />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          style={{ color: '#ffffff' }}
        >
          {open ? <Icons.X size={22} /> : <Icons.Menu size={22} />}
        </button>
      </header>

      {/* mobile drawer */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-14 z-30"
            style={{ background: 'rgba(18,48,58,0.45)' }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="lg:hidden fixed top-14 inset-x-0 z-40 p-4 flex flex-col gap-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto"
            style={sidebarStyle}
          >
            <NavList counts={counts} onNavigate={() => setOpen(false)} />
            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>{footer}</div>
          </div>
        </>
      )}

      <main className="flex-1 min-w-0 lg:ml-[248px] px-4 sm:px-6 lg:px-8 pb-10 pt-18 lg:pt-8">
        <div className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1560px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
