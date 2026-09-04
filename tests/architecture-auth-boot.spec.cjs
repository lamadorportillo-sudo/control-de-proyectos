const {test,expect}=require('@playwright/test');

const appUrl=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='b1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='b2222222-2222-4222-8222-222222222222';

const emptyState={
  users:[],projects:[],contracts:[],estimates:[],guarantees:[],changes:[],payments:[],visits:[],
  offers:[],procurements:[],audit:[],durationLearning:[],contractors:[],reports:[],alerts:[]
};

async function mockBackend(page){
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const request=route.request();
    const url=new URL(request.url());
    const path=url.pathname;
    let body=[];
    if(path.includes('/functions/v1/secure-login')){
      body={user:{id:USER_ID,email:'qa-arquitectura@example.com'},access_token:'qa-architecture-access',refresh_token:'qa-architecture-refresh',expires_in:3600,security_session_id:'qa-architecture-session',device_label:'Chromium arquitectura',mfa_required:false,mfa_enrollment_required:false};
    }else if(path.includes('/rest/v1/workspace_members')){
      body=[{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
    }else if(path.includes('/rest/v1/profiles')){
      body=[{full_name:'QA Arquitectura',active:true,must_change_password:false}];
    }else if(path.includes('/rest/v1/app_state')){
      body=[{data:emptyState,version:1,updated_at:'2026-09-04T03:00:00Z'}];
    }else if(path.includes('/rest/v1/rpc/get_control_center')){
      body={summary:{projects_total:0,projects_execution:0,projects_finalized:0,projects_pre_execution:0,portfolio_amount:0,execution_amount:0,execution_estimated:0,execution_paid:0,paid_total:0,execution_progress_pct:0,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}};
    }else if(path.includes('/rest/v1/rpc/save_app_state')){
      body=[{saved:true,new_version:2}];
    }else if(path.includes('/auth/v1/logout')){
      body={};
    }
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

test.describe('integridad arquitectónica del arranque autenticado',()=>{
  test.use({viewport:{width:1280,height:800}});

  test('login seguro recarga el contexto y activa una sola arquitectura autenticada',async({page})=>{
    test.setTimeout(60000);
    const pageErrors=[];
    const consoleErrors=[];
    let topNavigations=0;
    page.on('pageerror',error=>pageErrors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});
    page.on('framenavigated',frame=>{if(frame===page.mainFrame())topNavigations++});

    await mockBackend(page);
    await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:30000});

    await expect(page.locator('#authForm')).toBeVisible({timeout:10000});
    await expect(page.locator('#ccSidebar')).toHaveCount(0);
    await page.locator('#authEmail').fill('qa-arquitectura@example.com');
    await page.locator('#authPass').fill('Arquitectura-Segura-2026!');
    await page.locator('#authSubmit').click();

    // El login seguro debe hacer una navegación real para que el plan autenticado
    // se evalúe desde cero con la sesión ya guardada.
    await expect.poll(()=>topNavigations,{timeout:15000,message:'El login no recargó el contexto autenticado'}).toBeGreaterThanOrEqual(2);

    await expect(page.locator('#ccSidebar')).toBeVisible({timeout:15000});
    await expect(page.locator('#content')).toBeVisible();
    await page.waitForFunction(()=>window.__CC_AUTH_CRITICAL_READY__===true||window.__CC_AUTH_BOOT_FAILED__===true,null,{timeout:15000});

    const critical=await page.evaluate(()=>({
      loader:window.__CC_AUTH_MODULE_LOADER__===true,
      staged:window.__CC_STAGED_AUTH_BOOT__===true,
      critical:window.__CC_AUTH_CRITICAL_READY__===true,
      failed:window.__CC_AUTH_BOOT_FAILED__===true,
      errors:Array.isArray(window.__CC_AUTH_MODULE_ERRORS__)?window.__CC_AUTH_MODULE_ERRORS__:[]
    }));
    expect(critical.loader,'Debe existir un único cargador autenticado').toBe(true);
    expect(critical.staged,'El arranque autenticado debe ser escalonado').toBe(true);
    expect(critical.critical,'Portal, pestañas y navegación deben completar la fase crítica').toBe(true);
    expect(critical.failed,`Fallo crítico: ${JSON.stringify(critical.errors)}`).toBe(false);

    // Un clic de Proyectos debe dejar una sola ruta principal activa. Esto
    // detecta que portal-web o ui-stability vuelvan a competir como routers.
    await page.locator('#ccSidebar [data-route="proyectos"]').click();
    await expect(page.locator('#ccSidebar [data-route="proyectos"]')).toHaveClass(/active/,{timeout:8000});
    const activeRoutes=await page.locator('#ccSidebar .cc-side-btn.active').evaluateAll(nodes=>nodes.map(node=>node.dataset.route));
    expect(activeRoutes.filter(route=>route==='proyectos').length).toBe(1);
    expect(activeRoutes.includes('inicio'),'Inicio y Proyectos no deben quedar activos a la vez').toBe(false);

    // Espera un poco más para descubrir conflictos de versión generados por la
    // carga histórica. No exige que todos los módulos opcionales hayan terminado.
    await page.waitForTimeout(1500);
    const versionConflicts=consoleErrors.filter(text=>/Conflicto de versión/i.test(text));
    expect(versionConflicts,`Conflictos de versión: ${versionConflicts.join(' | ')}`).toEqual([]);
    expect(pageErrors,`Errores JavaScript: ${pageErrors.join(' | ')}`).toEqual([]);
  });
});
