const { test, expect } = require('@playwright/test');

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
  let stateVersion=1;
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const path=new URL(route.request().url()).pathname;let body=[];
    if(path.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'consulta',active:true}];
    else if(path.includes('/rest/v1/profiles'))body=[{full_name:'QA Contraste',active:true}];
    else if(path.includes('/rest/v1/rpc/save_app_state')){
      stateVersion+=1;
      body=[{saved:true,new_version:stateVersion,server_data:fixture}];
    }
    else if(path.includes('/rest/v1/app_state'))body=[{data:fixture,version:stateVersion,updated_at:'2026-08-31T00:00:00Z'}];
    else if(path.includes('/rest/v1/rpc/get_control_center'))body={summary:{projects_total:1,projects_execution:1,projects_finalized:0,portfolio_amount:2307639.52,execution_amount:2307639.52,execution_estimated:250000,execution_paid:190625,execution_progress_pct:10.83,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_failures:0}};
    else if(path.includes('/auth/v1/logout'))body={};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

async function assertContrast(page,label,include='#content'){
  const issues=await page.locator(include).evaluate(root=>{
    const clamp=v=>Math.max(0,Math.min(255,Number(v)||0));
    const parseColor=value=>{
      const nums=String(value||'').match(/[\d.]+/g)?.map(Number)||[];
      if(nums.length<3)return null;
      return{r:clamp(nums[0]),g:clamp(nums[1]),b:clamp(nums[2]),a:nums.length>3?Math.max(0,Math.min(1,nums[3])):1};
    };
    const blend=(top,bottom)=>{
      const a=top?.a??1,ba=bottom?.a??1,outA=a+ba*(1-a)||1;
      return{r:(top.r*a+bottom.r*ba*(1-a))/outA,g:(top.g*a+bottom.g*ba*(1-a))/outA,b:(top.b*a+bottom.b*ba*(1-a))/outA,a:outA};
    };
    const lum=color=>{
      const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
      return 0.2126*f(color.r)+0.7152*f(color.g)+0.0722*f(color.b);
    };
    const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)};
    const background=el=>{
      const chain=[];let cur=el;
      while(cur&&cur.nodeType===1){chain.push(cur);if(cur===document.documentElement)break;cur=cur.parentElement}
      let out={r:255,g:255,b:255,a:1};
      for(const node of chain.reverse()){
        const c=parseColor(getComputedStyle(node).backgroundColor);
        if(c&&c.a>0)out=blend(c,out);
      }
      return out;
    };
    const selector=el=>{
      if(el.id)return`#${el.id}`;
      const cls=[...el.classList].slice(0,3).join('.');
      return`${el.tagName.toLowerCase()}${cls?'.'+cls:''}`;
    };
    const visible=el=>{
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0)return false;
      return el.getClientRects().length>0;
    };
    const directText=el=>[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent||'').join(' ').replace(/\s+/g,' ').trim();
    const out=[];
    for(const el of [root,...root.querySelectorAll('*')]){
      if(!visible(el))continue;
      const text=directText(el);if(!text)continue;
      const cs=getComputedStyle(el);
      const fg=parseColor(cs.color);if(!fg)continue;
      const bg=background(el);
      let alpha=fg.a;
      for(let cur=el;cur&&cur.nodeType===1;cur=cur.parentElement)alpha*=Math.max(0,Math.min(1,Number(getComputedStyle(cur).opacity)||0));
      const effectiveFg=blend({...fg,a:alpha},bg);
      const actual=ratio(effectiveFg,bg);
      const size=parseFloat(cs.fontSize)||16,weight=parseInt(cs.fontWeight,10)||400;
      const required=size>=24||(size>=18.66&&weight>=700)?3:4.5;
      if(actual+0.01<required)out.push({target:selector(el),text:text.slice(0,90),ratio:Number(actual.toFixed(2)),required,size:Number(size.toFixed(1)),weight,color:cs.color,background:cs.backgroundColor});
      if(out.length>=30)break;
    }
    return out;
  });
  expect(issues,`${label}: contraste WCAG insuficiente`).toEqual([]);
}

