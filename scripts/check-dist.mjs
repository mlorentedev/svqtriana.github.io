#!/usr/bin/env node
/**
 * Checks the HTML generated in dist/ before publishing it.
 *
 * Every check exists because something actually broke on the previous site:
 * duplicated titles, canonicals with .html, navigation injected by JS, ads.txt
 * with capitals, versions that did not match the CHANGELOG, inline scripts
 * blocked by the CSP, or referenced assets that did not exist.
 *
 * Usage: node scripts/check-dist.mjs  (requires a prior npm run build)
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://svqtriana.com';

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const read = (path) => readFileSync(path, 'utf8');
const one = (pattern, text) => text.match(pattern)?.[1]?.trim();

const PAGES = [
  { file: 'index.html', path: '/', title: 'PS SVQ Triana | Peña sevillista de Triana, Sevilla' },
  { file: 'nosotros.html', path: '/nosotros', title: 'Nuestra historia | PS SVQ Triana' },
  { file: 'productos.html', path: '/productos', title: 'Material oficial | PS SVQ Triana' },
  { file: 'media.html', path: '/media', title: 'Galería de vídeos | PS SVQ Triana' },
];

const REQUIRED_FILES = [
  'index.html',
  'nosotros.html',
  'productos.html',
  'media.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'ads.txt',
  'llms.txt',
  'sw.js',
  'CNAME',
  'images/site.webmanifest',
  'images/cartel-27.jpg',
  'favicon.ico',
];

for (const file of new Set(REQUIRED_FILES)) {
  check(existsSync(join(DIST, file)), `missing dist/${file}`);
}

// Root files GitHub Pages serves verbatim.
check(read(join(DIST, 'CNAME')).trim() === 'svqtriana.com', 'CNAME does not point at svqtriana.com');
check(
  read(join(DIST, 'ads.txt')).trim() === 'google.com, pub-5217718596352992, DIRECT, f08c47fec0942fa0',
  'ads.txt no longer carries the AdSense line',
);
check(
  read(join(DIST, 'robots.txt')).includes(`Sitemap: ${SITE}/sitemap.xml`),
  'robots.txt does not advertise /sitemap.xml',
);

const htmlFiles = readdirSync(DIST).filter((name) => name.endsWith('.html'));
const html = new Map(htmlFiles.map((name) => [name, read(join(DIST, name))]));

const titles = new Map();
const canonicals = new Map();

for (const page of PAGES) {
  const text = html.get(page.file);

  check(Boolean(text), `${page.file} was not generated`);
  if (!text) continue;

  const title = one(/<title>(.*?)<\/title>/s, text);
  check(title === page.title, `${page.file}: unexpected title (${title})`);

  const canonical = one(/<link rel="canonical" href="(.*?)"/, text);
  const expectedCanonical = `${SITE}${page.path}`;
  check(canonical === expectedCanonical, `${page.file}: canonical ${canonical} != ${expectedCanonical}`);
  check(!canonical?.endsWith('.html'), `${page.file}: canonical keeps .html`);
  check(!canonical?.endsWith('/') || page.path === '/', `${page.file}: canonical has a trailing slash`);

  const ogUrl = one(/<meta property="og:url" content="(.*?)"/, text);
  check(ogUrl === canonical, `${page.file}: og:url ${ogUrl} != canonical ${canonical}`);

  check(/<meta name="description" content="[^"]+"/.test(text), `${page.file}: missing meta description`);
  check(/<html lang="es"/.test(text), `${page.file}: missing lang="es"`);
  check((text.match(/<h1\b/g) ?? []).length === 1, `${page.file}: must have exactly one <h1>`);

  const robots = one(/<meta name="robots" content="([^"]+)"/, text);
  check(robots === 'index, follow', `${page.file}: robots is "${robots}", expected index, follow`);

  // Menu and footer live in the served HTML (never injected by JS).
  for (const href of ['/#home', '/nosotros', '/productos', '/media']) {
    check(text.includes(`href="${href}"`), `${page.file}: missing link ${href} in the HTML`);
  }

  // No internal link with .html and none with a trailing slash.
  for (const match of text.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = match[1];
    check(!href.endsWith('.html'), `${page.file}: internal link with .html (${href})`);
    check(href === '/' || !href.endsWith('/'), `${page.file}: internal link with a trailing slash (${href})`);
  }

  titles.set(page.file, title);
  canonicals.set(page.file, canonical);
}

check(titles.size === new Set(titles.values()).size, 'duplicated titles across pages');
check(canonicals.size === new Set(canonicals.values()).size, 'duplicated canonicals across pages');

// 404: noindex and links to the four sections.
const notFound = html.get('404.html');
check(notFound !== undefined, '404.html was not generated');
if (notFound) {
  check(
    /<meta name="robots" content="noindex, follow"/.test(notFound),
    '404.html: must be noindex, follow',
  );
  for (const href of ['/#home', '/nosotros', '/productos', '/media']) {
    check(notFound.includes(`href="${href}"`), `404.html: missing link ${href}`);
  }
}

// No executable inline scripts: the CSP carries no 'unsafe-inline'.
for (const [file, text] of html) {
  const inline = text.match(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/gi) ?? [];
  check(inline.length === 0, `${file}: ${inline.length} executable inline <script>`);
  check(!/\sstyle="/.test(text), `${file}: contains inline style="" attributes`);
  check(!/<style\b/i.test(text), `${file}: contains an inline <style> block`);
}

// No third-party assets (only <a> links, which load no resources).
for (const [file, text] of html) {
  const remoteScript = text.match(/<script\b[^>]*\bsrc="(?:https?:)?\/\//gi) ?? [];
  const remoteImage = text.match(/<img\b[^>]*\bsrc="(?:https?:)?\/\//gi) ?? [];
  const remoteLink =
    text.match(
      /<link\b[^>]*\brel="(?:stylesheet|preload|icon|manifest|apple-touch-icon)"[^>]*\bhref="(?:https?:)?\/\//gi,
    ) ?? [];
  check(remoteScript.length === 0, `${file}: remote script (${remoteScript[0]})`);
  check(remoteImage.length === 0, `${file}: remote image (${remoteImage[0]})`);
  check(remoteLink.length === 0, `${file}: remote stylesheet/font (${remoteLink[0]})`);
}

// JSON-LD parses and carries @context/@type.
for (const [file, text] of html) {
  for (const raw of text.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      const data = JSON.parse(raw[1]);
      check(Boolean(data['@context']), `${file}: JSON-LD without @context`);
      check(Boolean(data['@type']), `${file}: JSON-LD without @type`);
    } catch (error) {
      failures.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }
}

const productosHtml = html.get('productos.html') ?? '';
check(
  (productosHtml.match(/"@type":"Offer"|"@type":"AggregateOffer"/g) ?? []).length === 4,
  'productos.html: the JSON-LD must list the 4 products',
);
check(productosHtml.includes('Pulsera oficial'), 'productos.html: missing the bracelet');

// Gallery: six YouTube links, not a single iframe.
const mediaHtml = html.get('media.html') ?? '';
const youtubeIds = [
  'Nz1E1GyG1EA',
  'NZbk3zVNMaY',
  'gyamGKXwkMc',
  'BQ16EOFLZEM',
  '0v1XvikTbIo',
  'C85CSoQkVy8',
];
for (const id of youtubeIds) {
  check(mediaHtml.includes(`https://youtu.be/${id}`), `media.html: missing video ${id}`);
}
check(!/<iframe\b/i.test(mediaHtml), 'media.html: must not contain iframes');

// Footer: version consistent with the CHANGELOG.
const changelog = read(join(ROOT, 'CHANGELOG.md'));
const changelogVersion = changelog.match(/^## (v\d{8}(?:\.\d+)?)/m)?.[1];
check(Boolean(changelogVersion), 'CHANGELOG.md: missing a ## vYYYYMMDD entry');
for (const page of PAGES) {
  const text = html.get(page.file) ?? '';
  const version = text.match(/class="footer-version[^"]*"[^>]*>(v[^<]+)</)?.[1];
  check(version === changelogVersion, `${page.file}: version ${version} != ${changelogVersion}`);
}

// Sitemap: one URL per page, no trailing slash, ISO lastmod.
const sitemap = read(join(DIST, 'sitemap.xml'));
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const expectedLocs = PAGES.map((page) => `${SITE}${page.path}`);
check(
  JSON.stringify(locs) === JSON.stringify(expectedLocs),
  `sitemap.xml: URLs ${JSON.stringify(locs)} != ${JSON.stringify(expectedLocs)}`,
);
check(
  (sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) ?? []).length === PAGES.length,
  'sitemap.xml: missing lastmod entries',
);

// llms.txt: every page, without the stale official-shirt mention.
const llms = read(join(DIST, 'llms.txt'));
for (const page of PAGES) {
  check(llms.includes(`${SITE}${page.path}`), `llms.txt: missing ${page.path}`);
}
check(!/camiseta oficial/i.test(llms), 'llms.txt: still mentions the official shirt');
check(llms.includes('## Preguntas frecuentes'), 'llms.txt: missing the FAQ block');
check(
  /docs\.google\.com\/forms\/d\/e\/[\w-]+\/viewform/.test(llms),
  'llms.txt: the FAQ does not link the membership form',
);

// Kill switch for the old service worker.
const sw = read(join(DIST, 'sw.js'));
check(sw.includes('caches.keys()'), 'sw.js: missing cache cleanup');
check(sw.includes('registration.unregister()'), 'sw.js: missing unregister()');
check(!/addEventListener\(\s*['"]fetch['"]/.test(sw), 'sw.js: must not intercept fetch');

/** Resolves a local URL against dist/, the way GitHub Pages does. */
function resolveLocal(url, fromFile) {
  const clean = url.split(/[?#]/)[0];
  if (!clean || clean.startsWith('data:') || clean.startsWith('#')) return null;
  if (/^(?:https?:)?\/\//.test(clean) || /^(?:mailto|tel|javascript):/.test(clean)) return null;

  let base;
  if (clean.startsWith('/')) {
    base = join(DIST, clean.slice(1));
  } else {
    base = resolve(dirname(fromFile), clean);
  }

  const candidates = [base];
  if (clean.endsWith('/')) candidates.push(join(base, 'index.html'));
  if (!/\.\w+$/.test(clean)) candidates.push(`${base}.html`, join(base, 'index.html'));

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

// Every referenced local asset and link exists.
for (const [file, text] of html) {
  const fromFile = join(DIST, file);
  const urls = [];

  for (const match of text.matchAll(/\b(?:src|href)="([^"]+)"/g)) urls.push(match[1]);
  for (const match of text.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) urls.push(candidate.trim().split(/\s+/)[0]);
  }

  for (const url of new Set(urls)) {
    if (url.startsWith('data:')) continue;
    if (resolveLocal(url, fromFile) === null) {
      // External and mailto links are ignored inside resolveLocal.
      if (/^(?:https?:)?\/\//.test(url) || /^(?:mailto|tel):/.test(url) || url.startsWith('#')) continue;
      failures.push(`${file}: broken local reference (${url})`);
    }
  }
}

// CSS url() targets exist too.
const astroDir = join(DIST, '_astro');
if (existsSync(astroDir)) {
  for (const name of readdirSync(astroDir).filter((entry) => entry.endsWith('.css'))) {
    const cssFile = join(astroDir, name);
    const css = read(cssFile);
    for (const match of css.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) {
      const url = match[2];
      if (url.startsWith('data:')) continue;
      if (resolveLocal(url, cssFile) === null && !/^(?:https?:)?\/\//.test(url)) {
        failures.push(`_astro/${name}: broken CSS asset (${url})`);
      }
    }
  }
}

// No generated PNG. The <Picture> fallback is derived from the master's
// format; if the master is WebP or JPEG, a PNG in _astro means Astro is
// emitting a far heavier version than the original (this happened with the
// bracelet: a 275 kB PNG for a 21 kB WebP). Legitimate PNG masters should be
// converted before importing them.
if (existsSync(astroDir)) {
  for (const name of readdirSync(astroDir).filter((entry) => entry.endsWith('.png'))) {
    failures.push(`_astro/${name}: generated PNG; check the master's format`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s) in dist/:\n`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`ok: ${PAGES.length} pages, 404, sitemap, llms.txt and assets consistent`);
