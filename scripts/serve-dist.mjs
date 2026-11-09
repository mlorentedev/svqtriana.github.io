#!/usr/bin/env node
/**
 * Minimal static server that imitates GitHub Pages for the tests:
 * - `/nosotros` serves `dist/nosotros.html` with a 200;
 * - an unknown route serves `dist/404.html` with a 404;
 * - no redirects and no trailing slash.
 *
 * Usage: node scripts/serve-dist.mjs [port]
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4321);
const ROOT = resolve(process.cwd(), 'dist');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function fileFor(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const target = join(ROOT, normalize(clean).replace(/^([/\\])+/, ''));
  if (!target.startsWith(ROOT + sep) && target !== ROOT) return null;

  if (clean.endsWith('/')) {
    const index = join(target, 'index.html');
    return existsSync(index) ? index : null;
  }
  if (existsSync(target) && statSync(target).isFile()) return target;
  if (!extname(target)) {
    const withHtml = `${target}.html`;
    if (existsSync(withHtml)) return withHtml;
    const index = join(target, 'index.html');
    if (existsSync(index)) return index;
  }
  return null;
}

const server = createServer((request, response) => {
  const file = fileFor(request.url ?? '/');
  const notFound = join(ROOT, '404.html');

  if (!file) {
    if (!existsSync(notFound)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('404');
      return;
    }
    response.writeHead(404, {
      'Content-Type': TYPES['.html'],
      'Cache-Control': 'no-store',
    });
    if (request.method === 'HEAD') return response.end();
    createReadStream(notFound).pipe(response);
    return;
  }

  response.writeHead(200, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  if (request.method === 'HEAD') return response.end();
  createReadStream(file).pipe(response);
});

server.listen(PORT, () => {
  console.log(`serving dist on http://localhost:${PORT}/`);
});
