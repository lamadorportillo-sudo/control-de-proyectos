const {test,expect}=require('@playwright/test');

const APP_URL=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='d1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='d2222222-2222-4222-8222-222222222222';
const CODE='QA-ALTA-DIRECTA-001';
const EMPTY={users:[],projects:[],contracts:[],estimates:[],guarantees:[],changes:[],payments:[],visits:[],audit:[],durationLearning:[]};

async function mockBackend(page){
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const path=new URL(route.request().url()).pathname;let body=[];
    if(path.includes('/functions/v1/secure-login'))body={user:{id:USER_ID,email:'qa-alta@example.com'},access_token:'qa-alta-access',refresh_token:'qa-alta-refresh',expires_in:3600,security_session_id:'qa-alta-session',device_label:'Chrome QA',mfa_required:false,mfa_enrollment_required:false};
    else if(path.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
    else if(path.includes('/rest/v1/profiles'))body=[{full_name:'Ing. QA Alta',active:true,must_change_password:false}];
    else if(path.includes('/rest/v1/app_state'))body=[{data:EMPTY,version:1,updated_at:'2026-09-03T20:00:00Z'}];
    else if(path.includes('/rest/v1/rpc/get_control_center'))body={summary:{projects_total:0,projects_execution:0,projects_finalized:0,projects_pre_execution:0,portfolio_amount:0,execution_amount:0,execution_estimated:0,execution_paid:0,paid_total:0,execution_progress_pct:0,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}};
    else if(path.includes('/rest/v1/rpc/save_app_state'))body=[{saved:true,new_version:2}];
    else if(path.includes('/rest/v1/access_requests'))body=[];
    else if(path.includes('/auth/v1/logout'))body={};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

test.use({viewport:{width:1366,height:768}});

test('crear proyecto abre el expediente y la navegación no usa dashboard heredado',async({page})=>{
  test.setTimeout(60000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await mockBackend(page);
  await page.goto(APP_URL,{waitUntil:'domcontentloaded',timeout:30000});
  await expect(page.locator('#authForm')).toBeVisible();
  await page.locator('#authEmail').fill('qa-alta@example.com');
  await page.locator('#authPass').fill('Prueba-Segura-2026!');
  await page.locator('#authSubmit').click();
  await expect(page.locator('#ccSidebar')).toBeVisible({timeout:15000});

  await expect(page.locator('#ccxNav')).toBeHidden();
  await expect(page.locator('.hero-control-contractual')).toHaveCount(0);

  await page.locator('[data-command="project"],#newProjectBtn').first().click();
  await expect(page.locator('#projectForm')).toBeVisible();
  await page.locator('#pCode').fill(CODE);
  await page.locator('#pName').fill('Proyecto QA de alta directa');
  await page.locator('#pLocation').fill('Santa María, La Paz');
  await page.locator('#pBudget').fill('500000');
  await page.locator('#pStart').fill('2026-09-03');
  await page.locator('#pDays').fill('60');
  await page.locator('#pStatus').selectOption({label:'Proceso de contratación'});
  await page.locator('#pDescription').fill('Proyecto sintético para comprobar alta, apertura inmediata y rutas del sidebar.');
  await page.locator('#projectForm button.btn.primary').click();

  await expect(page.locator('#tabBody')).toBeVisible({timeout:12000});
  await expect(page.locator('#content')).toContainText(CODE);
  await expect(page.locator('#ccSidebar [data-route="proyectos"]')).toHaveClass(/active/);

  await page.locator('#ccSidebar [data-route="inicio"]').click();
  await expect(page.locator('#ccSidebar [data-route="inicio"]')).toHaveClass(/active/);
  await expect(page.locator('#content')).toContainText(/Centro de Control|Estado general del portafolio/i,{timeout:8000});

  await page.locator('#ccSidebar [data-route="proyectos"]').click();
  await expect(page.locator('#ccSidebar [data-route="proyectos"]')).toHaveClass(/active/);
  await expect(page.locator('#content')).toContainText(CODE,{timeout:8000});
  await expect(page.locator('.hero-control-contractual')).toHaveCount(0);
  expect(errors).toEqual([]);
});
