/**
 * The site's only hand-written JavaScript:
 *  - mobile menu <details>: close on Esc, on an outside click or on navigation;
 *  - product galleries: previous/next buttons with scroll-snap.
 */
const menus = document.querySelectorAll<HTMLDetailsElement>('details[data-mobile-nav]');

if (menus.length > 0) {
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    for (const menu of menus) {
      if (!menu.open) continue;
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    for (const menu of menus) {
      if (menu.open && !menu.contains(target)) menu.open = false;
    }
  });

  for (const menu of menus) {
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.open = false;
      });
    });
  }
}

const galleryButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-gallery-prev], [data-gallery-next]',
);

galleryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.galleryTarget;
    const gallery = id ? document.getElementById(id) : null;
    if (!gallery) return;

    const direction = button.hasAttribute('data-gallery-prev') ? -1 : 1;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gallery.scrollBy({
      left: direction * gallery.clientWidth,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  });
});
