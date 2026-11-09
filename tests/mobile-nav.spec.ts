import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });

test('the mobile menu opens, shows the four sections and navigates', async ({ page }) => {
  await page.goto('/');

  const menu = page.locator('details[data-mobile-nav]');
  const summary = menu.locator('summary');

  await expect(summary).toBeVisible();
  await expect(menu).not.toHaveAttribute('open', '');

  await summary.click();
  await expect(menu).toHaveAttribute('open', '');

  const links = menu.locator('nav a');
  await expect(links).toHaveCount(4);

  for (const label of ['INICIO', 'NUESTRA HISTORIA', 'MATERIAL', 'GALERÍA']) {
    await expect(menu.getByRole('link', { name: label })).toBeVisible();
  }

  await menu.getByRole('link', { name: 'GALERÍA' }).click();
  await expect(page).toHaveURL(/\/media$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('GALERÍA');
});

test('the mobile menu closes with Escape', async ({ page }) => {
  await page.goto('/nosotros');

  const menu = page.locator('details[data-mobile-nav]');
  await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open', '');

  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
});
