import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://svqtriana.com',
  base: '/',
  outDir: './dist',

  // GitHub Pages compatibility
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },

  // Integrations
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-US',
        },
      },
    }),
    mdx(),
  ],

  // i18n configuration
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // Vite configuration for optimization
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['astro'],
          },
        },
      },
    },
    optimizeDeps: {
      include: [],
    },
  },

  // Image optimization
  image: {
    domains: ['svqtriana.com'],
    remotePatterns: [{ protocol: 'https' }],
  },

  // Compression and optimization
  compressHTML: true,

  // Prefetch configuration
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
