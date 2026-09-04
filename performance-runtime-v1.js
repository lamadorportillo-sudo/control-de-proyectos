/* ===== COORDINADOR DE RENDIMIENTO DEL DOM V6 · ESTABLE ===== */
(()=>{
'use strict';
if(window.__CC_PERFORMANCE_RUNTIME_V6__)return;
window.__CC_PERFORMANCE_RUNTIME_V6__=true;
window.__CC_PERFORMANCE_RUNTIME_V5__=true;
window.__CC_PERFORMANCE_RUNTIME_V4__=true;
window.__CC_PERFORMANCE_RUNTIME_V3__=true;
window.__CC_PERFORMANCE_RUNTIME_V2__=true;
window.__CC_PERFORMANCE_RUNTIME_V1__=true;

/* MutationObserver pertenece al navegador y NO se reemplaza globalmente. */
if(!window.__ccNativeMutationObserver&&window.MutationObserver){
  window.__ccNativeMutationObserver=window.MutationObserver;
}

const base=new URL('.',document.currentScript?.src||location.href).href;
const normalized=file=>{try{const u=new URL(file,base);return u.pathname+u.search}catch{return String(file||'')}};

function styleOnce(file,id){
  const key=normalized(file);
  if(document.getElementById(id)||[...document.querySelectorAll('link[rel="stylesheet"]')].some(link=>normalized(link.getAttribute('href')||link.href)===key))return;
  const link=document.createElement('link');
  link.id=id;
  link.rel='stylesheet';
  link.href=base+file;
  document.head.appendChild(link);
}

function scriptOnce(file,id){
  const key=normalized(file),name=file.split('?')[0];
  if(document.getElementById(id)||[...document.scripts].some(script=>normalized(script.getAttribute('src')||script.src)===key))return;
  const sameName=[...document.scripts].find(script=>(script.getAttribute('src')||script.src||'').includes('/'+name));
  if(sameName){
    console.error('Conflicto de versión en runtime:',name,normalized(sameName.getAttribute('src')||sameName.src),key);
    return;
  }
  const script=document.createElement('script');
  script.id=id;
  script.src=base+file;
  script.async=false;
  script.dataset.ccRuntime='1';
  script.onerror=()=>console.error('No se pudo cargar módulo crítico:',file);
  document.head.appendChild(script);
}

function installContainment(){
  if(document.getElementById('ccPerformanceContainment'))return;
  const style=document.createElement('style');
  style.id='ccPerformanceContainment';
  style.textContent=`
.project-v3,.project-card,.project-photo-item,.portfolio-project-card{content-visibility:auto;contain-intrinsic-size:1px 260px}
.table tbody tr{content-visibility:auto;contain-intrinsic-size:1px 48px}
`;
  (document.head||document.documentElement).appendChild(style);
}

function registerOffline(){
  if(!('serviceWorker' in navigator)||location.protocol!=='https:')return;
  const scope=new URL('.',location.href).pathname;
  navigator.serviceWorker.register(`${scope}service-worker-v1.js?v=20260903-sw2`,{scope,updateViaCache:'none'})
    .catch(error=>console.warn('Caché sin conexión no disponible.',error?.message||error));
}

function bootModules(){
  installContainment();

  styleOnce('portal-web-v2.css?v=20260903-web3','ccRuntimePortalCss');
  styleOnce('project-detail-v2.css?v=20260901-detail2','ccRuntimeProjectCss');
  styleOnce('dashboard-simplified-v4.css?v=20260903-dash6','ccRuntimeDashboardCss');

  /* Este runtime es una red de seguridad. El cargador autenticado es la
     autoridad primaria; si ya existe exactamente la misma versión no duplica. */
  scriptOnce('portal-web-v2.js?v=20260904-web4','ccRuntimePortalJs');
  scriptOnce('project-detail-v2.js?v=20260901-detail2','ccRuntimeProjectJs');
  scriptOnce('dashboard-simplified-v4.js?v=20260903-dash6','ccRuntimeDashboardJs');
  scriptOnce('payments-center-v1.js?v=20260901-payments1','ccRuntimePaymentsJs');
  scriptOnce('guarantees-center-v1.js?v=20260901-guarantees1','ccRuntimeGuaranteesJs');
  scriptOnce('visits-center-v1.js?v=20260901-visits1','ccRuntimeVisitsJs');
  scriptOnce('reports-center-v1.js?v=20260901-reports1','ccRuntimeReportsJs');
  scriptOnce('alerts-center-v1.js?v=20260901-alerts1','ccRuntimeAlertsJs');
  scriptOnce('audit-center-v1.js?v=20260901-audit1','ccRuntimeAuditJs');
  scriptOnce('portal-route-bridge-v1.js?v=20260901-route5','ccRuntimeRouteBridgeJs');
  scriptOnce('ui-stability-v1.js?v=20260904-stable2','ccRuntimeStabilityJs');
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bootModules,{once:true});
  window.addEventListener('load',registerOffline,{once:true});
}else{
  bootModules();
  registerOffline();
}
})();
