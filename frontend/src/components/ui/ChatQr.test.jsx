/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChatQr } from './ChatQr';

describe('ChatQr', () => {
  it('renders a real scannable QR for the chat link', () => {
    const html = renderToStaticMarkup(<ChatQr url="https://ig.me/m/ankit.singh" />);
    expect(html).toContain('<svg');
    // A QR of this URL needs a good number of dark modules; a blank/■ render would be tiny.
    const modules = (html.match(/M\d+ \d+h1v1h-1z/g) || []).length;
    console.log('   dark modules drawn:', modules);
    expect(modules).toBeGreaterThan(150);
  });

  it('changes with the handle — never a fixed account', () => {
    const a = renderToStaticMarkup(<ChatQr url="https://ig.me/m/one" />);
    const b = renderToStaticMarkup(<ChatQr url="https://ig.me/m/two" />);
    expect(a).not.toBe(b);
  });
});
