const { test, expect } = require('@playwright/test');

const appUrl=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='a1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='a2222222-2222-4222-8222-222222222222';
const PROJECT_ID='a3333333-3333-4333-8333-333333333333';
const CONTRACT_ID='a4444444-4444-4444-8444-444444444444';
const fixture={
  users:[],
  projects:[{id:PROJECT_ID,code:'QA-RECORRIDO-001',name:'Proyecto de prueba recorrido completo',description:'Proyecto sintético para probar el flujo real de usuario desde cero.',location:'Santa María, La Paz',type:'Obra',projectType:'Obra',budget:2307639.52,status:'En ejecución',start:'2026-08-05',end:'2026-11-02',executionDays:90,physicalProgress:35,financialProgress:10.83,deletedAt:null,procurement:{offers:[]}}],
  contracts:[{id:CONTRACT_ID,projectId:PROJECT_ID,number:'QA-CON-001',contractor:'Contratista de prueba',originalAmount:2307639.52,currentAmount:2307639.52,signature:'2026-08-05',start:'2026-08-05',end:'2026-11-02',executionDays:90,status:'Vigente',advanceStatus:'Pagado',advanceApproved:346145.93,advancePaid:346145.93,recoveryTarget:80}],
  estimates:[{id:'a5555555-5555-4555-8555-555555555555',projectId:PROJECT_ID,contractId:CONTRACT_ID,number:1,start:'2026-08-05',end:'2026-08-19',gross:250000,advanceApplied:46875,qualityApplied:12500,isrApplied:0,totalDeductions:59375,net:190625,status:'Pagada',paymentDate:'2026-08-20'}],
  guarantees:[{id:'a6666666-6666-4666-8666-666666666666',projectId:PROJECT_ID,contractId:CONTRACT_ID,type:'Cumplimiento',number:'QA-GAR-001',issuer:'Entidad de prueba',base:2307639.52,percentage:15,applied:346145.93,start:'2026-08-05',end:'2026-12-02'}],
  changes:[{id:'a7777777-7777-4777-8777-777777777777',projectId:PROJECT_ID,contractId:CONTRACT_ID,number:1,type:'Orden de cambio',date:'2026-08-18',amountDelta:10000,daysDelta:2,status:'Borrador'}],
  payments:[],
  visits:[{id:'a8888888-8888-4888-8888-888888888888',projectId:PROJECT_ID,contractId:CONTRACT_ID,number:1,date:'2026-08-21',type:'Supervisión',status:'Abierta',physical:35,activities:'Revisión de terracería y control geométrico.',generalObservations:'Registro sintético del recorrido.',observations:[]}],
  audit:[],durationLearning:[]
};

function controlCenter(){return {summary:{projects_total:1,projects_execution:1,projects_finalized:0,projects_pre_execution:0,portfolio_amount:2307639.52,execution_amount:2307639.52,execution_estimated:250000,execution_paid:190625,paid_total:190625,execution_progress_pct:10.83,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[{project_id:PROJECT_ID,code:'QA-RECORRIDO-001',name:'Proyecto de prueba recorrido completo',status:'En ejecución',current_amount:2307639.52,estimated_total:250000,paid_total:190625,financial_progress_pct:10.83}],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}}}

async function mockBackend(page){
 await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname;let body=[];
  if(path.includes('/functions/v1/secure-login'))body={user:{id:USER_ID,email:'qa-recorrido@example.com'},access_token:'qa-recorrido-access',refresh_token:'qa-recorrido-refresh',expires_in:3600,security_session_id:'qa-sec-session',device_label:'Chrome QA',mfa_required:false,mfa_enrollment_required:false};
  else if(path.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'consulta',active:true}];
  else if(path.includes('/rest/v1/profiles'))body=[{full_name:'Usuario QA Recorrido',active:true,must_change_password:false}];
  else if(path.includes('/rest/v1/app_state'))body=[{data:fixture,version:1,updated_at:'2026-09-03T20:00:00Z'}];
  else if(path.includes('/rest/v1/rpc/get_control_center'))body=controlCenter();
  else if(path.includes('/rest/v1/rpc/save_app_state'))body=[{saved:true,new_version:2}];
  else if(path.includes('/auth/v1/logout'))body={};
  else if(path.includes('/rest/v1/access_requests'))body=[];
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
}

