/* CONTROL CONTRACTUAL · PORTAL WEB V4 · PRESENTACIÓN ESTABLE
   Construye la estructura visual del portal. La navegación principal pertenece
   a ui-navigation-single-source-v1.js y los centros a portal-route-bridge-v1.js. */
(()=>{
'use strict';
if(window.__CC_PORTAL_WEB_V4__)return;
window.__CC_PORTAL_WEB_V4__=true;
window.__CC_PORTAL_WEB_V3__=true;
window.__CC_PORTAL_WEB_V2__=true;

const $q=(s,r=document)=>r.querySelector(s);
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let enhancing=false,observerQueued=false;
const setText=(el,value)=>{if(!el)return;const next=String(value??'');if(el.textContent!==next)el.textContent=next};

function openProjects(){
  try{
    if(window.__ccSingleNav?.goPortfolio)return window.__ccSingleNav.goPortfolio('proyectos');
    view.screen='projects';view.projectId=null;view.tab='summary';view.trash=false;
    if(typeof renderApp==='function')renderApp();
  }catch(e){console.warn(e)}
}
function quick(action){try{if(typeof dashboardQuickAction==='function')dashboardQuickAction(action)}catch(e){console.warn(e)}}
function showArchitecture(){
  const html=`<div class="cc-architecture cc-architecture-compact">
    <div class="cc-arch-flow">
      <div class="cc-arch-node"><h3>Usuario / Campo</h3><p>PC, tablet, celular y Telegram.</p></div>
      <div class="cc-arch-arrow">→</div>
      <div class="cc-arch-node primary"><h3>Control Contractual</h3><p>Proyectos · contratos · pagos · visitas · garantías · reportes.</p></div>
      <div class="cc-arch-arrow">→</div>
      <div class="cc-arch-node green"><h3>Supabase</h3><p>Datos, usuarios, permisos, archivos y trazabilidad.</p></div>
    </div>
    <div class="cc-arch-services cc-arch-services-compact">
      <div class="cc-arch-service"><b>Telegram</b><span>Captura y consulta de campo.</span></div>
      <div class="cc-arch-service"><b>Drive / Sheets</b><span>Apoyo documental y sincronización auxiliar.</span></div>
      <div class="cc-arch-service"><b>IA</b><span>Análisis y apoyo documental con revisión humana.</span></div>
    </div>
    <div class="cc-arch-rule">Registrar una vez · utilizar en todo el sistema.</div>
  </div>`;
  try{if(typeof openModal==='function')openModal('Arquitectura',html)}catch(e){console.warn(e)}
}
function showFieldMode(){
  const html=`<div class="cc-field-shell"><div class="cc-field-intro"><b>Modo campo</b><span>Accesos grandes para trabajar desde celular o tablet.</span></div><div class="cc-field-mode">
    <button class="cc-field-action primary" data-field="visit"><b>⌖ Registrar visita</b><span>Fotos, avance, observaciones y evidencia.</span></button>
    <button class="cc-field-action" data-field="projects"><b>▦ Buscar proyecto</b><span>Abrir rápidamente el expediente de obra.</span></button>
    <button class="cc-field-action" data-field="alerts"><b>! Deficiencias</b><span>Revisar observaciones pendientes y seguimiento.</span></button>
    <button class="cc-field-action" data-field="estimate"><b>$ Nueva estimación</b><span>Registrar avance financiero desde el expediente.</span></button>
  </div></div>`;
  try{
    if(typeof openModal!=='function')return;
    const modal=openModal('Modo campo',html);
    modal.querySelectorAll('[data-field]').forEach(b=>b.onclick=()=>{
      const a=b.dataset.field;modal.remove();
      if(a==='visit')quick('visit');
      else if(a==='estimate')quick('estimate');
      else if(a==='alerts'){try{window.__ccAlertsCenter?.open?.()}catch{}}
      else openProjects();
    });
  }catch(e){console.warn(e)}
}
function syncBadge(sidebar){
  const count=$q('.rail-attention-count')?.textContent?.trim()||$q('.followup-count')?.textContent?.trim()||'';
  const badge=sidebar.querySelector('[data-alert-badge]');
  if(badge){setText(badge,count||'0');badge.style.display=count&&count!=='0'?'grid':'none'}
}
function createSidebar(shell){
  const aside=document.createElement('aside');aside.className='cc-sidebar';aside.id='ccSidebar';
  aside.innerHTML=`
    <div class="cc-sidebar-brand"><div class="cc-sidebar-mark">CC</div><div><strong>Control Contractual</strong><small>Gestión técnica y contractual de proyectos</small></div></div>
    <div class="cc-sidebar-motto">Registrar una vez · utilizar en todo el sistema.</div>
    <div class="cc-nav-label">Gestión</div>
    <nav class="cc-side-nav">
      <button class="cc-side-btn" data-route="inicio"><span class="cc-side-icon">⌂</span><span>Inicio</span></button>
      <button class="cc-side-btn" data-route="proyectos"><span class="cc-side-icon">▦</span><span>Proyectos</span></button>
      <button class="cc-side-btn" data-route="contratos"><span class="cc-side-icon">▤</span><span>Contratos</span></button>
      <button class="cc-side-btn" data-route="presupuesto"><span class="cc-side-icon">▧</span><span>Presupuesto</span></button>
      <button class="cc-side-btn" data-route="pagos"><span class="cc-side-icon">$</span><span>Pagos / Estimaciones</span></button>
      <button class="cc-side-btn" data-route="visitas"><span class="cc-side-icon">⌖</span><span>Visitas de obra</span></button>
      <button class="cc-side-btn" data-route="garantias"><span class="cc-side-icon">◇</span><span>Garantías</span></button>
      <button class="cc-side-btn" data-route="reportes"><span class="cc-side-icon">↗</span><span>Reportes</span></button>
    </nav>
    <div class="cc-nav-label">Control</div>
    <nav class="cc-side-nav">
      <button class="cc-side-btn" data-route="alertas"><span class="cc-side-icon">!</span><span>Deficiencias y seguimiento</span><span class="cc-nav-badge" data-alert-badge style="display:none">0</span></button>
      <button class="cc-side-btn" data-route="auditoria"><span class="cc-side-icon">✓</span><span>Auditoría</span></button>
      <button class="cc-side-btn" data-route="campo"><span class="cc-side-icon">⚒</span><span>Modo campo</span></button>
      <button class="cc-side-btn" data-route="arquitectura"><span class="cc-side-icon">⌘</span><span>Arquitectura</span></button>
    </nav>
    <div class="cc-sidebar-bottom">
      <div class="cc-sync-box"><div class="cc-sync-line"><i class="cc-sync-dot"></i><span>SUPABASE · <b data-cc-sync>Conectado</b></span></div></div>
      <div class="cc-profile-box"><strong data-cc-user>Usuario</strong><small data-cc-role>Acceso autorizado</small></div>
      <button class="cc-sidebar-logout" data-route="logout">↪ Cerrar sesión</button>
    </div>`;
  shell.insertBefore(aside,shell.firstChild);

  /* El portal solo atiende acciones auxiliares que no son rutas de expediente.
     Inicio, Proyectos, Presupuesto y centros globales quedan sin listener local. */
  aside.querySelector('[data-route="campo"]')?.addEventListener('click',()=>{closeMobile();showFieldMode()});
  aside.querySelector('[data-route="arquitectura"]')?.addEventListener('click',()=>{closeMobile();showArchitecture()});
  aside.querySelector('[data-route="logout"]')?.addEventListener('click',()=>{closeMobile();$q('#logoutBtn')?.click()});
  return aside;
}
function createCommandbar(column){
  const bar=document.createElement('div');bar.className='cc-commandbar';bar.id='ccCommandbar';
  bar.innerHTML=`<button class="cc-mobile-toggle" id="ccMobileToggle" aria-label="Abrir menú">☰</button><div class="cc-global-search"><input id="ccGlobalSearch" placeholder="Buscar proyecto, código, ubicación o estado…" autocomplete="off"></div><div class="cc-command-actions"><button class="cc-command-btn primary" data-command="project">＋ <span>Nuevo proyecto</span></button><button class="cc-command-btn" data-command="visit">⌖ <span>Nueva visita</span></button><button class="cc-command-btn" data-command="estimate">$ <span>Nueva estimación</span></button><button class="cc-command-btn gold" data-command="report">↗ <span>Generar informe</span></button></div>`;
  const top=column.querySelector('.topbar');top?.insertAdjacentElement('afterend',bar);
  bar.querySelector('#ccMobileToggle')?.addEventListener('click',openMobile);
  bar.querySelectorAll('[data-command]').forEach(b=>b.onclick=()=>{const a=b.dataset.command;if(a==='project'){try{if(typeof projectModal==='function')projectModal()}catch{}}else quick(a)});
  const search=bar.querySelector('#ccGlobalSearch');
  try{search.value=typeof view!=='undefined'?(view.search||''):''}catch{}
  search.addEventListener('input',()=>{
    const local=$q('#projectSearch');if(local){local.value=search.value;local.dispatchEvent(new Event('input',{bubbles:true}))}
  });
  search.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    try{view.search=search.value.trim();view.screen='projects';view.projectId=null;renderApp();setTimeout(()=>window.__ccSingleNav?.refresh?.(),0)}catch{}
  });
  return bar;
}
function createOverlay(){let o=$q('#ccSidebarOverlay');if(o)return o;o=document.createElement('div');o.id='ccSidebarOverlay';o.className='cc-sidebar-overlay';o.onclick=closeMobile;document.body.appendChild(o);return o}
function openMobile(){createOverlay().classList.add('show');$q('#ccSidebar')?.classList.add('open')}
function closeMobile(){$q('#ccSidebar')?.classList.remove('open');$q('#ccSidebarOverlay')?.classList.remove('show')}
function syncIdentity(sidebar){
  const user=$q('.topbar .userbox b')?.textContent?.trim();const role=$q('.topbar .userbox small')?.textContent?.trim();const sync=$q('.topbar .cloud-pill b')?.textContent?.trim();
  if(user)setText(sidebar.querySelector('[data-cc-user]'),user);
  if(role)setText(sidebar.querySelector('[data-cc-role]'),role);
  if(sync)setText(sidebar.querySelector('[data-cc-sync]'),sync);
}
function enhance(){
  if(enhancing)return;enhancing=true;
  try{
    const app=$q('#app'),shell=app?.querySelector('.shell');
    if(!shell||app.querySelector('.auth'))return;
    document.body.classList.add('cc-portal-v2');shell.classList.add('cc-shell');
    const sidebar=shell.querySelector('#ccSidebar')||createSidebar(shell);
    let column=shell.querySelector('.cc-app-column');
    if(!column){column=document.createElement('div');column.className='cc-app-column';[...shell.children].filter(x=>x!==sidebar).forEach(x=>column.appendChild(x));shell.appendChild(column)}
    if(!column.querySelector('#ccCommandbar'))createCommandbar(column);
    createOverlay();syncIdentity(sidebar);syncBadge(sidebar);
    window.__ccSingleNav?.refresh?.();
  }finally{enhancing=false}
}
function queueEnhance(){
  if(observerQueued)return;observerQueued=true;
  const run=()=>{observerQueued=false;enhance()};
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(run);
}

if(NativeObserver)new NativeObserver(queueEnhance).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('resize',()=>{if(innerWidth>860)closeMobile()},{passive:true});
setTimeout(enhance,0);setTimeout(enhance,350);setTimeout(enhance,1200);
})();
