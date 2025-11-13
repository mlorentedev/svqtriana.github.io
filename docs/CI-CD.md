# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The pipeline ensures code quality, performance, and reliability before deploying to production.

## Workflow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GitHub Actions Workflows                │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────┐
│  PR Checks    │   │    Deploy     │   │  Lighthouse  │
│  (On PR)      │   │  (On Main)    │   │  (On Push)   │
└───────────────┘   └───────────────┘   └──────────────┘
        │
        ├─► Code Quality
        ├─► Build Test
        ├─► Lighthouse
        ├─► Security Audit
        ├─► Accessibility
        ├─► Asset Check
        ├─► HTML Validation
        ├─► Link Check
        ├─► Performance Regression
        └─► Deployment Simulation
```

## Workflows

### 1. PR Checks (`.github/workflows/pr-checks.yml`)

**Triggers:** Pull requests to `main` branch

**Purpose:** Comprehensive testing before code merge

**Jobs:**

#### Critical Checks (Must Pass)
- **Code Quality** - TypeScript type checking and Prettier formatting
- **Build Test** - Verifies site builds successfully and critical files exist
- **Deployment Simulation** - Tests GitHub Pages compatibility and server startup
- **Performance Regression** - Enforces bundle size budgets

#### Quality Checks (Warnings)
- **Lighthouse** - Performance, accessibility, best practices, SEO scores
- **Security** - npm audit and secret scanning
- **Accessibility** - axe-core automated accessibility tests
- **HTML Validation** - Validates HTML structure and semantics
- **Link Check** - Finds broken internal and external links

#### Performance Checks
- **Asset Check** - Monitors image, JS, and CSS bundle sizes
- **Performance Regression** - Tracks bundle size trends

**Status:** Final summary shows which checks passed/failed and blocks merge if critical checks fail.

---

### 2. Deploy (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch
- Daily at 2 AM UTC (scheduled rebuild)
- Manual workflow dispatch

**Purpose:** Build and deploy site to GitHub Pages

**Jobs:**
1. **Build** - Install dependencies, run type checking, build site
2. **Deploy** - Upload artifact and deploy to GitHub Pages

**Permissions:**
- `contents: read` - Read repository
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC token for deployment

---

### 3. Lighthouse CI (`.github/workflows/lighthouse.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Manual workflow dispatch

**Purpose:** Monitor performance metrics

**Tests:**
- Performance score > 90
- Accessibility score > 90
- Best Practices score > 90
- SEO score > 90
- PWA score > 80 (warning)

**Tested Pages:**
- Homepage (`/`)
- Nosotros (`/nosotros`)
- Productos (`/productos`)
- Media (`/media`)
- Encuentro (`/encuentro`)

---

## Performance Budgets

Defined in `lighthouse-budget.json`:

| Metric | Budget | Description |
|--------|--------|-------------|
| **Time to Interactive** | 3000ms | Time until page is fully interactive |
| **First Contentful Paint** | 1500ms | Time to first content render |
| **Largest Contentful Paint** | 2500ms | Time to largest content render |
| **Speed Index** | 2500ms | Visual progress of page load |
| **Cumulative Layout Shift** | 0.1 | Visual stability metric |
| **Max Potential FID** | 130ms | Maximum input delay |

| Resource | Budget | Description |
|----------|--------|-------------|
| **JavaScript** | 300KB | Total JS bundle size |
| **CSS** | 100KB | Total CSS bundle size |
| **Images** | 500KB | Total image size |
| **Document** | 50KB | HTML document size |
| **Fonts** | 150KB | Total font files |
| **Total** | 1000KB | Total page weight |

---

## Setting Up Branch Protection

To enforce CI checks before merging, configure branch protection rules:

### GitHub Repository Settings

1. Go to **Settings** → **Branches**
2. Click **Add rule** or edit existing rule for `main`
3. Configure the following:

```yaml
Branch name pattern: main

Protection rules:
  ☑ Require a pull request before merging
    ☑ Require approvals: 1
    ☑ Dismiss stale pull request approvals when new commits are pushed
    ☑ Require review from Code Owners

  ☑ Require status checks to pass before merging
    ☑ Require branches to be up to date before merging

    Required status checks:
      ☑ Code Quality & Linting
      ☑ Build & Validation
      ☑ Deployment Simulation
      ☑ Performance Regression
      ☑ PR Status Summary

    Optional (can warn but not block):
      ☐ Performance Tests (Lighthouse)
      ☐ Security Audit
      ☐ Accessibility Tests
      ☐ HTML Validation
      ☐ Link Validation
      ☐ Asset Optimization

  ☑ Require conversation resolution before merging

  ☑ Do not allow bypassing the above settings

  ☐ Allow force pushes (keep disabled)
  ☐ Allow deletions (keep disabled)
```

---

