/* ===== COORDINADOR DE RENDIMIENTO DEL DOM V4 ===== */
(()=>{
'use strict';
if(window.__CC_PERFORMANCE_RUNTIME_V4__)return;window.__CC_PERFORMANCE_RUNTIME_V4__=true;window.__CC_PERFORMANCE_RUNTIME_V3__=true;window.__CC_PERFORMANCE_RUNTIME_V2__=true;window.__CC_PERFORMANCE_RUNTIME_V1__=true;
const NativeObserver=window.MutationObserver;if(!NativeObserver)return;
const pending=new Set();let flushScheduled=false,passes=0;
const MAX_PASSES=4;
const schedule=callback=>window.requestIdleCallback?requestIdleCallback(callback,{timeout:180}):setTimeout(callback,32);
function queue(observer){
  if(passes>=MAX_PASSES){observer.discard();return}
  pending.add(observer);if(flushScheduled)return;flushScheduled=true;schedule(()=>{flushScheduled=false;passes+=1;const batch=[...pending];pending.clear();for(const item of batch)item.flush()})
}
function resetBudget(){passes=0}
for(const event of ['click','input','change','submit'])document.addEventListener(event,resetBudget,true);
const style=document.createElement('style');style.id='ccPerformanceContainment';style.textContent=`
.project-v3,.project-card,.project-photo-item,.portfolio-project-card{content-visibility:auto;contain-intrinsic-size:1px 260px}
.table tbody tr{content-visibility:auto;contain-intrinsic-size:1px 48px}
`;(document.head||document.documentElement).appendChild(style);
class BatchedMutationObserver{
  constructor(callback){
    if(typeof callback!=='function')throw new TypeError('MutationObserver callback must be a function');
    this.callback=callback;this.records=[];this.queued=false;
    this.native=new NativeObserver(records=>{this.records.push(...records);if(this.queued)return;this.queued=true;queue(this)});
  }
  flush(){this.queued=false;const batch=this.records.splice(0);if(batch.length)this.callback(batch,this)}
  discard(){this.records.length=0;this.queued=false}
  observe(target,options){return this.native.observe(target,options)}
  disconnect(){pending.delete(this);this.records.length=0;this.queued=false;return this.native.disconnect()}
  takeRecords(){return this.records.splice(0).concat(this.native.takeRecords())}
}
window.MutationObserver=BatchedMutationObserver;
window.__ccNativeMutationObserver=NativeObserver;
if('serviceWorker'in navigator&&location.protocol==='https:'){
  const scope=new URL('.',location.href).pathname;
  addEventListener('load',()=>navigator.serviceWorker.register(`${scope}service-worker-v1.js?v=20260903-sw2`,{scope,updateViaCache:'none'}).catch(error=>console.warn('Caché sin conexión no disponible.',error?.message||error)),{once:true});
}

const portalCss=document.createElement('link');portalCss.rel='stylesheet';portalCss.href='portal-web-v2.css?v=20260903-web3';document.head.appendChild(portalCss);
const projectCss=document.createElement('link');projectCss.rel='stylesheet';projectCss.href='project-detail-v2.css?v=20260901-detail2';document.head.appendChild(projectCss);
const dashboardCss=document.createElement('link');dashboardCss.rel='stylesheet';dashboardCss.href='dashboard-simplified-v4.css?v=20260903-dash6';document.head.appendChild(dashboardCss);
const portalJs=document.createElement('script');portalJs.src='portal-web-v2.js?v=20260903-web3';portalJs.defer=true;document.head.appendChild(portalJs);
const projectJs=document.createElement('script');projectJs.src='project-detail-v2.js?v=20260901-detail2';projectJs.defer=true;document.head.appendChild(projectJs);
const dashboardJs=document.createElement('script');dashboardJs.src='dashboard-simplified-v4.js?v=20260903-dash6';dashboardJs.defer=true;document.head.appendChild(dashboardJs);
const paymentsJs=document.createElement('script');paymentsJs.src='payments-center-v1.js?v=20260901-payments1';paymentsJs.defer=true;document.head.appendChild(paymentsJs);
const guaranteesJs=document.createElement('script');guaranteesJs.src='guarantees-center-v1.js?v=20260901-guarantees1';guaranteesJs.defer=true;document.head.appendChild(guaranteesJs);
const visitsJs=document.createElement('script');visitsJs.src='visits-center-v1.js?v=20260901-visits1';visitsJs.defer=true;document.head.appendChild(visitsJs);
const reportsJs=document.createElement('script');reportsJs.src='reports-center-v1.js?v=20260901-reports1';reportsJs.defer=true;document.head.appendChild(reportsJs);
const alertsJs=document.createElement('script');alertsJs.src='alerts-center-v1.js?v=20260901-alerts1';alertsJs.defer=true;document.head.appendChild(alertsJs);
const auditJs=document.createElement('script');auditJs.src='audit-center-v1.js?v=20260901-audit1';auditJs.defer=true;document.head.appendChild(auditJs);
const routeBridgeJs=document.createElement('script');routeBridgeJs.src='portal-route-bridge-v1.js?v=20260901-route5';routeBridgeJs.defer=true;document.head.appendChild(routeBridgeJs);
const stabilityJs=document.createElement('script');stabilityJs.src='ui-stability-v1.js?v=20260903-stable1';stabilityJs.defer=true;document.head.appendChild(stabilityJs);
})();
