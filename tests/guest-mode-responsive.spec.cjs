const { test, expect } = require('@playwright/test');

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const storeKey = 'control_contractual_independiente_v3';
const sessionKey = 'control_contractual_session_v3';

test.describe('modo invitado temporal', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ storeKey, sessionKey }) => {
      localStorage.removeItem(storeKey);
      localStorage.removeItem(sessionKey);
    }, { storeKey, sessionKey });
  });

  test('permite usar la página, no persiste y borra al salir', async ({ page }) => {
    const pageErrors = [];
    const supabaseRequests = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => {
      if (request.url().includes('.supabase.co')) supabaseRequests.push({ method: request.method(), url: request.url() });
    });

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#ccGuestEnter')).toBeVisible();
    await page.locator('#ccGuestEnter').click();

    await expect(page.locator('body')).toHaveClass(/cc-guest-mode/);
    await expect(page.locator('.cc-guest-banner')).toContainText('Modo invitado temporal');
    await expect(page.locator('#backupBtn')).toBeDisabled();
    await expect(page.locator('#newProjectBtn')).toBeVisible();
    await expect(page.locator('#ccSidebar')).toBeVisible({timeout:10000});
    await page.locator('#ccSidebar [data-route="proyectos"]').click();
    await expect(page.locator('.project-v3, .project-card-premium').first()).toBeVisible();

    await page.locator('#newProjectBtn').click();
    await page.locator('#pCode').fill('INV-TEMP-01');
    await page.locator('#pName').fill('Proyecto temporal del invitado');
    await page.locator('#pLocation').fill('Prueba local');
    await page.locator('#pBudget').fill('125000');
    await page.locator('#projectForm button.btn.primary').click();
    await expect(page.locator('body')).toContainText('Proyecto temporal del invitado');
    await expect.poll(() => page.evaluate(() => window.__ccGuestMode.changes())).toBeGreaterThan(0);

    expect(supabaseRequests.filter(request => request.method() !== 'GET')).toEqual([]);

    await page.evaluate(() => window.print());
    await expect(page.locator('.toast').last()).toContainText('usuario autorizado');

    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-guest-exit]').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#ccGuestEnter')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Proyecto temporal del invitado');
    const afterExit = await page.evaluate(({ storeKey, sessionKey }) => ({
      store: localStorage.getItem(storeKey),
      session: localStorage.getItem(sessionKey),
    }), { storeKey, sessionKey });
    expect(afterExit).toEqual({ store: null, session: null });
    expect(pageErrors).toEqual([]);
  });

  test('Halu conserva el hilo y acepta mensajes libres', async ({ page }) => {
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('#ccGuestEnter').click();
    await page.locator('#ccEngineerChatLaunch').click();
    const input = page.locator('#ccEngineerChat textarea');
    await expect(input).toBeVisible();

    await input.fill('Hola, me llamo Ana');
    await input.press('Enter');
    await expect(page.locator('.cc-eng-msg.user').last()).toContainText('me llamo Ana');
    await expect(page.locator('.cc-eng-msg.bot').last()).toContainText(/Ana|gusto|cómo/i);

    await input.fill('Estoy revisando una obra atrasada');
    await input.press('Enter');
    await expect(page.locator('.cc-eng-msg.bot').last()).not.toHaveText('Halu está pensando…');

    const history = await page.evaluate(() => window.__ccEngineerChat.conversation.history);
    expect(history.length).toBeGreaterThanOrEqual(4);
    expect(history.some(turn => turn.role === 'user' && /obra atrasada/i.test(turn.text))).toBeTruthy();
    expect(history[history.length - 1].role).toBe('assistant');
    const guestLearning = await page.evaluate(() => {
      const result = window.__ccZordonLearning.rememberFact('Prefiero respuestas breves.', { type: 'personal', confirmed: true });
      return { persistent: result.persistent, memories: window.__ccZordonLearning.recall('respuestas breves').length };
    });
    expect(guestLearning).toEqual({ persistent: false, memories: 1 });

    await page.locator('.cc-eng-chat-reset').click();
    await expect(page.locator('.cc-eng-msg.bot').last()).toContainText('hilo nuevo');
    const resetHistory = await page.evaluate(() => window.__ccEngineerChat.conversation.history);
    expect(resetHistory.length).toBe(0);
    expect(await page.evaluate(() => window.__ccZordonLearning.recall('respuestas breves').length)).toBe(0);
  });
});