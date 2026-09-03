const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'mobile-360x800', width: 360, height: 800, touch: true },
  { name: 'mobile-390x844', width: 390, height: 844, touch: true },
  { name: 'tablet-768x1024', width: 768, height: 1024, touch: true },
  { name: 'tablet-1024x768', width: 1024, height: 768, touch: true },
  { name: 'desktop-1366x768', width: 1366, height: 768, touch: false },
  { name: 'desktop-1440x900', width: 1440, height: 900, touch: false },
  { name: 'desktop-wide-1815x900', width: 1815, height: 900, touch: false },
];

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const WORKSPACE_ID = '22222222-2222-4222-8222-222222222222';
const PROJECT_ID = '33333333-3333-4333-8333-333333333333';
const CONTRACT_ID = '44444444-4444-4444-8444-444444444444';

const fixture = {
  users: [],
  projects: [{
    id: PROJECT_ID,
    code: 'QA-RESP-001',
    name: 'Proyecto de prueba responsive',
    description: 'Expediente sintético usado únicamente por la auditoría automática.',
    location: 'Santa María, La Paz',
    type: 'Obra',
    projectType: 'Obra',
    budget: 2307639.52,
    status: 'En ejecución',
    start: '2026-08-05',
    end: '2026-11-02',
    executionDays: 90,
    physicalProgress: 35,
    financialProgress: 10.83,
    deletedAt: null,
    procurement: { offers: [] },
  }],
  contracts: [{
    id: CONTRACT_ID,
    projectId: PROJECT_ID,
    number: 'QA-CON-001',
    contractor: 'Contratista de prueba',
    originalAmount: 2307639.52,
    currentAmount: 2307639.52,
    signatureDate: '2026-08-05',
    start: '2026-08-05',
    end: '2026-11-02',
    executionDays: 90,
    status: 'Vigente',
    advanceStatus: 'Pagado',
    advanceApproved: 346145.93,
    advancePaid: 346145.93,
    recoveryTarget: 80,
  }],
  estimates: [{
    id: '55555555-5555-4555-8555-555555555555', projectId: PROJECT_ID, contractId: CONTRACT_ID,
    number: 1, start: '2026-08-05', end: '2026-08-19', gross: 250000, advanceApplied: 46875,
    qualityApplied: 12500, isrApplied: 0, totalDeductions: 59375, net: 190625, status: 'Pagada', paymentDate: '2026-08-20',
  }],
  guarantees: [{
    id: '66666666-6666-4666-8666-666666666666', projectId: PROJECT_ID, contractId: CONTRACT_ID,
    type: 'Cumplimiento', number: 'QA-GAR-001', issuer: 'Entidad de prueba', base: 2307639.52,
    percentage: 15, applied: 346145.93, start: '2026-08-05', end: '2026-12-02',
  }],
  changes: [{
    id: '77777777-7777-4777-8777-777777777777', projectId: PROJECT_ID, contractId: CONTRACT_ID,
    number: 1, type: 'Orden de cambio', date: '2026-08-18', amountDelta: 0, daysDelta: 0, status: 'Borrador',
  }],
  payments: [],
  visits: [{
    id: '88888888-8888-4888-8888-888888888888', projectId: PROJECT_ID, contractId: CONTRACT_ID,
    number: 1, date: '2026-08-21', type: 'Supervisión', status: 'Abierta', physical: 35,
    activities: 'Revisión de terracería y control geométrico.', generalObservations: 'Registro sintético para pruebas responsive.', observations: [],
  }],
  audit: [],
  durationLearning: [],
};

function controlCenter(){
  return {
    summary:{projects_total:1,projects_execution:1,projects_finalized:0,projects_pre_execution:0,portfolio_amount:2307639.52,execution_amount:2307639.52,execution_estimated:250000,execution_paid:190625,paid_total:190625,execution_progress_pct:10.83,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},
    projects:[{project_id:PROJECT_ID,code:'QA-RESP-001',name:'Proyecto de prueba responsive',status:'En ejecución',current_amount:2307639.52,estimated_total:250000,paid_total:190625,financial_progress_pct:10.83}],
    alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}
  };
}

