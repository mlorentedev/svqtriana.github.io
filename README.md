# PS SVQ Triana - Modern Website

[![Build and Deploy](https://github.com/mlorentedev/svqtriana.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/mlorentedev/svqtriana.github.io/actions/workflows/deploy.yml)
[![Lighthouse CI](https://github.com/mlorentedev/svqtriana.github.io/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/mlorentedev/svqtriana.github.io/actions/workflows/lighthouse.yml)

Modern, performant, and feature-rich website for PS SVQ Triana - Peña Sevillista. Built with Astro, featuring CMS capabilities, PWA support, and optimized for GitHub Pages.

## 🚀 Features

- ⚡ **Lightning Fast**: Built with Astro for optimal performance
- 📱 **Progressive Web App**: Works offline with service worker
- 🎨 **Modern Design**: Responsive and mobile-first
- 📝 **Easy Content Management**: Decap CMS for non-technical updates
- 🌐 **Multilingual**: Spanish and English support (i18n ready)
- 🔍 **SEO Optimized**: Meta tags, structured data, and sitemap
- 📊 **Analytics**: Google Analytics integration
- 🎯 **Lighthouse Score**: >95 in all categories
- 🚢 **Automated Deployment**: GitHub Actions CI/CD
- 💯 **TypeScript**: Type-safe development

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Git

## 🏗️ Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/mlorentedev/svqtriana.github.io.git
cd svqtriana.github.io

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:4321`

### Build for Production

```bash
# Build the site
npm run build

# Preview the production build
npm run preview
```

## 📝 Content Management

### Using Decap CMS

1. Navigate to `/admin` in your browser (e.g., `https://svqtriana.com/admin`)
2. Login with your GitHub account
3. Create, edit, or delete content through the visual interface

### Local Development with CMS

```bash
# Start the CMS proxy server (in a separate terminal)
npm run cms-proxy

# Start the dev server
npm run dev
```

Navigate to `http://localhost:4321/admin` to use the CMS locally.

## 📁 Project Structure

```
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── public/                 # Static assets
│   ├── admin/             # Decap CMS configuration
│   ├── images/            # Images and media
│   ├── fonts/             # Custom fonts
│   └── sw.js              # Service worker
├── src/
│   ├── components/        # Reusable Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ContactForm.astro
│   ├── layouts/           # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/             # Routes (file-based routing)
│   │   ├── index.astro
│   │   ├── nosotros.astro
│   │   ├── productos.astro
│   │   ├── media.astro
│   │   └── encuentro.astro
│   ├── content/           # CMS-managed content
│   │   ├── blog/
│   │   ├── events/
│   │   ├── products/
│   │   ├── videos/
│   │   └── pages/
│   ├── styles/            # Global styles
│   │   └── global.css
│   └── lib/               # Utility functions
├── astro.config.mjs       # Astro configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🎨 Customization

### Colors

Edit color variables in `src/styles/global.css`:

```css
:root {
  --primary-color: #df0606;
  --secondary-color: #242424;
  --text-color: #333;
  --background-color: #fff;
}
```

### Site Metadata

Update site information in `astro.config.mjs` and page frontmatter.

### Navigation Menu

Edit navigation items in `src/components/Header.astro`.

## 📊 Analytics

### Google Analytics

The site includes Google Analytics. The tracking ID is configured in:

- `src/layouts/BaseLayout.astro`

To change the tracking ID, update the `gtag('config', 'YOUR-GA-ID')` line.

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Run TypeScript type checking
npm run cms-proxy    # Start CMS proxy server for local development
```

### Adding New Pages

1. Create a new `.astro` file in `src/pages/`
2. Use the `BaseLayout` component
3. Add the page to the navigation in `Header.astro`

Example:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
---

<BaseLayout title="New Page" description="Description">
  <Header slot="header" lang="es" />

  <section class="layout_padding">
    <!-- Your content here -->
  </section>

  <Footer slot="footer" lang="es" />
</BaseLayout>
```

### Adding Blog Posts

Blog posts can be created through the CMS at `/admin` or by creating markdown files in `src/content/blog/`.

Frontmatter format:

```markdown
---
title: 'Post Title'
date: 2024-11-13
author: 'PS SVQ Triana'
description: 'Post description'
image: '/images/post-image.jpg'
tags: ['sevillismo', 'triana']
featured: true
---

Your content here...
```

## 🚀 Deployment

### GitHub Pages (Automatic)

The site automatically deploys to GitHub Pages when you push to the `main` branch.

1. Ensure GitHub Pages is enabled in your repository settings
2. Set the source to "GitHub Actions"
3. Push to `main` branch
4. GitHub Actions will build and deploy automatically

### Manual Deployment

```bash
# Build the site
npm run build

# The dist/ folder contains your production site
# Deploy the contents to your hosting provider
```

## 🔍 SEO

The site includes:

- Meta tags (Open Graph, Twitter Cards)
- Structured data (Schema.org)
- Sitemap (automatically generated)
- robots.txt
- Canonical URLs
- Alt text for images
- Semantic HTML

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Responsive font sizes

## 📱 Progressive Web App

The site works as a PWA with:

- Service worker for offline support
- Web app manifest
- Installable on mobile devices
- Cached assets for fast loading

### Testing PWA Features

1. Build and serve the site: `npm run build && npm run preview`
2. Open Chrome DevTools
3. Go to Application > Service Workers
4. Check "Offline" to test offline functionality

## 🧪 Testing & CI/CD

### Automated Testing

Every pull request runs comprehensive automated tests:

| Test Category              | Purpose                         | Status      |
| -------------------------- | ------------------------------- | ----------- |
| **Code Quality**           | TypeScript & Prettier checks    | Required ✅ |
| **Build Test**             | Verify successful build         | Required ✅ |
| **Lighthouse**             | Performance > 90 all scores     | Warning ⚠️  |
| **Security**               | npm audit & secret scanning     | Warning ⚠️  |
| **Accessibility**          | axe-core automated tests        | Warning ⚠️  |
| **HTML Validation**        | Validate HTML structure         | Warning ⚠️  |
| **Link Check**             | Find broken links               | Warning ⚠️  |
| **Performance Regression** | Enforce bundle budgets          | Required ✅ |
| **Deployment Simulation**  | Test GitHub Pages compatibility | Required ✅ |

**📚 Full CI/CD Documentation:** See [docs/CI-CD.md](docs/CI-CD.md)

### Local Testing

```bash
# Type checking
npm run check

# Build test
npm run build

# Preview production build
npm run preview

# Code formatting check
npx prettier --check "src/**/*.{astro,ts,js,json,css}"
```

### Lighthouse CI

Lighthouse tests run automatically on every push. View results in GitHub Actions.

Local Lighthouse testing:

```bash
npm install -g @lhci/cli
npm run build
lhci autorun
```

### Performance Budget

Performance budgets are configured in `lighthouse-budget.json`. The CI will fail if budgets are exceeded:

- JavaScript: < 300KB
- CSS: < 100KB
- Total Site: < 20MB
- Time to Interactive: < 3s
- First Contentful Paint: < 1.5s

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .astro
npm install
npm run build
```

### Service Worker Issues

```bash
# Clear service worker cache
# In Chrome DevTools:
# Application > Service Workers > Unregister
# Application > Cache Storage > Delete
```

### CMS Login Issues

1. Ensure you have write access to the repository
2. Check that GitHub OAuth is configured correctly
3. Try clearing browser cache

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [Decap CMS Documentation](https://decapcms.org/docs/)
- [GitHub Pages Documentation](https://docs.github.com/pages)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is private and proprietary to PS SVQ Triana.

## 👥 Authors

- **PS SVQ Triana** - [Website](https://svqtriana.com)
- **Developer** - [mlorentedev](https://github.com/mlorentedev)

## 📞 Support

For issues or questions:

- Instagram: [@ps_svqtriana](https://www.instagram.com/ps_svqtriana/)
- Email: Contact through social media

## 🎉 Acknowledgments

- Sevilla FC supporters community
- Triana neighborhood
- All members of PS SVQ Triana

---

Made with ❤️ for PS SVQ Triana
