/* CONTROL CONTRACTUAL · DASHBOARD SIMPLIFICADO V6 · ESTABLE
   Mejora de experiencia web sobre el dashboard existente, sin duplicar datos ni alterar Supabase. */
(()=>{
'use strict';
if(window.__CC_DASHBOARD_SIMPLIFIED_V6__)return;window.__CC_DASHBOARD_SIMPLIFIED_V6__=true;window.__CC_DASHBOARD_SIMPLIFIED_V5__=true;window.__CC_DASHBOARD_SIMPLIFIED_V4__=true;
const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const setText=(el,value)=>{if(!el)return;const next=String(value??'');if(el.textContent!==next)el.textContent=next};
const PORTFOLIO_VIEW_KEY='cc_portfolio_view_v4';
let working=false,observerQueued=false;
let portfolioView=(()=>{const saved=localStorage.getItem(PORTFOLIO_VIEW_KEY);if(['executive','cards','table'].includes(saved))return saved;return localStorage.getItem('cp_dashboard_view_v3')==='compact'?'executive':'cards'})();

function safeView(){try{return typeof view!=='undefined'?view:null}catch{return null}}
function safeDB(){try{return typeof db!=='undefined'?db:null}catch{return null}}
function currentName(){
  try{const u=typeof currentUser==='function'?currentUser():null;if(u?.name)return String(u.name)}catch{}
  return Q('[data-cc-user]')?.textContent?.trim()||'Usuario';
}
function spanishDate(){
  const t=new Date().toLocaleDateString('es-HN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  return t.charAt(0).toUpperCase()+t.slice(1);
}
function activeProjects(){return (safeDB()?.projects||[]).filter(p=>!p.deletedAt)}
function count(re){return activeProjects().filter(p=>re.test(String(p.status||''))).length}

function regroupSidebar(){
  const side=Q('#ccSidebar');if(!side||side.dataset.groupedV4==='1')return;
  const buttons=QA('.cc-side-btn[data-route]',side);if(!buttons.length)return;
  const byRoute=new Map(buttons.map(b=>[b.dataset.route,b]));
  buttons.forEach(b=>b.remove());
  QA(':scope > .cc-nav-label,:scope > .cc-side-nav',side).forEach(x=>x.remove());
  const bottom=Q('.cc-sidebar-bottom',side);
  const groups=[
    ['Control ejecutivo',['inicio','proyectos','alertas']],
    ['Contratos y finanzas',['contratos','presupuesto','pagos','garantias']],
    ['Supervisión',['visitas','reportes']],
    ['Sistema',['auditoria','campo','arquitectura']]
  ];
  groups.forEach(([title,routes])=>{
    const label=document.createElement('div');label.className='cc-nav-label';label.textContent=title;
    const nav=document.createElement('nav');nav.className='cc-side-nav';
    routes.forEach(r=>{const b=byRoute.get(r);if(b)nav.appendChild(b)});
    side.insertBefore(label,bottom);side.insertBefore(nav,bottom);
  });
  side.dataset.groupedV4='1';
  const projects=byRoute.get('proyectos');
  projects?.addEventListener('click',()=>setTimeout(()=>Q('.projects-board')?.scrollIntoView({behavior:'smooth',block:'start'}),180));
}

function welcome(){
  const v=safeView(),content=Q('#content');
  if(!v||v.screen!=='projects'||v.trash||!content||Q('.cc-dashboard-welcome-v4',content))return;
  const first=(currentName().split(/\s+/)[0]||'Usuario').replace(/[^\p{L}\p{N}.'-]/gu,'');
  const execution=count(/ejecuci/i),alerts=Number(Q('.rail-attention-count')?.textContent||0),visits=(safeDB()?.visits||[]).length;
  const box=document.createElement('section');box.className='cc-dashboard-welcome-v4';
  box.innerHTML=`<div><p class="cc-welcome-kicker">CONTROL CONTRACTUAL · SANTA MARÍA, LA PAZ</p><h2>¡Hola, ${first}!</h2><p class="cc-welcome-date">${spanishDate()}</p></div><div class="cc-welcome-summary"><span role="button" tabindex="0" class="cc-summary-action" data-cc-summary-action="execution" aria-label="Ver proyectos en ejecución"><b>${execution}</b> en ejecución</span><span role="button" tabindex="0" class="cc-summary-action ${alerts?'attention':''}" data-cc-summary-action="review" aria-label="Ver asuntos por revisar"><b>${alerts}</b> por revisar</span><span role="button" tabindex="0" class="cc-summary-action" data-cc-summary-action="visits" aria-label="Ver visitas registradas"><b>${visits}</b> visitas registradas</span></div>`;
  content.insertBefore(box,content.firstChild);
}

function currentMainRoute(){return String(document.body?.dataset?.ccMainRoute||window.__ccMainRoute||'').toLowerCase()}
function homeHero(){
  const content=Q('#content');if(!content||currentMainRoute()!=='inicio'||Q('.cc-home-hero-v7',content))return;
  const overview=Q('.exec-overview',content);if(!overview)return;
  const total=Q('.exec-money strong',overview)?.textContent?.trim()||'L. 0.00',active=activeProjects().length;
  const estimatedPct=Q('.portfolio-ring-content b',overview)?.textContent?.trim()||'0.00%',labels=QA('.exec-bar-label',overview);
  const estimated=Q('b',labels[0])?.textContent?.trim()||'L. 0.00',paidPct=Q('b',labels[1])?.textContent?.trim()||'0.00%';
  const paid=Q('.exec-kpis .exec-kpi:nth-child(4) strong',content)?.textContent?.trim()||'L. 0.00';
  const guaranteeRow=QA('.rail-state-row',content).find(x=>/garant/i.test(x.textContent||'')),guarantees=Q('b',guaranteeRow)?.textContent?.trim()||'0';
  const section=document.createElement('section');section.className='cc-home-hero-v7';
  section.innerHTML=`<div class="cc-home-copy-v7"><span class="cc-home-chip-v7">●&nbsp; CENTRO DE CONTROL</span><h2>Una vista clara de cada proyecto, su dinero y sus compromisos.</h2><p>Consulta rápidamente el estado contractual, financiero y documental. Los expedientes permanecen vinculados y sincronizados en Supabase para trabajar desde PC, tablet o celular.</p></div><div class="cc-home-stats-v7"><article><small>Portafolio registrado</small><strong>${H(total)}</strong><span>${active} expedientes activos</span></article><article><small>Avance estimado global</small><strong>${H(estimatedPct)}</strong><span>${H(estimated)} certificado</span></article><article><small>Desembolso global</small><strong>${H(paidPct)}</strong><span>${H(paid)} pagado</span></article><article><small>Alertas de garantía</small><strong>${H(guarantees)}</strong><span>${Number(guarantees)?'Requieren seguimiento':'Sin alertas activas'}</span></article></div>`;
  overview.insertAdjacentElement('beforebegin',section);
}

function lifecycle(){
  const v=safeView(),content=Q('#content');
  if(!v||v.screen!=='projects'||v.trash||!content||Q('.cc-lifecycle-v4',content))return;
  const workspace=Q('.dashboard-workspace-v3',content);if(!workspace)return;
  const stages=[
    ['1','Planificación',/planific/i,'Planificación'],
    ['2','Contratación',/contrat/i,'contratación'],
    ['3','Adjudicado',/adjudic/i,'Adjudicado'],
    ['4','Ejecución',/ejecuci/i,'En ejecución'],
    ['5','Suspendido',/suspend/i,'Suspendido'],
    ['6','Finalizado',/finaliz/i,'Finalizado'],
    ['7','Cerrado',/cerrad/i,'Cerrado']
  ];
  const section=document.createElement('section');section.className='cc-lifecycle-v4';
  section.innerHTML=`<div class="cc-life-head"><div><p class="cc-welcome-kicker">CICLO DE VIDA DEL PROYECTO</p><h3>Del expediente a la finalización</h3><p>Cada registro conserva su trazabilidad técnica, contractual y financiera.</p></div><button class="cc-life-clear" type="button" ${v.search?'':'hidden'}>Ver todos</button></div><div class="cc-life-track">${stages.map(([n,label,re,q])=>{const c=count(re),special=/Suspendido/.test(label)?' warn':'';return `<button class="cc-life-step${special}${c?' has-data':''}" type="button" data-life-query="${q}"><span class="cc-life-node">${n}</span><span class="cc-life-name">${label}</span><b>${c}</b></button>`}).join('')}</div>`;
  workspace.insertAdjacentElement('afterend',section);
  QA('[data-life-query]',section).forEach(b=>b.onclick=()=>{try{view.search=b.dataset.lifeQuery;view.screen='projects';view.projectId=null;view.trash=false;renderApp()}catch{}});
  Q('.cc-life-clear',section)?.addEventListener('click',()=>{try{view.search='';renderApp()}catch{}});
}

function rememberPortfolioView(mode){portfolioView=mode;localStorage.setItem(PORTFOLIO_VIEW_KEY,mode)}
function cardData(card){
  const metrics=QA('.v3-metric b',card),progress=QA('.mini-progress-label b',card),sub=QA('.project-v3-sub span',card);
  return{
    id:Q('[data-open]',card)?.dataset.open||'',code:Q('.project-v3-code',card)?.textContent?.trim()||'—',name:Q('h3',card)?.textContent?.trim()||'Proyecto',status:Q('.status',card)?.textContent?.trim()||'—',statusClass:Q('.status',card)?.className||'status',location:(sub[0]?.textContent||'').replace(/^\s*⌖\s*/,'').trim()||'Sin ubicación',contract:(sub[1]?.textContent||'').replace(/^\s*Contrato:\s*/i,'').trim()||'Pendiente',final:(sub[2]?.textContent||'').replace(/^\s*Final:\s*/i,'').trim()||'—',contractor:Q('.project-v3-contractor b',card)?.textContent?.trim()||'No registrado',amount:metrics[0]?.textContent?.trim()||'—',estimated:metrics[1]?.textContent?.trim()||'0.00%',paid:metrics[2]?.textContent?.trim()||'0.00%',progress:progress[0]?.textContent?.trim()||'0.00%',time:progress[1]?.textContent?.trim()||'0.00%',health:Q('.health-tag',card)?.textContent?.trim()||'Sin evaluación',healthClass:Q('.health-tag',card)?.className||'health-tag'
  };
}
function openProject(id){if(!id)return;try{view.projectId=id;view.screen='project';view.tab='summary';renderApp()}catch(e){console.warn(e)}}
function renderPortfolioTable(grid,cards){
  const rows=cards.map(cardData);if(!rows.length)return;
  grid.classList.remove('compact');grid.classList.add('cc-portfolio-table-mode');
  grid.innerHTML=`<div class="cc-portfolio-table-v4"><div class="cc-pt-head"><span>Proyecto</span><span>Estado</span><span>Contratista / contrato</span><span>Monto contractual</span><span>Avance</span><span>Plazo</span><span></span></div>${rows.map(r=>`<div class="cc-pt-row" data-cc-pt-row="${H(r.id)}"><div class="cc-pt-project"><b>${H(r.code)}</b><strong>${H(r.name)}</strong><small>${H(r.location)}</small></div><div><span class="${H(r.statusClass)}">${H(r.status)}</span><small class="cc-pt-health ${/danger/.test(r.healthClass)?'danger':/warn/.test(r.healthClass)?'warn':''}">${H(r.health)}</small></div><div class="cc-pt-contract"><b>${H(r.contractor)}</b><small>Contrato ${H(r.contract)}</small></div><div class="cc-pt-money"><b>${H(r.amount)}</b><small>Estimado ${H(r.estimated)} · Pagado ${H(r.paid)}</small></div><div class="cc-pt-progress"><b>${H(r.progress)}</b><small>Físico / financiero</small></div><div class="cc-pt-time"><b>${H(r.time)}</b><small>Final ${H(r.final)}</small></div><div class="cc-pt-action"><button class="btn primary" type="button" data-cc-pt-open="${H(r.id)}">Abrir expediente →</button></div></div>`).join('')}</div>`;
  QA('[data-cc-pt-open]',grid).forEach(b=>b.onclick=()=>openProject(b.dataset.ccPtOpen));
}
function portfolioViews(){
  const v=safeView(),board=Q('.projects-board');if(!v||v.screen!=='projects'||v.trash||!board)return;
  const switcher=Q('.view-switch',board),grid=Q('.project-grid-v3',board);if(!switcher||!grid)return;
  const cardsBtn=Q('[data-dashboard-view="cards"]',switcher),executiveBtn=Q('[data-dashboard-view="compact"]',switcher);if(!cardsBtn||!executiveBtn)return;
  setText(cardsBtn,'▦ Tarjetas');setText(executiveBtn,'☰ Ejecutiva');
  let tableBtn=Q('[data-portfolio-view="table"]',switcher);
  if(!tableBtn){
    tableBtn=document.createElement('button');tableBtn.type='button';tableBtn.dataset.portfolioView='table';tableBtn.textContent='▤ Tabla';
    tableBtn.onclick=e=>{e.preventDefault();e.stopPropagation();rememberPortfolioView('table');setTimeout(enhance,0)};
    switcher.appendChild(tableBtn);
  }
  if(switcher.dataset.portfolioBound!=='1'){
    switcher.addEventListener('click',e=>{const b=e.target.closest?.('[data-dashboard-view]');if(!b)return;rememberPortfolioView(b.dataset.dashboardView==='compact'?'executive':'cards')},true);
    switcher.dataset.portfolioBound='1';
  }
  const countHost=Q('.board-controls',board);let badge=Q('.cc-portfolio-count-v4',countHost);
  if(!badge){badge=document.createElement('span');badge.className='cc-portfolio-count-v4';countHost.prepend(badge)}
  const currentCards=QA(':scope > .project-v3',grid);setText(badge,`${currentCards.length||QA('.cc-pt-row',grid).length} visibles`);
  executiveBtn.classList.toggle('active',portfolioView==='executive');cardsBtn.classList.toggle('active',portfolioView==='cards');tableBtn.classList.toggle('active',portfolioView==='table');
  if(portfolioView==='table'){if(!Q('.cc-portfolio-table-v4',grid)&&currentCards.length)renderPortfolioTable(grid,currentCards);return}
  grid.classList.remove('cc-portfolio-table-mode');
}

function dashboardStatus(status,attempt=0){
  const search=Q('#projectSearch');
  try{if(typeof view!=='undefined')view.search=''}catch{}
  if(search)search.value='';
  const selector='[data-status-filter="'+String(status||'all').replace(/"/g,'')+'"]';
  const button=QA(selector).find(el=>el.offsetParent!==null||el.getClientRects().length)||Q(selector);
  if(button){
    button.click();
    setTimeout(()=>Q('.projects-board')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
    return true;
  }
  if(attempt<3){
    const projects=Q('#ccSidebar [data-route="proyectos"]');
    if(projects){projects.click();setTimeout(()=>dashboardStatus(status,attempt+1),140);return true}
  }
  return false;
}
function dashboardRoute(route){
  const button=Q('#ccSidebar [data-route="'+String(route||'').replace(/"/g,'')+'"]');
  if(button){button.click();return true}
  return false;
}
function ensureDashboardNavigationStyle(){
  if(Q('#cc-dashboard-navigation-style'))return;
  const style=document.createElement('style');style.id='cc-dashboard-navigation-style';style.textContent='.cc-dashboard-nav-item{cursor:pointer!important}.cc-dashboard-nav-item:focus-visible{outline:2px solid #60a5fa;outline-offset:3px}';
  document.head.appendChild(style);
}
function bindDashboardNavigationItem(element,action,label){
  if(!element||element.dataset.ccNavBound==='1')return;
  element.dataset.ccNavBound='1';
  element.classList.add('cc-dashboard-nav-item');
  element.setAttribute('role','button');
  element.setAttribute('tabindex','0');
  if(label)element.setAttribute('aria-label',label);
  const go=()=>{
    if(action==='review'){
      const review=Q('#reviewIssuesBtn');
      if(review)review.click();else dashboardRoute('alertas');
    }else if(action.startsWith('status:'))dashboardStatus(action.slice(7));
    else if(action.startsWith('route:'))dashboardRoute(action.slice(6));
  };
  element.addEventListener('click',go);
  element.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();go()}
  });
}
function bindDashboardNavigation(){
  ensureDashboardNavigationStyle();
  QA('.exec-chips .exec-chip:not(.review-issues-chip)').forEach(element=>{
    const text=element.textContent.toLowerCase();
    const action=/ejecuci/.test(text)?'status:execution':/contrat|adjudic/.test(text)?'status:procurement':/finaliz|cerrad/.test(text)?'status:closed':'';
    if(action)bindDashboardNavigationItem(element,action,'Filtrar proyectos: '+element.textContent.trim());
  });
  QA('.cc-summary-action,.cc-welcome-summary > span').forEach(element=>{
    const action=element.dataset.ccSummaryAction||(
      /visita/.test(element.textContent.toLowerCase())?'visits':
      /revisar/.test(element.textContent.toLowerCase())?'review':
      /ejecuci/.test(element.textContent.toLowerCase())?'execution':''
    );
    if(action==='execution')bindDashboardNavigationItem(element,'status:execution','Ver proyectos en ejecución');
    else if(action==='review')bindDashboardNavigationItem(element,'review','Ver asuntos por revisar');
    else if(action==='visits')bindDashboardNavigationItem(element,'route:visitas','Ver visitas registradas');
  });
  QA('.exec-kpi').forEach(element=>{
    const text=element.textContent.toLowerCase();
    const action=/proyectos activos/.test(text)?'status:all':
      /monto contractual/.test(text)?'route:contratos':
      /total estimado|total pagado/.test(text)?'route:pagos':
      /alertas garantías/.test(text)?'route:garantias':'';
    if(action)bindDashboardNavigationItem(element,action,'Abrir '+text.split(/\s+/).slice(0,4).join(' '));
  });
  QA('.followup-mini').forEach(element=>{
    const text=element.textContent.toLowerCase();
    const action=/plazo/.test(text)?'route:alertas':
      /garant/.test(text)?'route:garantias':
      /observ/.test(text)?'route:visitas':
      /anticipo/.test(text)?'route:pagos':'';
    if(action)bindDashboardNavigationItem(element,action,'Abrir '+text.split(/\s+/).slice(0,3).join(' '));
  });
  QA('.rail-state-row').forEach(element=>{
    const text=element.textContent.toLowerCase();
    const action=/en ejecución/.test(text)?'status:execution':
      /contratación|adjudicación/.test(text)?'status:procurement':
      /finalizado|cerrado/.test(text)?'status:closed':
      /garantías con alerta/.test(text)?'route:garantias':
      /observaciones pendientes/.test(text)?'route:visitas':
      /anticipos por amortizar|estimaciones pendientes/.test(text)?'route:pagos':
      /otros estados/.test(text)?'status:all':'';
    if(action)bindDashboardNavigationItem(element,action,'Abrir '+text.split(/\s+/).slice(0,4).join(' '));
  });
}
function enhance(){if(working)return;working=true;try{regroupSidebar();welcome();homeHero();lifecycle();portfolioViews();bindDashboardNavigation()}finally{working=false}}
function queueEnhance(){
  if(observerQueued)return;observerQueued=true;
  const run=()=>{observerQueued=false;enhance()};
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(run);
}
if(NativeObserver)new NativeObserver(queueEnhance).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:data-changed',()=>setTimeout(enhance,40));
setTimeout(enhance,0);setTimeout(enhance,300);setTimeout(enhance,1000);
})();