async function installAuthenticatedFixture(page, role = 'consulta') {
  await page.addInitScript(({ userId, fixture }) => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    localStorage.setItem('control_contractual_session_v3', JSON.stringify({
      userId, email: 'qa-responsive@example.com', accessToken: 'qa-access-token', refreshToken: 'qa-refresh-token', expiresAt: Date.now() + 60 * 60 * 1000,
    }));
    localStorage.setItem('control_contractual_independiente_v3', JSON.stringify(fixture));
    localStorage.setItem('cc_exec_section_v2', 'home');
  }, { userId: USER_ID, fixture });

  await page.route('https://flethujkrharehjikwgj.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let body = [];
    if (path.includes('/rest/v1/workspace_members')) body = [{ workspace_id: WORKSPACE_ID, role, active: true }];
    else if (path.includes('/rest/v1/profiles')) body = [{ full_name: 'Usuario QA Responsive', active: true, must_change_password:false }];
    else if (path.includes('/rest/v1/app_state')) body = [{ data: fixture, version: 1, updated_at: '2026-08-22T12:00:00Z' }];
    else if (path.includes('/rest/v1/rpc/get_control_center')) body = controlCenter();
    else if (path.includes('/rest/v1/rpc/save_app_state')) body = [{ saved: true, new_version: 2 }];
    else if (path.includes('/rest/v1/access_requests')) body = [];
    else if (path.includes('/auth/v1/logout')) body = {};
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

async function assertNoGlobalOverflow(page, label) {
  const dims = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyWidth: document.body.scrollWidth,
    offenders: [...document.querySelectorAll('body *')].map(el => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, id: el.id, cls: String(el.className || '').slice(0, 90), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), scrollWidth: el.scrollWidth };
    }).filter(x => x.right > document.documentElement.clientWidth + 3 || x.left < -3)
      .sort((a, b) => Math.max(b.right - document.documentElement.clientWidth, -b.left) - Math.max(a.right - document.documentElement.clientWidth, -a.left)).slice(0, 6),
  }));
  expect(dims.scrollWidth, `${label}: desbordamiento global; ${JSON.stringify(dims.offenders)}`).toBeLessThanOrEqual(dims.clientWidth + 3);
  expect(dims.bodyWidth, `${label}: desbordamiento del body`).toBeLessThanOrEqual(dims.clientWidth + 3);
}

async function openSidebarIfNeeded(page){
  const sidebar=page.locator('#ccSidebar');
  if(await sidebar.isVisible().catch(()=>false))return;
  const toggle=page.locator('#ccMobileToggle');
  if(await toggle.isVisible().catch(()=>false)){await toggle.click();await expect(sidebar).toBeVisible();}
}
async function clickRoute(page,route){
  await openSidebarIfNeeded(page);
  const btn=page.locator(`#ccSidebar [data-route="${route}"]`);
  await expect(btn).toBeVisible();await btn.click();await page.waitForTimeout(260);
}

