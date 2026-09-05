/* CONTROL CONTRACTUAL · SINCRONIZACIÓN DE INTERFAZ AUTENTICADA V2
   Coordina la búsqueda superior con ZORDON, conserva la consulta visible tras el rerender y refresca decoraciones tardías sin crear un segundo router. */
(()=>{
'use strict';
if(window.__CC_AUTHENTICATED_UI_SYNC_V2__)return;
window.__CC_AUTHENTICATED_UI_SYNC_V2__=true;
window.__CC_AUTHENTICATED_UI_SYNC_V1__=true;

const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let queued=false;

function syncProjectQuery(query){
  const q=String(query||'').trim();
  const run=()=>{
    const board=[...document.querySelectorAll('.projects-board')].find(el=>el.offsetParent!==null||el.getClientRects().length)||document.querySelector('.projects-board');
    const local=board?.querySelector('#projectSearch');
    try{
      if(window.__ccProjectSearchBridge?.syncGlobalProjectSearch){
        window.__ccProjectSearchBridge.syncGlobalProjectSearch(q);
        return;
      }
      if(local){
        if(local.value!==q)local.value=q;
        local.dispatchEvent(new Event('input',{bubbles:true}));
      }
    }catch{}
  };
  run();
  setTimeout(run,80);
  setTimeout(run,220);
}

function restoreGlobalQuery(query){
  const q=String(query||'').trim();
  const run=()=>{
    const input=document.getElementById('ccGlobalSearch');
    if(input&&input.value!==q)input.value=q;
  };
  run();
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);
  setTimeout(run,80);
  setTimeout(run,220);
}

function routeGlobalSearch(event){
  if(event.key!=='Enter')return;
  const input=event.currentTarget;
  const query=String(input?.value||'').trim();
  event.preventDefault();
  event.stopImmediatePropagation();
  try{
    /* ZORDON conserva la autoridad de búsqueda. El filtro literal histórico
       permanece vacío para no ejecutar dos motores distintos sobre la lista. */
    view.search='';
    view.screen='projects';
    view.projectId=null;
    view.trash=false;
    localStorage.setItem('cc_main_route_v2','proyectos');
    renderApp();
  }catch(error){console.warn('No se pudo abrir Proyectos desde la búsqueda global.',error)}
  setTimeout(()=>window.__ccSingleNav?.refresh?.(),0);
  restoreGlobalQuery(query);
  syncProjectQuery(query);
}

function bindGlobalSearch(){
  const input=document.getElementById('ccGlobalSearch');
  if(!input||input.dataset.ccAuthUiSearchSync==='1')return;
  input.dataset.ccAuthUiSearchSync='1';
  input.addEventListener('keydown',routeGlobalSearch,true);
}

function refreshLateDashboard(){
  try{window.dispatchEvent(new CustomEvent('cc:data-changed',{detail:{source:'authenticated-ui-sync'}}))}catch{}
}

function run(){
  bindGlobalSearch();
}
function schedule(){
  if(queued)return;queued=true;
  const go=()=>{queued=false;run()};
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(go);else setTimeout(go,0);
}

const observer=typeof NativeObserver==='function'?new NativeObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'))schedule();
}):null;
observer?.observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:authenticated-web-ready',()=>{run();refreshLateDashboard()});
window.addEventListener('pagehide',()=>observer?.disconnect(),{once:true});

run();
refreshLateDashboard();
setTimeout(()=>{run();refreshLateDashboard()},120);
setTimeout(()=>{run();refreshLateDashboard()},420);
window.__ccAuthenticatedUiSync={run,syncProjectQuery,restoreGlobalQuery,refreshLateDashboard};
})();