/**
 * Shared handle on the running Lenis instance.
 *
 * Lenis drives the page scroll, so calling window.scrollTo() elsewhere fights
 * it. Anything that needs to move the page — paging through a table, for
 * instance — goes through here instead, and falls back to native smooth
 * scrolling when Lenis is not running (reduced motion, or a page that never
 * mounted it).
 */
let lenis = null;

export function registerLenis(instance) {
  lenis = instance;
}

/**
 * Scrolls an element to the top of the viewport, or the page to the very top
 * if no element is given.
 */
export function scrollToTop(element) {
  if (lenis) {
    lenis.scrollTo(element ?? 0, { offset: element ? -24 : 0 });
    return;
  }
  if (element?.scrollIntoView) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
