/* CONTROL CONTRACTUAL · ESTABILIDAD VISUAL V2
   Capa final no destructiva: corrige artefactos visuales y etiquetas sin
   intervenir rutas ni simular clics. La navegación pertenece únicamente a
   ui-navigation-single-source-v1.js y portal-route-bridge-v1.js. */
(()=>{
'use strict';
if(window.__CC_UI_STABILITY_V1__)return;
window.__CC_UI_STABILITY_V1__=true;

const Q=(s,r=document)=>r.querySelector(s);
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let queued=false,working=false;

function css(){
  if(document.getElementById('cc-ui-stability-v1-style'))return;
  const s=document.createElement('style');
  s.id='cc-ui-stability-v1-style';
  s.textContent=`
  /* La barra lateral es la navegación principal. La navegación ejecutiva
     heredada puede permanecer en DOM por compatibilidad, pero nunca visible. */
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

function cleanAccessibleLabels(){
  const search=Q('#ccGlobalSearch');
  if(search){
    search.setAttribute('aria-label','Buscar proyecto, código, ubicación o estado');
    if(search.placeholder!=='Buscar proyecto, código, ubicación o estado…')search.placeholder='Buscar proyecto, código, ubicación o estado…';
  }
  const sidebar=Q('#ccSidebar');
  if(sidebar)sidebar.setAttribute('aria-label','Navegación principal de Control Contractual');
}

function normalize(){
  if(working)return;working=true;
  try{
    css();cleanAccessibleLabels();
    const nav=Q('#ccxNav');
    if(nav){
      nav.setAttribute('aria-hidden','true');
      nav.setAttribute('inert','');
    }
  }finally{working=false}
}

function schedule(){
  if(queued)return;queued=true;
  const run=()=>{queued=false;normalize()};
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(run);
}

/* Este observador solo normaliza elementos que el núcleo vuelva a dibujar.
   No modifica view, rutas, botones activos ni dispara eventos de navegación. */
if(NativeObserver)new NativeObserver(schedule).observe(Q('#app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:route-changed',schedule);
window.addEventListener('cc:authenticated-critical-ready',schedule);
window.addEventListener('resize',schedule,{passive:true});
setTimeout(normalize,0);setTimeout(normalize,250);setTimeout(normalize,900);
})();