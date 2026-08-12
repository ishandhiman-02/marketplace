/** @vitest-environment jsdom */
import {
  render, screen, waitFor, fireEvent, cleanup,
} from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { OrderModal } from './OrderModal';
import { setInstagramHandle, orderOnInstagram } from '../config/site';

/**
 * The one thing this modal exists to get right: whichever way the customer
 * leaves it, a desktop customer must end up at the scan step and never on the
 * profile page.
 *
 * This is written because the form path did exactly that in production. The QR
 * was built, tested, deployed and verified present in the bundle — and still
 * unreachable for anyone who filled the form in, because submit() bypassed the
 * branch that shows it. A bundle check cannot see that; only a click can.
 */

vi.mock('../services/leads', () => ({ createLead: vi.fn(() => Promise.resolve({})) }));
vi.mock('../context/useSettings', () => ({
  useSettings: () => ({ order: { modalTitle: 'Almost there', modalNote: 'Tell us who you are' } }),
}));

const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/131 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1';

const useAgent = (ua) => Object.defineProperty(window.navigator, 'userAgent', {
  value: ua, configurable: true,
});

const DETAIL = { title: 'Netflix', variant: '1 Month', price: 199 };

let opened;

beforeEach(() => {
  setInstagramHandle('substore.test');
  opened = [];
  vi.stubGlobal('open', (url) => { opened.push(url); return null; });
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText: () => Promise.resolve() }, configurable: true,
  });
});

// This project has no globals/cleanup setup file, so unmount explicitly —
// otherwise each render stacks another modal in the document and the queries
// below start matching the previous test's DOM.
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

/** Fills the form and presses the modal's own submit button. */
const fillAndSubmit = async () => {
  const inputs = document.querySelectorAll('form input');
  fireEvent.change(inputs[0], { target: { value: 'Test Dummy' } });
  fireEvent.change(inputs[1], { target: { value: '@dummy_tester' } });
  fireEvent.submit(document.querySelector('form'));
};

describe('OrderModal — every exit reaches the chat', () => {
  it('shows the QR after the form is submitted on desktop', async () => {
    useAgent(DESKTOP);
    render(<OrderModal />);
    orderOnInstagram(DETAIL);

    await screen.findByText(/almost there/i);
    await fillAndSubmit();

    // The regression: this used to close the modal and open the profile.
    await waitFor(() => expect(screen.getByText(/scan to open the chat/i)).toBeTruthy());
    expect(opened).toHaveLength(0);
    expect(document.querySelector('svg[role="img"]')).toBeTruthy();
  });

  it('shows the QR from the "just DM instead" link too', async () => {
    useAgent(DESKTOP);
    render(<OrderModal />);
    orderOnInstagram(DETAIL);

    fireEvent.click(await screen.findByText(/just dm instead/i));

    await waitFor(() => expect(screen.getByText(/scan to open the chat/i)).toBeTruthy());
    expect(opened).toHaveLength(0);
  });

  it('opens the chat directly on a phone and never shows the scan step', async () => {
    useAgent(IPHONE);
    render(<OrderModal />);
    orderOnInstagram(DETAIL);

    await screen.findByText(/almost there/i);
    await fillAndSubmit();

    await waitFor(() => expect(opened).toHaveLength(1));
    expect(opened[0]).toBe('https://ig.me/m/substore.test');
    expect(screen.queryByText(/scan to open the chat/i)).toBeNull();
  });

  it('still hands off when the lead fails to save', async () => {
    useAgent(DESKTOP);
    const { createLead } = await import('../services/leads');
    createLead.mockRejectedValueOnce(new Error('network down'));

    render(<OrderModal />);
    orderOnInstagram(DETAIL);
    await screen.findByText(/almost there/i);
    await fillAndSubmit();

    // A failed lead must never cost the customer the chat.
    await waitFor(
      () => expect(screen.getByText(/scan to open the chat/i)).toBeTruthy(),
      { timeout: 3000 },
    );
  });
});
