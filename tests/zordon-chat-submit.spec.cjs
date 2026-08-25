const { test, expect } = require('@playwright/test');

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const storeKey = 'control_contractual_independiente_v3';
const sessionKey = 'control_contractual_session_v3';

test.describe('ZORDON envío de chat', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ storeKey, sessionKey }) => {
      localStorage.removeItem(storeKey);
      localStorage.removeItem(sessionKey);
    }, { storeKey, sessionKey });
  });

  test('botón Enviar y tecla Enter funcionan', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('#ccGuestEnter').click();
    await page.locator('#ccEngineerChatLaunch').click();

    const chat = page.locator('#ccEngineerChat');
    const input = chat.locator('textarea');
    const send = chat.locator('button[type="submit"]');
    await expect(input).toBeVisible();
    await expect(send).toBeVisible();
    await expect(send).toBeEnabled();

    await input.fill('hola desde boton');
    await send.click();
    await expect(chat.locator('.cc-eng-msg.user').last()).toContainText('hola desde boton');
    await expect(input).toHaveValue('');

    await input.fill('hola desde enter');
    await input.press('Enter');
    await expect(chat.locator('.cc-eng-msg.user').last()).toContainText('hola desde enter');
    await expect(input).toHaveValue('');

    expect(pageErrors).toEqual([]);
  });
});
