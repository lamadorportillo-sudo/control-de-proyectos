/* ===== DIAGNÓSTICO CONTRACTUAL NO DESTRUCTIVO V1 ===== */
(()=>{
'use strict';
if(typeof window==='undefined')return;
if(window.__CC_INTEGRITY_DIAGNOSTICS_V1__)return;
window.__CC_INTEGRITY_DIAGNOSTICS_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const R=v=>Math.round(N(v)*100)/100;
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const active=x=>!!x&&!x.voidedAt&&!x.voided_at&&!x.archivedAt&&!x.archived_at&&!/anulad/i.test(String(x.status||''));
const money=v=>{try{return typeof fmtC==='function'?fmtC(N(v)):`L ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`}catch{return`L ${R(v).toFixed(2)}`}};
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getDB=()=>{try{return typeof db!=='undefined'?db:window.db}catch{return window.db}};
const getView=()=>{try{return typeof view!=='undefined'?view:window.view}catch{return window.view}};

function approvedChanges(contractId){return A(getDB()?.changes).filter(x=>active(x)&&x.contractId===contractId&&norm(x.status)==='aprobado')}
function derivedAmount(c){if(!c)return 0;return R(N(c.originalAmount)+approvedChanges(c.id).reduce((sum,x)=>sum+N(x.amountDelta),0))}
function storedAmount(c){
  if(!c)return 0;
  for(const value of [c.currentAmount,c.legacyCurrentAmount,c.legacy_current_amount]){
    if(value!==undefined&&value!==null&&String(value)!=='')return R(value);
  }
  return derivedAmount(c);
}
function calendarDays(start,end){
  if(!start||!end)return 0;
  const a=new Date(`${start}T12:00:00`),b=new Date(`${end}T12:00:00`);
  if(!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime())||b<a)return 0;
  return Math.round((b-a)/86400000)+1;
}
function guaranteeIssues(g,c){
  if(window.__ccContractIntegrity?.guaranteeIssues)return window.__ccContractIntegrity.guaranteeIssues(g,c);
  const out=[];
  if(!String(g?.number||'').trim())out.push('Falta el número de garantía.');
  if(!String(g?.issuer||'').trim())out.push('Falta la institución emisora.');
  if(!String(g?.document||g?.document_ref||'').trim())out.push('Falta la referencia documental.');
  if(!(g?.start||g?.startDate)||!(g?.end||g?.endDate))out.push('La vigencia está incompleta.');
  return out;
}
function scanProject(projectId){
  const store=getDB();const p=A(store?.projects).find(x=>x.id===projectId);if(!p)return[];
  const issues=[];
  for(const c of A(store?.contracts).filter(c=>active(c)&&c.projectId===p.id)){
    const derived=derivedAmount(c),stored=storedAmount(c);
    if(Math.abs(stored-derived)>0.01)issues.push({level:'danger',kind:'contract_amount',projectId:p.id,contractId:c.id,title:'Monto contractual requiere revisión documental',detail:`El monto vigente almacenado (${money(stored)}) no coincide con monto original + modificaciones aprobadas (${money(derived)}). El sistema no lo corregirá automáticamente.`});
    const start=c.start||c.startDate||c.start_date,end=c.end||c.endDate||c.end_date,days=Math.trunc(N(c.executionDays||c.execution_days));
    const span=calendarDays(start,end);
    if(start&&end&&days>0&&span>0&&Math.abs(span-days)>1)issues.push({level:'warn',kind:'contract_dates',projectId:p.id,contractId:c.id,title:'Plazo y fechas requieren verificación',detail:`Las fechas abarcan ${span} días calendario y el contrato registra ${days} días de ejecución. Verifique el documento contractual antes de modificar cualquiera de los valores.`});
    for(const g of A(store?.guarantees).filter(x=>active(x)&&x.contractId===c.id))for(const detail of guaranteeIssues(g,c))issues.push({level:'warn',kind:'guarantee',projectId:p.id,contractId:c.id,guaranteeId:g.id,title:`Garantía ${g.type||g.guaranteeType||'contractual'} incompleta`,detail});
  }
  return issues;
}
function scanAll(){return A(getDB()?.projects).filter(active).flatMap(p=>scanProject(p.id))}
function mountProjectNotice(){
  if(typeof document==='undefined')return;
  const projectId=getView()?.projectId||'';
  const host=document.getElementById('tabBody')||document.querySelector('.project-portfolio-actions')?.parentElement;
  document.querySelectorAll('[data-cc-integrity-diagnostics]').forEach(el=>{if(!host||!host.contains(el))el.remove()});
  if(!projectId||!host||host.querySelector('[data-cc-integrity-diagnostics]'))return;
  const issues=scanProject(projectId);if(!issues.length)return;
  if(typeof document.createElement!=='function')return;
  const box=document.createElement('section');box.dataset.ccIntegrityDiagnostics='1';box.className='panel';box.setAttribute('role','status');box.setAttribute('aria-live','polite');
  box.innerHTML=`<div class="panel-head"><div><small class="eyebrow">CONTROL DE INTEGRIDAD</small><h3>Registros que requieren verificación</h3></div><span class="status warn">${issues.length} pendiente${issues.length===1?'':'s'}</span></div><div class="cc-integrity-list">${issues.map(x=>`<div class="alert ${x.level==='danger'?'danger':'warn'}"><b>${E(x.title)}</b><br><span>${E(x.detail)}</span></div>`).join('')}</div><small class="muted">Estos avisos no modifican información contractual. La corrección debe realizarse únicamente con respaldo documental.</small>`;
  host.prepend(box);
}
let queued=false;
function schedule(){if(queued)return;queued=true;const go=()=>{queued=false;mountProjectNotice()};if(typeof requestAnimationFrame==='function')requestAnimationFrame(go);else go()}
function observe(){
  if(typeof document==='undefined'||typeof MutationObserver==='undefined')return false;
  const app=document.getElementById('app');if(!app)return false;
  const observer=new MutationObserver(schedule);observer.observe(app,{childList:true,subtree:true});return true;
}
if(typeof document!=='undefined')setTimeout(()=>{mountProjectNotice();if(!observe()){const wait=setInterval(()=>{if(observe()){clearInterval(wait);mountProjectNotice()}},500);setTimeout(()=>clearInterval(wait),10000)}},0);
window.__ccIntegrityDiagnostics={scanProject,scanAll,derivedAmount,storedAmount,calendarDays,mountProjectNotice};
})();

