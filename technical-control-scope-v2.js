/* ===== ALCANCE VISIBLE DEL CONTROL TÉCNICO V5 ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_TECH_CONTROL_SCOPE_V5__)return;
window.__CC_TECH_CONTROL_SCOPE_V5__=true;
window.__CC_TECH_CONTROL_SCOPE_V4__=true;
window.__CC_TECH_CONTROL_SCOPE_V3__=true;
window.__CC_TECH_CONTROL_SCOPE_V2__=true;

const HIDDEN=new Set(['calidad','seguridad','ambiental']);
const ROOT_SELECTOR='[data-cct-shell]';
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let redirecting=false,queued=false,observer=null,observedShell=null;

function prune(){
  const shell=document.querySelector(ROOT_SELECTOR);
  if(!shell)return;
  shell.querySelectorAll('[data-cct-module]').forEach(b=>{
    if(HIDDEN.has(String(b.dataset.cctModule||'')))b.remove();
  });
  const hero=shell.querySelector('.cct-hero h2');
  if(hero&&hero.textContent!=='Campo, gestión técnica y cierre contractual')hero.textContent='Campo, gestión técnica y cierre contractual';
  const badge=shell.querySelector('.cct-hero-badge b');
  if(badge&&badge.textContent!=='5 controles integrados')badge.textContent='5 controles integrados';
  const host=shell.querySelector('[data-cct-module-host]');
  const title=host?.querySelector('.cct-panel-head h3')?.textContent||'';
  if(!redirecting&&/Calidad y ensayos|Seguridad y salud|Ambiental y social/i.test(title)){
    const api=window.__ccTechnicalControl;
    if(api?.renderModule){
      redirecting=true;
      Promise.resolve(api.renderModule('actas')).finally(()=>{
        redirecting=false;
        schedule();
      });
    }
  }
}

function guard(){
  const api=window.__ccTechnicalControl;
  if(!api||api.__scopeV5)return;
  const original=api.renderModule?.bind(api);
  if(original){
    api.renderModule=(key,...rest)=>{
      const safeKey=HIDDEN.has(String(key||''))?'actas':key;
      const result=original(safeKey,...rest);
      Promise.resolve(result).finally(schedule);
      return result;
    };
  }
  api.visibleModules=['actas','bitacora','consultas','riesgos','recepcion'];
  api.hiddenHistoricalModules=[...HIDDEN];
  api.__scopeV5=true;
  api.__scopeV4=true;
  api.__scopeV3=true;
  api.__scopeV2=true;
}

function bindShellObserver(){
  const shell=document.querySelector(ROOT_SELECTOR);
  if(shell===observedShell)return;
  observer?.disconnect?.();
  observedShell=shell||null;
  if(!shell||!NativeObserver)return;
  observer=new NativeObserver(()=>schedule());
  observer.observe(shell,{childList:true,subtree:true});
}

function run(){
  queued=false;
  guard();
  prune();
  bindShellObserver();
}
function schedule(){
  if(queued)return;
  queued=true;
  const go=()=>run();
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(go);
}

function armAfterBoot(){
  if(window.__CC_AUTH_MODULES_READY__===true){schedule();return}
  document.addEventListener('cc:authenticated-modules-ready',schedule,{once:true});
  document.addEventListener('cc:authenticated-modules-partial',schedule,{once:true});
}

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-cc-technical-control],[data-cct-module]'))setTimeout(schedule,0);
},true);
window.addEventListener('cc:route-changed',schedule);
document.addEventListener('cc:data-changed',schedule);
window.addEventListener('pagehide',()=>observer?.disconnect?.(),{once:true});
armAfterBoot();
})();
