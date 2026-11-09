import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/nosotros', '/productos', '/media'];

for (const route of ROUTES) {
  test(`${route} responds 200`, async ({ request }) => {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
  });
}

for (const route of ['/robots.txt', '/sitemap.xml', '/ads.txt', '/llms.txt', '/sw.js']) {
  test(`${route} responds 200`, async ({ request }) => {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
  });
}

test('an unknown route responds 404 and serves the error page', async ({ request }) => {
  const response = await request.get('/esta-pagina-no-existe');
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('Esta página no existe');
});
