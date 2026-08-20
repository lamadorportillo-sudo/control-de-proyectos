/* ===== CONTROL CONTRACTUAL · DASHBOARD EJECUTIVO V1 ===== */
(()=>{
'use strict';
if(window.__CP_DASHBOARD_EXECUTIVE_V1__)return;
window.__CP_DASHBOARD_EXECUTIVE_V1__=true;

const S={auditOpen:false};
const h=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const arr=v=>Array.isArray(v)?v:[];
const r2=v=>Math.round((Number(v)||0)*100)/100;
const money=v=>`L ${r2(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

function activeProjects(){return arr(window.db?.projects).filter(p=>!p.deletedAt&&!p.archivedAt)}
function executionProjects(){return activeProjects().filter(p=>/ejecuci/i.test(p.status||''))}
function finalProjects(){return activeProjects().filter(p=>/finaliz|cerrad/i.test(p.status||''))}
function budgetProjects(){return activeProjects().filter(p=>p.budgetControl)}
function budgetAvailable(){return budgetProjects().reduce((sum,p)=>{
  const b=p.budgetControl||{};let a=+b.assigned||0,d=+b.decrease||0,x=+b.expansion||0,tp=+b.transferPositive||0,tn=+b.transferNegative||0,pd=+b.paid||0;
  arr(b.movements).forEach(m=>{const n=+m.amount||0;if(m.type==='Ampliación')x+=n;else if(m.type==='Disminución')d+=n;else if(m.type==='Transferencia +')tp+=n;else if(m.type==='Transferencia -')tn+=n;else if(m.type==='Pago')pd+=n});
  return sum+(a-d+x+tp-tn-pd);
},0)}
function alertCount(){return document.querySelectorAll('.control-rail-v3 .rail-alert,.followup-center .followup-item').length||Number(document.querySelector('[data-cp-alerts-open]')?.textContent?.match(/\d+/)?.[0]||0)}
function auditCount(){return arr(window.db?.audit).length}

function styles(){
 if(document.getElementById('cp-dashboard-executive-style'))return;
 const s=document.createElement('style');s.id='cp-dashboard-executive-style';s.textContent=`
.cp-exec-nav{margin:12px 0 14px}.cp-exec-nav-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:9px}.cp-exec-nav-head h2{font-size:15px;margin:0}.cp-exec-nav-head p{font-size:9px;color:#72879e;margin:3px 0 0}.cp-exec-nav-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.cp-exec-nav-card{appearance:none;text-align:left;border:1px solid rgba(148,163,184,.12);background:linear-gradient(145deg,#0c1622,#08111b);color:#eef5fc;border-radius:14px;padding:12px;min-height:92px;display:flex;flex-direction:column;justify-content:space-between;transition:.16s ease}.cp-exec-nav-card:hover{border-color:#315f95;background:linear-gradient(145deg,#10233a,#0b1725);transform:translateY(-1px)}.cp-exec-nav-card .top{display:flex;justify-content:space-between;align-items:center;gap:8px}.cp-exec-nav-card .ico{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#12243a;border:1px solid #233d5b;font-weight:900}.cp-exec-nav-card .num{font-size:20px;font-weight:900;letter-spacing:-.03em}.cp-exec-nav-card b{font-size:10px}.cp-exec-nav-card small{display:block;color:#758ba2;font-size:8px;margin-top:3px;line-height:1.3}.cp-exec-nav-card.alert .ico{background:#2a1518;border-color:#5c2930;color:#fecaca}.cp-exec-nav-card.budget .ico{background:#10271b;border-color:#28563b;color:#bbf7d0}.cp-exec-nav-card.audit .ico{background:#231b36;border-color:#4a376d;color:#ddd6fe}
.cp-exec-accordion-stack{display:grid;gap:8px;margin:0 0 18px}.cp-exec-accordion{border:1px solid #1c2a3b;border-radius:14px;background:#09111a;overflow:hidden}.cp-exec-accordion>summary{list-style:none;cursor:pointer;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px;font-weight:850;color:#d7e3f0}.cp-exec-accordion>summary::-webkit-details-marker{display:none}.cp-exec-accordion>summary:after{content:'+';font-size:18px;color:#6f8dad}.cp-exec-accordion[open]>summary:after{content:'−'}.cp-exec-accordion>summary small{font-size:8px;color:#71869b;font-weight:650}.cp-exec-accordion-body{padding:0 10px 10px}.cp-exec-accordion-body>.projects-board,.cp-exec-accordion-body>.projects-panel,.cp-exec-accordion-body>.control-rail-v3{margin:0!important}.cp-exec-accordion-body .cp-project-search-note{margin-top:8px}.followup-center{display:none!important}
.cp-audit-modal-bg{position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.72);backdrop-filter:blur(5px);display:grid;place-items:center;padding:14px}.cp-audit-modal{width:min(920px,100%);max-height:88vh;overflow:auto;background:#0b131e;border:1px solid #2a3c54;border-radius:17px;box-shadow:0 28px 90px rgba(0,0,0,.5)}.cp-audit-head{position:sticky;top:0;background:#0b131e;border-bottom:1px solid #1e2b3c;padding:14px;display:flex;justify-content:space-between;align-items:center;z-index:2}.cp-audit-head h3{margin:0;font-size:14px}.cp-audit-body{padding:12px}.cp-audit-row{display:grid;grid-template-columns:145px 120px minmax(0,1fr);gap:10px;padding:10px;border-bottom:1px solid #172334;font-size:9px}.cp-audit-row:last-child{border-bottom:0}.cp-audit-row b{font-size:9px}.cp-audit-row small{color:#71869b}.cp-audit-empty{padding:30px;text-align:center;color:#71869b}
@media(max-width:900px){.cp-exec-nav-grid{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.cp-exec-nav-grid{grid-template-columns:1fr 1fr}.cp-exec-nav-card{min-height:80px;padding:10px}.cp-exec-nav-card .num{font-size:17px}.cp-exec-nav-head{display:block}.cp-audit-row{grid-template-columns:1fr}.cp-exec-accordion>summary{align-items:flex-start}}
`;
 document.head.appendChild(s);
}

function buildNav(){
 if(typeof view!=='undefined'&&view.screen!=='projects')return;
 const anchor=document.getElementById('cpExecutionOnly')||document.querySelector('.exec-overview');
 if(!anchor)return;
 let nav=document.getElementById('cpExecutiveNav');
 if(!nav){nav=document.createElement('section');nav.id='cpExecutiveNav';nav.className='cp-exec-nav';anchor.insertAdjacentElement('afterend',nav)}
 const ps=activeProjects(),ex=executionProjects(),fin=finalProjects(),bp=budgetProjects(),alerts=alertCount(),aud=auditCount(),avail=budgetAvailable();
 nav.innerHTML=`<div class="cp-exec-nav-head"><div><h2>Accesos de gestión</h2><p>La portada muestra solo lo esencial. Abre únicamente el área que necesites revisar.</p></div></div><div class="cp-exec-nav-grid">
 <button type="button" class="cp-exec-nav-card" data-cp-exec-action="projects"><div class="top"><span class="ico">▦</span><span class="num">${ps.length}</span></div><div><b>Proyectos</b><small>${ex.length} en ejecución · ${fin.length} finalizados</small></div></button>
 <button type="button" class="cp-exec-nav-card alert" data-cp-exec-action="alerts"><div class="top"><span class="ico">!</span><span class="num">${alerts}</span></div><div><b>Alertas</b><small>Plazos, garantías y anticipos que requieren revisión</small></div></button>
 <button type="button" class="cp-exec-nav-card budget" data-cp-exec-action="budget"><div class="top"><span class="ico">▤</span><span class="num">${bp.length}</span></div><div><b>Disponibilidad</b><small>${money(avail)} disponible registrado</small></div></button>
 <button type="button" class="cp-exec-nav-card audit" data-cp-exec-action="audit"><div class="top"><span class="ico">✓</span><span class="num">${aud}</span></div><div><b>Auditoría</b><small>Historial de cambios y trazabilidad</small></div></button>
 </div>`;
}

function wrapSection(section,id,title,meta){
 if(!section||section.closest('.cp-exec-accordion'))return;
 const details=document.createElement('details');details.className='cp-exec-accordion';details.id=id;
 const summary=document.createElement('summary');summary.innerHTML=`<span>${h(title)}<small> · ${h(meta)}</small></span>`;
 const body=document.createElement('div');body.className='cp-exec-accordion-body';
 section.before(details);details.append(summary,body);body.appendChild(section);
}

function organizeLowerDashboard(){
 if(typeof view!=='undefined'&&view.screen!=='projects')return;
 const nav=document.getElementById('cpExecutiveNav');if(!nav)return;
 let stack=document.getElementById('cpExecutiveAccordions');if(!stack){stack=document.createElement('div');stack.id='cpExecutiveAccordions';stack.className='cp-exec-accordion-stack';nav.insertAdjacentElement('afterend',stack)}
 const projects=document.querySelector('.projects-board,.projects-panel');
 const rail=document.querySelector('.control-rail-v3');
 if(projects&&!projects.closest('.cp-exec-accordion')){const d=document.createElement('details');d.className='cp-exec-accordion';d.id='cpAccordionProjects';d.innerHTML=`<summary><span>Expedientes de proyectos <small>· ${activeProjects().length} proyectos</small></span></summary><div class="cp-exec-accordion-body"></div>`;stack.appendChild(d);d.querySelector('.cp-exec-accordion-body').appendChild(projects)}
 if(rail&&!rail.closest('.cp-exec-accordion')){const d=document.createElement('details');d.className='cp-exec-accordion';d.id='cpAccordionAlerts';d.innerHTML=`<summary><span>Alertas y seguimiento <small>· ${alertCount()} activas</small></span></summary><div class="cp-exec-accordion-body"></div>`;stack.appendChild(d);d.querySelector('.cp-exec-accordion-body').appendChild(rail)}
 document.querySelector('.followup-center')?.setAttribute('aria-hidden','true');
}

function openAccordion(id){
 const d=document.getElementById(id);if(!d)return;d.open=true;setTimeout(()=>d.scrollIntoView({behavior:'smooth',block:'start'}),30)
}
function openBudget(){
 if(typeof view==='undefined')return;view.screen='budgetPortfolio';view.projectId=null;if(typeof renderApp==='function')renderApp();
}
function openAudit(){
 document.getElementById('cpAuditModal')?.remove();
 const rows=arr(window.db?.audit).slice(0,40);
 const bg=document.createElement('div');bg.id='cpAuditModal';bg.className='cp-audit-modal-bg';
 bg.innerHTML=`<section class="cp-audit-modal"><div class="cp-audit-head"><div><h3>Auditoría y trazabilidad</h3><small>${rows.length?`Últimos ${Math.min(rows.length,40)} movimientos visibles`:'Sin movimientos locales disponibles'}</small></div><button type="button" class="icon-btn" data-cp-close-audit>×</button></div><div class="cp-audit-body">${rows.length?rows.map(x=>`<div class="cp-audit-row"><div><b>${h(x.action||x.type||'Movimiento')}</b><br><small>${h(x.at||x.createdAt||x.date||'')}</small></div><div>${h(x.entity||x.entityType||x.module||'Sistema')}</div><div>${h(x.detail?.name||x.detail?.number||x.message||x.note||x.entityId||'Registro de auditoría')}</div></div>`).join(''):'<div class="cp-audit-empty">La auditoría completa se conserva en Supabase.</div>'}</div></section>`;
 document.body.appendChild(bg);
}

function apply(){
 try{styles();if(typeof view!=='undefined'&&view.screen!=='projects')return;buildNav();organizeLowerDashboard()}catch(err){console.warn('Dashboard ejecutivo:',err)}
}

if(typeof renderApp==='function'&&!renderApp.__cpDashboardExec){const base=renderApp;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(apply,0);return r};wrapped.__cpDashboardExec=true;renderApp=wrapped}
if(typeof renderProjects==='function'&&!renderProjects.__cpDashboardExec){const base=renderProjects;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(apply,0);return r};wrapped.__cpDashboardExec=true;renderProjects=wrapped}

document.addEventListener('click',e=>{
 const btn=e.target.closest?.('[data-cp-exec-action]');if(btn){const a=btn.dataset.cpExecAction;if(a==='projects')openAccordion('cpAccordionProjects');else if(a==='alerts')openAccordion('cpAccordionAlerts');else if(a==='budget')openBudget();else if(a==='audit')openAudit();return}
 if(e.target.closest?.('[data-cp-close-audit]')||e.target.id==='cpAuditModal')document.getElementById('cpAuditModal')?.remove();
},true);

styles();setTimeout(apply,0);setTimeout(apply,300);setTimeout(apply,1000);
})();
