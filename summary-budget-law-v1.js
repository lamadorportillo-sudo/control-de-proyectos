/* ===== RESUMEN · NORMATIVA VIGENTE Y PRESUPUESTO BASE V1 ===== */
(()=>{
'use strict';
if(window.__CC_SUMMARY_BUDGET_LAW_V1__)return;
window.__CC_SUMMARY_BUDGET_LAW_V1__=true;

const ACTIVE_LAW_DEFAULT={
  status:'Vigente',
  title:'Ley de Contratación del Estado y su Reglamento, según corresponda.',
  note:'Se mantiene vigente hasta que se registre una nueva disposición normativa.'
};
const A=v=>Array.isArray(v)?v:[];
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>`L. ${Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const say=m=>{try{toast(m)}catch{console.log(m)}};

function project(){try{return A(db?.projects).find(x=>x.id===view?.projectId&&!x.deletedAt)||null}catch{return null}}
function contract(p){try{return A(db?.contracts).find(x=>x.projectId===p?.id)||null}catch{return null}}
function law(){try{return db?.activeLegalFramework&&typeof db.activeLegalFramework==='object'?{...ACTIVE_LAW_DEFAULT,...db.activeLegalFramework}:ACTIVE_LAW_DEFAULT}catch{return ACTIVE_LAW_DEFAULT}}
function inferredYear(p){const direct=Number(p?.fiscalYear);if(direct>=2000&&direct<=2100)return direct;const code=String(p?.code||'').match(/(?:19|20)\d{2}/g);if(code?.length)return Number(code.at(-1));const dates=[p?.start,p?.createdAt,p?.updatedAt].filter(Boolean);for(const d of dates){const m=String(d).match(/(?:19|20)\d{2}/);if(m)return Number(m[0])}return new Date().getFullYear()}

function css(){if(document.getElementById('cc-summary-budget-law-style'))return;const s=document.createElement('style');s.id='cc-summary-budget-law-style';s.textContent=`
.cc-current-law{display:grid!important;grid-template-columns:170px minmax(0,1fr)!important;gap:8px!important;padding:11px 12px!important;margin-bottom:10px!important;border:1px solid #bfe2cf!important;background:#f3fbf7!important;border-radius:12px!important}.cc-current-law>div{min-width:0}.cc-current-law small{display:block!important;color:#6a8375!important;font-size:8px!important;text-transform:uppercase!important;letter-spacing:.05em!important;margin-bottom:3px!important}.cc-current-law b{display:block!important;color:#173f2d!important;font-size:10px!important;line-height:1.4!important}.cc-current-law .law-status{color:#13794f!important;font-size:12px!important}.cc-current-law .law-note{display:block!important;margin-top:3px!important;color:#688174!important;font-size:8px!important;font-weight:500!important}.cc-summary-budget-box{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:12px 14px;margin:0 0 12px;border:1px solid #c9dcec;border-radius:12px;background:#f7fbff}.cc-summary-budget-box small{display:block;color:#687f96;font-size:8px;text-transform:uppercase;letter-spacing:.05em}.cc-summary-budget-box strong{display:block;color:#153b60;font-size:20px;margin:2px 0}.cc-summary-budget-box span{display:block;color:#70859a;font-size:9px}.cc-summary-budget-box .btn{white-space:nowrap}.cc-budget-modal-note{grid-column:1/-1;padding:9px 11px;border:1px solid #c9dcec;border-radius:10px;background:#f5f9fd;color:#506b83;font-size:10px;line-height:1.45}
@media(max-width:650px){.cc-current-law{grid-template-columns:1fr!important}.cc-summary-budget-box{align-items:stretch;flex-direction:column}.cc-summary-budget-box .btn{width:100%}}
`;document.head.appendChild(s)}

function ensureLawRecord(){
 try{
  if(!db||db.activeLegalFramework)return;
  db.activeLegalFramework={...ACTIVE_LAW_DEFAULT,createdAt:new Date().toISOString()};
  if(typeof saveDB==='function')setTimeout(()=>{try{saveDB()}catch{}},120);
 }catch(e){console.warn(e)}
}

function decorateLaw(){
 css();const p=project();if(!p)return;const body=document.getElementById('tabBody');if(!body)return;
 const existing=body.querySelector('[data-ccg-project-rule]');
 if(existing&&/NORMA ORIGINAL/i.test(existing.textContent||''))return;
 const l=law(),year=inferredYear(p);
 if(existing){existing.classList.remove('warn');existing.classList.add('cc-current-law');existing.innerHTML=`<div><small>AÑO FISCAL</small><b class="law-status">${H(year)}</b></div><div><small>NORMATIVA VIGENTE</small><b>${H(l.title)}</b><span class="law-note">${H(l.note)}</span></div>`;return}
 if(body.querySelector('[data-cc-current-law]'))return;
 const box=document.createElement('div');box.dataset.ccCurrentLaw='1';box.className='cc-current-law';box.innerHTML=`<div><small>AÑO FISCAL</small><b class="law-status">${H(year)}</b></div><div><small>NORMATIVA VIGENTE</small><b>${H(l.title)}</b><span class="law-note">${H(l.note)}</span></div>`;body.prepend(box)
}

function openBudgetModal(p){
 const c=contract(p),current=Number(p.budget||0);let m;
 try{m=openModal(current>0?'Editar presupuesto base':'Registrar presupuesto base',`${typeof projectContext==='function'?projectContext(p,c):''}<form id="ccBudgetBaseForm" class="form-grid"><label class="field wide"><span>Presupuesto base del proyecto</span><input id="ccBudgetBase" type="number" min="0.01" step="0.01" required value="${current||''}"><small>Este es el valor base para comparar las ofertas del proceso.</small></label><div class="cc-budget-modal-note"><b>Importante:</b> modificar el presupuesto base no cambia el monto de un contrato que ya esté formalizado. El monto contractual se controla por separado.</div><div class="modal-actions"><button type="button" class="btn cancel">Cancelar</button><button class="btn primary">Guardar presupuesto base</button></div></form>`)}catch(e){console.error(e);return}
 m.querySelector('.cancel').onclick=()=>m.remove();
 m.querySelector('#ccBudgetBaseForm').onsubmit=e=>{e.preventDefault();const n=Math.round(Number(m.querySelector('#ccBudgetBase').value||0)*100)/100;if(!(n>0))return say('Ingresa un presupuesto base mayor que cero.');const old=Number(p.budget||0);p.budget=n;p.updatedAt=typeof iso==='function'?iso():new Date().toISOString();if(!p.procurementReferenceAmount||Number(p.procurementReferenceAmount)===old)p.procurementReferenceAmount=n;try{if(typeof audit==='function')audit('EDITAR','Presupuesto base',p.id,{projectId:p.id,previousBudget:old,budget:n});if(typeof saveDB==='function')saveDB()}catch(err){console.error(err)}m.remove();if(typeof renderProject==='function')renderProject();say('Presupuesto base actualizado.')}
}

function decorateSummary(){
 css();const p=project();if(!p||view?.tab!=='summary')return;const body=document.getElementById('tabBody');if(!body||body.querySelector('[data-cc-summary-budget]'))return;
 const firstGrid=body.querySelector('.summary-grid');if(!firstGrid)return;
 const box=document.createElement('section');box.dataset.ccSummaryBudget='1';box.className='cc-summary-budget-box';const amount=Number(p.budget||0);box.innerHTML=`<div><small>PRESUPUESTO BASE</small><strong>${amount>0?money(amount):'No registrado'}</strong><span>Base económica para comparación de ofertas y control previo a la adjudicación.</span></div>${typeof roleCanEdit==='function'&&!roleCanEdit()?'':`<button type="button" class="btn primary" data-edit-base-budget>${amount>0?'Editar presupuesto base':'Registrar presupuesto base'}</button>`}`;firstGrid.insertAdjacentElement('beforebegin',box);box.querySelector('[data-edit-base-budget]')?.addEventListener('click',()=>openBudgetModal(p))
}

function refresh(){ensureLawRecord();decorateLaw();decorateSummary()}

try{if(typeof renderSummary==='function'&&!renderSummary.__ccSummaryBudgetLaw){const base=renderSummary;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(refresh,0);setTimeout(decorateLaw,450);return r};wrapped.__ccSummaryBudgetLaw=true;renderSummary=wrapped}}catch(e){console.warn(e)}
try{if(typeof renderProject==='function'&&!renderProject.__ccSummaryBudgetLaw){const base=renderProject;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(refresh,0);setTimeout(decorateLaw,450);return r};wrapped.__ccSummaryBudgetLaw=true;renderProject=wrapped}}catch(e){console.warn(e)}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-tab="summary"]')){setTimeout(refresh,0);setTimeout(decorateLaw,450)}},true);
setTimeout(refresh,200);setTimeout(decorateLaw,800);
})();