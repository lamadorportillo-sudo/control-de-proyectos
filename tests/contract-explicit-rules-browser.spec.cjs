const {test,expect}=require('@playwright/test');

const appUrl=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='c1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='c2222222-2222-4222-8222-222222222222';
const PROJECT_ID='c3333333-3333-4333-8333-333333333333';
const CONTRACT_ID='c4444444-4444-4444-8444-444444444444';

const fixture={
  users:[],
  projects:[{id:PROJECT_ID,code:'QA-CONTRATO-001',name:'Proyecto contractual explícito',description:'Prueba de reglas sin valores fabricados.',location:'Santa María, La Paz',type:'Obra',budget:1000000,status:'En ejecución',start:'2026-01-01',end:'2026-04-10',executionDays:100,deletedAt:null}],
  contracts:[{id:CONTRACT_ID,projectId:PROJECT_ID,number:'QA-C-001',contractor:'Contratista QA',originalAmount:1000000,currentAmount:1000000,signature:'2026-01-01',start:'2026-01-01',end:'2026-04-10',executionDays:100,status:'Vigente',advanceStatus:'No solicitado',advanceRequestedPct:0,advanceApproved:0,advancePaid:0,recoveryTarget:null,controls:{},notes:''}],
  estimates:[],guarantees:[],changes:[],payments:[],visits:[],offers:[],procurements:[],audit:[],durationLearning:[],contractors:[],reports:[],alerts:[]
};

