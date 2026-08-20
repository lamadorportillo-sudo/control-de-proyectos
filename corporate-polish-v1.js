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
`;document.head.appendChild(s);

function orderNav(){
 const nav=document.getElementById('ccxNav');if(!nav)return;
 const selectors=['[data-ccx="home"]','[data-ccx="projects"]','#cccNavBtn','[data-ccx="budget"]','#ccgNavBtn','[data-ccx="alerts"]','[data-ccx="audit"]','[data-ccx="reports"]'];
 selectors.forEach(sel=>{const el=nav.querySelector(sel);if(el)nav.appendChild(el)});
 const labels={home:'Dashboard',projects:'Proyectos',budget:'Presupuesto',alerts:'Alertas',audit:'Auditoría',reports:'Reportes'};
 nav.querySelectorAll('[data-ccx]').forEach(b=>{if(labels[b.dataset.ccx])b.textContent=labels[b.dataset.ccx]});
 const c=document.getElementById('cccNavBtn');if(c)c.textContent='Contratos';
 const g=document.getElementById('ccgNavBtn');if(g)g.textContent='Gacetas';
}

if(typeof renderApp==='function'&&!renderApp.__ccCorporatePolish){
 const base=renderApp;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(orderNav,40);return r};wrapped.__ccCorporatePolish=true;renderApp=wrapped;
}
setTimeout(orderNav,180);setTimeout(orderNav,650);setTimeout(orderNav,1400);
})();
