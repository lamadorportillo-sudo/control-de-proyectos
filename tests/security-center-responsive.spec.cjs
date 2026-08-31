const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const USER_ID='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER_ID='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const WORKSPACE_ID='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const SECURITY_SESSION='dddddddd-dddd-4ddd-8ddd-dddddddddddd';

const fixture={users:[{id:USER_ID,name:'Administrador QA',email:'admin-qa@example.com',role:'admin',active:true}],projects:[],contracts:[],estimates:[],guarantees:[],changes:[],payments:[],visits:[],audit:[],durationLearning:[]};

async function install(page){
  await page.addInitScript(({userId,fixture,securitySession})=>{
    Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});
    localStorage.setItem('control_contractual_session_v3',JSON.stringify({userId,email:'admin-qa@example.com',accessToken:'qa-admin-token',refreshToken:'qa-refresh-token',expiresAt:Date.now()+3600000,securitySessionId:securitySession,deviceLabel:'QA'}));
    localStorage.setItem('control_contractual_independiente_v3',JSON.stringify(fixture));
  },{userId:USER_ID,fixture,securitySession:SECURITY_SESSION});

  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    if(path.includes('/functions/v1/manage-users')){
      const body=req.postDataJSON?.()||{};
      if(body.action==='security_overview'){
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
          summary:{success_24h:7,failed_24h:2,active_sessions:2,restricted_users:1},
          users:[
            {user_id:USER_ID,email:'admin-qa@example.com',full_name:'Administrador QA',role:'admin',active:true,last_login_at:'2026-08-23T01:00:00Z',security_force_reauth:false},
            {user_id:OTHER_ID,email:'editor-qa@example.com',full_name:'Editor QA',role:'editor',active:true,last_login_at:'2026-08-23T01:20:00Z',security_force_reauth:false},
          ],
          sessions:[
            {id:SECURITY_SESSION,user_id:USER_ID,email:'admin-qa@example.com',device_label:'Windows · Chrome',started_at:'2026-08-23T01:00:00Z',last_seen_at:new Date().toISOString(),ended_at:null,revoked_at:null},
            {id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',user_id:OTHER_ID,email:'editor-qa@example.com',device_label:'Android · Chrome',started_at:'2026-08-23T01:20:00Z',last_seen_at:new Date().toISOString(),ended_at:null,revoked_at:null},
          ],
          events:[
            {id:'1',user_id:USER_ID,email:'admin-qa@example.com',event_type:'login_success',success:true,severity:'info',device_label:'Windows · Chrome',created_at:'2026-08-23T01:00:00Z'},
            {id:'2',user_id:OTHER_ID,email:'editor-qa@example.com',event_type:'login_failure',success:false,severity:'warning',device_label:'Android · Chrome',created_at:'2026-08-23T01:15:00Z'},
          ],
        })});
      }
      if(body.action==='revoke_sessions')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true})});
      if(body.action==='heartbeat')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revoked:false})});
      if(body.action==='end_session')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true})});
      if(body.action==='list')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({users:[]})});
      return route.fulfill({status:200,contentType:'application/json',body:'{}'});
    }
    if(path.includes('/auth/v1/logout'))return route.fulfill({status:200,contentType:'application/json',body:'{}'});
    if(path.includes('/rest/v1/workspace_members'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{workspace_id:WORKSPACE_ID,role:'admin',active:true}])});
    if(path.includes('/rest/v1/profiles'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{full_name:'Administrador QA',active:true}])});
    if(path.includes('/rest/v1/app_state'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{data:fixture,version:1,updated_at:'2026-08-23T01:00:00Z'}])});
    return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
}

async function noOverflow(page,label){
  const d=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  expect(d.sw,`${label}: desbordamiento horizontal`).toBeLessThanOrEqual(d.cw+3);
}

async function noSeriousContrast(page,label){
  const result=await new AxeBuilder({page}).include('.modal').withRules(['color-contrast']).analyze();
  const bad=result.violations
    .filter(v=>v.id==='color-contrast'&&['serious','critical'].includes(v.impact))
    .map(v=>({impact:v.impact,targets:v.nodes.slice(0,12).flatMap(n=>n.target)}));
  expect(bad,`${label}: el Centro de Seguridad no debe contener texto de contraste insuficiente`).toEqual([]);
}

for(const vp of [{name:'seguridad-mobile',width:390,height:844,touch:true},{name:'seguridad-desktop',width:1366,height:768,touch:false}]){
  test.describe(vp.name,()=>{
    test.use({viewport:{width:vp.width,height:vp.height},hasTouch:vp.touch});
    test('muestra métricas, eventos, contraste legible y permite cerrar sesiones de otro usuario',async({page},testInfo)=>{
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await install(page);
      await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForTimeout(900);
      await page.evaluate(()=>{try{cloudRole='admin'}catch{};document.body.appendChild(document.createComment('qa-security-admin'))});
      await page.waitForSelector('#ccSecurityBtn',{timeout:15000});
      await page.locator('#ccSecurityBtn').click();
      await page.waitForSelector('#ccSecurityCenter .cc-sec-kpis',{timeout:15000});
      await page.waitForTimeout(250);

      await expect(page.getByText('Ingresos correctos · 24 h')).toBeVisible();
      await expect(page.getByText('Intentos fallidos · 24 h')).toBeVisible();
      await expect(page.getByText('Editor QA').first()).toBeVisible();
      await expect(page.getByText('Android · Chrome').first()).toBeVisible();
      await expect(page.getByText('Intento fallido')).toBeVisible();
      await noOverflow(page,vp.name);
      await noSeriousContrast(page,vp.name);

      let revoked=false;
      page.on('request',req=>{if(req.url().includes('/functions/v1/manage-users')){try{if(req.postDataJSON()?.action==='revoke_sessions')revoked=true}catch{}}});
      page.once('dialog',d=>d.accept());
      const close=page.locator(`[data-sec-revoke="${OTHER_ID}"]`);
      await expect(close).toBeVisible();
      await close.click();
      await page.waitForTimeout(300);
      expect(revoked,'debe enviar la orden de cierre de sesiones').toBe(true);
      await noOverflow(page,`${vp.name} después de cerrar sesión`);
      expect(errors,`${vp.name}: errores JS ${errors.join(' | ')}`).toEqual([]);
      await page.screenshot({path:testInfo.outputPath(`${vp.name}.png`),fullPage:true});
    });
  });
}
