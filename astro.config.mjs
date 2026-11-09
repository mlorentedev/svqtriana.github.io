// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// El sitemap se genera en src/pages/sitemap.xml.ts: @astrojs/sitemap solo
// produce sitemap-index.xml y el sitio legado publica /sitemap.xml.
export default defineConfig({
  site: 'https://svqtriana.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    // 'file' genera dist/nosotros.html, que GitHub Pages sirve como /nosotros
    // sin barra final, igual que el sitio legado.
    format: 'file',
    // CSP sin 'unsafe-inline': ni CSS ni JS dentro del HTML.
    inlineStylesheets: 'never',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Keeps Astro from inlining the menu/gallery script into the HTML.
      assetsInlineLimit: 0,
    },
  },
});
