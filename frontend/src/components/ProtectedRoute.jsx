import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../services/auth';
import { hideAppLoader } from '../lib/appLoader';

export function ProtectedRoute({ children }) {
  // undefined = still checking, null = logged out, object = logged in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let alive = true;
    getSession()
      .then((s) => { if (alive) setSession(s); })
      // Only now is it safe to drop the splash: either the panel is about to
      // render or we are about to redirect. Hiding it earlier showed a spinner,
      // and sometimes a flash of the login form, before the redirect landed.
      .finally(hideAppLoader);
    return () => { alive = false; };
  }, []);

  // The first-paint loader is still covering the screen while this resolves, so
  // rendering a second spinner underneath it would only cause a visible swap.
  if (session === undefined) return null;

  if (!session) return <Navigate to="/admin/login" replace />;

  return children;
}
