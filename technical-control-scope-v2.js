/* ===== ALCANCE VISIBLE DEL CONTROL TÉCNICO V2 ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_TECH_CONTROL_SCOPE_V2__)return;
window.__CC_TECH_CONTROL_SCOPE_V2__=true;
const HIDDEN=new Set(['calidad','seguridad','ambiental']);
let redirecting=false;
function prune(){
  const shell=document.querySelector('[data-cct-shell]');
  if(!shell)return;
  shell.querySelectorAll('[data-cct-module]').forEach(b=>{if(HIDDEN.has(String(b.dataset.cctModule||'')))b.remove()});
  const hero=shell.querySelector('.cct-hero h2');
  if(hero)hero.textContent='Campo, gestión técnica y cierre contractual';
  const badge=shell.querySelector('.cct-hero-badge b');
  if(badge)badge.textContent='5 controles integrados';
  const host=shell.querySelector('[data-cct-module-host]');
  const title=host?.querySelector('.cct-panel-head h3')?.textContent||'';
  if(!redirecting&&/Calidad y ensayos|Seguridad y salud|Ambiental y social/i.test(title)){
    const api=window.__ccTechnicalControl;
    if(api?.renderModule){redirecting=true;Promise.resolve(api.renderModule('actas')).finally(()=>{redirecting=false;setTimeout(prune,0)})}
  }
}
function guard(){
  const api=window.__ccTechnicalControl;
  if(!api||api.__scopeV2)return;
  const original=api.renderModule?.bind(api);
  if(original)api.renderModule=(key,...rest)=>original(HIDDEN.has(String(key||''))?'actas':key,...rest);
  api.visibleModules=['actas','bitacora','consultas','riesgos','recepcion'];
  api.hiddenHistoricalModules=[...HIDDEN];
  api.__scopeV2=true;
}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-cc-technical-control]'))setTimeout(()=>{guard();prune()},0)},true);
new MutationObserver(()=>{guard();prune()}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(()=>{guard();prune()},0);setTimeout(()=>{guard();prune()},500);setTimeout(()=>{guard();prune()},1400);
})();
