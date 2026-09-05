const { test, expect } = require('@playwright/test');

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const storeKey = 'control_contractual_independiente_v3';
const sessionKey = 'control_contractual_session_v3';

test.describe('frontera de acceso privado sin modo invitado', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ storeKey, sessionKey }) => {
      localStorage.removeItem(storeKey);
      localStorage.removeItem(sessionKey);
    }, { storeKey, sessionKey });
  });

  test('sin sesión solo muestra acceso privado y no crea estado temporal', async ({ page }) => {
    const pageErrors = [];
    const writes = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => {
      if (request.url().includes('.supabase.co') && !['GET','HEAD','OPTIONS'].includes(request.method())) writes.push({ method: request.method(), url: request.url() });
    });

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#authForm')).toBeVisible();
    await expect(page.locator('#ccGuestEnter')).toHaveCount(0);
    await expect(page.locator('#ccSidebar')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveClass(/cc-guest-mode/);

    const state = await page.evaluate(({ storeKey, sessionKey }) => ({
      guestRuntime: typeof window.__ccGuestMode,
      store: localStorage.getItem(storeKey),
      session: localStorage.getItem(sessionKey),
    }), { storeKey, sessionKey });
    expect(state).toEqual({ guestRuntime: 'undefined', store: null, session: null });
    expect(writes).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Halu y los módulos autenticados no quedan expuestos antes de iniciar sesión', async ({ page }) => {
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#authForm')).toBeVisible();
    await expect(page.locator('#ccEngineerChatLaunch')).toHaveCount(0);
    await expect(page.locator('#ccSidebar')).toHaveCount(0);
    const runtime = await page.evaluate(() => ({
      engineerChat: typeof window.__ccEngineerChat,
      zordon: typeof window.__ccZordonLearning,
      authLoaderStarted: window.__CC_AUTH_MODULE_LOADER__ === true,
    }));
    expect(runtime.engineerChat).toBe('undefined');
    expect(runtime.zordon).toBe('undefined');
    expect(runtime.authLoaderStarted).toBe(false);
  });
});