const { test, expect } = require('@playwright/test');

const APP_URL = process.env.FRONTEND_V2_URL || 'http://127.0.0.1:4173/frontend-v2/dist/';
const SUPABASE_ORIGIN = 'https://flethujkrharehjikwgj.supabase.co';
const SESSION_KEY = 'control_contractual_session_v3';
const USER_ID = '11111111-1111-4111-8111-111111111111';

function b64url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function makeJwt() {
  const now = Math.floor(Date.now() / 1000);
  return [
    b64url({ alg: 'HS256', typ: 'JWT' }),
    b64url({
      aud: 'authenticated',
      exp: now + 3600,
      iat: now - 10,
      sub: USER_ID,
      email: 'qa-v2@example.com',
      role: 'authenticated',
    }),
    'qa-signature',
  ].join('.');
}

function userPayload() {
  return {
    id: USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'qa-v2@example.com',
    email_confirmed_at: new Date().toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
}

function projectRow() {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    workspace_id: '33333333-3333-4333-8333-333333333333',
    code: 'QA-V2-001',
    name: 'Proyecto QA V2',
    description: 'Prueba de puente de sesión',
    location: 'Santa María',
    project_type: 'Obra',
    budget_estimate: 100000,
    status: 'En ejecución',
    start_date: '2026-09-01',
    end_date: '2026-12-01',
    archived_at: null,
    raw_data: {
      shortName: 'QA V2',
      physicalProgress: 25,
      financialProgress: 20,
      fundingSource: 'Municipal',
    },
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-16T00:00:00Z',
  };
}

async function seedProductionSession(page, token) {
  await page.addInitScript(
    ({ key, token, userId }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          userId,
          email: 'qa-v2@example.com',
          accessToken: token,
          refreshToken: 'refresh-qa',
          expiresAt: Date.now() + 3600_000,
        })
      );
    },
    { key: SESSION_KEY, token, userId: USER_ID }
  );
}

