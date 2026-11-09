/**
 * Data for the poster used as the social image (Open Graph / Twitter).
 *
 * Kept apart from `temporada.ts` on purpose: `temporada.ts` imports the image
 * master, while `site.ts` (used by every page) only needs the public path and
 * the alt. Separating them avoids dragging the asset into every module.
 *
 * Changing season means editing the three values here and the import in
 * `temporada.ts`. `npm run check:dist` asserts it (og:image and JSON-LD).
 */
export const cartelOg = '/images/cartel-27.jpg';
export const cartelOgSize = { width: 1131, height: 1600 };
export const cartelAlt =
  'Cartel oficial de la temporada 2026/2027 de PS SVQ Triana: renovación 20€ (28€ con camiseta) y nueva alta 25€ (35€ con camiseta)';
