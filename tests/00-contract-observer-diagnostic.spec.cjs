const {test,expect}=require('@playwright/test');

const appUrl=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='91111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='92222222-2222-4222-8222-222222222222';
const PROJECT_ID='93333333-3333-4333-8333-333333333333';
const CONTRACT_ID='94444444-4444-4444-8444-444444444444';
const fixture={users:[],projects:[{id:PROJECT_ID,code:'QA-CONTRASTE-001',name:'Proyecto QA contraste',description:'Expediente sintético de auditoría visual.',location:'Santa María, La Paz',type:'Obra',projectType:'Obra',budget:2307639.52,status:'En ejecución',start:'2026-08-05',end:'2026-11-02',executionDays:90,physicalProgress:35,financialProgress:10.83,deletedAt:null,procurement:{offers:[]}}],contracts:[{id:CONTRACT_ID,projectId:PROJECT_ID,number:'QA-CONTRASTE-CON',contractor:'Contratista QA',originalAmount:2307639.52,currentAmount:2307639.52,signatureDate:'2026-08-05',start:'2026-08-05',end:'2026-11-02',executionDays:90,status:'Vigente',advanceStatus:'Pagado',advanceApproved:346145.93,advancePaid:346145.93,recoveryTarget:80}],estimates:[{id:'95555555-5555-4555-8555-555555555555',projectId:PROJECT_ID,contractId:CONTRACT_ID,number:1,start:'2026-08-05',end:'2026-08-19',gross:250000,advanceApplied:46875,qualityApplied:12500,isrApplied:0,totalDeductions:59375,net:190625,status:'Pagada',paymentDate:'2026-08-20'}],guarantees:[{id:'96666666-6666-4666-8666-666666666666',projectId:PROJECT_ID,contractId:CONTRACT_ID,type:'Cumplimiento',number:'QA-GAR-001',issuer:'Entidad QA',base:2307639.52,percentage:15,applied:346145.93,start:'2026-08-05',end:'2026-12-02'}],changes:[],payments:[],visits:[{id:'98888888-8888-4888-8888-888888888888',projectId:PROJECT_ID,contractId:CONTRACT_ID,number:1,date:'2026-08-21',type:'Supervisión',status:'Abierta',physical:35,activities:'Revisión de terracería.',generalObservations:'Registro QA.',observations:[]}],audit:[],durationLearning:[]};

async function install(page){
  page.on('console',msg=>{const text=msg.text();if(text.includes('[CC-DIAG]'))console.log(text)});
  await page.addInitScript(({userId,fixture})=>{
    const NativeMO=window.MutationObserver;let nextId=0;
    window.MutationObserver=class DiagnosticMutationObserver extends NativeMO{
      constructor(callback){
        const id=++nextId,origin=(new Error('observer-origin')).stack?.split('\n').slice(2,7).join(' | ')||'sin-stack';let calls=0,total=0;
        super((mutations,observer)=>{
          calls++;total+=mutations.length;
          if(calls===1||calls===5||calls===20||calls===100||calls===500||calls%2000===0)console.log(`[CC-DIAG] MO#${id} calls=${calls} mutations=${total} origin=${origin}`);
          return callback(mutations,observer);
        });
      }
    };
    Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});
    localStorage.setItem('control_contractual_session_v3',JSON.stringify({userId,email:'qa-contraste@example.com',accessToken:'qa-access-token',refreshToken:'qa-refresh-token',expiresAt:Date.now()+3600000}));
    localStorage.setItem('control_contractual_independiente_v3',JSON.stringify(fixture));
    localStorage.setItem('cc_exec_section_v2','home');
  },{userId:USER_ID,fixture});
  let stateVersion=1;
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const path=new URL(route.request().url()).pathname;let body=[];
    if(path.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'consulta',active:true}];
    else if(path.includes('/rest/v1/profiles'))body=[{full_name:'QA Contraste',active:true}];
    else if(path.includes('/rest/v1/rpc/save_app_state')){stateVersion+=1;body=[{saved:true,new_version:stateVersion,server_data:fixture}]}
    else if(path.includes('/rest/v1/app_state'))body=[{data:fixture,version:stateVersion,updated_at:'2026-08-31T00:00:00Z'}];
    else if(path.includes('/rest/v1/rpc/get_control_center'))body={summary:{projects_total:1,projects_execution:1,projects_finalized:0,portfolio_amount:2307639.52,execution_amount:2307639.52,execution_estimated:250000,execution_paid:190625,execution_progress_pct:10.83,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_failures:0}};
    else if(path.includes('/auth/v1/logout'))body={};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

test.describe('diagnóstico temporal de Contrato',()=>{
  test.use({viewport:{width:390,height:844},hasTouch:true});
  test('identifica el observador o render que bloquea el clic',async({page})=>{
    test.setTimeout(35000);
    await install(page);
    await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>window.__CC_AUTH_MODULES_READY__===true||window.__CC_AUTH_BOOT_FAILED__===true,null,{timeout:20000});
    const boot=await page.evaluate(()=>({ready:window.__CC_AUTH_MODULES_READY__===true,failed:window.__CC_AUTH_BOOT_FAILED__===true,errors:window.__CC_AUTH_MODULE_ERRORS__||[]}));
    expect(boot.failed,JSON.stringify(boot.errors)).toBe(false);expect(boot.ready).toBe(true);
    await page.evaluate(projectId=>{
      const wrap=name=>{
        const original=window[name];if(typeof original!=='function'||original.__ccDiag)return;
        const wrapped=function(){console.log(`[CC-DIAG] ENTER ${name}`);const t=performance.now();try{return original.apply(this,arguments)}finally{console.log(`[CC-DIAG] EXIT ${name} ms=${(performance.now()-t).toFixed(1)}`)}};
        wrapped.__ccDiag=true;window[name]=wrapped;
      };
      ['renderProject','renderContract','projectFinancials','contractControlAlerts','contractControlDefaults'].forEach(wrap);
      console.log(`[CC-DIAG] renderContract flags=${Object.keys(window.renderContract||{}).join(',')} source=${String(window.renderContract).slice(0,280).replace(/\s+/g,' ')}`);
      view.screen='project';view.projectId=projectId;view.tab='procurement';renderApp();
    },PROJECT_ID);
    await page.waitForSelector('button[data-tab="contract"]',{timeout:5000});
    console.log('[CC-DIAG] clicking contract');
    await page.locator('button[data-tab="contract"]').click({timeout:12000});
    console.log('[CC-DIAG] contract click returned');
    await expect(page.locator('button[data-tab="contract"]')).toHaveClass(/active/,{timeout:3000});
  });
});
