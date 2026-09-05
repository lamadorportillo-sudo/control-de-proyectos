/* ===== CONTROL CONTRACTUAL · PULIDO CORPORATIVO V2 · GACETAS AISLADAS ===== */
(()=>{
'use strict';
if(window.__CC_CORPORATE_POLISH_V1__)return;
window.__CC_CORPORATE_POLISH_V1__=true;

/*
  Esta capa conserva únicamente dos responsabilidades:
  1) ordenar/rotular la navegación histórica;
  2) presentar el módulo de Gacetas.
  No aplica colores globales al Inicio, portafolio, alertas, topbar ni controles.
  El portal autenticado moderno mantiene su tema desde las capas de UI canónicas.
*/
const s=document.createElement('style');
s.id='cc-corporate-polish-v1';
s.textContent=`
/* Gacetas: ocultar campos técnicos que no forman parte del trabajo operativo diario. */
label:has(>#ccgUrl),label:has(>#ccgSha){display:none!important}

/* Gacetas: presentación normativa clara y deliberadamente encapsulada. */
.ccg-page{color:#172231!important}
.ccg-page .ccg-head h2{color:#172b40!important}
.ccg-page .ccg-head p{color:#566b80!important}
.ccg-page .ccg-panel{background:#fff!important;color:#172231!important;border-color:#dbe5ef!important;box-shadow:0 8px 26px rgba(24,48,75,.045)!important}
.ccg-page .ccg-toolbar h3{color:#1d344b!important}
.ccg-page .ccg-kpi{background:#fff!important;color:#172231!important;border-color:#dce6ef!important;box-shadow:0 7px 20px rgba(24,48,75,.04)!important}
.ccg-page .ccg-kpi small{color:#566b80!important}
.ccg-page .ccg-kpi strong{color:#18334c!important}
.ccg-page .ccg-kpi.good{background:#f2fbf6!important;border-color:#bfe4cf!important}
.ccg-page .ccg-kpi.good strong{color:#12623e!important}
.ccg-page .ccg-kpi.warn{background:#fff9ea!important;border-color:#ebd89d!important}
.ccg-page .ccg-kpi.warn strong{color:#755006!important}
.ccg-page .ccg-note{background:#eef6ff!important;border-color:#c8dcf0!important;color:#324f69!important}
.ccg-page .ccg-note.good{background:#effaf4!important;border-color:#c1e5d0!important;color:#1f5f41!important}
.ccg-page .ccg-note.warn{background:#fff8e8!important;border-color:#ead69a!important;color:#694a08!important}
.ccg-page .ccg-year{background:#fff!important;color:#172231!important;border:1px solid #d5e2ee!important;border-radius:14px!important;box-shadow:0 10px 28px rgba(24,48,75,.06)!important;padding:16px!important}
.ccg-page .ccg-year-head{padding-bottom:12px!important;border-bottom:1px solid #e7edf4!important}
.ccg-page .ccg-year h3{color:#122f4d!important;font-size:26px!important}
.ccg-page .ccg-year-head small{color:#526a80!important}
.ccg-page .ccg-badge{background:#eef5fc!important;border-color:#cbdcec!important;color:#315a7c!important;padding:6px 9px!important}
.ccg-page .ccg-badge.lock{background:#eef5ff!important;border-color:#c7d9ee!important;color:#254e76!important}
.ccg-page .ccg-rules{gap:8px!important}
.ccg-page .ccg-year .ccg-rules{margin-top:12px!important}
.ccg-page .ccg-rules-head{display:grid;grid-template-columns:160px minmax(250px,1fr) minmax(245px,.9fr);gap:10px;padding:0 12px 5px;color:#536a80;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.ccg-page .ccg-year .ccg-rule{grid-template-columns:160px minmax(250px,1fr) minmax(245px,.9fr)!important;gap:10px!important;align-items:center!important;padding:11px 12px!important;background:#f8fafc!important;border:1px solid #dfe7ef!important;border-left:4px solid #8ba6bf!important;border-radius:10px!important;color:#273f55!important;font-size:10px!important}
.ccg-page .ccg-year .ccg-rule b{font-size:10px!important;color:#27445f!important}
.ccg-page .ccg-year .ccg-rule span:nth-child(2){font-weight:700!important}
.ccg-page .ccg-year .ccg-rule span:last-child{text-align:left!important;font-weight:800!important;color:#223f5b!important}
.ccg-page .ccg-year .ccg-rule.is-minor{background:#f1faf5!important;border-color:#cce8d8!important;border-left-color:#299866!important}
.ccg-page .ccg-year .ccg-rule.is-minor span:nth-child(2){color:#125a3d!important}
.ccg-page .ccg-year .ccg-rule.is-private{background:#fff8e8!important;border-color:#ead9a6!important;border-left-color:#d49a21!important}
.ccg-page .ccg-year .ccg-rule.is-private span:nth-child(2){color:#6b4a07!important}
.ccg-page .ccg-year .ccg-rule.is-public{background:#eef5ff!important;border-color:#c9dbf5!important;border-left-color:#2563c7!important}
.ccg-page .ccg-year .ccg-rule.is-public span:nth-child(2){color:#174f9e!important}
.ccg-page .ccg-category-pill{display:inline-flex;align-items:center;width:max-content;padding:5px 8px;border-radius:999px;background:#eaf2f9;color:#315c80;font-size:9px;font-weight:850;white-space:nowrap}
.ccg-page .ccg-range{font-variant-numeric:tabular-nums}
.ccg-page .ccg-year .actions{border-top:1px solid #e8eef4!important;padding-top:10px!important}
.ccg-page .ccg-form-section{background:#f8fafc!important;color:#172231!important;border-color:#dde7ef!important}
.ccg-page .ccg-form-section h3{color:#1f3b55!important}
@media(max-width:760px){
  .ccg-page .ccg-rules-head{display:none}
  .ccg-page .ccg-year .ccg-rule{grid-template-columns:1fr!important;gap:5px!important}
  .ccg-page .ccg-year .ccg-rule span:last-child{text-align:left!important}
  .ccg-page .ccg-category-pill{margin-bottom:2px}
}
`;
document.head.appendChild(s);

function money(v){return `L ${Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`}
function parseMoney(txt){const n=Number(String(txt||'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:null}
function styleGacetas(){
 document.querySelectorAll('.ccg-year').forEach(card=>{
   const box=card.querySelector('.ccg-rules');if(!box)return;
   if(!box.querySelector('.ccg-rules-head')){
     const h=document.createElement('div');h.className='ccg-rules-head';h.innerHTML='<span>Categoría</span><span>Modalidad</span><span>Rango aplicable</span>';box.prepend(h);
   }
   const previous={};
   box.querySelectorAll(':scope > .ccg-rule').forEach(row=>{
     const cells=[...row.children];if(cells.length<3)return;
     const cat=(cells[0].textContent||'').trim();
     const mode=(cells[1].textContent||'').trim();
     const maxText=(cells[2].textContent||'').trim();
     const max=/sin límite/i.test(maxText)?null:parseMoney(maxText);
     const min=previous[cat]==null?0.01:Number((previous[cat]+0.01).toFixed(2));
     if(max!=null)previous[cat]=max;
     cells[0].innerHTML=`<span class="ccg-category-pill">${/obras/i.test(cat)?'Obras públicas':cat}</span>`;
     cells[2].classList.add('ccg-range');
     cells[2].textContent=max==null?`Desde ${money(min)}`:`${money(min)} – ${money(max)}`;
     row.classList.remove('is-minor','is-private','is-public');
     if(/licitación pública/i.test(mode))row.classList.add('is-public');
     else if(/licitación privada/i.test(mode))row.classList.add('is-private');
     else row.classList.add('is-minor');
   });
 });
}

function ensureMainTabs(){
 const nav=document.getElementById('ccxNav');if(!nav)return;
 let g=document.getElementById('ccgNavBtn');
 if(!g&&typeof window.openProcurementThresholds==='function'){
   g=document.createElement('button');g.id='ccgNavBtn';g.type='button';g.textContent='Gacetas';g.title='Gacetas y umbrales por año fiscal';g.addEventListener('click',e=>{e.preventDefault();window.openProcurementThresholds()});nav.appendChild(g);
 }
 let c=document.getElementById('cccNavBtn');
 if(!c&&window.__CC_CONTRACTS_CENTER_V1__){
   c=document.createElement('button');c.id='cccNavBtn';c.type='button';c.className='ccc-nav-btn';c.textContent='Contratos';c.dataset.ccContracts='1';nav.appendChild(c);
 }
}

function orderNav(){
 ensureMainTabs();
 const nav=document.getElementById('ccxNav');if(!nav)return;
 const selectors=['[data-ccx="home"]','[data-ccx="projects"]','#cccNavBtn','[data-ccx="budget"]','#ccgNavBtn','[data-ccx="alerts"]','[data-ccx="audit"]','[data-ccx="reports"]'];
 selectors.forEach(sel=>{const el=nav.querySelector(sel);if(el)nav.appendChild(el)});
 const labels={home:'Inicio',projects:'Proyectos',budget:'Presupuesto',alerts:'Alertas',audit:'Auditoría',reports:'Reportes'};
 nav.querySelectorAll('[data-ccx]').forEach(b=>{if(labels[b.dataset.ccx])b.textContent=labels[b.dataset.ccx]});
 const c=document.getElementById('cccNavBtn');if(c)c.textContent='Contratos';
 const g=document.getElementById('ccgNavBtn');if(g)g.textContent='Gacetas';
 styleGacetas();
}

if(typeof renderApp==='function'&&!renderApp.__ccCorporatePolish){
 const base=renderApp;
 const wrapped=function(){const r=base.apply(this,arguments);setTimeout(orderNav,40);setTimeout(styleGacetas,180);return r};
 wrapped.__ccCorporatePolish=true;renderApp=wrapped;
}
document.addEventListener('click',e=>{if(e.target.closest?.('#ccgNavBtn,[data-ccg-view],[data-ccg-edit]')){setTimeout(styleGacetas,80);setTimeout(styleGacetas,350);setTimeout(styleGacetas,900);}},true);
setTimeout(orderNav,180);setTimeout(orderNav,650);setTimeout(orderNav,1400);setTimeout(styleGacetas,2200);
})();
