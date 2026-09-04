/* ===== COORDINADOR DE RENDIMIENTO DEL DOM V7 · SIN CARGA FUNCIONAL ===== */
(()=>{
'use strict';
if(window.__CC_PERFORMANCE_RUNTIME_V7__)return;
window.__CC_PERFORMANCE_RUNTIME_V7__=true;
window.__CC_PERFORMANCE_RUNTIME_V6__=true;
window.__CC_PERFORMANCE_RUNTIME_V5__=true;
window.__CC_PERFORMANCE_RUNTIME_V4__=true;
window.__CC_PERFORMANCE_RUNTIME_V3__=true;
window.__CC_PERFORMANCE_RUNTIME_V2__=true;
window.__CC_PERFORMANCE_RUNTIME_V1__=true;

/* MutationObserver pertenece al navegador y nunca se reemplaza globalmente. */
if(!window.__ccNativeMutationObserver&&window.MutationObserver){
  window.__ccNativeMutationObserver=window.MutationObserver;
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

/* Este archivo ya no crea ni carga scripts funcionales. La autoridad única de
   módulos autenticados vive en el plan generado por stabilize-core-v1.cjs. */
function bootPerformance(){
  installContainment();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bootPerformance,{once:true});
  window.addEventListener('load',registerOffline,{once:true});
}else{
  bootPerformance();
  registerOffline();
}
})();
