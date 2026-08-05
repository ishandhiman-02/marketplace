import * as Icons from 'lucide-react';
import { openInstagram } from '../../lib/instagram';
import { IgIcon } from '../ui/IgIcon';

export function Footer() {
  return (
    <footer className="py-8 bg-canvas border-t border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-ink flex items-center justify-center">
            <Icons.Zap size={12} className="text-canvas" />
          </div>
          <span className="font-bold text-sm text-ink">SubStore</span>
        </div>
        <p className="text-xs text-center text-faint">
          All subscriptions are shared/family plan accounts. Prices are subject to availability.
        </p>
        <button
          onClick={openInstagram}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-line text-ink cursor-pointer hover:bg-surface-2 transition-colors"
        >
          <IgIcon size={12} color="#E1306C" />
          Instagram
        </button>
      </div>
    </footer>
  );
}
