import { useEffect } from 'react';
import Lenis from 'lenis';
import { registerLenis } from '../../lib/scroll';

/**
 * Eased wheel scrolling for the whole app.
 *
 * Lenis keeps the real window scroll position and just interpolates towards
 * it each frame, so `position: sticky` and `position: fixed` keep working —
 * the sticky navbar and the admin's sticky save bar are unaffected.
 *
 * Three things it deliberately stays out of:
 *  - touch devices, where the OS momentum is better than anything we can do
 *  - anyone with prefers-reduced-motion set
 *  - inner scroll areas marked `data-lenis-prevent` (admin tables and
 *    drawers), which need immediate, precise scrolling
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      // Standard exponential ease-out: quick to respond, settles gently.
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      // Native momentum on phones beats an emulated one, and hijacking touch
      // is what makes smooth-scroll libraries feel broken on mobile.
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    // Lets non-React code (table pagination) move the page without
    // fighting the running animation loop.
    registerLenis(lenis);

    let frame;
    const loop = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    /**
     * In-page anchors. The CSS `scroll-behavior: smooth` that used to handle
     * these has to be off for Lenis to work, so the jump is re-implemented
     * here — otherwise the navbar links would snap instantly.
     */
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = e.target.closest?.('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      // Section ids come from Global Settings, so a client can type anything.
      // "#1deals" or "#deals!" is not a valid CSS selector and querySelector
      // throws — from a document-level handler that would break every anchor
      // click on the page, not just the bad one. getElementById takes a plain
      // string and never throws.
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      // Clear the sticky navbar so the heading is not hidden underneath it.
      lenis.scrollTo(target, { offset: -72 });
      window.history.pushState(null, '', hash);
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(frame);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
