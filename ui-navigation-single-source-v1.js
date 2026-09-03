/* CONTROL CONTRACTUAL · NAVEGACION UNICA V1
   La barra lateral es la única navegación principal visible.
   Conserva compatibilidad interna con el motor ejecutivo legado sin exponerlo al usuario. */
(()=>{
'use strict';
if(window.__CC_SINGLE_NAV_V1__)return;window.__CC_SINGLE_NAV_V1__=true;
const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let queued=false,cleaning=false,sideObserver=null,observedSidebar=null;

function role(){try{return String(cloudRole||'')}catch{return''}}
function screen(){try{return String(view?.screen||'')}catch{return''}}
function tab(){try{return String(view?.tab||'')}catch{return''}}
function executiveSection(){try{return localStorage.getItem('cc_exec_section_v2')||'home'}catch{return'home'}}
let requestedExecutive=executiveSection();
function toastSafe(message){try{if(typeof toast==='function')toast(message)}catch{}}

function css(){
 if(Q('#cc-single-nav-style'))return;
 const s=document.createElement('style');s.id='cc-single-nav-style';s.textContent=`
/* Una sola navegación visible: sidebar */
#ccxNav,#ccxSync,[data-cp-main-tabs],#cpExecutiveNav,.cp-main-tabs{display:none!important;visibility:hidden!important;pointer-events:none!important}
/* Los botones administrativos originales se conservan como motores internos y se exponen por el sidebar. */
#ccTeamBtn,#ccAccessRequestsBtn,#ccSecurityBtn{display:none!important}
/* Una notificación nunca debe bloquear botones o navegación. */
.toast{pointer-events:none!important}
/* Evita que la columna de contenido invada la barra lateral. */
.cc-shell{position:relative!important}.cc-app-column{min-width:0!important;position:relative!important;z-index:1!important}.cc-sidebar{position:relative!important;z-index:30!important;flex:0 0 auto!important}
.cc-sidebar .cc-nav-admin{margin-top:4px}
.cc-side-btn[data-route="transparencia"] .cc-side-icon{font-weight:900}
@media(max-width:860px){.cc-sidebar{position:fixed!important;z-index:1000!important}.cc-sidebar-overlay{z-index:999!important}}
`;
 document.head.appendChild(s);
}

function driveExecutive(section){
 requestedExecutive=section;
 try{localStorage.setItem('cc_exec_section_v2',section)}catch{}
 const nav=Q('#ccxNav');
 const btn=nav?.querySelector(`[data-ccx="${section}"]`);
 if(btn){
  try{btn.click();setTimeout(queue,0);return true}catch{}
 }
 try{
  if(typeof view!=='undefined'){
   if(section==='budget'){view.screen='budgetPortfolio';view.projectId=null}
   else{view.screen='projects';view.projectId=null;view.tab='summary'}
  }
  if(typeof renderApp==='function')renderApp();
  setTimeout(queue,0);
  return true;
 }catch(e){console.warn('No se pudo cambiar de sección ejecutiva.',e);return false}
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
 let req=nav.querySelector('[data-route="solicitudes"]');
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
 if(s==='projects'){
  const current=requestedExecutive||executiveSection();
  return current==='projects'?'proyectos':'inicio';
 }
 return'';
}
function syncActive(sidebar){
 const r=activeRoute();
 QA('.cc-side-btn',sidebar).forEach(b=>{
  const should=b.dataset.route===r;
  if(b.classList.contains('active')!==should)b.classList.toggle('active',should);
 });
}
function watchSidebar(sidebar){
 if(!NativeObserver||observedSidebar===sidebar)return;
 sideObserver?.disconnect?.();observedSidebar=sidebar;
 sideObserver=new NativeObserver(mutations=>{
  if(cleaning)return;
  for(const m of mutations){
   if(m.type==='attributes'&&m.attributeName==='class'&&m.target?.matches?.('.cc-side-btn')){queue();break}
  }
 });
 sideObserver.observe(sidebar,{subtree:true,attributes:true,attributeFilter:['class']});
}

function sanitizeLegacy(){
 const legacy=QA('#ccxNav,#ccxSync,[data-cp-main-tabs],#cpExecutiveNav,.cp-main-tabs');
 for(const el of legacy){el.setAttribute('aria-hidden','true');el.setAttribute('inert','');}
 QA('[data-tr-nav],[data-tr-exec]').forEach(el=>{if(!el.closest('#ccSidebar')){el.setAttribute('aria-hidden','true');el.setAttribute('inert','')}});
}

function ensure(){
 if(cleaning)return;cleaning=true;
 try{
  css();sanitizeLegacy();
  const side=Q('#ccSidebar');if(!side)return;
  ensureTransparency(side);ensureAdmin(side);watchSidebar(side);syncActive(side);
 }finally{cleaning=false}
}
function queue(){if(queued)return;queued=true;const run=()=>{queued=false;ensure()};(window.requestAnimationFrame||setTimeout)(run)}

document.addEventListener('click',event=>{
 const b=event.target.closest?.('#ccSidebar .cc-side-btn[data-route]');if(!b)return;
 const r=b.dataset.route;
 if(r==='inicio'||r==='proyectos'||r==='presupuesto'||r==='transparencia'||r==='usuarios'||r==='solicitudes'||r==='seguridad'){
  event.preventDefault();event.stopImmediatePropagation();
  if(r==='inicio')driveExecutive('home');
  else if(r==='proyectos')driveExecutive('projects');
  else if(r==='presupuesto')driveExecutive('budget');
  else if(r==='transparencia'){
   requestedExecutive='transparency';
   if(typeof window.__ccOpenTransparencyDirect==='function')window.__ccOpenTransparencyDirect();
   else{try{view.screen='transparency';view.projectId=null;view.tab='summary';renderApp()}catch{}}
  }
  else if(r==='usuarios'){
   if(typeof window.adminUsersModal==='function')window.adminUsersModal();else Q('#ccTeamBtn')?.click();
  }
  else if(r==='solicitudes'){
   const original=Q('#ccAccessRequestsBtn');if(original)original.click();else toastSafe('No hay solicitudes pendientes o el control todavía se está cargando.');
  }
  else if(r==='seguridad'){
   if(typeof window.securityCenterModal==='function')window.securityCenterModal();else Q('#ccSecurityBtn')?.click();
  }
  // Marca la ruta al instante y vuelve a comprobar después del render heredado.
  syncActive(Q('#ccSidebar'));
  setTimeout(queue,0);setTimeout(queue,40);setTimeout(queue,180);return;
 }
},true);

if(NativeObserver)new NativeObserver(queue).observe(Q('#app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:route-changed',queue);
setTimeout(ensure,0);setTimeout(ensure,250);setTimeout(ensure,900);
window.__ccSingleNav={refresh:ensure,driveExecutive};
})();