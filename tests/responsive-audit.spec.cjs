const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'mobile-360x800', width: 360, height: 800 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'desktop-1366x768', width: 1366, height: 768 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
];

const appUrl = process.env.APP_URL || 'https://lamadorportillo-sudo.github.io/control-de-proyectos/';

for (const vp of viewports) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('carga sin errores graves y no desborda horizontalmente', async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', err => pageErrors.push(err.message));

      await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1800);

      const dims = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
      }));

      expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth + 3);
      expect(dims.scrollHeight).toBeGreaterThan(0);
      expect(pageErrors, `Errores JS en ${vp.name}: ${pageErrors.join(' | ')}`).toEqual([]);

      const seriousConsoleErrors = consoleErrors.filter(t =>
        !/favicon|Failed to load resource.*404|ResizeObserver loop/i.test(t)
      );
      expect(seriousConsoleErrors, `Errores de consola en ${vp.name}: ${seriousConsoleErrors.join(' | ')}`).toEqual([]);
    });

    test('controles visibles permanecen dentro de la pantalla', async ({ page }) => {
      await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);

      const problems = await page.evaluate(() => {
        const selectors = 'button, input, select, textarea, [role="button"], a.btn';
        const els = [...document.querySelectorAll(selectors)].filter(el => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        });
        return els.map(el => {
          const r = el.getBoundingClientRect();
          const label = (el.getAttribute('aria-label') || el.textContent || el.id || el.name || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 80);
          return { label, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        }).filter(x => x.left < -3 || x.right > innerWidth + 3 || x.width < 28 || x.height < 28);
      });

      expect(problems, `Controles problemáticos en ${vp.name}: ${JSON.stringify(problems, null, 2)}`).toEqual([]);
    });

    test('login y solicitud de acceso responden al toque/clic', async ({ page }) => {
      await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1000);

      const loginTab = page.locator('#loginTab');
      const registerTab = page.locator('#registerTab');

      if (await loginTab.count()) {
        await expect(loginTab).toBeVisible();
        await loginTab.click();
      }
      if (await registerTab.count()) {
        await expect(registerTab).toBeVisible();
        await registerTab.click();
        await page.waitForTimeout(250);
        const submit = page.locator('#authSubmit');
        await expect(submit).toBeVisible();
        await expect(submit).toBeEnabled();
      }
    });
  });
}
