/* ===== ALCANCE VISIBLE DEL CONTROL TÉCNICO V4 ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_TECH_CONTROL_SCOPE_V4__)return;
window.__CC_TECH_CONTROL_SCOPE_V4__=true;
window.__CC_TECH_CONTROL_SCOPE_V3__=true;
window.__CC_TECH_CONTROL_SCOPE_V2__=true;
const HIDDEN=new Set(['calidad','seguridad','ambiental']);
let redirecting=false,observer=null,observerStarted=false,queued=false;
const ROOT_SELECTOR='[data-cct-shell]';
function prune(){
  const shell=document.querySelector(ROOT_SELECTOR);if(!shell)return;
  shell.querySelectorAll('[data-cct-module]').forEach(b=>{if(HIDDEN.has(String(b.dataset.cctModule||'')))b.remove()});
  const hero=shell.querySelector('.cct-hero h2');if(hero&&hero.textContent!=='Campo, gestión técnica y cierre contractual')hero.textContent='Campo, gestión técnica y cierre contractual';
  const badge=shell.querySelector('.cct-hero-badge b');if(badge&&badge.textContent!=='5 controles integrados')badge.textContent='5 controles integrados';
  const host=shell.querySelector('[data-cct-module-host]');
  const title=host?.querySelector('.cct-panel-head h3')?.textContent||'';
  if(!redirecting&&/Calidad y ensayos|Seguridad y salud|Ambiental y social/i.test(title)){
    const api=window.__ccTechnicalControl;
    if(api?.renderModule){redirecting=true;Promise.resolve(api.renderModule('actas')).finally(()=>{redirecting=false;schedule()})}
  }
}
function guard(){
  const api=window.__ccTechnicalControl;if(!api||api.__scopeV4)return;
  const original=api.renderModule?.bind(api);
  if(original)api.renderModule=(key,...rest)=>original(HIDDEN.has(String(key||''))?'actas':key,...rest);
  api.visibleModules=['actas','bitacora','consultas','riesgos','recepcion'];
  api.hiddenHistoricalModules=[...HIDDEN];
  api.__scopeV4=true;api.__scopeV3=true;api.__scopeV2=true;
}
function run(){queued=false;observer?.disconnect();try{guard();prune()}finally{observe()}}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
function relevant(m){for(const n of m.addedNodes||[]){if(n.nodeType!==1)continue;const e=n;if(e.matches?.(ROOT_SELECTOR)||e.closest?.(ROOT_SELECTOR)||e.querySelector?.(ROOT_SELECTOR))return true}return false}
function observe(){if(!observerStarted)return;const target=document.body||document.documentElement;if(target)observer.observe(target,{childList:true,subtree:true})}
function startObserver(){if(observerStarted)return;observerStarted=true;observer=new MutationObserver(ms=>{if(ms.some(relevant))schedule()});observe();schedule()}
function armAfterBoot(){
  if(window.__CC_AUTH_MODULES_READY__===true){startObserver();return}
  document.addEventListener('cc:authenticated-modules-ready',startObserver,{once:true});
  document.addEventListener('cc:authenticated-modules-partial',startObserver,{once:true});
}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-cc-technical-control]'))setTimeout(schedule,0)},true);
armAfterBoot();
})();
