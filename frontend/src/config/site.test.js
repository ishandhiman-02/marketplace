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

  it('opens the message composer on desktop, carrying the handle', () => {
    useAgent(DESKTOP);
    const url = igDmUrl();
    expect(url).toBe(`https://www.instagram.com/direct/new/?username=${HANDLE}`);

    // The two routes that were tried and that fail for a signed-in desktop user:
    //   ig.me/m/<handle>            -> HTTP 400
    //   instagram.com/m/<handle>    -> "Sorry, this page isn't available."
    // Both answer 200 to curl, because a signed-out request is redirected to a
    // login page. Do not let that evidence bring either of them back.
    expect(url).not.toContain('ig.me');
    expect(url).not.toMatch(/instagram\.com\/m\//);
  });

  it('escapes anything odd in the handle before putting it in a query string', () => {
    setInstagramHandle('a b&c');
    useAgent(DESKTOP);
    expect(igDmUrl()).toBe('https://www.instagram.com/direct/new/?username=a%20b%26c');
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
