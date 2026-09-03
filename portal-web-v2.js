/* CONTROL CONTRACTUAL · PORTAL WEB V3 · ESTABLE
   Capa de navegación y experiencia web. No sustituye la lógica existente. */
(()=>{
'use strict';
if(window.__CC_PORTAL_WEB_V3__)return;window.__CC_PORTAL_WEB_V3__=true;window.__CC_PORTAL_WEB_V2__=true;

const $q=(s,r=document)=>r.querySelector(s);
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let enhancing=false,observerQueued=false;
const setText=(el,value)=>{if(!el)return;const next=String(value??'');if(el.textContent!==next)el.textContent=next};

function currentScreen(){
  try{return typeof view!=='undefined'?view.screen:'projects'}catch{return'projects'}
}
function currentTab(){
  try{return typeof view!=='undefined'?view.tab:'summary'}catch{return'summary'}
}
function goProjects(){
  try{view.screen='projects';view.projectId=null;view.tab='summary';view.trash=false;if(typeof renderApp==='function')renderApp()}catch(e){console.warn(e)}
}
function goBudget(){
  try{view.screen='budgetPortfolio';view.projectId=null;if(typeof renderApp==='function')renderApp()}catch(e){console.warn(e)}
}
function openProjectTab(title,tab){
  try{
    if(typeof dashboardProjectPicker==='function')return dashboardProjectPicker(title,null,(p)=>{view.projectId=p.id;view.screen='project';view.tab=tab;renderApp()});
    goProjects();
  }catch(e){console.warn(e)}
}
function quick(action){try{if(typeof dashboardQuickAction==='function')dashboardQuickAction(action)}catch(e){console.warn(e)}}
function showAudit(){try{if(typeof auditModal==='function')auditModal()}catch(e){console.warn(e)}}
function showArchitecture(){
  const html=`<div class="cc-architecture">
    <div class="cc-arch-intro"><b>Arquitectura de Control Contractual</b><br>La página mantiene el tema de gestión integral de proyectos municipales. Los canales y servicios auxiliares apoyan el expediente; Supabase continúa como base principal del sistema.</div>
    <div class="cc-arch-flow">
      <div class="cc-arch-node"><h3>Supervisor / Usuario autorizado</h3><p>Consulta proyectos, registra visitas, estimaciones, garantías, observaciones y genera informes.</p><ul><li>Portal Web</li><li>Telegram para captura y consultas</li><li>Uso desde PC, tablet o celular</li></ul></div>
      <div class="cc-arch-arrow">→</div>
      <div class="cc-arch-node primary"><h3>Control Contractual</h3><p>Centro operativo que organiza la información técnica, contractual y financiera por expediente.</p><ul><li>Proyectos y contratos</li><li>Pagos / estimaciones</li><li>Visitas y bitácora</li><li>Garantías, alertas y reportes</li></ul></div>
      <div class="cc-arch-arrow">→</div>
      <div class="cc-arch-node green"><h3>Supabase · Base principal</h3><p>Autenticación, persistencia y sincronización de los expedientes del sistema.</p><ul><li>Datos estructurados</li><li>Usuarios y permisos</li><li>Trazabilidad</li></ul></div>
    </div>
    <div class="cc-arch-services">
      <div class="cc-arch-service"><b>Telegram</b><span>Canal de campo y entrada de evidencias.</span></div>
      <div class="cc-arch-service"><b>Google Sheets / Apps Script</b><span>Sincronización y flujos auxiliares cuando corresponda.</span></div>
      <div class="cc-arch-service"><b>Gemini / IA</b><span>Análisis asistido, estructuración y apoyo documental con revisión humana.</span></div>
      <div class="cc-arch-service"><b>Drive / AppSheet</b><span>Apoyo documental y consulta móvil dentro del ecosistema del proyecto.</span></div>
    </div>
    <div class="cc-arch-node gold"><h3>Regla operativa</h3><p><b>REGISTRAR UNA VEZ → UTILIZAR EN TODO EL SISTEMA.</b> La IA organiza y propone; las decisiones técnicas, contractuales y financieras continúan bajo revisión del supervisor.</p></div>
  </div>`;
  try{if(typeof openModal==='function')openModal('Arquitectura e integraciones del sistema',html)}catch(e){console.warn(e)}
}
function showFieldMode(){
  const html=`<div class="cc-architecture"><div class="cc-arch-intro"><b>Modo de trabajo en campo</b><br>Accesos rápidos adaptados al mismo Control Contractual. No se crea otra aplicación ni otro tema.</div><div class="cc-field-mode">
    <button class="cc-field-action" data-field="visit"><b>📍 Registrar visita</b><span>Seleccionar proyecto y abrir el módulo de supervisión.</span></button>
    <button class="cc-field-action" data-field="estimate"><b>💳 Nueva estimación</b><span>Registrar avance financiero o pago en el expediente.</span></button>
    <button class="cc-field-action" data-field="guarantee"><b>🛡️ Garantía</b><span>Registrar vigencia y control contractual.</span></button>
    <button class="cc-field-action" data-field="report"><b>📄 Generar informe</b><span>Abrir el módulo documental del proyecto.</span></button>
    <button class="cc-field-action" data-field="projects"><b>🏗️ Proyectos</b><span>Volver al portafolio de obras bajo control.</span></button>
    <button class="cc-field-action" data-field="architecture"><b>⌘ Arquitectura</b><span>Ver cómo se relacionan los componentes del sistema.</span></button>
  </div></div>`;
  try{
    if(typeof openModal!=='function')return;
    const modal=openModal('Accesos rápidos de supervisión',html);
    modal.querySelectorAll('[data-field]').forEach(b=>b.onclick=()=>{const a=b.dataset.field;modal.remove();if(a==='visit')quick('visit');else if(a==='estimate')quick('estimate');else if(a==='guarantee')quick('guarantee');else if(a==='report')quick('report');else if(a==='architecture')showArchitecture();else goProjects()});
  }catch(e){console.warn(e)}
}
function setActive(sidebar){
  const screen=currentScreen(),tab=currentTab();
  sidebar.querySelectorAll('.cc-side-btn').forEach(b=>{
    const route=b.dataset.route;
    let active=false;
    if(route==='inicio'||route==='proyectos')active=screen==='projects'&&route==='inicio';
    if(route==='presupuesto')active=screen==='budgetPortfolio';
    if(screen==='project'){
      if(route==='contratos')active=tab==='contract'||tab==='controls';
      else if(route==='pagos')active=tab==='estimates'||tab==='payments';
      else if(route==='visitas')active=tab==='visits';
      else if(route==='garantias')active=tab==='guarantees';
      else if(route==='reportes')active=tab==='reports';
      else if(route==='proyectos')active=tab==='summary'||tab==='procurement'||tab==='changes';
    }
    b.classList.toggle('active',active);
  });
  const count=$q('.rail-attention-count')?.textContent?.trim()||$q('.followup-count')?.textContent?.trim()||'';
  const badge=sidebar.querySelector('[data-alert-badge]');if(badge){setText(badge,count||'0');badge.style.display=count&&count!=='0'?'grid':'none'}
}
function createSidebar(shell){
  const aside=document.createElement('aside');aside.className='cc-sidebar';aside.id='ccSidebar';
  aside.innerHTML=`
    <div class="cc-sidebar-brand"><div class="cc-sidebar-mark">CC</div><div><strong>Control Contractual</strong><small>Gestión integral de proyectos municipales</small></div></div>
    <div class="cc-sidebar-motto">Registrar una vez · utilizar en todo el sistema.</div>
    <div class="cc-nav-label">Gestión</div>
    <nav class="cc-side-nav">
      <button class="cc-side-btn" data-route="inicio"><span class="cc-side-icon">⌂</span><span>Inicio</span></button>
      <button class="cc-side-btn" data-route="proyectos"><span class="cc-side-icon">▦</span><span>Proyectos</span></button>
      <button class="cc-side-btn" data-route="contratos"><span class="cc-side-icon">▤</span><span>Contratos</span></button>
      <button class="cc-side-btn" data-route="presupuesto"><span class="cc-side-icon">L</span><span>Presupuesto</span></button>
      <button class="cc-side-btn" data-route="pagos"><span class="cc-side-icon">$</span><span>Pagos / Estimaciones</span></button>
      <button class="cc-side-btn" data-route="visitas"><span class="cc-side-icon">⌖</span><span>Visitas de obra</span></button>
      <button class="cc-side-btn" data-route="garantias"><span class="cc-side-icon">◇</span><span>Garantías</span></button>
      <button class="cc-side-btn" data-route="reportes"><span class="cc-side-icon">↗</span><span>Reportes</span></button>
    </nav>
    <div class="cc-nav-label">Control</div>
    <nav class="cc-side-nav">
      <button class="cc-side-btn" data-route="alertas"><span class="cc-side-icon">!</span><span>Alertas y seguimiento</span><span class="cc-nav-badge" data-alert-badge style="display:none">0</span></button>
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
  aside.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>{
    const route=b.dataset.route;
    closeMobile();
    if(route==='inicio'||route==='proyectos')goProjects();
    else if(route==='presupuesto')goBudget();
    else if(route==='contratos')openProjectTab('Abrir contrato de proyecto','contract');
    else if(route==='pagos')openProjectTab('Pagos y estimaciones','estimates');
    else if(route==='visitas')openProjectTab('Visitas de obra','visits');
    else if(route==='garantias')openProjectTab('Garantías contractuales','guarantees');
    else if(route==='reportes')openProjectTab('Informes del proyecto','reports');
    else if(route==='alertas'){goProjects();setTimeout(()=>{($q('.rail-card')||$q('.followup-center'))?.scrollIntoView({behavior:'smooth',block:'start'})},180)}
    else if(route==='auditoria')showAudit();
    else if(route==='campo')showFieldMode();
    else if(route==='arquitectura')showArchitecture();
    else if(route==='logout')$q('#logoutBtn')?.click();
  }));
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
  search.addEventListener('keydown',e=>{if(e.key!=='Enter')return;try{view.search=search.value.trim();view.screen='projects';view.projectId=null;renderApp()}catch{}});
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
    let sidebar=shell.querySelector('#ccSidebar')||createSidebar(shell);
    let column=shell.querySelector('.cc-app-column');
    if(!column){column=document.createElement('div');column.className='cc-app-column';[...shell.children].filter(x=>x!==sidebar).forEach(x=>column.appendChild(x));shell.appendChild(column)}
    if(!column.querySelector('#ccCommandbar'))createCommandbar(column);
    createOverlay();syncIdentity(sidebar);setActive(sidebar);
  }finally{enhancing=false}
}
function queueEnhance(){
  if(observerQueued)return;observerQueued=true;
  const run=()=>{observerQueued=false;enhance()};
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(run);
}

if(NativeObserver){new NativeObserver(queueEnhance).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true})}
window.addEventListener('resize',()=>{if(innerWidth>860)closeMobile()},{passive:true});
setTimeout(enhance,0);setTimeout(enhance,350);setTimeout(enhance,1200);
})();