async function mockBackend(page){
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const path=new URL(route.request().url()).pathname;let body=[];
    if(path.includes('/functions/v1/secure-login'))body={user:{id:USER_ID,email:'qa-contrato@example.com'},access_token:'qa-contract-access',refresh_token:'qa-contract-refresh',expires_in:3600,security_session_id:'qa-contract-session',device_label:'Chromium contractual',mfa_required:false,mfa_enrollment_required:false};
    else if(path.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
    else if(path.includes('/rest/v1/profiles'))body=[{full_name:'QA Contrato',active:true,must_change_password:false}];
    else if(path.includes('/rest/v1/app_state'))body=[{data:fixture,version:1,updated_at:'2026-09-04T04:00:00Z'}];
    else if(path.includes('/rest/v1/rpc/get_control_center'))body={summary:{projects_total:1,projects_execution:1,projects_finalized:0,projects_pre_execution:0,portfolio_amount:1000000,execution_amount:1000000,execution_estimated:0,execution_paid:0,paid_total:0,execution_progress_pct:0,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}};
    else if(path.includes('/rest/v1/rpc/save_app_state'))body=[{saved:true,new_version:2}];
    else if(path.includes('/auth/v1/logout'))body={};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

async function login(page){
  await mockBackend(page);
  await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await expect(page.locator('#authForm')).toBeVisible({timeout:10000});
  await page.locator('#authEmail').fill('qa-contrato@example.com');
  await page.locator('#authPass').fill('Contrato-Seguro-2026!');
  await page.locator('#authSubmit').click();
  await page.waitForFunction(()=>window.__CC_AUTH_MODULES_READY__===true||window.__CC_AUTH_BOOT_FAILED__===true,null,{timeout:30000});
  const boot=await page.evaluate(()=>({ready:window.__CC_AUTH_MODULES_READY__===true,failed:window.__CC_AUTH_BOOT_FAILED__===true,errors:window.__CC_AUTH_MODULE_ERRORS__||[]}));
  expect(boot.failed,JSON.stringify(boot.errors)).toBe(false);
  expect(boot.ready,JSON.stringify(boot.errors)).toBe(true);
}

async function closeModal(page){await page.evaluate(()=>document.querySelector('.modal-bg')?.remove())}

test.describe('reglas contractuales explícitas en navegador real',()=>{
  test.use({viewport:{width:1280,height:800}});

  test('no inventa porcentajes, plazos ni límites cuando el contrato no los define',async({page})=>{
    test.setTimeout(90000);
    const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
    await login(page);

    const logic=await page.evaluate(()=>{
      const c=db.contracts.find(x=>x.id===window.__qaContractId)||db.contracts[0];
      const blank=contractControlDefaults(c.controls||{});
      const classification=changeClass(c.originalAmount,110000,c);
      return{
        explicitModule:window.__CC_CONTRACT_EXPLICIT_RULES_V1__===true,
        penalty:blank.penaltyDailyPct,performance:blank.performanceGuaranteePct,quality:blank.qualityGuaranteePct,
        qualityDays:blank.qualityGuaranteeDays,changeLimit:blank.changeOrderLimitPct,resolution:blank.contractorResolutionThresholdPct,accumulated:blank.accumulatedChangeLimitPct,
        classification
      };
    });
    expect(logic.explicitModule).toBe(true);
    expect(logic.penalty).toBeNull();
    expect(logic.performance).toBeNull();
    expect(logic.quality).toBeNull();
    expect(logic.qualityDays).toBeNull();
    expect(logic.changeLimit).toBeNull();
    expect(logic.resolution).toBeNull();
    expect(logic.accumulated).toBeNull();
    expect(logic.classification.suggested).toBe('Definir según contrato');
    expect(logic.classification.alert).toMatch(/Definir límites de modificación según contrato/);

    await page.evaluate(()=>contractControlsModal(db.projects[0],db.contracts[0]));
    await expect(page.locator('#ctrlForm')).toBeVisible();
    for(const selector of ['#ctPenaltyPct','#ctQualityRetention','#ctAdvG','#ctPerfG','#ctPerfMonths','#ctQualG','#ctQualDays','#ctChangeLimit','#ctResolutionLimit','#ctAccumLimit','#ctCureDays','#ctEmergencyNotice','#ctEmergencyReview','#ctSuccDays']){
      await expect(page.locator(selector),`${selector} debe quedar vacío si no existe cláusula explícita`).toHaveValue('');
    }
    await closeModal(page);

    await page.evaluate(()=>guaranteeModal(db.projects[0],db.contracts[0],null));
    await expect(page.locator('#gForm')).toBeVisible();
    await expect(page.locator('#gType')).toHaveValue('Cumplimiento');
    await expect(page.locator('#gPct')).toHaveValue('');
    await expect(page.locator('#gCalcWords')).toContainText(/Definir porcentaje según contrato/i);
    await closeModal(page);

    await page.evaluate(()=>changeModal(db.projects[0],db.contracts[0],null));
    await expect(page.locator('#chForm')).toBeVisible();
    await page.locator('#chAmount').fill('110000');
    await expect(page.locator('#chClass')).toHaveValue(/Definir según contrato/);
    await expect(page.locator('#chAlert')).toContainText(/Definir límites de modificación según contrato/);
    await closeModal(page);

    expect(pageErrors,`Errores JavaScript: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('respeta exactamente los valores cuando sí están guardados en el contrato',async({page})=>{
    test.setTimeout(90000);
    await login(page);
    const result=await page.evaluate(()=>{
      const c=db.contracts[0];
      c.controls={penaltyDailyPct:0.18,performanceGuaranteePct:12,performanceExtraMonths:2,qualityGuaranteePct:4,qualityGuaranteeDays:180,qualityRetentionPct:4,advanceGuaranteePct:100,changeOrderLimitPct:8,contractorResolutionThresholdPct:18,accumulatedChangeLimitPct:22};
      const explicit=contractControlDefaults(c.controls),classification=changeClass(c.originalAmount,90000,c);
      return{penalty:explicit.penaltyDailyPct,performance:explicit.performanceGuaranteePct,quality:explicit.qualityGuaranteePct,qualityDays:explicit.qualityGuaranteeDays,classification};
    });
    expect(result.penalty).toBe(0.18);
    expect(result.performance).toBe(12);
    expect(result.quality).toBe(4);
    expect(result.qualityDays).toBe(180);
    expect(result.classification.suggested).toBe('Adenda');
    expect(result.classification.alert).toMatch(/8\.00% configurado/);

    await page.evaluate(()=>guaranteeModal(db.projects[0],db.contracts[0],null));
    await expect(page.locator('#gPct')).toHaveValue('12');
    await closeModal(page);
  });
});
