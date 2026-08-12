import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { signIn, getSession } from '../../services/auth';
import { useAdminTheme } from '../../context/useAdminTheme';
import { field, labelCls, btnPrimary, radius } from '../../components/admin/ui';
import { BrandMark } from '../../components/ui/BrandMark';
import { useSettings } from '../../context/useSettings';
import { hideAppLoader } from '../../lib/appLoader';

export default function AdminLogin() {
  const { brand } = useSettings();
  const { theme } = useAdminTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // already signed in — go straight to the dashboard
  useEffect(() => {
    getSession()
      .then((s) => { if (s) navigate('/admin', { replace: true }); })
      // Keep the splash up until we know whether to redirect, so an already
      // signed-in admin never sees the login form flash past.
      .finally(hideAppLoader);
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-theme={theme}
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: 'var(--admin-sidebar)' }}
    >
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <BrandMark
            size={40}
            iconSize={19}
            background="var(--admin-sidebar-active)"
            iconColor="var(--admin-sidebar-active-text)"
          />
          <div>
            <div className="font-bold text-white text-[17px] leading-tight" style={{ letterSpacing: '-0.3px' }}>
              {brand.name}
            </div>
            <div className="text-[11px] leading-tight" style={{ color: 'var(--admin-sidebar-text)' }}>
              Admin panel
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-surface p-7 flex flex-col gap-4"
          style={{ borderRadius: radius, boxShadow: '0 20px 50px rgba(0,0,0,0.28)' }}
        >
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Email</span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${field} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-faint hover:text-ink transition-colors"
              >
                {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
              </button>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 text-[13px] px-3.5 py-2.5 rounded-xl"
              style={{ background: 'var(--admin-danger-soft)', color: 'var(--admin-danger)' }}
            >
              <Icons.AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`${btnPrimary} mt-1 py-3`}
            style={{ background: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}
          >
            {busy ? <Icons.Loader2 size={16} className="animate-spin" /> : <Icons.LogIn size={16} />}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-[11px] text-faint mt-1 leading-relaxed text-center">
            Admin accounts come from the deployment&apos;s <code>ADMIN_ACCOUNTS</code> setting.
            There is no signup here.
          </p>
        </form>
      </div>
    </div>
  );
}
