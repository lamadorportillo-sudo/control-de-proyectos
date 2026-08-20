/* ===== CONTROL CONTRACTUAL · PULIDO CORPORATIVO V1 ===== */
(()=>{
'use strict';
if(window.__CC_CORPORATE_POLISH_V1__)return;
window.__CC_CORPORATE_POLISH_V1__=true;
const s=document.createElement('style');s.id='cc-corporate-polish-v1';s.textContent=`
.cp-alerts-compact{background:#fff!important;border-color:#dfe7f0!important;box-shadow:0 8px 28px rgba(24,48,75,.05)!important}.cp-alerts-head b{color:#1a3148!important}.cp-alerts-head small{color:#75879a!important}.cp-alert-chip{background:#f4f7fa!important;border-color:#dce5ee!important;color:#50667c!important}.cp-alert-chip strong{color:#1d344b!important}.cp-alert-chip.critical{background:#fff0f1!important;border-color:#efc7cb!important;color:#ad3540!important}.cp-alert-chip.deadline{background:#fff8e8!important;border-color:#efd99d!important;color:#946108!important}.cp-alert-chip.guarantee{background:#edf6ff!important;border-color:#c5dcf2!important;color:#1769c2!important}.cp-alert-chip.advance{background:#f5f0ff!important;border-color:#dacaf5!important;color:#6f48a5!important}.cp-alerts-open{background:#f6f9fc!important;color:#1769c2!important;border-color:#cbdcea!important}.cp-alerts-open:hover,.cp-alerts-open.active{background:#e9f3fd!important;color:#0b5ead!important;border-color:#adcde9!important}.cp-alert-list-clean .rail-alert,.cp-alert-list-clean .followup-item{background:#fff!important;color:#24384d!important;border-color:#dfe7f0!important}.rail-card,.control-rail-v3,.followup-panel{background:#fff!important;color:#172231!important;border-color:#dfe7f0!important}.rail-card h3,.rail-card h4,.followup-panel h3,.followup-panel h4{color:#1b344c!important}.rail-card small,.followup-panel small{color:#75879a!important}
.footer-note{color:#7a8b9d!important}.cloud-pill{background:rgba(255,255,255,.12)!important;border-color:rgba(255,255,255,.22)!important}.cloud-pill small,.cloud-pill b{color:#fff!important}.sync-dot{background:#69e49e!important}.eyebrow{color:#1769c2}.topbar .eyebrow{color:#fff!important}.icon-btn{background:#f3f6f9!important;color:#52687e!important;border-color:#dce5ee!important}.topbar .icon-btn{background:rgba(255,255,255,.10)!important;color:#fff!important;border-color:rgba(255,255,255,.22)!important}
/* Gacetas: ocultar campos técnicos que no forman parte del trabajo operativo diario. */
label:has(>#ccgUrl),label:has(>#ccgSha){display:none!important}
/* Gacetas: presentación normativa clara, corporativa y sin ruido visual. */
.ccg-page{color:#172231!important}.ccg-head h2{color:#172b40!important}.ccg-head p{color:#708297!important}.ccg-panel{background:#fff!important;border-color:#dbe5ef!important;box-shadow:0 8px 26px rgba(24,48,75,.045)!important}.ccg-toolbar h3{color:#1d344b!important}.ccg-kpi{background:#fff!important;border-color:#dce6ef!important;box-shadow:0 7px 20px rgba(24,48,75,.04)!important}.ccg-kpi small{color:#77899b!important}.ccg-kpi strong{color:#18334c!important}.ccg-kpi.good{background:#f2fbf6!important;border-color:#bfe4cf!important}.ccg-kpi.good strong{color:#187a4d!important}.ccg-kpi.warn{background:#fff9ea!important;border-color:#ebd89d!important}.ccg-kpi.warn strong{color:#98690b!important}.ccg-note{background:#eef6ff!important;border-color:#c8dcf0!important;color:#41627f!important}.ccg-note.good{background:#effaf4!important;border-color:#c1e5d0!important;color:#28704e!important}.ccg-note.warn{background:#fff8e8!important;border-color:#ead69a!important;color:#85600e!important}.ccg-year{background:#fff!important;border:1px solid #d5e2ee!important;border-radius:14px!important;box-shadow:0 10px 28px rgba(24,48,75,.06)!important;padding:16px!important}.ccg-year-head{padding-bottom:12px!important;border-bottom:1px solid #e7edf4!important}.ccg-year h3{color:#122f4d!important;font-size:26px!important}.ccg-year-head small{color:#667d93!important}.ccg-badge{background:#eef5fc!important;border-color:#cbdcec!important;color:#315a7c!important;padding:6px 9px!important}.ccg-badge.lock{background:#eef5ff!important;border-color:#c7d9ee!important;color:#254e76!important}.ccg-rules{gap:8px!important}.ccg-year .ccg-rules{margin-top:12px!important}.ccg-rules-head{display:grid;grid-template-columns:160px minmax(250px,1fr) minmax(245px,.9fr);gap:10px;padding:0 12px 5px;color:#718397;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}.ccg-year .ccg-rule{grid-template-columns:160px minmax(250px,1fr) minmax(245px,.9fr)!important;gap:10px!important;align-items:center!important;padding:11px 12px!important;background:#f8fafc!important;border:1px solid #dfe7ef!important;border-left:4px solid #8ba6bf!important;border-radius:10px!important;color:#273f55!important;font-size:10px!important}.ccg-year .ccg-rule b{font-size:10px!important;color:#27445f!important}.ccg-year .ccg-rule span:nth-child(2){font-weight:700!important}.ccg-year .ccg-rule span:last-child{text-align:left!important;font-weight:800!important;color:#223f5b!important}.ccg-year .ccg-rule.is-minor{background:#f1faf5!important;border-color:#cce8d8!important;border-left-color:#299866!important}.ccg-year .ccg-rule.is-minor span:nth-child(2){color:#176d49!important}.ccg-year .ccg-rule.is-private{background:#fff8e8!important;border-color:#ead9a6!important;border-left-color:#d49a21!important}.ccg-year .ccg-rule.is-private span:nth-child(2){color:#8c620a!important}.ccg-year .ccg-rule.is-public{background:#eef5ff!important;border-color:#c9dbf5!important;border-left-color:#2563c7!important}.ccg-year .ccg-rule.is-public span:nth-child(2){color:#174f9e!important}.ccg-category-pill{display:inline-flex;align-items:center;width:max-content;padding:5px 8px;border-radius:999px;background:#eaf2f9;color:#315c80;font-size:9px;font-weight:850;white-space:nowrap}.ccg-range{font-variant-numeric:tabular-nums}.ccg-year .actions{border-top:1px solid #e8eef4!important;padding-top:10px!important}.ccg-form-section{background:#f8fafc!important;border-color:#dde7ef!important}.ccg-form-section h3{color:#1f3b55!important}
@media(max-width:760px){.ccg-rules-head{display:none}.ccg-year .ccg-rule{grid-template-columns:1fr!important;gap:5px!important}.ccg-year .ccg-rule span:last-child{text-align:left!important}.ccg-category-pill{margin-bottom:2px}}
`;document.head.appendChild(s);

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
 const base=renderApp;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(orderNav,40);setTimeout(styleGacetas,180);return r};wrapped.__ccCorporatePolish=true;renderApp=wrapped;
}
document.addEventListener('click',e=>{if(e.target.closest?.('#ccgNavBtn,[data-ccg-view],[data-ccg-edit]')){setTimeout(styleGacetas,80);setTimeout(styleGacetas,350);setTimeout(styleGacetas,900);}},true);
setTimeout(orderNav,180);setTimeout(orderNav,650);setTimeout(orderNav,1400);setTimeout(styleGacetas,2200);
})();
