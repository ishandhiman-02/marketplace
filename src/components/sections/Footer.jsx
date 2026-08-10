import * as Icons from 'lucide-react';
import { orderOnInstagram } from '../../config/site';
import { useDark } from '../../context/useDark';
import { useSettings } from '../../context/useSettings';
import { IgIcon } from '../ui/IgIcon';

export function Footer() {
  const { dark } = useDark();
  const { brand, footer } = useSettings();
  return (
    <footer className="py-8" style={{
      background: dark ? '#0f172a' : '#f8faff',
      borderTop: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`,
    }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: brand.primaryColor }}>
            <Icons.Zap size={12} color="#fff" />
          </div>
          <span className="font-bold text-sm" style={{ color: dark ? '#f8fafc' : '#0f172a' }}>{brand.name}</span>
        </div>
        <p className="text-xs text-center" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
          {footer.note}
        </p>
        <button
          onClick={() => orderOnInstagram()}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full"
          style={{ background: 'rgba(131,58,180,0.08)', color: '#4f46e5', border: '1px solid rgba(131,58,180,0.2)' }}
        >
          <IgIcon size={12} color="#4f46e5" />
          Instagram
        </button>
      </div>
    </footer>
  );
}
