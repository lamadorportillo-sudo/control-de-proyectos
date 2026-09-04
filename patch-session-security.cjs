const fs=require('fs');

const path='index.html';
let html=fs.readFileSync(path,'utf8');

const oldSession="session={userId:d.user?.id||session.userId,email:d.user?.email||session.email,accessToken:d.access_token,refreshToken:d.refresh_token||session.refreshToken,expiresAt:Date.now()+(d.expires_in||3600)*1000};";
const newSession="const priorSession=session||{};session={userId:d.user?.id||priorSession.userId,email:d.user?.email||priorSession.email,accessToken:d.access_token,refreshToken:d.refresh_token||priorSession.refreshToken,expiresAt:Date.now()+(d.expires_in||3600)*1000,securitySessionId:priorSession.securitySessionId||'',deviceLabel:priorSession.deviceLabel||''};";

if(!html.includes(newSession)){
  if(!html.includes(oldSession))throw new Error('No se encontró el bloque de renovación de sesión esperado.');
  html=html.replace(oldSession,newSession);
}

const oldApiFetch="fetch(SUPABASE_URL+path,{method,headers,body:body==null?undefined:JSON.stringify(body)})";
const newApiFetch="fetch(SUPABASE_URL+path,{method,headers,body:body==null?undefined:JSON.stringify(body),cache:'no-store'})";
if(!html.includes(newApiFetch)){
  if(!html.includes(oldApiFetch))throw new Error('No se encontró sbFetch para activar no-store.');
  html=html.replace(oldApiFetch,newApiFetch);
}

const oldRefreshFetch="fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refreshToken})})";
const newRefreshFetch="fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refreshToken}),cache:'no-store'})";
if(!html.includes(newRefreshFetch)){
  if(!html.includes(oldRefreshFetch))throw new Error('No se encontró refreshCloudSession para activar no-store.');
  html=html.replace(oldRefreshFetch,newRefreshFetch);
}

/* El acceso privado escribe la sesión después de que el HTML ya terminó de
   evaluarse. El cargador autenticado, en cambio, decide qué módulos activar
   durante el arranque. Sin este puente, un login correcto puede quedarse en
   la pantalla de acceso porque los módulos autenticados siguen inertes hasta
   la siguiente recarga. Observamos únicamente el formulario de acceso: si una
   sesión nueva aparece después de enviarlo, recargamos una sola vez para que
   el cargador autenticado arranque en el contexto correcto. */
const stagedLoginBridge=`<script id="cc-staged-login-reload-bridge">
(()=>{
  'use strict';
  const KEY='control_contractual_session_v3';
  if(window.__CC_STAGED_LOGIN_RELOAD_BRIDGE__)return;
  window.__CC_STAGED_LOGIN_RELOAD_BRIDGE__=true;
  const bind=()=>{
    const form=document.getElementById('authForm');
    if(!form||form.dataset.ccStageReload==='1')return;
    form.dataset.ccStageReload='1';
    form.addEventListener('submit',()=>{
      const before=localStorage.getItem(KEY);
      const started=Date.now();
      const timer=setInterval(()=>{
        const current=localStorage.getItem(KEY);
        if(current&&current!==before){clearInterval(timer);location.reload();return}
        if(Date.now()-started>15000)clearInterval(timer);
      },50);
    },true);
  };
  bind();
  new (window.__ccNativeMutationObserver||MutationObserver)(bind).observe(document.documentElement,{subtree:true,childList:true});
})();
</script>`;
if(!html.includes('cc-staged-login-reload-bridge')){
  const privateAccess=/<script\s+src=["']private-access-v1\.js(?:\?[^"']*)?["']\s*><\/script>/i;
  if(!privateAccess.test(html))throw new Error('No se encontró private-access-v1.js para instalar el puente de recarga autenticada.');
  html=html.replace(privateAccess,match=>match+'\n'+stagedLoginBridge);
}

if(!html.includes("securitySessionId:priorSession.securitySessionId||''"))throw new Error('La renovación todavía perdería el identificador de seguridad.');
if(!html.includes("deviceLabel:priorSession.deviceLabel||''"))throw new Error('La renovación todavía perdería la identificación del dispositivo.');
if(!html.includes('cc-staged-login-reload-bridge'))throw new Error('Falta el puente entre login privado y arranque autenticado.');

fs.writeFileSync(path,html,'utf8');
console.log('Renovación de token endurecida y login privado enlazado con el arranque autenticado.');