for (const vp of viewports) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.touch });

    test('recorre navegación interna, búsqueda y expediente completo', async ({ page }, testInfo) => {
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      await installAuthenticatedFixture(page);
      await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('#ccSidebar', { timeout: 20000 });
      await page.waitForTimeout(700);

      await expect(page.locator('.auth-card')).toHaveCount(0);
      await expect(page.locator('#ccxNav')).toBeHidden();
      await expect(page.locator('#ccSidebar [data-route="transparencia"]')).toHaveCount(1);
      if (vp.width > 900) {
        await expect(page.locator('.service-strip .service-tile')).toHaveCount(5);
        const tileRows = await page.locator('.service-strip .service-tile').evaluateAll(tiles => [...new Set(tiles.map(tile => Math.round(tile.getBoundingClientRect().top)))]);
        expect(tileRows, `${vp.name}: las cinco tarjetas de servicios deben permanecer en una sola línea`).toHaveLength(1);
      }
      await assertNoGlobalOverflow(page, `${vp.name} inicio`);

      for (const route of ['inicio','proyectos','presupuesto','transparencia']) {
        await clickRoute(page,route);
        await expect(page.locator('#content')).not.toBeEmpty();
        await assertNoGlobalOverflow(page, `${vp.name} ruta ${route}`);
      }

      await clickRoute(page,'proyectos');
      const search = page.locator('#ccGlobalSearch');
      await expect(search).toBeVisible();
      await search.fill('QA RESP');
      await search.press('Enter');
      await expect(search).toHaveValue('QA RESP');

      const open = page.locator(`[data-ccx-open="${PROJECT_ID}"], [data-open="${PROJECT_ID}"]`).first();
      await expect(open).toBeVisible();
      await open.click();
      await page.waitForSelector('#tabBody', { timeout: 15000 });
      await page.waitForTimeout(500);
      await assertNoGlobalOverflow(page, `${vp.name} expediente`);

      const tabs = page.locator('nav.tabs button[data-tab], .tabs button[data-tab]');
      const count = await tabs.count();
      expect(count, `${vp.name}: cantidad de pestañas`).toBeGreaterThanOrEqual(9);

      for (let i = 0; i < count; i++) {
        const tab = tabs.nth(i);
        const label = ((await tab.textContent()) || `tab-${i}`).replace(/\s+/g, ' ').trim();
        if (!(await tab.isVisible())) continue;
        await tab.click();
        await page.waitForTimeout(180);
        await expect(page.locator('#tabBody')).toBeVisible();
        const textLength = await page.locator('#tabBody').evaluate(el => (el.innerText || '').trim().length);
        expect(textLength, `${vp.name}: pestaña ${label} sin contenido`).toBeGreaterThan(10);
        await assertNoGlobalOverflow(page, `${vp.name} pestaña ${label}`);
      }

      const reportsJump = page.locator('[data-project-jump="reports"]').first();
      if (await reportsJump.count()) { await reportsJump.click(); await page.waitForTimeout(300); }
      if (await page.locator('.report-type-card').count()) {
        await expect(page.locator('.report-type-card')).toHaveCount(9);
        await page.locator('.report-type-card').first().click();
        await page.waitForTimeout(180);
        await expect(page.locator('#reportPreview')).toBeVisible();
        await expect(page.locator('#printReport')).toBeVisible();
        await expect(page.locator('#downloadReport')).toBeVisible();
      }

      const editableInProject = page.locator('#tabBody button').filter({ hasText: /^(Guardar|Eliminar|Editar|Agregar|Nuevo|Registrar)/i });
      expect(await editableInProject.count(), `${vp.name}: usuario consulta no debe mostrar edición directa`).toBe(0);

      if (vp.name === 'desktop-1366x768') {
        const costButton = page.locator('#ccCostProgramLazyBtn');
        await expect(costButton).toBeVisible();
        await costButton.click();
        await page.waitForSelector('.cccost', { timeout: 30000 });
        await expect(page.locator('.cccost h2', { hasText: 'Programa de costos' })).toBeVisible();
        expect(await page.evaluate(() => window.__ccCostProgram?.data?.fichas?.length || 0), 'la base FHIS debe cargarse al solicitarla').toBeGreaterThan(0);

        await page.locator('#ccEngineerChatLaunch').click();
        await page.locator('#ccEngineerChat [data-q]').filter({ hasText: 'Consulta legal' }).click();
        await expect.poll(() => page.evaluate(() => !!window.__ccLegalKnowledge), { timeout: 30000 }).toBe(true);
      }

      expect(pageErrors, `${vp.name}: errores JS: ${pageErrors.join(' | ')}`).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${vp.name}-expediente.png`), fullPage: true });
    });
  });
}

test.describe('ZORDON autenticado', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('persiste memoria clasificada en el estado del espacio y protege datos sensibles', async ({ page }) => {
    const cloudSaves = [];
    const aiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/rest/v1/rpc/save_app_state')) cloudSaves.push(request.postDataJSON());
      if (request.url().includes('/functions/v1/halu-chat')) aiRequests.push(request.url());
    });
    await installAuthenticatedFixture(page, 'admin');
    await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#ccSidebar', { timeout: 20000 });

    const result = await page.evaluate(projectId => {
      const core = window.__ccZordonLearning;
      const preference = core.rememberFact('Prefiero informes ejecutivos breves.', { type: 'personal', confirmed: true });
      const sensitive = core.rememberFact('Mi contraseña es Obra-2026-secreta');
      const official = core.rememberFact('El monto del contrato QA-CON-001 ahora es L 2,400,000.00', { projectId });
      const confirmed = core.confirm('monto contrato QA-CON-001');
      return {
        engine: core.stats().engine,
        preference: { saved: preference.saved, type: preference.item.type, scope: preference.item.scope.level, confidence: preference.item.confidence, actorId: preference.item.source.actorId },
        sensitive: { saved: sensitive.saved, reason: sensitive.reason },
        officialPending: official.needsConfirmation,
        confirmed: confirmed.confirmed,
        context: core.contextFor('monto contrato QA-CON-001', { projectId }),
      };
    }, PROJECT_ID);

    expect(result.engine).toBe('ZORDON');
    expect(result.preference.saved).toBe(true);
    expect(result.preference.type).toBe('personal');
    expect(result.preference.scope).toBe('user');
    expect(result.preference.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.preference.actorId).toBe(USER_ID);
    expect(result.sensitive).toEqual({ saved: false, reason: 'sensitive' });
    expect(result.officialPending).toBe(true);
    expect(result.confirmed).toBe(true);
    expect(result.context).toContain('L 2,400,000.00');
    const sensitiveReply = await page.evaluate(() => window.__ccEngineerChat.answerWithAI('mi token es abc1234567890-secreto'));
    expect(sensitiveReply).toContain('No lo guardaré ni lo enviaré');
    expect(aiRequests).toHaveLength(0);

    await expect.poll(() => page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('control_contractual_independiente_v3') || '{}');
      return data.chatLearning?.items?.filter(item => item.status === 'active').length || 0;
    })).toBeGreaterThanOrEqual(2);
    await page.evaluate(() => window.ccSaveCloudNow());
    await expect.poll(() => cloudSaves.length).toBeGreaterThan(0);
    expect(cloudSaves.at(-1).p_data.chatLearning.engine).toBe('ZORDON');
    expect(cloudSaves.at(-1).p_data.chatLearning.items.some(item => item.type === 'personal')).toBe(true);
    expect(JSON.stringify(cloudSaves.at(-1).p_data.chatLearning)).not.toContain('abc1234567890-secreto');
  });
});