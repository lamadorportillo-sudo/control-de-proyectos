/* ===== MODO INVITADO TEMPORAL V1 ===== */
(()=>{
'use strict';
if(window.__CC_GUEST_MODE_V1__)return;
window.__CC_GUEST_MODE_V1__=true;

const state={active:false,changes:0,local:new Map(),session:new Map(),objectUrls:new Set()};
const outputRx=/\b(imprimir|impresi[oó]n|guardar pdf|descargar|exportar|respaldo|excel|word|generar pdf)\b/i;
const E=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function say(message){
  try{toast(message)}catch{console.info(message)}
}

function css(){
  if(document.getElementById('ccGuestModeStyle'))return;
  const style=document.createElement('style');style.id='ccGuestModeStyle';style.textContent=`
  .cc-guest-entry{margin-top:14px;padding-top:14px;border-top:1px solid var(--line,#d8e1d5)}
  .cc-guest-entry button{width:100%;min-height:46px}
  .cc-guest-entry p{margin:8px 0 0;color:var(--muted,#66756b);font-size:10px;line-height:1.45;text-align:center}
  .cc-guest-banner{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 16px;background:linear-gradient(90deg,#fff7d6,#f8efd0);border:1px solid #ddc46d;border-radius:14px;color:#594b15;box-shadow:0 8px 24px rgba(93,75,17,.10)}
  .cc-guest-banner b,.cc-guest-banner small{display:block}.cc-guest-banner small{margin-top:2px;color:#75662b}
  .cc-guest-banner button{white-space:nowrap;border:1px solid #9a7f24;background:#fffaf0;color:#594b15;border-radius:10px;padding:8px 11px;font-weight:850;cursor:pointer}
  body.cc-guest-mode [data-cc-guest-output]{opacity:.56!important;cursor:not-allowed!important}
  body.cc-guest-mode .cloud-pill{border-color:#ddc46d!important;background:#fff8dc!important;color:#665619!important}
  @media(max-width:720px){.cc-guest-banner{align-items:flex-start;flex-direction:column}.cc-guest-banner button{width:100%}}
  @media print{
    body.cc-guest-mode *{display:none!important}
    body.cc-guest-mode:after{content:'IMPRESIÓN BLOQUEADA · Ingrese con un usuario autorizado para imprimir o exportar documentos.';display:grid!important;place-items:center;position:fixed;inset:0;padding:30mm;color:#111;background:#fff;font:800 18pt/1.45 system-ui;text-align:center}
  }
  `;document.head.appendChild(style);
}

function storageArea(target){
  try{if(target===localStorage)return state.local;if(target===sessionStorage)return state.session}catch{}
  return null;
}

const nativeStorage={
  getItem:Storage.prototype.getItem,
  setItem:Storage.prototype.setItem,
  removeItem:Storage.prototype.removeItem,
  clear:Storage.prototype.clear,
  key:Storage.prototype.key
};
Storage.prototype.getItem=function(key){const area=state.active&&storageArea(this);return area?(area.has(String(key))?area.get(String(key)):null):nativeStorage.getItem.call(this,key)};
Storage.prototype.setItem=function(key,value){const area=state.active&&storageArea(this);if(area){area.set(String(key),String(value));return}return nativeStorage.setItem.call(this,key,value)};
Storage.prototype.removeItem=function(key){const area=state.active&&storageArea(this);if(area){area.delete(String(key));return}return nativeStorage.removeItem.call(this,key)};
Storage.prototype.clear=function(){const area=state.active&&storageArea(this);if(area){area.clear();return}return nativeStorage.clear.call(this)};
Storage.prototype.key=function(index){const area=state.active&&storageArea(this);return area?[...area.keys()][Number(index)]??null:nativeStorage.key.call(this,index)};

const nativeFetch=window.fetch.bind(window);
window.fetch=function(input,init={}){
  if(state.active){
    try{
      const raw=typeof input==='string'?input:input?.url||String(input),url=new URL(raw,location.href);
      if(url.origin===new URL(SUPABASE_URL).origin)return Promise.reject(new Error('El modo invitado no puede leer ni guardar datos en Supabase.'));
    }catch(error){if(/modo invitado/i.test(String(error?.message||'')))return Promise.reject(error)}
  }
  return nativeFetch(input,init);
};

const nativePrint=window.print.bind(window);
window.print=function(){if(state.active){say('La impresión requiere un usuario autorizado.');return}return nativePrint()};

const nativeOpen=window.open.bind(window);
window.open=function(){
  const opened=nativeOpen(...arguments);
  if(state.active&&opened){try{opened.print=()=>say('La impresión requiere un usuario autorizado.');opened.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p'){event.preventDefault();say('La impresión requiere un usuario autorizado.')}},true)}catch{}}
  return opened;
};

const nativeAnchorClick=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){
  if(state.active&&(this.hasAttribute('download')||/^(blob:|data:)/i.test(this.href||''))){say('Las descargas requieren un usuario autorizado.');return}
  return nativeAnchorClick.call(this);
};

const nativeCreateObjectURL=URL.createObjectURL.bind(URL),nativeRevokeObjectURL=URL.revokeObjectURL.bind(URL);
URL.createObjectURL=function(value){const url=nativeCreateObjectURL(value);if(state.active)state.objectUrls.add(url);return url};
URL.revokeObjectURL=function(url){state.objectUrls.delete(String(url));return nativeRevokeObjectURL(url)};

function installSaveGuard(){
  if(typeof saveDB!=='function'||saveDB.__ccGuestWrapped)return;
  const base=saveDB;
  const guarded=function(){
    if(!state.active)return base.apply(this,arguments);
    try{syncAllProjectProgress()}catch{}
    state.changes+=1;decorateApp();
    return true;
  };
  guarded.__ccGuestWrapped=true;
  guarded.__ccSafeStorageV2=true;
  saveDB=guarded;
}
installSaveGuard();

const baseToast=toast;
toast=function(message){
  let text=String(message||'');
  if(state.active)text=text
    .replace(/guardad[oa] y sincronizad[oa]/gi,'conservado temporalmente')
    .replace(/guardad[oa] en (?:la nube|Supabase)/gi,'conservado temporalmente')
    .replace(/sincronizad[oa]/gi,'actualizado temporalmente');
  return baseToast(text);
};

const baseExportBackup=exportBackup;
exportBackup=function(){if(state.active)return say('El respaldo y las descargas requieren un usuario autorizado.');return baseExportBackup.apply(this,arguments)};

const baseRender=render;
render=async function(){if(state.active)return renderApp();return baseRender.apply(this,arguments)};

const baseRenderApp=renderApp;
renderApp=function(){const result=baseRenderApp.apply(this,arguments);if(state.active)setTimeout(decorateApp,0);return result};

const baseCloudSignOut=cloudSignOut;
cloudSignOut=async function(){if(state.active)return exitGuest();return baseCloudSignOut.apply(this,arguments)};

function decorateApp(){
  if(!state.active)return;
  document.body.classList.add('cc-guest-mode');
  const shell=document.querySelector('#app .shell');if(!shell)return;
  let banner=shell.querySelector('.cc-guest-banner');
  if(!banner){banner=document.createElement('aside');banner.className='cc-guest-banner';banner.innerHTML='<div><b>Modo invitado temporal</b><small>Puede probar y modificar la página. Nada se guarda y la impresión o descarga está bloqueada.</small></div><button type="button" data-guest-exit>Salir y eliminar cambios</button>';shell.prepend(banner);banner.querySelector('[data-guest-exit]').onclick=exitGuest}
  const counter=state.changes? ` · ${state.changes} cambio${state.changes===1?'':'s'} temporal${state.changes===1?'':'es'}`:'';
  const note=banner.querySelector('small');if(note)note.textContent=`Puede probar y modificar la página. Nada se guarda y la impresión o descarga está bloqueada${counter}.`;
  const pill=document.querySelector('.cloud-pill');if(pill){const small=pill.querySelector('small'),strong=pill.querySelector('b');if(small)small.textContent='MODO INVITADO';if(strong)strong.textContent='TEMPORAL'}
  const role=document.querySelector('.userbox small');if(role)role.textContent='INVITADO · TEMPORAL';
  const logout=document.getElementById('logoutBtn');if(logout){logout.textContent='Salir y borrar';logout.onclick=exitGuest}
  const backup=document.getElementById('backupBtn');if(backup){backup.textContent='⇩ Respaldo bloqueado';backup.disabled=true;backup.dataset.ccGuestOutput='1';backup.title='Disponible únicamente para usuarios autorizados'}
  const footer=document.querySelector('.footer-note');if(footer)footer.textContent='Modo invitado · los cambios existen únicamente mientras esta página permanezca abierta';
  const chatStatus=document.querySelector('.cc-eng-chat-head small');if(chatStatus)chatStatus.textContent='Conversación temporal · este hilo se borra al salir';
}

function startGuest(){
  if(state.active)return;
  state.active=true;state.changes=0;state.local.clear();state.session.clear();
  window.__ccGuestSession={get active(){return state.active},isActive:()=>state.active};
  session={userId:`guest-${Date.now()}`,email:'invitado@temporal.local',accessToken:null,refreshToken:null,expiresAt:0,guest:true};
  cloudLoaded=false;cloudWorkspaceId=null;cloudRole='editor';cloudProfile={full_name:'Invitado temporal',active:true};cloudSaving=false;cloudLastSaved=null;
  db=defaultDB();view={screen:'projects',projectId:null,tab:'summary',search:'',trash:false};
  try{seed();state.changes=0;ensureProjectLinks()}catch(error){console.warn('No se pudo preparar la demostración temporal.',error)}
  document.dispatchEvent(new CustomEvent('cc:guest-start'));
  renderApp();decorateApp();
  say('Modo invitado activo. Sus cambios desaparecerán al salir.');
}

function exitGuest(){
  if(!state.active)return;
  if(!confirm('¿Salir del modo invitado? Todos los cambios temporales se eliminarán.'))return;
  state.objectUrls.forEach(url=>{try{nativeRevokeObjectURL(url)}catch{}});state.objectUrls.clear();state.local.clear();state.session.clear();state.active=false;
  document.body.classList.remove('cc-guest-mode');
  location.reload();
}

function injectEntry(){
  if(state.active)return;
  const form=document.getElementById('authForm');if(!form||document.getElementById('ccGuestEntry'))return;
  const entry=document.createElement('div');entry.id='ccGuestEntry';entry.className='cc-guest-entry';entry.innerHTML=`<button type="button" class="btn" id="ccGuestEnter">Entrar como invitado</button><p>Acceso de demostración: todas las áreas visibles, cambios temporales y sin impresión, descargas ni respaldo.</p>`;
  form.insertAdjacentElement('afterend',entry);entry.querySelector('#ccGuestEnter').onclick=startGuest;
}

function outputAction(target){
  const control=target?.closest?.('button,a,[role="button"]');if(!control)return false;
  if(control.hasAttribute('download')||/^(blob:|data:)/i.test(control.getAttribute('href')||''))return true;
  const signature=[control.id,control.className,control.getAttribute('data-action'),control.getAttribute('data-report-kind'),control.textContent,control.title].join(' ');
  return outputRx.test(signature);
}

document.addEventListener('click',event=>{
  if(!state.active||!outputAction(event.target))return;
  event.preventDefault();event.stopImmediatePropagation();
  say('La impresión, exportación y descarga requieren un usuario autorizado.');
},true);
document.addEventListener('keydown',event=>{
  if(!state.active||!(event.ctrlKey||event.metaKey))return;
  const key=event.key.toLowerCase();if(key==='p'||key==='s'){event.preventDefault();event.stopImmediatePropagation();say(key==='p'?'La impresión requiere un usuario autorizado.':'Guardar o descargar requiere un usuario autorizado.')}
},true);
window.addEventListener('beforeprint',()=>{if(state.active)say('La impresión requiere un usuario autorizado.')});
window.addEventListener('pagehide',()=>{if(!state.active)return;state.objectUrls.forEach(url=>{try{nativeRevokeObjectURL(url)}catch{}});state.objectUrls.clear();state.local.clear();state.session.clear()});
document.addEventListener('load',event=>{if(event.target instanceof HTMLScriptElement)setTimeout(installSaveGuard,0)},true);

css();injectEntry();
new MutationObserver(()=>{injectEntry();if(state.active)decorateApp()}).observe(document.documentElement,{subtree:true,childList:true});
setInterval(installSaveGuard,250);
window.__ccGuestMode={start:startGuest,exit:exitGuest,isActive:()=>state.active,changes:()=>state.changes};
})();
