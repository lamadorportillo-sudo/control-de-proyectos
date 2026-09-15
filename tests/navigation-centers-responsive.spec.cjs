const {test,expect}=require('@playwright/test');

const APP_URL=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='e1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='e2222222-2222-4222-8222-222222222222';
const FIXTURE={users:[],projects:[],contracts:[],estimates:[],guarantees:[],changes:[],payments:[],visits:[],audit:[],durationLearning:[]};

async function installSession(page){
  await page.addInitScript(({userId,fixture})=>{
    localStorage.setItem('control_contractual_session_v3',JSON.stringify({
      userId,email:'qa-nav@example.com',accessToken:'qa-nav-access',refreshToken:'qa-nav-refresh',expiresAt:Date.now()+3600000
    }));
    localStorage.setItem('control_contractual_independiente_v3',JSON.stringify(fixture));
    localStorage.setItem('cc_main_route_v2','inicio');
  },{userId:USER_ID,fixture:FIXTURE});
}
async function mockBackend(page){
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const path=new URL(route.request().url()).pathname;let body=[];
    if(path.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
    else if(path.includes('/rest/v1/profiles'))body=[{full_name:'Usuario QA Navegación',active:true,must_change_password:false}];
    else if(path.includes('/rest/v1/app_state'))body=[{data:FIXTURE,version:1,updated_at:'2026-09-15T20:00:00Z'}];
    else if(path.includes('/rest/v1/rpc/get_control_center'))body={summary:{projects_total:0,projects_execution:0,projects_finalized:0,projects_pre_execution:0,portfolio_amount:0,execution_amount:0,execution_estimated:0,execution_paid:0,paid_total:0,execution_progress_pct:0,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}};
    else if(path.includes('/rest/v1/rpc/save_app_state'))body=[{saved:true,new_version:2}];
    else if(path.includes('/rest/v1/access_requests'))body=[];
    else if(path.includes('/auth/v1/logout'))body={};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}
async function boot(page){
  await installSession(page);await mockBackend(page);
  await page.goto(APP_URL,{waitUntil:'domcontentloaded',timeout:30000});
  await expect(page.locator('#ccSidebar')).toBeVisible({timeout:15000});
}
const centerClasses={
  contratos:'cc-contracts-center-active',pagos:'cc-payments-center-active',garantias:'cc-guarantees-center-active',
  visitas:'cc-visits-center-active',reportes:'cc-reports-center-active',alertas:'cc-alerts-center-active',auditoria:'cc-audit-center-active'
};
async function openRoute(page,route){
  const btn=page.locator('#ccSidebar [data-route="'+route+'"]');
  await expect(btn).toHaveCount(1);
  await btn.click();
  if(centerClasses[route])await expect(page.locator('body')).toHaveClass(new RegExp(centerClasses[route]),{timeout:7000});
  await expect(btn).toHaveClass(/active/,{timeout:7000});
}
async function activeCenterCount(page){
  return page.evaluate(classes=>classes.filter(c=>document.body.classList.contains(c)).length,Object.values(centerClasses));
}

test.describe('navegación real entre centros',()=>{
  test.use({viewport:{width:1366,height:768}});

  test('cada ruta cierra la anterior y Transparencia no contamina otros centros',async({page})=>{
    test.setTimeout(60000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await boot(page);

    for(const route of ['contratos','pagos','garantias','visitas','reportes','alertas','auditoria']){
      await openRoute(page,route);
      expect(await activeCenterCount(page)).toBe(1);
    }

    await page.locator('#ccSidebar [data-route="transparencia"]').click();
    await expect(page.locator('body')).toHaveClass(/cc-transparency-active/,{timeout:7000});
    await openRoute(page,'contratos');
    await expect(page.locator('body')).not.toHaveClass(/cc-transparency-active/);
    expect(await activeCenterCount(page)).toBe(1);

    await page.locator('#ccSidebar [data-route="inicio"]').click();
    await expect(page.locator('body')).not.toHaveClass(/cc-contracts-center-active/);
    expect(await activeCenterCount(page)).toBe(0);
    await expect(page.locator('#ccSidebar [data-route="inicio"]')).toHaveClass(/active/);
    expect(errors).toEqual([]);
  });

  test('los buscadores no pierden el foco mientras se escribe',async({page})=>{
    test.setTimeout(45000);
    await boot(page);

    await openRoute(page,'alertas');
    const alerts=page.locator('#ccaSearch');await alerts.fill('tanque');await page.waitForTimeout(350);
    await expect(alerts).toHaveValue('tanque');await expect(alerts).toBeFocused();

    await openRoute(page,'auditoria');
    const audit=page.locator('#ccauSearch');await audit.fill('proyecto');await page.waitForTimeout(350);
    await expect(page.locator('#ccauSearch')).toHaveValue('proyecto');await expect(page.locator('#ccauSearch')).toBeFocused();

    await page.locator('#ccSidebar [data-route="transparencia"]').click();
    const tr=page.locator('#trCategorySearch');await expect(tr).toBeVisible({timeout:7000});
    await tr.fill('garant');await page.waitForTimeout(200);
    await expect(tr).toHaveValue('garant');await expect(tr).toBeFocused();
    await expect(page.locator('.tr-option:visible')).toContainText('Garantías');
  });

  test('en móvil un centro nunca deja al usuario sin botón de menú',async({page})=>{
    test.setTimeout(45000);
    await boot(page);
    await page.setViewportSize({width:390,height:844});

    const toggle=page.locator('#ccMobileToggle');
    await expect(toggle).toBeVisible({timeout:5000});
    await toggle.click();
    await expect(page.locator('#ccSidebar')).toHaveClass(/open/);

    await page.locator('#ccSidebar [data-route="contratos"]').click();
    await expect(page.locator('body')).toHaveClass(/cc-contracts-center-active/);
    await expect(page.locator('#ccMobileToggle')).toBeVisible();
    await page.locator('#ccMobileToggle').click();
    await expect(page.locator('#ccSidebar')).toHaveClass(/open/);

    await page.locator('#ccSidebar [data-route="auditoria"]').click();
    await expect(page.locator('body')).toHaveClass(/cc-audit-center-active/);
    await expect(page.locator('#ccMobileToggle')).toBeVisible();
  });
});