/* ZORDON · carga segura del buscador inteligente y compactación del portafolio. */
(()=>{
  if(typeof window==='undefined'||window.__CC_ZORDON_PROJECT_SEARCH_LOADER__)return;
  window.__CC_ZORDON_PROJECT_SEARCH_LOADER__=true;
  if(typeof document==='undefined'||typeof document.createElement!=='function')return;
  const installCompact=()=>{
    if(document.getElementById('cc-zordon-project-compact-loader'))return;
    const style=document.createElement('style');style.id='cc-zordon-project-compact-loader';style.textContent=`
      html.zordon-search-boot .projects-board .project-grid-v3>.project-v3{display:none!important}
      body:not(.print-report) .projects-board .project-grid-v3{grid-template-columns:1fr!important;gap:7px!important}
      body:not(.print-report) .projects-board .project-v3{min-height:0!important;height:auto!important}
      body:not(.print-report) .projects-board .project-v3-main{grid-template-columns:minmax(0,1.7fr) minmax(220px,.72fr)!important;gap:7px!important;padding:8px 10px!important}
      body:not(.print-report) .projects-board .project-v3 h3{font-size:11px!important;line-height:1.22!important;min-height:0!important;margin:3px 0!important}
      body:not(.print-report) .projects-board .project-v3-contractor{margin-top:4px!important;padding:5px 6px!important}
      body:not(.print-report) .projects-board .project-v3 .v3-metric{min-height:42px!important;padding:5px 6px!important}
      body:not(.print-report) .projects-board .project-v3-progress{margin-top:4px!important;gap:5px!important}
      body:not(.print-report) .projects-board .project-v3-health{margin-top:4px!important;padding-top:4px!important}
      body:not(.print-report) .projects-board .project-v3-actions{display:flex!important;flex-direction:row!important;align-items:center!important;gap:4px!important;padding:5px 7px!important;min-height:0!important}
      body:not(.print-report) .projects-board .project-v3-actions .btn{min-height:27px!important;padding:4px 7px!important;font-size:8px!important;width:auto!important}
      body:not(.print-report) .projects-board .project-v3-actions .btn.primary{margin-left:auto!important;min-width:104px!important}
      @media(max-width:760px){body:not(.print-report) .projects-board .project-v3-main{display:block!important}body:not(.print-report) .projects-board .project-v3-money{margin-top:6px!important}}
    `;document.head.appendChild(style);
  };
  const activate=()=>{document.documentElement.classList.remove('zordon-search-boot');try{window.__ccZordonProjectSearch?.run?.()}catch{}};
  const load=()=>{
    installCompact();document.documentElement.classList.add('zordon-search-boot');
    if(window.__CC_ZORDON_PROJECT_SEARCH_V1__){activate();return}
    let s=document.querySelector('script[data-zordon-project-search-loader]');if(s){s.addEventListener?.('load',activate,{once:true});return}
    s=document.createElement('script');s.src='zordon-project-search-v1.js?v=20260831-zordon3';s.async=false;s.dataset.zordonProjectSearchLoader='1';s.onload=activate;s.onerror=()=>document.documentElement.classList.remove('zordon-search-boot');document.head.appendChild(s);
  };
  if(document.readyState==='loading'&&typeof document.addEventListener==='function')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();

/* ZORDON · densidad unificada para todas las pestañas restantes. */
(()=>{
  if(typeof window==='undefined'||window.__CC_ZORDON_UNIFIED_DENSITY_LOADER__)return;
  window.__CC_ZORDON_UNIFIED_DENSITY_LOADER__=true;
  if(typeof document==='undefined'||typeof document.createElement!=='function')return;
  const activate=()=>{try{window.__ccZordonUnifiedDensity?.run?.()}catch{}};
  const load=()=>{
    if(window.__CC_ZORDON_UNIFIED_DENSITY_V1__){activate();return}
    let s=document.querySelector('script[data-zordon-unified-density-loader]');
    if(s){s.addEventListener?.('load',activate,{once:true});return}
    s=document.createElement('script');s.src='zordon-unified-density-v1.js?v=20260831-density1';s.async=false;s.dataset.zordonUnifiedDensityLoader='1';s.onload=activate;document.head.appendChild(s);
  };
  if(document.readyState==='loading'&&typeof document.addEventListener==='function')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
