const {test,expect}=require('@playwright/test');

const appUrl=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='c1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='c2222222-2222-4222-8222-222222222222';
const REQUIRED_AFTER='2026-09-01T12:00:00Z';
const emptyState={users:[],projects:[],contracts:[],estimates:[],guarantees:[],changes:[],payments:[],visits:[],offers:[],procurements:[],audit:[],durationLearning:[],contractors:[],reports:[],alerts:[]};

async function mockBackend(page,mfaActions){
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const request=route.request();
    const url=new URL(request.url());
    const pathname=url.pathname;
    let body=[];
    if(pathname.includes('/functions/v1/secure-login')){
      body={
        user:{id:USER_ID,email:'qa-mfa-admin@example.com'},
        access_token:'qa-mfa-seed-access',refresh_token:'qa-mfa-seed-refresh',expires_in:3600,
        mfa_enrollment_required:true,mfa_required:false,mfa_required_after:REQUIRED_AFTER,
        device_label:'Chromium MFA'
      };
    }else if(pathname.includes('/functions/v1/secure-mfa')){
      const payload=request.postDataJSON?.()||{};
      mfaActions.push({action:payload.action,complete_login:payload.complete_login===true});
      if(payload.action==='enroll'){
        body={factor_id:'factor-admin-1',friendly_name:'Control Contractual',qr_code:'data:image/svg+xml;base64,PHN2Zy8+',secret:'QA-MFA-SECRET',required:true,required_after:REQUIRED_AFTER};
      }else if(payload.action==='verify_enrollment'){
        body={ok:true,access_token:'qa-mfa-aal2-access',refresh_token:'qa-mfa-aal2-refresh',expires_in:3600,security_session_id:'qa-mfa-session',device_label:'Chromium MFA'};
      }else if(payload.action==='status'){
        body={enabled:true,aal:'aal2',factors:[{id:'factor-admin-1',factor_type:'totp',status:'verified',friendly_name:'Control Contractual'}],pending:[],required:true,required_after:REQUIRED_AFTER,past_due:true,role:'admin'};
      }else{
        body={ok:true};
      }
    }else if(pathname.includes('/rest/v1/workspace_members')){
      body=[{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
    }else if(pathname.includes('/rest/v1/profiles')){
      body=[{full_name:'QA MFA Admin',active:true,must_change_password:false,mfa_required_after:REQUIRED_AFTER}];
    }else if(pathname.includes('/rest/v1/app_state')){
      body=[{data:emptyState,version:1,updated_at:'2026-09-04T03:00:00Z'}];
    }else if(pathname.includes('/rest/v1/rpc/get_control_center')){
      body={summary:{projects_total:0,projects_execution:0,projects_finalized:0,projects_pre_execution:0,portfolio_amount:0,execution_amount:0,execution_estimated:0,execution_paid:0,paid_total:0,execution_progress_pct:0,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}};
    }else if(pathname.includes('/rest/v1/rpc/save_app_state')){
      body=[{saved:true,new_version:2}];
    }else if(pathname.includes('/auth/v1/logout')){
      body={};
    }
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

test.describe('MFA obligatorio para administradores',()=>{
  test.use({viewport:{width:1280,height:800}});

  test('un administrador vencido no abre la aplicación hasta verificar el enrolamiento',async({page})=>{
    test.setTimeout(90000);
    const mfaActions=[];
    let topNavigations=0;
    page.on('framenavigated',frame=>{if(frame===page.mainFrame())topNavigations++});
    await mockBackend(page,mfaActions);
    await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:30000});

    await expect(page.locator('#authForm')).toBeVisible({timeout:10000});
    await page.locator('#authEmail').fill('qa-mfa-admin@example.com');
    await page.locator('#authPass').fill('Mfa-Administrativa-2026!');
    await page.locator('#authSubmit').click();

    await expect(page.getByRole('heading',{name:'Active la verificación en dos pasos'})).toBeVisible({timeout:10000});
    await expect(page.locator('#ccSidebar')).toHaveCount(0);
    expect(await page.evaluate(()=>localStorage.getItem('control_contractual_session_v3')),'no debe existir sesión persistida antes de completar MFA').toBeNull();
    expect(mfaActions.some(x=>x.action==='enroll'),'el flujo obligatorio debe iniciar enrolamiento real').toBe(true);

    await expect(page.locator('#ccMandatoryCode')).toBeVisible();
    await page.locator('#ccMandatoryCode').fill('123456');
    await page.locator('#ccMandatoryMfa [data-confirm]').click();

    await expect.poll(()=>topNavigations,{timeout:15000,message:'la aplicación no recargó después de completar MFA'}).toBeGreaterThanOrEqual(2);
    await expect(page.locator('#ccSidebar')).toBeVisible({timeout:15000});
    expect(mfaActions.some(x=>x.action==='verify_enrollment'&&x.complete_login),'la verificación debe completar el login protegido').toBe(true);
    const session=await page.evaluate(()=>JSON.parse(localStorage.getItem('control_contractual_session_v3')||'null'));
    expect(session?.accessToken).toBe('qa-mfa-aal2-access');
    expect(session?.securitySessionId).toBe('qa-mfa-session');
  });
});
