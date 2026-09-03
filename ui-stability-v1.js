/* CONTROL CONTRACTUAL · ESTABILIDAD VISUAL Y DE NAVEGACIÓN V1
   Capa final no destructiva: consolida navegación, elimina duplicidades visibles,
   corrige artefactos de búsqueda y evita que el asistente tape información. */
(()=>{
'use strict';
if(window.__CC_UI_STABILITY_V1__)return;
window.__CC_UI_STABILITY_V1__=true;

const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let queued=false,working=false;

function css(){
  if(document.getElementById('cc-ui-stability-v1-style'))return;
  const s=document.createElement('style');
  s.id='cc-ui-stability-v1-style';
  s.textContent=`
  /* La barra lateral es la navegación principal. Se retira la segunda navegación
     ejecutiva para evitar Inicio/Proyectos/Contratos repetidos y botones agregados
     por módulos independientes. Los botones internos continúan disponibles en DOM. */
  body.cc-portal-v2 #ccxNav{display:none!important}

  /* El símbolo de lupa anterior dependía de una fuente que puede no contener el glifo. */
  body.cc-portal-v2 .cc-global-search:before{content:none!important;display:none!important}
  body.cc-portal-v2 .cc-global-search input{padding-left:13px!important}

  /* Evita desbordamientos horizontales provocados por módulos/tablas extensas. */
  body.cc-portal-v2 .cc-app-column{min-width:0!important;overflow-x:clip!important}
  body.cc-portal-v2 #content{min-width:0!important;max-width:100%!important}
  body.cc-portal-v2 .cc-commandbar{min-width:0!important}

  /* El asistente se mantiene disponible, pero no debe cubrir indicadores del dashboard. */
  body.cc-portal-v2 #ccEngineerChatLaunch.cc-eng-chat-launch{
    width:52px!important;height:106px!important;right:8px!important;bottom:8px!important;
    z-index:32!important;opacity:.96!important
  }
  body.cc-portal-v2 .exec-visual{padding-right:76px!important;box-sizing:border-box!important}

  /* Una sola jerarquía visual en cabecera y sincronización. */
  body.cc-portal-v2 #ccxSync{margin-top:0!important}
  body.cc-portal-v2 .topbar{position:relative!important;z-index:8!important}

  @media(max-width:860px){
    body.cc-portal-v2 #ccEngineerChatLaunch.cc-eng-chat-launch{width:44px!important;height:90px!important;right:6px!important;bottom:6px!important}
    body.cc-portal-v2 .exec-visual{padding-right:12px!important}
  }
  `;
  document.head.appendChild(s);
}

function hiddenExecutive(section){
  const button=Q(`#ccxNav [data-ccx="${section}"]`);
  if(!button)return false;
  button.click();
  return true;
}

function fallbackRoute(section){
  try{
    if(typeof view==='undefined'||typeof renderApp!=='function')return;
    if(section==='budget')view.screen='budgetPortfolio';
    else view.screen='projects';
    view.projectId=null;
    if(section==='home')view.tab='summary';
    renderApp();
  }catch(error){console.warn('Ruta estable:',error)}
}

function ensureTransparencySidebar(){
  const side=Q('#ccSidebar');if(!side)return;
  let button=Q('[data-route="transparencia"]',side);
  if(button)return;
  const anchor=Q('[data-route="auditoria"]',side)||Q('[data-route="campo"]',side);
  const nav=anchor?.closest('.cc-side-nav');if(!nav)return;
  button=document.createElement('button');
  button.type='button';button.className='cc-side-btn';button.dataset.route='transparencia';
  button.innerHTML='<span class="cc-side-icon">T</span><span>Transparencia</span>';
  nav.insertBefore(button,anchor||null);
}

function cleanAccessibleLabels(){
  const search=Q('#ccGlobalSearch');
  if(search){
    search.setAttribute('aria-label','Buscar proyecto, código, ubicación o estado');
    if(search.placeholder!=='Buscar proyecto, código, ubicación o estado…')search.placeholder='Buscar proyecto, código, ubicación o estado…';
  }
  const sidebar=Q('#ccSidebar');if(sidebar)sidebar.setAttribute('aria-label','Navegación principal de Control Contractual');
}

function normalize(){
  if(working)return;working=true;
  try{
    css();ensureTransparencySidebar();cleanAccessibleLabels();
    const nav=Q('#ccxNav');
    if(nav){
      nav.setAttribute('aria-hidden','true');
      nav.setAttribute('inert','');
    }
  }finally{working=false}
}

/* Captura únicamente rutas que antes dependían de la barra ejecutiva duplicada.
   Los centros globales (contratos, pagos, garantías, visitas, reportes, alertas y
   auditoría) siguen siendo atendidos por portal-route-bridge-v1.js. */
document.addEventListener('click',event=>{
  const button=event.target.closest?.('#ccSidebar .cc-side-btn[data-route]');if(!button)return;
  const route=button.dataset.route;
  const map={inicio:'home',proyectos:'projects',presupuesto:'budget'};
  if(map[route]){
    event.preventDefault();event.stopImmediatePropagation();
    Q('#ccSidebar')?.classList.remove('open');Q('#ccSidebarOverlay')?.classList.remove('show');
    if(!hiddenExecutive(map[route]))fallbackRoute(map[route]);
    return;
  }
  if(route==='transparencia'){
    event.preventDefault();event.stopImmediatePropagation();
    Q('#ccSidebar')?.classList.remove('open');Q('#ccSidebarOverlay')?.classList.remove('show');
    try{
      if(typeof window.__ccOpenTransparencyDirect==='function')window.__ccOpenTransparencyDirect();
      else{view.screen='transparency';view.projectId=null;view.tab='summary';renderApp()}
    }catch(error){console.warn('Transparencia:',error)}
  }
},true);

function schedule(){
  if(queued)return;queued=true;
  const run=()=>{queued=false;normalize()};
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(run);
}
if(NativeObserver)new NativeObserver(schedule).observe(Q('#app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:route-changed',schedule);
window.addEventListener('resize',schedule,{passive:true});
setTimeout(normalize,0);setTimeout(normalize,250);setTimeout(normalize,900);
})();