// Prueba crítica V4: protege contra pantalla en blanco, ciclos de arranque y regresiones visuales del dashboard.
const { test, expect } = require('@playwright/test');

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const USER_ID = '91111111-1111-4111-8111-111111111111';
const WORKSPACE_ID = '92222222-2222-4222-8222-222222222222';

const fixture = {
  users: [],
  projects: [],
  contracts: [],
  estimates: [],
  guarantees: [],
  changes: [],
  payments: [],
  visits: [],
  audit: [],
  durationLearning: [],
};

async function installSession(page) {
  await page.addInitScript(({ userId, fixture }) => {
    localStorage.setItem('control_contractual_session_v3', JSON.stringify({
      userId,
      email: 'qa-startup@example.com',
      accessToken: 'qa-startup-access-token',
      refreshToken: 'qa-startup-refresh-token',
      expiresAt: Date.now() + 60 * 60 * 1000,
    }));
    localStorage.setItem('control_contractual_independiente_v3', JSON.stringify(fixture));
  }, { userId: USER_ID, fixture });
}

function mockSupabaseFast(page) {
  return page.route('https://flethujkrharehjikwgj.supabase.co/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let body = [];
    if (path.includes('/rest/v1/workspace_members')) body = [{ workspace_id: WORKSPACE_ID, role: 'consulta', active: true }];
    else if (path.includes('/rest/v1/profiles')) body = [{ full_name: 'Usuario QA Inicio', active: true }];
    else if (path.includes('/rest/v1/app_state')) body = [{ data: fixture, version: 1, updated_at: '2026-09-03T20:00:00Z' }];
    else if (path.includes('/rest/v1/rpc/save_app_state')) body = [{ saved: true, new_version: 2 }];
    else if (path.includes('/auth/v1/logout')) body = {};
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

test.describe('arranque crítico', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('sin sesión nunca queda en una pantalla vacía', async ({ page }) => {
    await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect.poll(async () => (await page.locator('#app').innerText()).trim().length, { timeout: 8000 }).toBeGreaterThan(20);
  });

  test('con sesión y Supabase disponible abre la interfaz autenticada', async ({ page }) => {
    await installSession(page);
    await mockSupabaseFast(page);
    await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('#ccSidebar')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#content')).toBeVisible({ timeout: 5000 });
    await expect.poll(async () => (await page.locator('#app').innerText()).trim().length, { timeout: 5000 }).toBeGreaterThan(50);
  });

  test('la interfaz autenticada queda consolidada, legible y sin navegación duplicada', async ({ page }) => {
    await installSession(page);
    await mockSupabaseFast(page);
    await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('#ccSidebar')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#ccGlobalSearch')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#ccSidebar [data-route="transparencia"]')).toHaveCount(1, { timeout: 5000 });

    const state = await page.evaluate(() => {
      const nav=document.querySelector('#ccxNav');
      const search=document.querySelector('#ccGlobalSearch');
      const before=document.querySelector('.cc-global-search');
      const visual=document.querySelector('.exec-visual');
      return {
        executiveNavDisplay:nav?getComputedStyle(nav).display:'missing',
        searchPlaceholder:search?.getAttribute('placeholder')||'',
        searchBefore:before?getComputedStyle(before,'::before').content:'',
        overflow:document.documentElement.scrollWidth-window.innerWidth,
        visualPadding:visual?parseFloat(getComputedStyle(visual).paddingRight)||0:76,
      };
    });
    expect(['none','missing']).toContain(state.executiveNavDisplay);
    expect(state.searchPlaceholder).toBe('Buscar proyecto, código, ubicación o estado…');
    expect(['none','normal','""','"⌕"']).toContain(state.searchBefore);
    expect(state.overflow).toBeLessThanOrEqual(2);
    expect(state.visualPadding).toBeGreaterThanOrEqual(70);

    await page.locator('#ccSidebar [data-route="proyectos"]').click();
    await expect(page.locator('#content')).toContainText('Proyectos', { timeout: 5000 });
    await page.locator('#ccSidebar [data-route="inicio"]').click();
    await expect(page.locator('#content')).toContainText(/Estado general del portafolio|Centro de Control/i, { timeout: 5000 });
  });

  test('si Supabase tarda demasiado muestra recuperación y no queda en blanco', async ({ page }) => {
    test.setTimeout(30000);
    await installSession(page);
    await page.route('https://flethujkrharehjikwgj.supabase.co/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 13000));
      const path = new URL(route.request().url()).pathname;
      const body = path.includes('/rest/v1/workspace_members')
        ? [{ workspace_id: WORKSPACE_ID, role: 'consulta', active: true }]
        : [];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }).catch(() => {});
    });
    await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('#app')).toContainText('No se pudo abrir la nube', { timeout: 17000 });
    await expect.poll(async () => (await page.locator('#app').innerText()).trim().length, { timeout: 3000 }).toBeGreaterThan(40);
  });
});