/* ===== COORDINADOR DE RENDIMIENTO DEL DOM V1 ===== */
(()=>{
'use strict';
if(window.__CC_PERFORMANCE_RUNTIME_V1__)return;window.__CC_PERFORMANCE_RUNTIME_V1__=true;
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
  addEventListener('load',()=>navigator.serviceWorker.register(`${scope}service-worker-v1.js`,{scope,updateViaCache:'none'}).catch(error=>console.warn('Caché sin conexión no disponible.',error?.message||error)),{once:true});
}

// Portal Web V2: capa visual y de navegación, cargada aparte para no mezclar
// la lógica contractual ni la persistencia existente.
const portalCss=document.createElement('link');portalCss.rel='stylesheet';portalCss.href='portal-web-v2.css?v=20260901-web2';document.head.appendChild(portalCss);
const projectCss=document.createElement('link');projectCss.rel='stylesheet';projectCss.href='project-detail-v2.css?v=20260901-detail2';document.head.appendChild(projectCss);
const portalJs=document.createElement('script');portalJs.src='portal-web-v2.js?v=20260901-web2';portalJs.defer=true;document.head.appendChild(portalJs);
const projectJs=document.createElement('script');projectJs.src='project-detail-v2.js?v=20260901-detail2';projectJs.defer=true;document.head.appendChild(projectJs);
})();
