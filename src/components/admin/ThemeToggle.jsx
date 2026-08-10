import * as Icons from 'lucide-react';
import { useAdminTheme } from '../../context/useAdminTheme';

/**
 * Single light/dark switch in the sidebar footer.
 *
 * Built as a row rather than a bare icon so it matches "View site" and
 * "Log out" sitting directly beneath it. The pill on the right is the
 * affordance; the label says which mode you are in now.
 */
export function ThemeToggle() {
  const { dark, toggle } = useAdminTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium
                 text-left transition-colors hover:bg-[var(--admin-sidebar-hover)]"
      style={{ color: 'var(--admin-sidebar-text)' }}
    >
      {dark ? <Icons.Moon size={17} /> : <Icons.Sun size={17} />}
      <span className="flex-1">{dark ? 'Dark mode' : 'Light mode'}</span>

      <span
        className="relative w-9 h-5 rounded-full transition-colors shrink-0"
        style={{ background: dark ? 'var(--admin-sidebar-active)' : 'rgba(255,255,255,0.18)' }}
        aria-hidden="true"
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
          style={{
            left: dark ? 18 : 2,
            background: dark ? 'var(--admin-sidebar-active-text)' : '#ffffff',
          }}
        />
      </span>
    </button>
  );
}
