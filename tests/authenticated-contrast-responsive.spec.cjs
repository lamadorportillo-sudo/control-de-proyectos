const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const appUrl=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='91111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='92222222-2222-4222-8222-222222222222';
const PROJECT_ID='93333333-3333-4333-8333-333333333333';
const CONTRACT_ID='94444444-4444-4444-8444-444444444444';
const fixture={
  users:[],
  projects:[{id:PROJECT_ID,code:'QA-CONTRASTE-001',name:'Proyecto QA contraste',description:'Expediente sintético de auditoría visual.',location:'Santa María, La Paz',type:'Obra',projectType:'Obra',budget:2307639.52,status:'En ejecución',start:'2026-08-05',end:'2026-11-02',executionDays:90,physicalProgress:35,financialProgress:10.83,deletedAt:null,procurement:{offers:[]}}],
  contracts:[{id:CONTRACT_ID,projectId:PROJECT_ID,number:'QA-CONTRASTE-CON',contractor:'Contratista QA',originalAmount:2307639.52,currentAmount:2307639.52,signatureDate:'2026-08-05',start:'2026-08-05',end:'2026-11-02',executionDays:90,status:'Vigente',advanceStatus:'Pagado',advanceApproved:346145.93,advancePaid:346145.93,recoveryTarget:80}],
  estimates:[{id:'95555555-5555-4555-8555-555555555555',projectId:PROJECT_ID,contractId:CONTRACT_ID,number:1,start:'2026-08-05',end:'2026-08-19',gross:250000,advanceApplied:46875,qualityApplied:12500,isrApplied:0,totalDeductions:59375,net:190625,status:'Pagada',paymentDate:'2026-08-20'}],
  guarantees:[{id:'96666666-6666-4666-8666-666666666666',projectId:PROJECT_ID,contractId:CONTRACT_ID,type:'Cumplimiento',number:'QA-GAR-001',issuer:'Entidad QA',base:2307639.52,percentage:15,applied:346145.93,start:'2026-08-05',end:'2026-12-02'}],
  changes:[],payments:[],
  visits:[{id:'98888888-8888-4888-8888-888888888888',projectId:PROJECT_ID,contractId:CONTRACT_ID,number:1,date:'2026-08-21',type:'Supervisión',status:'Abierta',physical:35,activities:'Revisión de terracería.',generalObservations:'Registro QA.',observations:[]}],
  audit:[],durationLearning:[]
};

async function install(page){
  await page.addInitScript(({userId,fixture})=>{
    Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});
    localStorage.setItem('control_contractual_session_v3',JSON.stringify({userId,email:'qa-contraste@example.com',accessToken:'qa-access-token',refreshToken:'qa-refresh-token',expiresAt:Date.now()+3600000}));
    localStorage.setItem('control_contractual_independiente_v3',JSON.stringify(fixture));
    localStorage.setItem('cc_exec_section_v2','home');
  },{userId:USER_ID,fixture});
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const path=new URL(route.request().url()).pathname;let body=[];
    if(path.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'consulta',active:true}];
    else if(path.includes('/rest/v1/profiles'))body=[{full_name:'QA Contraste',active:true}];
    else if(path.includes('/rest/v1/app_state'))body=[{data:fixture,version:1,updated_at:'2026-08-31T00:00:00Z'}];
    else if(path.includes('/auth/v1/logout'))body={};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

async function assertContrast(page,label,include='#content'){
  const axe=new AxeBuilder({page}).withRules(['color-contrast']);
  if(include)axe.include(include);
  const result=await axe.analyze();
  const bad=result.violations.filter(v=>v.id==='color-contrast'&&['serious','critical'].includes(v.impact)).map(v=>({impact:v.impact,targets:v.nodes.slice(0,12).flatMap(n=>n.target)}));
  expect(bad,`${label}: contraste insuficiente`).toEqual([]);
}

for(const vp of [{name:'mobile',width:390,height:844,touch:true},{name:'desktop',width:1366,height:768,touch:false}]){
  test.describe(`contraste autenticado ${vp.name}`,()=>{
    test.use({viewport:{width:vp.width,height:vp.height},hasTouch:vp.touch});
    test('revisa navegación principal y expediente completo',async({page})=>{
      await install(page);
      await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForSelector('#ccxNav',{timeout:20000});
      await page.waitForTimeout(1200);
      for(const section of ['home','projects','budget','alerts','audit','reports']){
        const btn=page.locator(`#ccxNav [data-ccx="${section}"]`);
        await expect(btn).toBeVisible();await btn.click();await page.waitForTimeout(420);
        await assertContrast(page,`${vp.name} sección ${section}`);
      }
      await page.locator('#ccxNav [data-ccx="projects"]').click();await page.waitForTimeout(350);
      const search=page.locator('#projectSearch');if(await search.count()){await search.fill('QA CONTRASTE');await page.waitForTimeout(300)}
      const open=page.locator(`[data-ccx-open="${PROJECT_ID}"], [data-open="${PROJECT_ID}"]`).first();
      await expect(open).toBeVisible();await open.click();await page.waitForSelector('#tabBody',{timeout:15000});await page.waitForTimeout(800);
      await assertContrast(page,`${vp.name} expediente`);
      const tabs=page.locator('nav.tabs button[data-tab], .tabs button[data-tab]');const count=await tabs.count();
      expect(count).toBeGreaterThanOrEqual(9);
      for(let i=0;i<count;i++){
        const tab=tabs.nth(i);if(!(await tab.isVisible()))continue;
        const label=((await tab.textContent())||`tab-${i}`).replace(/\s+/g,' ').trim();await tab.click();await page.waitForTimeout(300);
        await assertContrast(page,`${vp.name} pestaña ${label}`,'#tabBody');
      }
    });
  });
}
