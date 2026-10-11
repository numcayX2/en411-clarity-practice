/**
 * paneScroll.ts — minimal "keep this element visible" scrolling for the reading
 * panes (Activity 1 dossier, Activity 4 email).
 *
 * Deliberately not `scrollIntoView()`: Lenis owns window scrolling on this site
 * (see Layout.astro) and fights the browser's smooth scroll, while the reading
 * panes are their own scrollports — so we compute the delta ourselves.
 */
export const ensureVisible = (scroller: HTMLElement, el: HTMLElement, margin = 18): void => {
  const pane = scroller.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
  if (rect.top < pane.top + margin) {
    scroller.scrollTo({ top: scroller.scrollTop + (rect.top - pane.top) - margin, behavior });
  } else if (rect.bottom > pane.bottom - margin) {
    scroller.scrollTo({ top: scroller.scrollTop + (rect.bottom - pane.bottom) + margin, behavior });
  }
};
