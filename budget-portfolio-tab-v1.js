/* ===== PESTANA DISPONIBILIDAD + VISTA LIMPIA V3 ===== */
(()=>{
'use strict';
if(window.__CP_BUDGET_PORTFOLIO_TAB_V3__)return;
window.__CP_BUDGET_PORTFOLIO_TAB_V3__=true;

const state={q:'',filter:'all',page:1,perPage:12};
const dashboardState={projectsOpen:false,alertsOpen:false};
const r2=v=>Math.round((Number(v)||0)*100)/100;
const money=v=>`L ${r2(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const h=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();

function snapshot(p){
  const b=p?.budgetControl;
  if(!b)return null;
  let assigned=+b.assigned||0,decrease=+b.decrease||0,expansion=+b.expansion||0,tp=+b.transferPositive||0,tn=+b.transferNegative||0,paid=+b.paid||0;
  (Array.isArray(b.movements)?b.movements:[]).forEach(m=>{
    const a=+m.amount||0;
    if(m.type==='Ampliación')expansion+=a;
    else if(m.type==='Disminución')decrease+=a;
    else if(m.type==='Transferencia +')tp+=a;
    else if(m.type==='Transferencia -')tn+=a;
    else if(m.type==='Pago')paid+=a;
  });
  const vigente=r2(assigned-decrease+expansion+tp-tn),pago=r2(paid),disponible=r2(vigente-pago);
  return{vigente,paid:pago,disponible,pct:vigente?r2(pago/vigente*100):0};
}

function projects(){
  if(typeof db==='undefined'||!Array.isArray(db?.projects))return[];
  return db.projects.filter(p=>!p.deletedAt&&p.budgetControl).sort((a,b)=>String(a.code||'').localeCompare(String(b.code||''),undefined,{numeric:true}));
}

function totals(ps=projects()){
  return ps.reduce((o,p)=>{
    const v=snapshot(p);if(!v)return o;
    o.n++;o.v=r2(o.v+v.vigente);o.p=r2(o.p+v.paid);o.d=r2(o.d+v.disponible);
    if(v.disponible>0.005)o.with++;
    else if(v.disponible<-0.005)o.neg++;
    else o.zero++;
    return o;
  },{n:0,v:0,p:0,d:0,with:0,zero:0,neg:0});
}

function ensureStyles(){
  if(document.getElementById('budget-portfolio-tab-v3-style'))return;
  document.getElementById('budget-portfolio-tab-v2-style')?.remove();
  const s=document.createElement('style');
  s.id='budget-portfolio-tab-v3-style';
  s.textContent=`
.cp-main-tabs{display:flex;gap:6px;overflow:auto;margin:-2px 0 16px;padding:5px;border:1px solid #1f2b3b;border-radius:13px;background:rgba(8,13,20,.82)}
.cp-main-tabs button{border:1px solid transparent;background:transparent;color:#9fb1c6;border-radius:9px;padding:9px 13px;font-weight:800;white-space:nowrap;display:flex;gap:7px;align-items:center}.cp-main-tabs button:hover{background:#111a27;color:#fff}.cp-main-tabs button.active{background:#17345e;border-color:#315f95;color:#fff}.cp-main-tabs .count{min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:rgba(255,255,255,.08);display:inline-grid;place-items:center;font-size:10px}
.cp-budget-page{display:grid;gap:12px}.cp-budget-title h2{font-size:22px;margin:5px 0}.cp-budget-title p{max-width:900px;margin:0}.cp-budget-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.cp-budget-kpi{background:linear-gradient(180deg,#0b1713,#08120f);border:1px solid #1f4d37;border-radius:14px;padding:14px;min-width:0}.cp-budget-kpi small{display:block;color:#8fb9a4;margin-bottom:6px}.cp-budget-kpi strong{display:block;font-size:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cp-budget-kpi.good{border-color:#2f7a50;background:linear-gradient(135deg,#0d2b1c,#0a2117)}.cp-budget-kpi.good strong{color:#86efac}.cp-budget-panel{padding:14px!important}.cp-budget-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:11px}.cp-budget-tools .search{flex:1;max-width:none;min-width:270px}.cp-budget-filters{display:flex;gap:6px;flex-wrap:wrap}.cp-budget-filter{border:1px solid #26384c;background:#0b121c;color:#aebed0;border-radius:999px;padding:8px 10px;font-size:10px;font-weight:800}.cp-budget-filter.active{background:#153824;border-color:#2f7a50;color:#bbf7d0}.cp-budget-table{min-width:980px}.cp-budget-table th,.cp-budget-table td{padding:9px 10px}.cp-budget-table th{font-size:10px}.cp-budget-table .code{width:105px}.cp-budget-table .project{min-width:360px}.cp-budget-table .num{width:145px;white-space:nowrap}.cp-budget-table .available{font-weight:900;color:#86efac}.cp-budget-table .available.neg{color:#fca5a5}.cp-budget-table .available.zero{color:#94a3b8}.cp-budget-name{font-weight:700;line-height:1.3}.cp-budget-sub{font-size:9px;color:#71849a;margin-top:3px}.cp-budget-progress{height:5px;background:#172235;border-radius:999px;overflow:hidden;margin-top:5px;width:110px}.cp-budget-progress i{display:block;height:100%;background:#4f8cff;border-radius:999px}.cp-budget-pager{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:10px}.cp-budget-pager small{color:#8297ad}.cp-budget-pager .actions{display:flex;gap:7px;margin:0}.cp-budget-empty{text-align:center!important;color:#94a3b8!important;padding:28px!important}
.cp-dashboard-toggle{border:1px solid #26384c;background:#0b1522;color:#c7d5e6;border-radius:10px;padding:9px 12px;font-weight:800;font-size:10px;white-space:nowrap}.cp-dashboard-toggle:hover{border-color:#3d5f86;background:#101e30}.cp-dashboard-toggle.active{border-color:#315f95;background:#17345e;color:#fff}.cp-project-search-note{grid-column:1/-1;border:1px dashed #24364d;border-radius:14px;background:rgba(7,13,21,.55);padding:19px;text-align:center;color:#8196ad;font-size:11px}.cp-project-search-note b{display:block;color:#c6d5e7;font-size:13px;margin-bottom:4px}.cp-alert-toggle-wrap{margin-top:10px}.cp-alert-toggle-wrap .cp-dashboard-toggle{width:100%}.cp-old-follow-toggle{display:flex;justify-content:flex-end;margin:9px 0}
@media(max-width:980px){.cp-budget-kpis{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.cp-budget-tools .search{min-width:100%}.cp-budget-filters{width:100%;overflow:auto;flex-wrap:nowrap}.cp-budget-panel .table-wrap{overflow:visible;border:0}.cp-budget-table{min-width:0;display:block}.cp-budget-table thead{display:none}.cp-budget-table tbody{display:grid;gap:9px}.cp-budget-table tr{display:block;border:1px solid #1f2b3b;border-radius:13px;background:#0a1119;padding:10px}.cp-budget-table td{display:grid;grid-template-columns:95px minmax(0,1fr);gap:8px;align-items:center;border-bottom:1px solid #172233;padding:7px 3px;width:auto!important;min-width:0!important}.cp-budget-table td:last-child{border-bottom:0}.cp-budget-table td:before{content:attr(data-label);color:#71849a;font-size:9px;font-weight:800;text-transform:uppercase}.cp-budget-table .project{display:block}.cp-budget-table .project:before{display:block;margin-bottom:5px}.cp-budget-table .action .btn{width:100%}.cp-budget-progress{width:100%}.cp-budget-pager{align-items:flex-start;flex-direction:column}.cp-budget-pager .actions{width:100%}.cp-budget-pager .actions .btn{flex:1}}
@media(max-width:440px){.cp-budget-kpis{grid-template-columns:1fr}.cp-budget-kpi strong{font-size:18px}}
`;
  document.head.appendChild(s);
}

function removeLegacyPanel(){document.getElementById('budgetPortfolioPanel')?.remove();}

function renderTabs(){
  if(typeof view==='undefined'||view.screen==='project')return;
  const shell=document.querySelector('.shell'),top=shell?.querySelector('.topbar');
  if(!shell||!top)return;
  let nav=shell.querySelector('[data-cp-main-tabs]');
  if(!nav){nav=document.createElement('nav');nav.className='cp-main-tabs';nav.dataset.cpMainTabs='1';top.insertAdjacentElement('afterend',nav);}
  const budget=view.screen==='budgetPortfolio',n=projects().length,sig=`${budget?'b':'p'}:${n}`;
  if(nav.dataset.sig!==sig){
    nav.dataset.sig=sig;
    nav.innerHTML=`<button data-screen="projects" class="${budget?'':'active'}">▦ Proyectos</button><button data-screen="budgetPortfolio" class="${budget?'active':''}">▤ Disponibilidad presupuestaria <span class="count">${n}</span></button>`;
    nav.querySelectorAll('[data-screen]').forEach(btn=>btn.addEventListener('click',()=>{view.screen=btn.dataset.screen;view.projectId=null;if(typeof renderApp==='function')renderApp();}));
  }
}

function filtered(){
  const q=norm(state.q);
  return projects().filter(p=>{
    const v=snapshot(p);if(!v)return false;
    if(q&&!norm(`${p.code||''} ${p.name||''}`).includes(q))return false;
    if(state.filter==='with'&&!(v.disponible>0.005))return false;
    if(state.filter==='zero'&&!(Math.abs(v.disponible)<=0.005))return false;
    if(state.filter==='neg'&&!(v.disponible<-0.005))return false;
    return true;
  });
}

function renderRows(){
  const body=document.getElementById('cpBudgetRows'),pager=document.getElementById('cpBudgetPager');if(!body||!pager)return;
  const all=filtered(),pages=Math.max(1,Math.ceil(all.length/state.perPage));state.page=Math.max(1,Math.min(state.page,pages));
  const start=(state.page-1)*state.perPage,show=all.slice(start,start+state.perPage);
  body.innerHTML=show.length?show.map(p=>{const v=snapshot(p),cls=v.disponible<-0.005?'neg':Math.abs(v.disponible)<=0.005?'zero':'',bar=Math.max(0,Math.min(100,v.pct));return `<tr><td class="code" data-label="Código"><button class="budget-row-btn" data-cp-budget-open="${h(p.id)}">${h(p.code||'—')}</button></td><td class="project" data-label="Proyecto"><div class="cp-budget-name">${h(p.name||'—')}</div><div class="cp-budget-sub">${h(p.budgetControl?.source||'Control presupuestario')}</div></td><td class="num" data-label="Vigente">${money(v.vigente)}</td><td class="num" data-label="Pagado">${money(v.paid)}</td><td class="num available ${cls}" data-label="Disponible">${money(v.disponible)}</td><td data-label="% pagado"><b>${v.pct.toFixed(2)}%</b><div class="cp-budget-progress"><i style="width:${bar}%"></i></div></td><td class="action" data-label="Acción"><button class="btn" data-cp-budget-open="${h(p.id)}">Ver saldo</button></td></tr>`;}).join(''):`<tr><td colspan="7" class="cp-budget-empty">No hay proyectos que coincidan con esta búsqueda.</td></tr>`;
  const from=all.length?start+1:0,to=Math.min(start+state.perPage,all.length);
  pager.innerHTML=`<small>Mostrando ${from}–${to} de ${all.length} proyectos · Página ${state.page} de ${pages}</small><div class="actions"><button class="btn" id="cpBudgetPrev" ${state.page<=1?'disabled':''}>← Anterior</button><button class="btn" id="cpBudgetNext" ${state.page>=pages?'disabled':''}>Siguiente →</button></div>`;
  body.querySelectorAll('[data-cp-budget-open]').forEach(btn=>btn.addEventListener('click',()=>{view.projectId=btn.dataset.cpBudgetOpen;view.screen='project';view.tab='budget';if(typeof renderApp==='function')renderApp();}));
  document.getElementById('cpBudgetPrev')?.addEventListener('click',()=>{state.page--;renderRows();});
  document.getElementById('cpBudgetNext')?.addEventListener('click',()=>{state.page++;renderRows();});
}

function renderBudgetScreen(){
  if(typeof view==='undefined'||view.screen!=='budgetPortfolio')return;
  const c=document.getElementById('content');if(!c)return;
  const ps=projects(),t=totals(ps),cut=ps.find(p=>p.budgetControl?.cutDate)?.budgetControl?.cutDate||'2026-07-16';
  const title=document.querySelector('.topbar h1');if(title)title.textContent='Disponibilidad Presupuestaria';
  c.innerHTML=`<div class="cp-budget-page"><div class="cp-budget-title"><p class="eyebrow">CONTROL PRESUPUESTARIO · S.A.M.I.</p><h2>Saldos disponibles por proyecto</h2><p class="muted">Estos proyectos tienen su propia pestaña para que el Centro de Proyectos se mantenga limpio. Corte ${h(cut.split('-').reverse().join('/'))}.</p></div><section class="cp-budget-kpis"><article class="cp-budget-kpi"><small>Proyectos con control</small><strong>${t.n}</strong></article><article class="cp-budget-kpi"><small>Presupuesto vigente</small><strong>${money(t.v)}</strong></article><article class="cp-budget-kpi"><small>Pagado</small><strong>${money(t.p)}</strong></article><article class="cp-budget-kpi good"><small>Disponible</small><strong>${money(t.d)}</strong></article></section><section class="panel cp-budget-panel"><div class="cp-budget-tools"><input class="search" id="cpBudgetSearch" placeholder="Buscar por código o proyecto…" value="${h(state.q)}"><div class="cp-budget-filters"><button class="cp-budget-filter ${state.filter==='all'?'active':''}" data-f="all">Todos ${t.n}</button><button class="cp-budget-filter ${state.filter==='with'?'active':''}" data-f="with">Con saldo ${t.with}</button><button class="cp-budget-filter ${state.filter==='zero'?'active':''}" data-f="zero">Agotados ${t.zero}</button><button class="cp-budget-filter ${state.filter==='neg'?'active':''}" data-f="neg">Sobregiro ${t.neg}</button></div></div><div class="table-wrap"><table class="table cp-budget-table"><thead><tr><th>Código</th><th>Proyecto</th><th>Vigente</th><th>Pagado</th><th>Disponible</th><th>% pagado</th><th></th></tr></thead><tbody id="cpBudgetRows"></tbody></table></div><div class="cp-budget-pager" id="cpBudgetPager"></div></section></div>`;
  document.getElementById('cpBudgetSearch').addEventListener('input',e=>{state.q=e.target.value;state.page=1;renderRows();});
  c.querySelectorAll('[data-f]').forEach(btn=>btn.addEventListener('click',()=>{state.filter=btn.dataset.f;state.page=1;c.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('active',x.dataset.f===state.filter));renderRows();}));
  renderRows();
}

function applyProjectVisibility(){
  if(typeof view!=='undefined'&&view.screen!=='projects')return;
  const grid=document.querySelector('.project-grid-v3')||document.querySelector('.dashboard-project-grid');
  const search=document.getElementById('projectSearch');
  if(!grid||!search)return;
  const cards=[...grid.querySelectorAll('.project-v3, .card')].filter(x=>!x.dataset.searchEmpty&&!x.dataset.cpProjectNote);
  const q=search.value.trim().toLowerCase();
  let visible=0;
  cards.forEach(card=>{
    const match=!q||card.textContent.toLowerCase().includes(q);
    const show=q?match:(dashboardState.projectsOpen&&match);
    card.hidden=!show;
    card.style.display=show?'':'';
    if(show)visible++;
  });
  grid.querySelectorAll('[data-search-empty]').forEach(x=>x.remove());
  let note=grid.querySelector('[data-cp-project-note]');
  if(!q&&!dashboardState.projectsOpen){
    if(!note){note=document.createElement('div');note.dataset.cpProjectNote='1';note.className='cp-project-search-note';grid.prepend(note);}
    note.innerHTML='<b>Proyectos ocultos para mantener limpia la pantalla</b>Escribe un código, nombre, ubicación o estado en el buscador para encontrar un proyecto.';
    note.hidden=false;
  }else if(q&&!visible){
    if(!note){note=document.createElement('div');note.dataset.cpProjectNote='1';note.className='cp-project-search-note';grid.prepend(note);}
    note.innerHTML='<b>No se encontraron proyectos</b>Prueba con otra parte del nombre, código, ubicación o estado.';
    note.hidden=false;
  }else if(note)note.hidden=true;
  const toggle=document.getElementById('cpToggleProjects');
  if(toggle){toggle.textContent=dashboardState.projectsOpen?'Ocultar proyectos':`Mostrar todos (${cards.length})`;toggle.classList.toggle('active',dashboardState.projectsOpen);}
}

function enhanceProjectBoard(){
  if(typeof view!=='undefined'&&view.screen!=='projects')return;
  const board=document.querySelector('.projects-board')||document.querySelector('.projects-panel');
  const search=document.getElementById('projectSearch');
  if(!board||!search)return;
  const filterRow=board.querySelector('.filter-row')||board.querySelector('.toolbar');
  if(filterRow&&!document.getElementById('cpToggleProjects')){
    const btn=document.createElement('button');btn.type='button';btn.id='cpToggleProjects';btn.className='cp-dashboard-toggle';btn.textContent='Mostrar todos';filterRow.appendChild(btn);
  }
  search.placeholder='Buscar proyecto por código, nombre, ubicación o estado…';
  applyProjectVisibility();
}

function enhanceAlerts(){
  if(typeof view!=='undefined'&&view.screen!=='projects')return;
  const railList=document.querySelector('.control-rail-v3 .rail-alert-list');
  if(railList){
    const card=railList.closest('.rail-card');
    let wrap=card?.querySelector('.cp-alert-toggle-wrap');
    if(card&&!wrap){wrap=document.createElement('div');wrap.className='cp-alert-toggle-wrap';const b=document.createElement('button');b.type='button';b.id='cpToggleAlerts';b.className='cp-dashboard-toggle';wrap.appendChild(b);railList.before(wrap);}
    railList.hidden=!dashboardState.alertsOpen;
    const btn=document.getElementById('cpToggleAlerts');if(btn){const count=railList.querySelectorAll('.rail-alert').length;btn.textContent=dashboardState.alertsOpen?'Ocultar alertas':`Mostrar alertas (${count})`;btn.classList.toggle('active',dashboardState.alertsOpen);}
  }
  const oldList=document.querySelector('.followup-center .followup-list');
  if(oldList){
    const panel=oldList.closest('.followup-panel');let wrap=panel?.querySelector('.cp-old-follow-toggle');
    if(panel&&!wrap){wrap=document.createElement('div');wrap.className='cp-old-follow-toggle';const b=document.createElement('button');b.type='button';b.id='cpToggleOldAlerts';b.className='cp-dashboard-toggle';wrap.appendChild(b);oldList.before(wrap);}
    oldList.hidden=!dashboardState.alertsOpen;
    const btn=document.getElementById('cpToggleOldAlerts');if(btn){const count=oldList.querySelectorAll('.followup-item').length;btn.textContent=dashboardState.alertsOpen?'Ocultar alertas':`Mostrar alertas (${count})`;btn.classList.toggle('active',dashboardState.alertsOpen);}
  }
}

function enhanceDashboard(){enhanceProjectBoard();enhanceAlerts();}

function syncUI(){ensureStyles();removeLegacyPanel();renderTabs();renderBudgetScreen();enhanceDashboard();}

function hookRenderProjects(){
  if(typeof renderProjects!=='function'||renderProjects.__cpCleanViewHook)return;
  const base=renderProjects;
  const wrapped=function(){const result=base.apply(this,arguments);queueMicrotask(()=>enhanceDashboard());return result;};
  wrapped.__cpCleanViewHook=true;renderProjects=wrapped;
}

ensureStyles();
if(typeof renderApp==='function'){
  const baseRenderApp=renderApp;
  renderApp=function(){const result=baseRenderApp.apply(this,arguments);syncUI();return result;};
}

document.addEventListener('input',e=>{if(e.target?.id==='projectSearch')queueMicrotask(applyProjectVisibility);},true);
document.addEventListener('click',e=>{
  const projectsBtn=e.target.closest?.('#cpToggleProjects');
  if(projectsBtn){dashboardState.projectsOpen=!dashboardState.projectsOpen;applyProjectVisibility();return;}
  const alertsBtn=e.target.closest?.('#cpToggleAlerts,#cpToggleOldAlerts');
  if(alertsBtn){dashboardState.alertsOpen=!dashboardState.alertsOpen;enhanceAlerts();return;}
},true);

setTimeout(()=>{hookRenderProjects();syncUI();},0);
setTimeout(()=>{hookRenderProjects();syncUI();},250);
setTimeout(()=>{hookRenderProjects();syncUI();},900);
})();
