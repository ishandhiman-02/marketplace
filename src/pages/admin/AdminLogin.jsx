import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { signIn, getSession } from '../../services/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // pehle se logged in ho to seedha dashboard
  useEffect(() => {
    getSession().then((s) => { if (s) navigate('/admin', { replace: true }); });
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(
        err?.message?.includes('galat')
          ? 'Email ya password galat hai.'
          : err.message || 'Login nahi ho paaya. Dobara koshish karein.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-theme="light" className="min-h-screen flex items-center justify-center px-6" style={{ background: '#E7E8E4' }}>
      <div className="w-full max-w-sm bg-surface border border-line p-8" style={{ borderRadius: 26 }}>
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-[10px] bg-ink flex items-center justify-center">
            <Icons.Zap size={15} className="text-canvas" />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-ink">SubStore admin</span>
        </div>


        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-muted">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm outline-none focus:border-ink transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-muted">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm outline-none focus:border-ink transition-colors"
            />
          </label>

          {error && (
            <div role="alert" className="text-[13px] px-3.5 py-2.5 rounded-xl" style={{ background: '#FEE2E2', color: '#991B1B' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 py-3 rounded-full text-sm font-semibold bg-ink text-canvas disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-[11px] text-faint mt-6 leading-relaxed">
          Admin account terminal se banta hai — <code>npm run db:create-admin</code>.
          Yahan signup nahi hai.
        </p>
      </div>
    </div>
  );
}
