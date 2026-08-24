/* ===== CARGA PROGRESIVA DE BIBLIOTECAS PESADAS V1 ===== */
(()=>{
'use strict';
if(window.__CC_LAZY_FEATURES_V1__)return;window.__CC_LAZY_FEATURES_V1__=true;
const base=new URL('.',document.currentScript?.src||location.href).href;
const pending=new Map();
const manifests={
  costs:[
    'fhis-cost-data-v1.js?v=20260823-fhis1',
    'assets/cost-knowledge/index.js?v=20260823-costsync2',
    'cost-program-v1.js?v=20260823-costs4',
  ],
  legal:[
    'law-knowledge-v1.js?v=20260822-law1',
    'legal-assistant-v2.js?v=20260822-short1',
  ],
};
function script(file){
  const clean=file.split('?')[0],present=[...document.scripts].find(s=>(s.src||'').includes('/'+clean));
  if(present)return present.dataset.ccLoaded==='error'?Promise.reject(new Error(`No se pudo cargar ${clean}`)):Promise.resolve();
  return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+file;s.async=false;s.dataset.ccLazy='1';s.onload=()=>{s.dataset.ccLoaded='ok';resolve()};s.onerror=()=>{s.dataset.ccLoaded='error';reject(new Error(`No se pudo cargar ${clean}`))};document.body.appendChild(s)});
}
function load(name){
  if(pending.has(name))return pending.get(name);
  const task=(async()=>{for(const file of manifests[name]||[])await script(file);return true})().catch(error=>{pending.delete(name);throw error});
  pending.set(name,task);return task;
}
async function openCosts(button){
  if(button){button.disabled=true;button.textContent='Cargando costos…'}
  try{await load('costs');document.getElementById('ccCostProgramLazyBtn')?.remove();window.__ccCostProgram?.open?.()}
  catch(error){console.error(error);try{toast('No se pudo cargar el Programa de costos. Revisa la conexión e intenta nuevamente.')}catch{}if(button){button.disabled=false;button.textContent='▤ Programa de costos'}}
}
function mountCostButton(){
  if(!window.session?.accessToken&&typeof session!=='undefined'&&!session?.accessToken)return;
  if(document.getElementById('ccCostProgramBtn')||document.getElementById('ccCostProgramLazyBtn'))return;
  const host=document.querySelector('.top-actions');if(!host)return;
  const button=document.createElement('button');button.type='button';button.className='btn';button.id='ccCostProgramLazyBtn';button.textContent='▤ Programa de costos';button.onclick=()=>openCosts(button);host.insertBefore(button,host.querySelector('#backupBtn')||host.firstChild);
}
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mountCostButton()})}).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(mountCostButton,80);
window.__ccLazyFeatures={loadCosts:()=>load('costs'),openCosts,loadLegal:()=>load('legal'),manifests};
})();
