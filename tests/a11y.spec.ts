import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { path: '/', heading: 'TEMPORADA 26/27' },
  { path: '/nosotros', heading: '¿QUIÉNES SOMOS?' },
  { path: '/productos', heading: 'MATERIAL' },
  { path: '/media', heading: 'GALERÍA' },
];

for (const pageUnderTest of PAGES) {
  test(`${pageUnderTest.path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(pageUnderTest.path);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(pageUnderTest.heading);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(
      serious,
      `Serious violations on ${pageUnderTest.path}:\n${JSON.stringify(serious, null, 2)}`,
    ).toEqual([]);
  });
}
