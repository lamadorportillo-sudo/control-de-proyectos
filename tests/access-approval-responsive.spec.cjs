const { test, expect } = require('@playwright/test');

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const WORKSPACE_ID = '22222222-2222-4222-8222-222222222222';
const fixture = { users: [], projects: [], contracts: [], estimates: [], guarantees: [], changes: [], payments: [], visits: [], audit: [], durationLearning: [] };

async function installAdminFixture(page) {
  const requests = [
    { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', full_name: 'María Supervisora', email: 'maria@example.com', phone: '9999-1111', position: 'Supervisión', requested_role: 'editor', status: 'pending', requested_at: '2026-08-24T15:00:00Z', notification_sent: true },
    { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', full_name: 'Carlos Auditor', email: 'carlos@example.com', phone: '', position: 'Auditoría', requested_role: 'consulta', status: 'pending', requested_at: '2026-08-24T16:00:00Z', notification_sent: false },
  ];

  await page.addInitScript(({ userId, fixture }) => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    localStorage.setItem('control_contractual_session_v3', JSON.stringify({
      userId,
      email: 'administrador@example.com',
      accessToken: 'admin-access-token',
      refreshToken: 'admin-refresh-token',
      expiresAt: Date.now() + 60 * 60 * 1000,
    }));
    localStorage.setItem('control_contractual_independiente_v3', JSON.stringify(fixture));
  }, { userId: USER_ID, fixture });

  await page.route('https://flethujkrharehjikwgj.supabase.co/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    let body = [];

    if (path.includes('/rest/v1/workspace_members')) {
      body = [{ workspace_id: WORKSPACE_ID, role: 'admin', active: true }];
    } else if (path.includes('/rest/v1/profiles')) {
      body = [{ full_name: 'Administrador QA', active: true }];
    } else if (path.includes('/rest/v1/app_state')) {
      body = [{ data: fixture, version: 1, updated_at: '2026-08-24T12:00:00Z' }];
    } else if (path.includes('/rest/v1/access_requests')) {
      body = requests.filter(item => url.search.includes('status=eq.pending') ? item.status === 'pending' : item.status !== 'rejected');
    } else if (path.includes('/rest/v1/rpc/approve_access_request')) {
      const payload = request.postDataJSON();
      const item = requests.find(entry => entry.id === payload.p_request_id);
      if (item) item.status = 'approved';
      body = [{ invite_code: 'AUTORIZA1234', expires_at: '2026-08-27T18:00:00Z', email: item?.email || '', role: item?.requested_role || 'consulta' }];
    } else if (path.includes('/rest/v1/rpc/reject_access_request')) {
      const payload = request.postDataJSON();
      const item = requests.find(entry => entry.id === payload.p_request_id);
      if (item) item.status = 'rejected';
      body = null;
    } else if (path.includes('/auth/v1/logout')) {
      body = {};
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

test.describe('autorización administrativa de usuarios', () => {
  test('avisa al administrador, permite aprobar y rechazar desde el sidebar', async ({ page }) => {
    await installAdminFixture(page);
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });

    const requestsButton = page.locator('#ccSidebar [data-route="solicitudes"]');
    await expect(requestsButton).toBeVisible({timeout:10000});
    await expect(requestsButton).toContainText('2');
    await expect(page.locator('.cc-access-request-notice')).toContainText('2 solicitudes nuevas de usuarios');

    await requestsButton.click();
    await expect(page.locator('[data-request="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"]')).toContainText('María Supervisora');
    await expect(page.locator('[data-request="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"]')).toContainText('Carlos Auditor');

    await page.locator('[data-request="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"] [data-approve]').click();
    await expect(page.locator('[data-request="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"] .invite-output')).toContainText('AUTORIZA1234');
    await expect(requestsButton).toContainText('1');

    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-request="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"] [data-reject]').click();
    await expect(requestsButton).toHaveText('Solicitudes');
    await expect(page.locator('.cc-access-request-notice')).toHaveCount(0);
  });

  test('el solicitante no crea una cuenta antes de la aprobación', async ({ page }) => {
    const signups = [];
    await page.route('https://flethujkrharehjikwgj.supabase.co/**', async route => {
      const request = route.request();
      if (request.url().includes('/auth/v1/signup')) signups.push(request.url());
      if (request.url().includes('/functions/v1/request-access')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, request_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', email_sent: true }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#authPhone')).toBeAttached();
    await page.locator('#registerTab').click();
    await page.locator('#authName').fill('Nuevo Usuario');
    await page.locator('#authEmail').fill('nuevo@example.com');
    await page.locator('#authPhone').fill('9999-2222');
    await page.locator('#authPosition').fill('Residente de obra');
    await page.locator('#authRequestedRole').selectOption('editor');
    await page.locator('#authSubmit').click();

    await expect(page.locator('#authMessage')).toContainText('administrador fue notificado');
    await expect(page.locator('#accessCodeField')).toBeVisible();
    expect(signups).toEqual([]);
  });
});