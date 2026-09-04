/* CONTROL CONTRACTUAL · NAVEGACIÓN ÚNICA V3
   La barra lateral gobierna directamente la aplicación.
   No dispara botones ocultos ni depende del dashboard ejecutivo legado. */
(()=>{
'use strict';
if(window.__CC_SINGLE_NAV_V3__)return;
window.__CC_SINGLE_NAV_V3__=true;
window.__CC_SINGLE_NAV_V2__=true;
window.__CC_SINGLE_NAV_V1__=true;

const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
const ROUTE_KEY='cc_main_route_v2';
let queued=false,cleaning=false,sideObserver=null,observedSidebar=null;

function role(){try{return String(cloudRole||'')}catch{return''}}
function screen(){try{return String(view?.screen||'')}catch{return''}}
function tab(){try{return String(view?.tab||'')}catch{return''}}
function storedRoute(){try{return localStorage.getItem(ROUTE_KEY)||'inicio'}catch{return'inicio'}}
function rememberRoute(route){try{localStorage.setItem(ROUTE_KEY,route)}catch{}window.__ccMainRoute=route}
function toastSafe(message){try{if(typeof toast==='function')toast(message)}catch{}}
function closeMobileNav(){
 const side=Q('#ccSidebar'),overlay=Q('#ccSidebarOverlay');
 side?.classList.remove('open');overlay?.classList.remove('show');
}

function css(){
 if(Q('#cc-single-nav-style'))return;
 const s=document.createElement('style');s.id='cc-single-nav-style';s.textContent=`
#ccxNav,#ccxSync,[data-cp-main-tabs],#cpExecutiveNav,.cp-main-tabs{display:none!important;visibility:hidden!important;pointer-events:none!important}
#ccTeamBtn,#ccAccessRequestsBtn,#ccSecurityBtn{display:none!important}
.toast{pointer-events:none!important}
.cc-shell{position:relative!important}.cc-app-column{min-width:0!important;position:relative!important;z-index:1!important}.cc-sidebar{position:relative!important;z-index:30!important;flex:0 0 auto!important}
.cc-sidebar .cc-nav-admin{margin-top:4px}
@media(max-width:860px){.cc-sidebar{position:fixed!important;z-index:1000!important}.cc-sidebar-overlay{z-index:999!important}}
`;
 document.head.appendChild(s);
}

function sideButton(route,label,icon){
 const b=document.createElement('button');b.type='button';b.className='cc-side-btn';b.dataset.route=route;b.innerHTML=`<span class="cc-side-icon">${icon}</span><span>${label}</span>`;return b;
}

function ensureTransparency(sidebar){
 if(sidebar.querySelector('[data-route="transparencia"]'))return;
 const report=sidebar.querySelector('[data-route="reportes"]');
 const nav=report?.closest('.cc-side-nav')||sidebar.querySelector('.cc-side-nav');if(!nav)return;
 const b=sideButton('transparencia','Transparencia','T');
 report?.insertAdjacentElement('afterend',b)||nav.appendChild(b);
}

function ensureAdmin(sidebar){
 let label=sidebar.querySelector('[data-cc-admin-label]'),nav=sidebar.querySelector('.cc-nav-admin');
 const isAdmin=role()==='admin';
 if(!isAdmin){label?.remove();nav?.remove();return}
 const bottom=sidebar.querySelector('.cc-sidebar-bottom');if(!bottom)return;
 if(!label){label=document.createElement('div');label.className='cc-nav-label';label.dataset.ccAdminLabel='1';label.textContent='Administración';bottom.before(label)}
 if(!nav){nav=document.createElement('nav');nav.className='cc-side-nav cc-nav-admin';label.after(nav)}
 const specs=[['usuarios','Usuarios','U'],['solicitudes','Solicitudes','S'],['seguridad','Seguridad','✓']];
 for(const [route,text,icon] of specs)if(!nav.querySelector(`[data-route="${route}"]`))nav.appendChild(sideButton(route,text,icon));
 const pending=Q('#ccAccessRequestsBtn .cc-access-count')?.textContent?.trim()||'';
 const req=nav.querySelector('[data-route="solicitudes"]');
 let badge=req?.querySelector('.cc-nav-badge');
 if(pending){if(!badge){badge=document.createElement('span');badge.className='cc-nav-badge';req.appendChild(badge)}badge.textContent=pending;badge.style.display='grid'}else badge?.remove();
}

function activeRoute(){
 const s=screen(),t=tab();
 if(s==='transparency')return'transparencia';
 if(s==='budgetPortfolio')return'presupuesto';
 if(s==='project'){
  if(t==='contract'||t==='controls')return'contratos';
  if(t==='estimates'||t==='payments')return'pagos';
  if(t==='visits')return'visitas';
  if(t==='guarantees')return'garantias';
  if(t==='reports')return'reportes';
  return'proyectos';
 }
 if(document.body.classList.contains('cc-contracts-center-active'))return'contratos';
 if(document.body.classList.contains('cc-payments-center-active'))return'pagos';
 if(document.body.classList.contains('cc-guarantees-center-active'))return'garantias';
 if(document.body.classList.contains('cc-visits-center-active'))return'visitas';
 if(document.body.classList.contains('cc-reports-center-active'))return'reportes';
 if(document.body.classList.contains('cc-alerts-center-active'))return'alertas';
 if(document.body.classList.contains('cc-audit-center-active'))return'auditoria';
 if(s==='projects')return storedRoute()==='proyectos'?'proyectos':storedRoute()==='alertas'?'alertas':'inicio';
 return storedRoute();
}

function syncActive(sidebar){
 const r=activeRoute();
 QA('.cc-side-btn',sidebar).forEach(b=>b.classList.toggle('active',b.dataset.route===r));
}

function watchSidebar(sidebar){
 if(!NativeObserver||observedSidebar===sidebar)return;
 sideObserver?.disconnect?.();observedSidebar=sidebar;
 sideObserver=new NativeObserver(mutations=>{
  if(cleaning)return;
  if(mutations.some(m=>m.type==='attributes'||m.type==='childList'))queue();
 });
 sideObserver.observe(sidebar,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
}

function sanitizeLegacy(){
 for(const el of QA('#ccxNav,#ccxSync,[data-cp-main-tabs],#cpExecutiveNav,.cp-main-tabs')){
  el.setAttribute('aria-hidden','true');el.setAttribute('inert','');
 }
 QA('[data-tr-nav],[data-tr-exec]').forEach(el=>{if(!el.closest('#ccSidebar')){el.setAttribute('aria-hidden','true');el.setAttribute('inert','')}});
}

function goPortfolio(route){
 rememberRoute(route);
 try{
  if(typeof view!=='undefined'){
   view.screen='projects';view.projectId=null;view.tab='summary';view.trash=false;
  }
  if(typeof renderApp==='function')renderApp();
  setTimeout(()=>{
   if(route==='proyectos')Q('.projects-board,.project-grid-v3,.dashboard-project-grid')?.scrollIntoView({behavior:'smooth',block:'start'});
   else window.scrollTo({top:0,behavior:'smooth'});
   queue();
  },80);
  return true;
 }catch(e){console.warn('No se pudo abrir el portafolio.',e);return false}
}

function goBudget(){
 rememberRoute('presupuesto');
 try{view.screen='budgetPortfolio';view.projectId=null;view.tab='summary';renderApp();setTimeout(queue,0)}catch(e){console.warn(e)}
}

function goTransparency(){
 rememberRoute('transparencia');
 if(typeof window.__ccOpenTransparencyDirect==='function')return window.__ccOpenTransparencyDirect();
 try{view.screen='transparency';view.projectId=null;view.tab='summary';renderApp();setTimeout(queue,0)}catch(e){console.warn(e)}
}

function ensure(){
 if(cleaning)return;cleaning=true;
 try{
  css();sanitizeLegacy();
  const side=Q('#ccSidebar');if(!side)return;
  /* La navegación principal es canónica. Las capas visuales posteriores no deben
     retirar, mover o reconstruir sus botones, porque eso provoca carreras de DOM
     en móvil y pérdida temporal de rutas durante una interacción real. */
  side.dataset.groupedV4='1';
  side.dataset.navStable='1';
  ensureTransparency(side);ensureAdmin(side);watchSidebar(side);syncActive(side);
 }finally{cleaning=false}
}
function queue(){if(queued)return;queued=true;const run=()=>{queued=false;ensure()};(window.requestAnimationFrame||setTimeout)(run)}

document.addEventListener('click',event=>{
 const b=event.target.closest?.('#ccSidebar .cc-side-btn[data-route]');if(!b)return;
 const r=b.dataset.route;

 /* En móvil el menú es un panel temporal: al elegir cualquier destino debe
    cerrarse para devolver inmediatamente el foco y el espacio al contenido. */
 closeMobileNav();

 /* Guardar intención incluso para rutas atendidas por portal-web. */
 if(!['campo','arquitectura','logout'].includes(r))rememberRoute(r);

 if(r==='inicio'||r==='proyectos'||r==='presupuesto'||r==='transparencia'||r==='usuarios'||r==='solicitudes'||r==='seguridad'){
  event.preventDefault();event.stopImmediatePropagation();
  if(r==='inicio'||r==='proyectos')goPortfolio(r);
  else if(r==='presupuesto')goBudget();
  else if(r==='transparencia')goTransparency();
  else if(r==='usuarios'){
   if(typeof window.adminUsersModal==='function')window.adminUsersModal();else Q('#ccTeamBtn')?.click();
  }else if(r==='solicitudes'){
   const original=Q('#ccAccessRequestsBtn');if(original)original.click();else toastSafe('No hay solicitudes pendientes o el control todavía se está cargando.');
  }else if(r==='seguridad'){
   if(typeof window.securityCenterModal==='function')window.securityCenterModal();else Q('#ccSecurityBtn')?.click();
  }
  setTimeout(queue,0);setTimeout(queue,80);return;
 }

 /* Contratos, pagos, visitas, garantías, reportes, alertas y auditoría
    continúan usando sus módulos actuales; aquí solo se sincroniza el estado. */
 setTimeout(queue,0);setTimeout(queue,120);
},true);

if(NativeObserver)new NativeObserver(queue).observe(Q('#app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:route-changed',queue);
window.addEventListener('cc:data-changed',queue);
setTimeout(ensure,0);setTimeout(ensure,250);setTimeout(ensure,900);
window.__ccSingleNav={refresh:ensure,goPortfolio,goBudget,goTransparency,closeMobileNav};
})();
