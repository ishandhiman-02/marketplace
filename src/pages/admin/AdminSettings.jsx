import { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { getSettings, saveSettings, resetSettings } from '../../services/settings';
import { mergeSettings, DEFAULT_SETTINGS } from '../../config/defaults';
import { PageHeader } from '../../components/admin/PageHeader';
import { SectionNav } from '../../components/admin/SectionNav';
import { ErrorBar } from '../../components/admin/Panel';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';
import {
  SettingsGroup, TextField, ColorField, ToggleRow, RepeaterField,
} from '../../components/admin/SettingsField';
import { btnPrimary, btnGhost, radius } from '../../components/admin/ui';

/** Jump chips at the top. Same order as the cards below. */
const NAV_SECTIONS = [
  { id: 'set-brand', label: 'Brand' },
  { id: 'set-colours', label: 'Colours' },
  { id: 'set-hero', label: 'Hero and buttons' },
  { id: 'set-navigation', label: 'Navigation' },
  { id: 'set-trust', label: 'Trust banner' },
  { id: 'set-stats', label: 'Stats row' },
  { id: 'set-order', label: 'Order form' },
  { id: 'set-sections', label: 'Sections' },
  { id: 'set-footer', label: 'Footer' },
];

/** Order matches the home page, top to bottom, so the list reads like the site. */
const SECTION_ROWS = [
  { key: 'hero', label: 'Hero', hint: 'Headline and the fanned product cards' },
  { key: 'dealCarousel', label: 'Daily deal carousel', hint: 'Full-width auto-advancing panel' },
  { key: 'trustBanner', label: 'Trust banner', hint: 'The scrolling lime strip' },
  { key: 'stats', label: 'Stats row', hint: 'Four numbers' },
  { key: 'categories', label: 'Categories', hint: 'Category tiles' },
  { key: 'deals', label: 'Product grid', hint: 'The main catalogue' },
  { key: 'offers', label: 'Offers', hint: 'Combo and bundle cards' },
  { key: 'proofs', label: 'Proofs', hint: 'Screenshots you upload in Proofs' },
  { key: 'testimonials', label: 'Reviews', hint: 'Student testimonials' },
  { key: 'contact', label: 'Contact', hint: 'Closing call to action' },
];

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const { toast, show } = useToast();

  const load = () => {
    setLoading(true);
    getSettings()
      .then((res) => {
        const merged = mergeSettings(res?.data);
        setForm(merged);
        setSaved(merged);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved],
  );

  // Nobody should lose a form full of copy to a stray back button.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /** set('brand', 'name', value) — one level is enough for this shape. */
  const set = (group, key, value) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));

  const save = async () => {
    setBusy(true);
    try {
      const res = await saveSettings(form);
      const merged = mergeSettings(res.data);
      setForm(merged);
      setSaved(merged);
      show('Settings saved — reload the site to see them');
    } catch (e) {
      show(e.message || 'Could not save settings', 'error');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Every setting goes back to the shipped defaults. Are you sure?')) return;
    setBusy(true);
    try {
      await resetSettings();
      const merged = mergeSettings({});
      setForm(merged);
      setSaved(merged);
      show('Back to defaults');
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !form) {
    return (
      <div>
        <PageHeader title="Global Settings" subtitle="Loading…" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface border border-line h-48 animate-pulse" style={{ borderRadius: radius }} />
          ))}
        </div>
      </div>
    );
  }

  const handleMissing = !form.brand.instagramHandle?.trim();

  return (
    <div className="pb-10">
      <PageHeader
        title="Global Settings"
        subtitle="Text, colours and visibility for the public site. Products, offers and proofs have their own pages."
      >
        <span className="text-[13px] text-muted mr-0.5">
          {dirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        {dirty && (
          <button type="button" onClick={() => setForm(saved)} className={btnGhost} disabled={busy}>
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={busy || !dirty}
          className={btnPrimary}
          style={{ background: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}
        >
          {busy ? <Icons.Loader2 size={15} className="animate-spin" /> : <Icons.Check size={15} />}
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" onClick={reset} disabled={busy} className={btnGhost}>
          <Icons.RotateCcw size={15} /> Reset
        </button>
      </PageHeader>

      <ErrorBar message={error} onRetry={load} />

      {handleMissing && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl text-[13px] mb-5 leading-relaxed"
          style={{ background: 'var(--admin-warning-soft)', color: 'var(--admin-warning)' }}
        >
          <Icons.AlertTriangle size={17} className="shrink-0 mt-0.5" />
          <p>
            <strong>No Instagram handle set.</strong> Every order button on the site currently
            opens a dead link. Fill it in below — it is the one setting the site cannot work without.
          </p>
        </div>
      )}

      <SectionNav sections={NAV_SECTIONS} />

      <div className="flex flex-col gap-4">
        <SettingsGroup
          id="set-brand"
          icon="Store"
          title="Brand"
          hint="Shown in the navbar, the footer and the browser tab."
        >
          <TextField
            label="Site name"
            value={form.brand.name}
            onChange={(v) => set('brand', 'name', v)}
            placeholder={DEFAULT_SETTINGS.brand.name}
          />
          <TextField
            label="Tagline"
            value={form.brand.tagline}
            onChange={(v) => set('brand', 'tagline', v)}
          />
          <TextField
            label="Instagram handle"
            prefix="@"
            value={form.brand.instagramHandle}
            onChange={(v) => set('brand', 'instagramHandle', v.replace(/^@/, ''))}
            placeholder="substore.in"
            hint="Without the @. Every order button opens a DM to this account."
          />
        </SettingsGroup>

        <SettingsGroup
          id="set-colours"
          icon="Palette"
          title="Colours"
          hint="Two accents carry the whole site. Everything else follows the theme."
        >
          <ColorField
            label="Accent — trust banner strip"
            value={form.brand.accentColor}
            onChange={(v) => set('brand', 'accentColor', v)}
            hint="The lime band. Keep it light: the text on it is near-black."
          />
          <ColorField
            label="Primary — logo tile and link hover"
            value={form.brand.primaryColor}
            onChange={(v) => set('brand', 'primaryColor', v)}
            hint="Keep it dark: white text sits on this."
          />
        </SettingsGroup>

        <SettingsGroup
          id="set-hero"
          icon="Type"
          title="Hero and buttons"
          hint="The first thing a visitor reads, and the label on every order button."
        >
          <TextField
            label="Eyebrow line"
            value={form.hero.eyebrow}
            onChange={(v) => set('hero', 'eyebrow', v)}
          />
          <TextField
            label="Order button label"
            value={form.hero.ctaLabel}
            onChange={(v) => set('hero', 'ctaLabel', v)}
          />
        </SettingsGroup>

        <SettingsGroup
          id="set-navigation"
          icon="Navigation"
          title="Navigation"
          hint="Links in the navbar. The section id must match a section on the page — deals, offers, daily-deals, contact."
        >
          <RepeaterField
            label="Links"
            rows={form.nav.links}
            onChange={(rows) => set('nav', 'links', rows)}
            columns={[
              { key: 'label', placeholder: 'Label' },
              { key: 'id', placeholder: 'Section id' },
            ]}
            addLabel="Add link"
            blank={{ label: '', id: '' }}
            max={6}
          />
        </SettingsGroup>

        <SettingsGroup
          id="set-trust"
          icon="BadgeCheck"
          title="Trust banner"
          hint="The scrolling strip under the hero. Icon names come from lucide.dev — ShieldCheck, Star, Clock, Zap."
        >
          <RepeaterField
            label="Items"
            rows={form.trustBanner.items}
            onChange={(rows) => set('trustBanner', 'items', rows)}
            columns={[
              { key: 'icon', placeholder: 'Icon', width: 150 },
              { key: 'text', placeholder: 'Text' },
            ]}
            addLabel="Add item"
            blank={{ icon: 'Star', text: '' }}
            max={8}
          />
        </SettingsGroup>

        <SettingsGroup
          id="set-stats"
          icon="BarChart3"
          title="Stats row"
          hint="Leave a value empty and set Auto to productCount or minPrice to have it work itself out from the catalogue."
        >
          <RepeaterField
            label="Stats"
            rows={form.stats.items}
            onChange={(rows) => set('stats', 'items', rows)}
            columns={[
              { key: 'value', placeholder: 'Value', width: 110 },
              { key: 'label', placeholder: 'Label' },
              { key: 'icon', placeholder: 'Icon', width: 130 },
              { key: 'auto', placeholder: 'Auto', width: 120 },
            ]}
            addLabel="Add stat"
            blank={{ value: '', label: '', icon: 'Tag', color: '#4f46e5', auto: '' }}
            max={4}
          />
        </SettingsGroup>

        <SettingsGroup
          id="set-order"
          icon="MessageSquare"
          title="Order form"
          hint="The small form shown before Instagram opens, and the message copied to the clipboard."
        >
          <TextField label="Form title" value={form.order.modalTitle} onChange={(v) => set('order', 'modalTitle', v)} />
          <TextField label="Form note" value={form.order.modalNote} onChange={(v) => set('order', 'modalNote', v)} />
          <TextField
            label="DM message prefix"
            value={form.order.messagePrefix}
            onChange={(v) => set('order', 'messagePrefix', v)}
            hint="The product name and price are appended after this."
          />
        </SettingsGroup>

        <SettingsGroup
          id="set-sections"
          icon="LayoutTemplate"
          title="Sections"
          hint="Turn any block of the home page off without deleting its content."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SECTION_ROWS.map((s) => (
              <ToggleRow
                key={s.key}
                label={s.label}
                hint={s.hint}
                checked={form.sections[s.key]}
                onChange={(v) => set('sections', s.key, v)}
              />
            ))}
          </div>
        </SettingsGroup>

        <SettingsGroup id="set-footer" icon="AlignLeft" title="Footer">
          <TextField
            label="Footer note"
            value={form.footer.note}
            onChange={(v) => set('footer', 'note', v)}
            hint="The small print at the bottom of every page."
          />
        </SettingsGroup>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
