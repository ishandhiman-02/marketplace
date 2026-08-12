/** @vitest-environment jsdom */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import {
  igDmUrl, completeOrder, setInstagramHandle, onOrderToast,
} from './site';

/**
 * These cover the two things that decide whether an order actually reaches the
 * seller: the link has to land in the message thread, and the tab has to open at
 * all. Both were wrong before, and neither is visible from a passing build.
 */

const HANDLE = 'substore.test';

const useAgent = (ua) => {
  Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
};

const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1';

describe('igDmUrl — the order link must open a chat, not a profile', () => {
  beforeEach(() => setInstagramHandle(HANDLE));

  it('uses the app deep link on a phone', () => {
    useAgent(IPHONE);
    expect(igDmUrl()).toBe(`https://ig.me/m/${HANDLE}`);
  });

  it('opens the profile on desktop — every DM shortcut is broken there', () => {
    useAgent(DESKTOP);
    const url = igDmUrl();
    expect(url).toBe(`https://www.instagram.com/${HANDLE}/`);

    // All three have been tried on a signed-in desktop browser and all failed:
    //   ig.me/m/<handle>                 HTTP 400
    //   instagram.com/m/<handle>         "Sorry, this page isn't available."
    //   /direct/new/?username=<handle>   username ignored — opens the visitor's
    //                                    OWN inbox, so the order never arrives.
    // Each answers 200 to curl because a signed-out request is redirected to a
    // login page. That evidence is worthless; do not let it bring them back.
    expect(url).not.toContain('ig.me');
    expect(url).not.toMatch(/instagram\.com\/m\//);
    expect(url).not.toContain('/direct/');
  });

  it('always points at the configured handle, never a fixed account', () => {
    useAgent(DESKTOP);
    setInstagramHandle('someone.else');
    expect(igDmUrl()).toBe('https://www.instagram.com/someone.else/');
    setInstagramHandle('@Third_Party ');
    expect(igDmUrl()).toBe('https://www.instagram.com/Third_Party/');
  });

  it('strips a leading @ from whatever the admin typed', () => {
    setInstagramHandle('@Someone ');
    useAgent(IPHONE);
    expect(igDmUrl()).toBe('https://ig.me/m/Someone');
  });
});

describe('completeOrder — opening the chat must survive a popup blocker', () => {
  let opened;
  let resolveClipboard;

  beforeEach(() => {
    setInstagramHandle(HANDLE);
    useAgent(IPHONE);
    opened = [];
    vi.stubGlobal('open', (...args) => { opened.push(args); return null; });
    // A clipboard write that never settles on its own, so the test can prove the
    // tab does not wait for it.
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: () => new Promise((res) => { resolveClipboard = res; }) },
      configurable: true,
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('opens the tab synchronously, before the clipboard write settles', () => {
    completeOrder({ detail: { title: 'Netflix', variant: '1 Month', price: 199 } });

    // The whole point: the window is open already, while the copy is pending.
    expect(opened).toHaveLength(1);
    expect(opened[0][0]).toBe(`https://ig.me/m/${HANDLE}`);
    expect(opened[0][1]).toBe('_blank');

    resolveClipboard();
  });

  it('still opens the chat when there is nothing to copy', () => {
    completeOrder({ detail: {} });
    expect(opened).toHaveLength(1);
  });

  it('does not open a broken link when no handle is configured', async () => {
    setInstagramHandle('');
    const messages = [];
    const off = onOrderToast((m) => messages.push(m));

    completeOrder({ detail: { title: 'Netflix', price: 199 } });

    expect(opened).toHaveLength(0);
    expect(messages[0]).toMatch(/not set up/i);
    off();
  });
});
