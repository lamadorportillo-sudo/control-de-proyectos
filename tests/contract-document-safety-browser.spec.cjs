const {test,expect}=require('@playwright/test');

const appUrl=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='d1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='d2222222-2222-4222-8222-222222222222';
const PROJECT_ID='d3333333-3333-4333-8333-333333333333';
const CONTRACT_ID='d4444444-4444-4444-8444-444444444444';

const fixture={
  users:[],
  projects:[{id:PROJECT_ID,code:'QA-DOC-001',name:'Proyecto documental QA',description:'Prueba de seguridad documental.',location:'Barrio El Centro, Santa María',type:'Obra',budget:1000000,status:'En ejecución',start:'2026-01-01',end:'2026-04-10',executionDays:100,deletedAt:null}],
  contracts:[{id:CONTRACT_ID,projectId:PROJECT_ID,number:'QA-DOC-CON',contractor:'Contratista QA',originalAmount:1000000,currentAmount:1000000,signature:'2025-12-20',start:'2026-01-01',end:'2026-04-10',executionDays:100,status:'Vigente',advanceStatus:'Pagado',advanceApproved:150000,advancePaid:150000,recoveryTarget:null,controls:{},documentProfile:{}}],
  estimates:[],guarantees:[],changes:[],payments:[],visits:[],offers:[],procurements:[],audit:[],durationLearning:[],contractors:[],reports:[],alerts:[]
};

async function mockBackend(page){
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const path=new URL(route.request().url()).pathname;let body=[];
    if(path.includes('/functions/v1/secure-login'))body={user:{id:USER_ID,email:'qa-doc@example.com'},access_token:'qa-doc-access',refresh_token:'qa-doc-refresh',expires_in:3600,security_session_id:'qa-doc-session',device_label:'Chromium documental',mfa_required:false,mfa_enrollment_required:false};
    else if(path.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
    else if(path.includes('/rest/v1/profiles'))body=[{full_name:'QA Documentos',active:true,must_change_password:false}];
    else if(path.includes('/rest/v1/app_state'))body=[{data:fixture,version:1,updated_at:'2026-09-04T05:00:00Z'}];
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
  await page.locator('#authEmail').fill('qa-doc@example.com');
  await page.locator('#authPass').fill('Documento-Seguro-2026!');
  await page.locator('#authSubmit').click();
  await page.waitForFunction(()=>window.__CC_AUTH_MODULES_READY__===true||window.__CC_AUTH_BOOT_FAILED__===true,null,{timeout:30000});
  const boot=await page.evaluate(()=>({ready:window.__CC_AUTH_MODULES_READY__===true,failed:window.__CC_AUTH_BOOT_FAILED__===true,errors:window.__CC_AUTH_MODULE_ERRORS__||[]}));
  expect(boot.failed,JSON.stringify(boot.errors)).toBe(false);
  expect(boot.ready,JSON.stringify(boot.errors)).toBe(true);
}

test.describe('blindaje de documentos contractuales',()=>{
  test.use({viewport:{width:1280,height:800}});

  test('bloquea una plantilla incompatible antes de ejecutar el botón',async({page})=>{
    test.setTimeout(90000);
    const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
    await login(page);
    const state=await page.evaluate(projectId=>{
      view.screen='project';view.projectId=projectId;
      const p=db.projects.find(x=>x.id===projectId),c=db.contracts.find(x=>x.projectId===projectId);
      const issues=window.__ccContractDocumentSafety.validate('contract',p,c);
      const button=document.createElement('button');button.type='button';button.dataset.ccDocContract='1';button.id='qaUnsafeContractButton';let downstream=false;button.addEventListener('click',()=>{downstream=true});document.body.appendChild(button);button.click();
      return{loaded:window.__CC_CONTRACT_DOCUMENT_SAFETY_V2__===true,issues,downstream};
    },PROJECT_ID);
    expect(state.loaded).toBe(true);
    expect(state.issues.length).toBeGreaterThan(5);
    expect(state.issues.some(x=>/80%/.test(x))).toBeTruthy();
    expect(state.downstream).toBe(false);
    await expect(page.locator('.toast').last()).toContainText(/Documento bloqueado por control contractual/i);
    expect(pageErrors,`Errores JavaScript: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('permite continuar solo cuando el expediente confirma la plantilla vigente',async({page})=>{
    test.setTimeout(90000);
    await login(page);
    const state=await page.evaluate(projectId=>{
      view.screen='project';view.projectId=projectId;
      const p=db.projects.find(x=>x.id===projectId),c=db.contracts.find(x=>x.projectId===projectId);
      c.advanceRequestedPct=15;c.recoveryTarget=80;c.executionDays=90;
      c.documentProfile={mayorName:'Alcalde QA',mayorDni:'0000-0000-00000',contractorGender:'Masculino',contractorDni:'1111-1111-11111',contractorProfession:'Ingeniero Civil',contractorCivilStatus:'casado',contractorNationality:'hondureña',contractorAddress:'Santa María, La Paz',treasuryRecipient:'Tesorero QA',treasuryDepartment:'Tesorería Municipal',supervisorName:'Supervisor QA',supervisorUnit:'Unidad de Proyectos',projectDepartment:'La Paz',projectMunicipality:'Santa María',projectVillage:'Barrio El Centro',officialStartDate:'2026-01-16'};
      c.controls={financingSource:'Fondos Municipales',penaltyDailyPct:0.18,performanceGuaranteePct:15,performanceExtraMonths:3,advanceGuaranteePct:100,qualityGuaranteePct:5,qualityGuaranteeDays:365,changeOrderLimitPct:10,accumulatedChangeLimitPct:25,rescissionCureDays:10,successionClauseEnabled:true,successionSuspensionDays:30,emergencyClauseEnabled:true,emergencyNoticeDays:5,emergencyReviewDays:10,priceType:'Fijo',priceAdjustmentAllowed:false,taxApplies:true,taxRatePct:15,taxBase:'Retención del 15% sobre la utilidad conforme cláusula contractual.',orderStartMode:'Después del pago/entrega del anticipo',orderStartAfterAdvanceDays:15,governingLaw:'Ley de Contratación del Estado y su Reglamento, según corresponda.',disputeJurisdiction:'Juzgado de Letras de lo Contencioso Administrativo de Tegucigalpa, Francisco Morazán.'};
      const issues=window.__ccContractDocumentSafety.validate('contract',p,c);
      const button=document.createElement('button');button.type='button';button.dataset.ccDocContract='1';let downstream=false;button.addEventListener('click',()=>{downstream=true});document.body.appendChild(button);button.click();
      return{issues,downstream};
    },PROJECT_ID);
    expect(state.issues).toEqual([]);
    expect(state.downstream).toBe(true);
  });
});