/* TEMPORAL DE DIAGNÓSTICO: si un MutationObserver supera una frecuencia que no
   corresponde a interacción humana, lo desconecta y conserva la pila exacta de
   creación. Esto permite identificar el módulo que secuestra el hilo principal
   sin recurrir a click({force:true}) ni esconder el fallo. Se eliminará al
   terminar la corrección. */
async function installObserverRunawayDiagnostic(page){
 await page.addInitScript(()=>{
  const Native=window.MutationObserver;if(typeof Native!=='function')return;
  let seq=0;window.__QA_OBSERVER_RUNAWAY__=null;window.__QA_OBSERVER_STATS__=[];
  window.MutationObserver=class DiagnosticMutationObserver extends Native{
   constructor(callback){
    const id=++seq,stack=String(new Error(`MutationObserver QA ${id}`).stack||'').slice(0,5000);
    const stat={id,stack,total:0,windowCalls:0,windowStart:performance.now(),disconnected:false};
    window.__QA_OBSERVER_STATS__.push(stat);
    super((mutations,observer)=>{
      const now=performance.now();
      if(now-stat.windowStart>500){stat.windowStart=now;stat.windowCalls=0}
      stat.windowCalls++;stat.total++;
      if(!stat.disconnected&&stat.windowCalls>80){
        stat.disconnected=true;
        window.__QA_OBSERVER_RUNAWAY__={id:stat.id,total:stat.total,windowCalls:stat.windowCalls,stack:stat.stack};
        console.error('QA_OBSERVER_RUNAWAY '+JSON.stringify(window.__QA_OBSERVER_RUNAWAY__));
        observer.disconnect();return;
      }
      callback(mutations,observer);
    });
   }
  };
 });
}

async function noOverflow(page,label){
 const d=await page.evaluate(()=>({w:document.documentElement.scrollWidth,c:document.documentElement.clientWidth,body:document.body.scrollWidth}));
 expect(d.w,`${label}: overflow documento`).toBeLessThanOrEqual(d.c+3);
 expect(d.body,`${label}: overflow body`).toBeLessThanOrEqual(d.c+3);
}
async function assertSinglePrimaryNavigation(page){
 await expect(page.locator('#ccSidebar')).toBeVisible();
 await expect(page.locator('#ccSidebar [data-route="transparencia"]')).toHaveCount(1);
 await expect(page.locator('#ccxNav')).toBeHidden();
 await expect(page.locator('[data-cp-main-tabs]')).toBeHidden();
 const legacyVisible=await page.locator('[data-tr-nav],[data-tr-exec]').evaluateAll(xs=>xs.filter(x=>{
   const s=getComputedStyle(x),r=x.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
 }).length);
 expect(legacyVisible,'No debe existir un segundo botón visible de Transparencia en navegación heredada').toBe(0);
}

