import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../services/auth';

export function ProtectedRoute({ children }) {
  // undefined = still checking, null = logged out, object = logged in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let alive = true;
    getSession().then((s) => { if (alive) setSession(s); });
    return () => { alive = false; };
  }, []);

  // show loading until the check finishes — otherwise the login page flashes briefly
  if (session === undefined) {
    return (
      <div data-theme="admin" className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="w-4 h-4 rounded-full border-2 border-line border-t-[var(--admin-accent)] animate-spin" />
          Checking session…
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  return children;
}