## Local Development Testing

### Run All Checks Locally

```bash
# Type checking
npm run check

# Build test
npm run build

# Preview production build
npm run preview

# Code formatting
npx prettier --check "src/**/*.{astro,ts,js,json,css}"
npx prettier --write "src/**/*.{astro,ts,js,json,css}"  # Auto-fix
```

### Performance Testing

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Build site
npm run build

# Run Lighthouse
lhci autorun
```

### Accessibility Testing

```bash
# Install axe CLI
npm install -g @axe-core/cli

# Start preview server
npm run preview

# Run axe (in another terminal)
axe http://localhost:4321
```

### Link Checking

```bash
# Install broken link checker
npm install -g broken-link-checker

# Start preview server
npm run preview

# Check links (in another terminal)
blc http://localhost:4321 -ro
```

---

## Troubleshooting CI Failures

### Build Failures

**Error:** `Build failed with exit code 1`

**Solutions:**
- Check TypeScript errors: `npm run check`
- Verify all imports are correct
- Check for syntax errors in `.astro` files
- Clear cache: `rm -rf .astro node_modules && npm install`

### Lighthouse Failures

**Error:** `Performance score below threshold`

**Solutions:**
- Check bundle sizes in workflow output
- Optimize images (use WebP, compress)
- Review code splitting strategy
- Check for unused dependencies

### Security Audit Failures

**Error:** `npm audit found vulnerabilities`

**Solutions:**
- Run `npm audit fix` for automatic fixes
- For major version updates: `npm audit fix --force` (review changes)
- Update specific package: `npm update package-name`
- If dev dependency: Add `--audit-level=high` to ignore low/moderate

### Link Check Failures

**Error:** `Broken links found`

**Solutions:**
- Check the workflow logs for specific broken links
- Fix internal links in source files
- Update external URLs that have changed
- Add exclusions for known false positives

---

## Workflow Optimization Tips

### Faster CI Runs

1. **Use caching:**
   - Node modules are cached automatically
   - Consider caching build output between jobs

2. **Parallel execution:**
   - Independent jobs run in parallel
   - Build artifact is shared between dependent jobs

3. **Conditional jobs:**
   - Some checks only run on specific conditions
   - Use `continue-on-error: true` for non-critical checks

### Cost Optimization

1. **Free tier limits:** 2000 minutes/month for private repos
2. **Optimization strategies:**
   - Use `timeout-minutes` to prevent stuck jobs
   - Cancel redundant runs with `concurrency`
   - Use scheduled rebuilds sparingly

---

## Monitoring and Alerts

### GitHub Actions Dashboard

View workflow runs:
- **Repository** → **Actions** tab
- Filter by workflow, branch, or status
- Download logs and artifacts

### Email Notifications

GitHub sends emails for:
- ✅ Workflow success (if enabled)
- ❌ Workflow failure (always)
- ⚠️ Required checks failed

Configure in: **Settings** → **Notifications**

### Status Badges

Add to README.md:

```markdown
[![Build and Deploy](https://github.com/mlorentedev/svqtriana.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/mlorentedev/svqtriana.github.io/actions/workflows/deploy.yml)
[![Lighthouse CI](https://github.com/mlorentedev/svqtriana.github.io/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/mlorentedev/svqtriana.github.io/actions/workflows/lighthouse.yml)
```

---

## Continuous Improvement

### Metrics to Track

1. **Build time** - Target: < 2 minutes
2. **Deployment time** - Target: < 3 minutes total
3. **Lighthouse scores** - Target: > 95 all categories
4. **Bundle size** - Monitor trends over time
5. **Test coverage** - Add unit tests when needed

### Recommended Additions

1. **Unit tests** - Add Jest/Vitest for component testing
2. **E2E tests** - Add Playwright/Cypress for critical user flows
3. **Visual regression** - Add Percy or Chromatic for UI testing
4. **Code coverage** - Track test coverage with Codecov
5. **Dependency updates** - Use Dependabot for automated updates

---

## Emergency Procedures

### Skip CI Checks (Emergency Only)

```bash
# Commit with skip CI (not recommended)
git commit -m "emergency fix [skip ci]"
```

⚠️ **Warning:** This bypasses all safety checks. Use only in emergencies.

### Rollback Deployment

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main  # Use with caution!
```

### Disable Workflow Temporarily

1. Go to **Actions** → **Workflows**
2. Select the workflow
3. Click **⋮** → **Disable workflow**
4. Re-enable after fixing issues

---

## Support and Resources

- **GitHub Actions Docs:** https://docs.github.com/actions
- **Astro Build Docs:** https://docs.astro.build/en/guides/deploy/github/
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci
- **Repository Issues:** https://github.com/mlorentedev/svqtriana.github.io/issues

For questions or issues with CI/CD, create an issue in the repository.