for(const vp of [{name:'desktop',width:1366,height:768},{name:'tablet',width:1024,height:768}]){
 test.describe(`recorrido completo ${vp.name}`,()=>{
  test.use({viewport:{width:vp.width,height:vp.height}});
  test('entra desde cero, abre un proyecto y recorre el expediente',async({page},testInfo)=>{
   test.setTimeout(90000);
   const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
   page.on('console',msg=>{if(msg.text().startsWith('QA_OBSERVER_RUNAWAY'))console.log(msg.text())});
   await installObserverRunawayDiagnostic(page);
   await mockBackend(page);
   await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:30000});

   // 1. Inicio absolutamente desde cero: no hay sesión preinyectada.
   await expect(page.locator('#authForm')).toBeVisible({timeout:10000});
   await expect(page.locator('#ccSidebar')).toHaveCount(0);
   await page.locator('#authEmail').fill('qa-recorrido@example.com');
   await page.locator('#authPass').fill('Prueba-Segura-2026!');
   await page.locator('#authSubmit').click();

   // 2. Acceso autenticado y navegación única.
   await expect(page.locator('#ccSidebar')).toBeVisible({timeout:15000});
   await expect(page.locator('#content')).toBeVisible();
   await expect(page.locator('#ccSidebar [data-route="inicio"]')).toBeVisible();
   await expect(page.locator('#ccSidebar [data-route="proyectos"]')).toBeVisible();
   await assertSinglePrimaryNavigation(page);
   await noOverflow(page,`${vp.name} inicio`);

   // 3. Inicio y Proyectos deben ser rutas diferentes aunque compartan el mismo motor interno.
   await page.locator('#ccSidebar [data-route="proyectos"]').click();
   await expect(page.locator('#content')).toContainText('Proyectos',{timeout:8000});
   await expect(page.locator('#ccSidebar [data-route="proyectos"]')).toHaveClass(/active/);
   await noOverflow(page,`${vp.name} proyectos`);

   // 4. Búsqueda como la haría el usuario y apertura del expediente.
   const search=page.locator('#ccGlobalSearch');await expect(search).toBeVisible();
   await search.fill('QA-RECORRIDO-001');await search.press('Enter');
   await expect(page.locator('#content')).toContainText('QA-RECORRIDO-001',{timeout:8000});
   const open=page.locator(`[data-open="${PROJECT_ID}"], [data-ccx-open="${PROJECT_ID}"]`).first();
   await expect(open).toBeVisible();await open.click();
   await expect(page.locator('#tabBody')).toBeVisible({timeout:12000});
   await expect(page.locator('#content')).toContainText('Proyecto de prueba recorrido completo');
   await noOverflow(page,`${vp.name} expediente`);

   // 5. El contrato debe abrir desde la pestaña real del expediente y mostrar
   //    los datos del contrato ligado al proyecto, no una tarjeta vacía o ajena.
   const contractTab=page.locator('nav.tabs button[data-tab], .tabs button[data-tab]').filter({hasText:/Contrato/i}).first();
   await expect(contractTab,'No aparece la pestaña Contrato en el expediente').toBeVisible();
   await contractTab.click();
   await expect(page.locator('#tabBody')).toContainText('QA-CON-001',{timeout:8000});
   await expect(page.locator('#tabBody')).toContainText('Contratista de prueba');
   await expect(page.locator('#tabBody')).toContainText(/Vigente/i);
   const observerRunaway=await page.evaluate(()=>window.__QA_OBSERVER_RUNAWAY__||null);
   if(observerRunaway)console.log('QA_OBSERVER_DIAGNOSTIC '+JSON.stringify(observerRunaway));
   expect(observerRunaway,'Se detectó un MutationObserver en bucle; revisar la pila registrada en QA_OBSERVER_DIAGNOSTIC').toBeNull();
   await noOverflow(page,`${vp.name} contrato`);

   // 6. Recorrer cada pestaña real del expediente y comprobar que no queda vacía.
   const tabs=page.locator('nav.tabs button[data-tab], .tabs button[data-tab]');
   const count=await tabs.count();expect(count,'El expediente debe conservar sus módulos').toBeGreaterThanOrEqual(9);
   for(let i=0;i<count;i++){
    const t=tabs.nth(i);if(!(await t.isVisible()))continue;
    const label=((await t.textContent())||`tab-${i}`).replace(/\s+/g,' ').trim();
    await t.click();await page.waitForTimeout(120);
    await expect(page.locator('#tabBody')).toBeVisible();
    const len=await page.locator('#tabBody').evaluate(el=>(el.innerText||'').trim().length);
    expect(len,`Pestaña ${label} vacía`).toBeGreaterThan(10);
    await noOverflow(page,`${vp.name} ${label}`);
   }

   // 7. Volver al portafolio y luego a Inicio sin depender de la barra ejecutiva antigua.
   await page.locator('#ccSidebar [data-route="proyectos"]').click();
   await expect(page.locator('#content')).toContainText('Proyectos',{timeout:8000});
   await page.locator('#ccSidebar [data-route="inicio"]').click();
   await expect(page.locator('#content')).toContainText(/Estado general del portafolio|Centro de Control/i,{timeout:8000});
   await expect(page.locator('#ccSidebar [data-route="inicio"]')).toHaveClass(/active/);

   // 8. Transparencia debe abrir desde el sidebar sin reactivar la navegación heredada.
   await page.locator('#ccSidebar [data-route="transparencia"]').click();
   await expect(page.locator('#content')).toContainText(/Portal de Transparencia|Control mensual de formatos/i,{timeout:8000});
   await assertSinglePrimaryNavigation(page);
   await noOverflow(page,`${vp.name} transparencia`);

   expect(pageErrors,`Errores JavaScript: ${pageErrors.join(' | ')}`).toEqual([]);
   await page.screenshot({path:testInfo.outputPath(`${vp.name}-recorrido-final.png`),fullPage:true});
  });
 });
}