async function mockSupabase(page, capture) {
  await page.route(`${SUPABASE_ORIGIN}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const auth = request.headers()['authorization'] || '';

    if (path === '/auth/v1/user') {
      capture.userAuth = auth;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(userPayload()),
      });
    }

    if (path === '/auth/v1/token') {
      const accessToken = capture.token || makeJwt();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: 'refresh-qa',
          expires_in: 3600,
          token_type: 'bearer',
          user: userPayload(),
        }),
      });
    }

    if (path.startsWith('/rest/v1/')) {
      capture.restRequests = (capture.restRequests || 0) + 1;
      if (!['GET', 'HEAD'].includes(request.method())) {
        capture.restWriteRequests = (capture.restWriteRequests || 0) + 1;
      }
      if (path === '/rest/v1/projects') {
        capture.projectsAuth = auth;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([projectRow()]),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      });
    }

    if (path === '/functions/v1/halu-chat') {
      capture.functionAuth = auth;
      try {
        capture.functionBody = request.postDataJSON();
      } catch {
        capture.functionBody = null;
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reply: 'Respuesta QA de ZORDON' }),
      });
    }

    if (path.startsWith('/functions/v1/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    });
  });
}

test('V2 reutiliza la sesión productiva al compartir el mismo origen', async ({ page }) => {
  const token = makeJwt();
  const capture = { token, restRequests: 0 };

  await seedProductionSession(page, token);
  await mockSupabase(page, capture);
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('Control Contractual').first()).toBeVisible();
  await expect.poll(() => capture.restRequests).toBeGreaterThan(0);
  await expect.poll(() => capture.projectsAuth).toBe(`Bearer ${token}`);
  await expect(page.getByText(/Sesión requerida\. Abre la V2/)).toHaveCount(0);
});

test('ZORDON V2 usa la misma sesión y el Edge Function productivo', async ({ page }) => {
  const token = makeJwt();
  const capture = { token, restRequests: 0 };

  await seedProductionSession(page, token);
  await mockSupabase(page, capture);
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: 'Abrir ZORDON' }).first().click();
  const input = page.getByPlaceholder('Escribe a ZORDON…');
  await expect(input).toBeVisible();
  await input.fill('Revisa el estado del proyecto QA.');
  await input.press('Enter');

  await expect(page.getByText('Respuesta QA de ZORDON')).toBeVisible();
  await expect.poll(() => capture.functionAuth).toBe(`Bearer ${token}`);
  expect(capture.functionBody?.message).toBe('Revisa el estado del proyecto QA.');
});

test('Telegram Mini App activa automáticamente el entorno Telegram', async ({ page }) => {
  const token = makeJwt();
  const capture = { token, restRequests: 0 };

  await seedProductionSession(page, token);
  await page.addInitScript(() => {
    window.Telegram = {
      WebApp: {
        initData: 'query_id=qa',
        initDataUnsafe: {
          user: { id: 999001, first_name: 'QA', username: 'qa_control' },
        },
        expand() {
          window.__CC_QA_TELEGRAM_EXPANDED__ = true;
        },
        sendData() {},
        close() {},
      },
    };
  });

  await mockSupabase(page, capture);
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  const root = page.locator('[data-telegram-mini-app="true"]');
  await expect(root).toBeVisible();
  await expect(root).toHaveAttribute('data-viewport-mode', 'telegram');
  await expect.poll(() => page.evaluate(() => Boolean(window.__CC_QA_TELEGRAM_EXPANDED__))).toBe(true);
});


test('Reportes expone generador de proyectos en ejecución sin escribir en backend', async ({ page }) => {
  const token = makeJwt();
  const capture = { token, restRequests: 0 };

  await seedProductionSession(page, token);
  await mockSupabase(page, capture);
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  const reportNav = page.getByRole('button', { name: /Reportes/i }).first();
  await expect(reportNav).toBeVisible();
  await reportNav.click();

  await expect(page.getByText('Reporte de proyectos en ejecución')).toBeVisible();
  await expect(page.getByRole('button', { name: /Imprimir \/ Guardar PDF/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Exportar CSV/i })).toBeVisible();
});


for (const viewport of [
  { name: 'celular-360', width: 360, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'pc-1440', width: 1440, height: 900 },
]) {
  test(`V2 responde correctamente en ${viewport.name}`, async ({ page }) => {
    const token = makeJwt();
    const capture = { token, restRequests: 0 };
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seedProductionSession(page, token);
    await mockSupabase(page, capture);
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-viewport-mode]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Abrir ZORDON' }).first()).toBeVisible();

    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 4);
  });
}


test('Transparencia inicia sin categorías preseleccionadas y permite elegir formato', async ({ page }) => {
  const token = makeJwt();
  const capture = { token, restRequests: 0 };

  await seedProductionSession(page, token);
  await mockSupabase(page, capture);
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: /Transparencia/i }).first().click();
  await expect(page.getByText('Generador del Portal de Transparencia').first()).toBeVisible();
  await expect(page.getByText(/0 categoría\(s\) seleccionada\(s\)/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Portal web' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ZIP' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Generar vista seleccionada/i })).toBeDisabled();
});

test('V2 bloquea lecturas de datos cuando no existe sesión productiva', async ({ page }) => {
  const capture = { restRequests: 0 };
  await mockSupabase(page, capture);

  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/Sesión requerida\. Abre la V2 desde una sesión iniciada en Control Contractual\./)).toBeVisible();
  await page.waitForTimeout(500);
  expect(capture.restRequests).toBe(0);
});


test('V2 no desborda horizontalmente en anchos oficiales', async ({ page }) => {
  const token = makeJwt();
  const capture = { token, restRequests: 0 };
  await seedProductionSession(page, token);
  await mockSupabase(page, capture);

  const widths = [360, 480, 768, 1024, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-viewport-mode]').first()).toBeVisible();
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth, `overflow horizontal a ${width}px`).toBeLessThanOrEqual(overflow.clientWidth + 2);
    await expect(page.getByRole('button', { name: 'Abrir ZORDON' }).first()).toBeVisible();
  }
});


test('Registrar visita mantiene escritura productiva desactivada por defecto', async ({ page }) => {
  const token = makeJwt();
  const capture = { token, restRequests: 0, restWriteRequests: 0 };

  await seedProductionSession(page, token);
  await mockSupabase(page, capture);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  await page.locator('#btn-sidebar-modo-campo').click();
  await expect(page.getByRole('heading', { name: 'Modo campo', exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Nueva visita' }).click();

  await expect(page.getByRole('heading', { name: 'Registrar visita de obra' })).toBeVisible();
  await page.getByRole('button', { name: /Revisar y guardar/ }).click();

  const saveButton = page.getByRole('button', { name: 'Guardar visita' });
  await expect(saveButton).toBeDisabled();
  await expect(page.getByText(/escritura productiva está preparada pero permanece desactivada/i)).toBeVisible();
  expect(capture.restWriteRequests).toBe(0);
});