async function openSidebarIfNeeded(page,vp){
  if(vp.name!=='mobile')return;
  const toggle=page.locator('#ccMobileToggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await page.waitForTimeout(60);
  const open=await page.evaluate(()=>document.querySelector('#ccSidebar')?.classList.contains('open')===true);
  expect(open,'El menú móvil debe abrirse con el botón ☰').toBe(true);
}

async function mobileRouteBox(page,route){
  return page.evaluate(route=>{
    const b=document.querySelector(`#ccSidebar .cc-side-btn[data-route="${route}"]`);
    if(!b)return null;
    const cs=getComputedStyle(b),r=b.getBoundingClientRect();
    if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0||r.width<1||r.height<1)return null;
    return{x:r.x,y:r.y,width:r.width,height:r.height,text:(b.textContent||'').replace(/\s+/g,' ').trim(),connected:b.isConnected};
  },route);
}

async function clickRoute(page,vp,route){
  await openSidebarIfNeeded(page,vp);
  if(vp.name==='mobile'){
    const box=await mobileRouteBox(page,route);
    expect(box,`La ruta móvil ${route} debe existir y tener un área táctil visible`).not.toBeNull();
    expect(box.connected,`La ruta móvil ${route} debe seguir conectada al DOM`).toBe(true);
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
    await page.waitForTimeout(120);
    const state=await page.evaluate(route=>{
      const side=document.querySelector('#ccSidebar');
      const overlay=document.querySelector('#ccSidebarOverlay');
      const active=document.querySelector(`#ccSidebar [data-route="${route}"]`);
      return{open:side?.classList.contains('open')===true,overlay:overlay?.classList.contains('show')===true,active:active?.classList.contains('active')===true};
    },route);
    expect(state.open,`La ruta móvil ${route} debe cerrar el sidebar`).toBe(false);
    expect(state.overlay,`La ruta móvil ${route} debe retirar el fondo del menú`).toBe(false);
    expect(state.active,`La ruta móvil ${route} debe quedar activa`).toBe(true);
  }else{
    const btn=page.locator(`#ccSidebar [data-route="${route}"]`);
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(btn).toHaveClass(/active/);
  }
  await page.waitForTimeout(350);
}

for(const vp of [{name:'mobile',width:390,height:844,touch:true},{name:'desktop',width:1366,height:768,touch:false}]){
  test.describe(`contraste autenticado ${vp.name}`,()=>{
    test.use({viewport:{width:vp.width,height:vp.height},hasTouch:vp.touch});
    test('revisa navegación principal y expediente completo',async({page})=>{
      await install(page);
      await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:60000});
      await expect(page.locator('#ccSidebar')).toBeVisible({timeout:20000});
      await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
      await page.waitForTimeout(900);
      for(const route of ['inicio','proyectos','presupuesto','transparencia']){
        await clickRoute(page,vp,route);
        await assertContrast(page,`${vp.name} ruta ${route}`);
      }
      await clickRoute(page,vp,'proyectos');
      const search=page.locator('#ccGlobalSearch');await expect(search).toBeVisible();await search.fill('QA CONTRASTE');await search.press('Enter');await page.waitForTimeout(250);
      const open=page.locator(`[data-ccx-open="${PROJECT_ID}"], [data-open="${PROJECT_ID}"]`).first();
      await expect(open).toBeVisible();await open.click();await page.waitForSelector('#tabBody',{timeout:15000});await page.waitForTimeout(500);
      await assertContrast(page,`${vp.name} expediente`);
      const tabs=page.locator('nav.tabs button[data-tab], .tabs button[data-tab]');const count=await tabs.count();
      expect(count).toBeGreaterThanOrEqual(9);
      for(let i=0;i<count;i++){
        const tab=tabs.nth(i);if(!(await tab.isVisible()))continue;
        const label=((await tab.textContent())||`tab-${i}`).replace(/\s+/g,' ').trim();await tab.click();await page.waitForTimeout(220);
        await assertContrast(page,`${vp.name} pestaña ${label}`,'#tabBody');
      }
    });
  });
}