/* CONTROL CONTRACTUAL · AJUSTE RESPONSIVE TABLET V1
   Corrige el desfase entre el ancho real del sidebar y la columna reservada,
   evita que la navegación tape el contenido y compacta la barra superior. */
(()=>{
'use strict';
if(window.__CC_TABLET_LAYOUT_FIX_V1__)return;
window.__CC_TABLET_LAYOUT_FIX_V1__=true;

function install(){
  if(document.getElementById('cc-tablet-layout-fix-v1'))return;
  const s=document.createElement('style');
  s.id='cc-tablet-layout-fix-v1';
  s.textContent=`
html,body{max-width:100%;overflow-x:hidden}
body.cc-portal-v2:not(.print-report) .cc-app-column,
body.cc-portal-v2:not(.print-report) #content{
  min-width:0!important;max-width:100%!important;
}
body.cc-portal-v2:not(.print-report) .topbar,
body.cc-portal-v2:not(.print-report) .cc-commandbar{
  width:100%!important;max-width:100%!important;
}
body.cc-portal-v2:not(.print-report) #ccEngineerChatLaunch.cc-eng-chat-launch{
  width:52px!important;height:106px!important;
}

/* Cada módulo usa su propia barra de trabajo. Evita títulos y acciones duplicadas. */
body.cc-contracts-center-active:not(.print-report) .topbar,
body.cc-payments-center-active:not(.print-report) .topbar,
body.cc-guarantees-center-active:not(.print-report) .topbar,
body.cc-visits-center-active:not(.print-report) .topbar,
body.cc-reports-center-active:not(.print-report) .topbar,
body.cc-alerts-center-active:not(.print-report) .topbar,
body.cc-audit-center-active:not(.print-report) .topbar,
body.cc-transparency-active:not(.print-report) .topbar,
body.cc-portal-v2[data-cc-main-route="proyectos"]:not(.print-report) .topbar,
body.cc-portal-v2[data-cc-main-route="presupuesto"]:not(.print-report) .topbar{
  display:none!important;
}
body.cc-contracts-center-active:not(.print-report) #ccCommandbar,
body.cc-payments-center-active:not(.print-report) #ccCommandbar,
body.cc-guarantees-center-active:not(.print-report) #ccCommandbar,
body.cc-visits-center-active:not(.print-report) #ccCommandbar,
body.cc-reports-center-active:not(.print-report) #ccCommandbar,
body.cc-alerts-center-active:not(.print-report) #ccCommandbar,
body.cc-audit-center-active:not(.print-report) #ccCommandbar,
body.cc-portal-v2[data-cc-main-route="presupuesto"]:not(.print-report) #ccCommandbar{
  display:none!important;
}
/* Transparencia reutiliza la barra global solo para el periodo y Nuevo mes. */
body.cc-transparency-active:not(.print-report) #ccCommandbar{
  display:grid!important;
}
@media(max-width:900px){
  body.cc-portal-v2:not(.print-report) #ccEngineerChatLaunch.cc-eng-chat-launch{
    width:44px!important;height:90px!important;
  }
  /* En móvil nunca se pierde el botón de menú aunque un centro oculte la barra global. */
  body.cc-contracts-center-active:not(.print-report) #ccCommandbar,
  body.cc-payments-center-active:not(.print-report) #ccCommandbar,
  body.cc-guarantees-center-active:not(.print-report) #ccCommandbar,
  body.cc-visits-center-active:not(.print-report) #ccCommandbar,
  body.cc-reports-center-active:not(.print-report) #ccCommandbar,
  body.cc-alerts-center-active:not(.print-report) #ccCommandbar,
  body.cc-audit-center-active:not(.print-report) #ccCommandbar,
  body.cc-portal-v2[data-cc-main-route="presupuesto"]:not(.print-report) #ccCommandbar{
    display:flex!important;width:max-content!important;max-width:100%!important;
    grid-template-columns:none!important;align-items:center!important;
    padding:7px!important;margin:0 0 10px!important;
  }
  body.cc-contracts-center-active:not(.print-report) #ccCommandbar .cc-global-search,
  body.cc-contracts-center-active:not(.print-report) #ccCommandbar .cc-command-actions,
  body.cc-payments-center-active:not(.print-report) #ccCommandbar .cc-global-search,
  body.cc-payments-center-active:not(.print-report) #ccCommandbar .cc-command-actions,
  body.cc-guarantees-center-active:not(.print-report) #ccCommandbar .cc-global-search,
  body.cc-guarantees-center-active:not(.print-report) #ccCommandbar .cc-command-actions,
  body.cc-visits-center-active:not(.print-report) #ccCommandbar .cc-global-search,
  body.cc-visits-center-active:not(.print-report) #ccCommandbar .cc-command-actions,
  body.cc-reports-center-active:not(.print-report) #ccCommandbar .cc-global-search,
  body.cc-reports-center-active:not(.print-report) #ccCommandbar .cc-command-actions,
  body.cc-alerts-center-active:not(.print-report) #ccCommandbar .cc-global-search,
  body.cc-alerts-center-active:not(.print-report) #ccCommandbar .cc-command-actions,
  body.cc-audit-center-active:not(.print-report) #ccCommandbar .cc-global-search,
  body.cc-audit-center-active:not(.print-report) #ccCommandbar .cc-command-actions,
  body.cc-portal-v2[data-cc-main-route="presupuesto"]:not(.print-report) #ccCommandbar .cc-global-search,
  body.cc-portal-v2[data-cc-main-route="presupuesto"]:not(.print-report) #ccCommandbar .cc-command-actions{
    display:none!important;
  }
  body.cc-contracts-center-active:not(.print-report) #ccCommandbar .cc-mobile-toggle,
  body.cc-payments-center-active:not(.print-report) #ccCommandbar .cc-mobile-toggle,
  body.cc-guarantees-center-active:not(.print-report) #ccCommandbar .cc-mobile-toggle,
  body.cc-visits-center-active:not(.print-report) #ccCommandbar .cc-mobile-toggle,
  body.cc-reports-center-active:not(.print-report) #ccCommandbar .cc-mobile-toggle,
  body.cc-alerts-center-active:not(.print-report) #ccCommandbar .cc-mobile-toggle,
  body.cc-audit-center-active:not(.print-report) #ccCommandbar .cc-mobile-toggle,
  body.cc-portal-v2[data-cc-main-route="presupuesto"]:not(.print-report) #ccCommandbar .cc-mobile-toggle{
    display:grid!important;
  }
}

/* Escritorio: la columna reservada y el ancho visible del menú deben coincidir. */
@media (min-width:1181px){
  body.cc-portal-v2:not(.print-report) .shell.cc-shell{
    display:grid!important;
    grid-template-columns:264px minmax(0,1fr)!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-sidebar{
    width:264px!important;max-width:264px!important;flex:0 0 264px!important;
  }
}

/* Tablet horizontal / portátil pequeño: menú un poco más estrecho, sin invadir contenido. */
@media (min-width:901px) and (max-width:1180px){
  body.cc-portal-v2:not(.print-report) .shell.cc-shell{
    display:grid!important;
    grid-template-columns:228px minmax(0,1fr)!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-sidebar{
    position:sticky!important;left:auto!important;top:0!important;
    width:228px!important;max-width:228px!important;flex:0 0 228px!important;
    height:100vh!important;transform:none!important;
    padding:20px 13px!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-sidebar-brand strong{font-size:13px!important}
  body.cc-portal-v2:not(.print-report) .cc-sidebar-brand small{font-size:8px!important}
  body.cc-portal-v2:not(.print-report) .cc-side-btn{
    min-height:39px!important;padding:8px 9px!important;font-size:11px!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-app-column{padding:12px 14px 22px!important}
  body.cc-portal-v2:not(.print-report) .topbar{
    min-height:68px!important;padding:12px 14px!important;margin-bottom:10px!important;
  }
  body.cc-portal-v2:not(.print-report) .topbar h1{font-size:24px!important}
  body.cc-portal-v2:not(.print-report) .cc-commandbar{
    grid-template-columns:minmax(220px,1fr) auto!important;
    gap:8px!important;padding:8px!important;margin-bottom:12px!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-command-actions{
    display:flex!important;grid-column:auto!important;flex-wrap:nowrap!important;gap:6px!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-command-btn{
    height:38px!important;padding:0 9px!important;font-size:9px!important;white-space:nowrap!important;
  }
}

/* Tablet vertical y móvil: el menú deja de ocupar ancho permanente y se vuelve off-canvas real. */
@media (max-width:900px){
  body.cc-portal-v2:not(.print-report) .shell.cc-shell{
    display:block!important;width:100%!important;max-width:100%!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-sidebar{
    position:fixed!important;left:0!important;top:0!important;
    width:min(286px,86vw)!important;max-width:min(286px,86vw)!important;
    height:100dvh!important;min-height:100dvh!important;
    transform:translateX(-105%)!important;
    transition:transform .2s ease!important;
    z-index:1000!important;overflow-y:auto!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-sidebar.open{
    transform:translateX(0)!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-sidebar-overlay{
    position:fixed!important;top:0!important;right:0!important;bottom:0!important;
    left:min(286px,86vw)!important;width:auto!important;height:100dvh!important;
    z-index:999!important;background:rgba(0,0,0,.58)!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-app-column{
    width:100%!important;max-width:100%!important;margin:0!important;padding:10px 12px 18px!important;
  }
  body.cc-portal-v2:not(.print-report) .topbar{
    min-height:62px!important;margin:0 0 9px!important;padding:10px 12px!important;
  }
  body.cc-portal-v2:not(.print-report) .topbar h1{font-size:22px!important}
  body.cc-portal-v2:not(.print-report) .cc-commandbar{
    display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;
    gap:8px!important;padding:7px!important;margin-bottom:10px!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-mobile-toggle{
    display:grid!important;place-items:center!important;width:40px!important;height:40px!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-global-search{min-width:0!important;max-width:none!important}
  body.cc-portal-v2:not(.print-report) .cc-global-search input{
    width:100%!important;min-width:0!important;height:40px!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-command-actions{
    grid-column:1/-1!important;display:grid!important;
    grid-template-columns:repeat(4,minmax(0,1fr))!important;
    gap:6px!important;overflow:visible!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-command-btn{
    width:100%!important;min-width:0!important;height:38px!important;padding:0 7px!important;
    font-size:9px!important;white-space:normal!important;line-height:1.15!important;
  }
  body.cc-portal-v2:not(.print-report) #content .exec-overview,
  body.cc-portal-v2:not(.print-report) #content .dashboard-workspace-v3{
    min-width:0!important;max-width:100%!important;
  }
}

@media (max-width:680px){
  body.cc-portal-v2:not(.print-report) .cc-app-column{padding:8px!important}
  body.cc-portal-v2:not(.print-report) .topbar{padding:9px 10px!important}
  body.cc-portal-v2:not(.print-report) .topbar h1{font-size:20px!important}
  body.cc-portal-v2:not(.print-report) .cc-command-actions{
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-command-btn{font-size:10px!important}
}

@media (max-width:420px){
  body.cc-portal-v2:not(.print-report) .cc-commandbar{
    grid-template-columns:42px minmax(0,1fr)!important;
  }
  body.cc-portal-v2:not(.print-report) .cc-command-actions{
    grid-template-columns:1fr 1fr!important;
  }
}
`;
  document.head.appendChild(s);
}

install();
document.addEventListener('DOMContentLoaded',install,{once:true});
setTimeout(install,250);
window.addEventListener('resize',()=>{
  if(innerWidth<=900){
    const side=document.getElementById('ccSidebar');
    const overlay=document.getElementById('ccSidebarOverlay');
    if(side&&!side.classList.contains('open'))overlay?.classList.remove('show');
  }
},{passive:true});
})();
