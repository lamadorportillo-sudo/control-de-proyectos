/* ===== INTEGRIDAD CONTRACTUAL Y FINANCIERA V2 · REGLAS EXPLÍCITAS ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_INTEGRITY_V2__)return;
window.__CC_CONTRACT_INTEGRITY_V2__=true;
window.__CC_CONTRACT_INTEGRITY_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const C=v=>typeof cents==='function'?cents(v):Math.round(N(v)*100);
const F=v=>typeof fromCents==='function'?fromCents(v):Math.round(N(v))/100;
const R=v=>typeof round2==='function'?round2(v):F(C(v));
const now=()=>typeof iso==='function'?iso():new Date().toISOString();
const say=m=>{try{toast(m)}catch{console.log(m)}};
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const active=x=>!!x&&!x.voidedAt&&!x.voided_at&&!/anulad/i.test(String(x.status||''));
const certified=x=>active(x)&&['aprobada','aprobado','pagada','pagado'].includes(norm(x.status));
const paid=x=>active(x)&&['pagada','pagado'].includes(norm(x.status));
const qualifiedOffer=x=>x?.eligible!==false&&['cumple','admisible'].includes(norm(x?.technicalStatus));
const hasExplicit=(o,k)=>!!o&&Object.prototype.hasOwnProperty.call(o,k)&&o[k]!==''&&o[k]!==null&&o[k]!==undefined&&Number.isFinite(Number(o[k]));
const currentAmount=c=>{
  if(!c)return 0;
  const changes=A(db?.changes).filter(x=>active(x)&&x.contractId===c.id&&norm(x.status)==='aprobado');
  return R(N(c.originalAmount)+changes.reduce((s,x)=>s+N(x.amountDelta),0));
};

function financialModel(p,c=null,estimates=null){
  const contract=c||A(db?.contracts).find(x=>x.projectId===p?.id),all=A(estimates??(contract?A(db?.estimates).filter(e=>e.contractId===contract.id):[])).filter(active);
  const est=all.filter(certified),moves=A(db?.payments).filter(x=>active(x)&&x.projectId===p?.id&&!x.estimateId);
  const grossC=est.reduce((s,e)=>s+C(e.gross),0),netC=est.reduce((s,e)=>s+C(e.net),0);
  const proposedC=all.reduce((s,e)=>s+C(e.gross),0),paidEstimatesC=est.filter(paid).reduce((s,e)=>s+C(e.net),0);
  const advancePaidC=C(contract?.advancePaid),movementPaidC=moves.filter(paid).reduce((s,x)=>s+C(x.amount),0),totalPaidC=advancePaidC+paidEstimatesC+movementPaidC;
  const currentC=C(contract?currentAmount(contract):(p?.budget||0));
  const qualityRetainedC=est.reduce((s,e)=>s+C(e.qualityApplied),0),qualityReturnedC=moves.filter(x=>paid(x)&&/calidad/i.test(x.movementType||'')).reduce((s,x)=>s+C(x.amount),0);
  const advanceAmortizedC=est.reduce((s,e)=>s+C(e.advanceApplied),0);
  return{contract,est,allEstimates:all,moves,grossC,netC,proposedC,paidEstimatesC,advancePaidC,movementPaidC,totalPaidC,currentC,
    contractPendingC:Math.max(0,currentC-totalPaidC),contractOverrunC:Math.max(0,totalPaidC-currentC),
    saldoEstimarC:Math.max(0,currentC-grossC),estimateOverrunC:Math.max(0,grossC-currentC),
    qualityRetainedC,qualityReturnedC,qualityPendingC:Math.max(0,qualityRetainedC-qualityReturnedC),
    advanceAmortizedC,advancePendingC:Math.max(0,advancePaidC-advanceAmortizedC)};
}

function automaticProgress(p,c=null){
  const contract=c||A(db?.contracts).find(x=>x.projectId===p?.id),fin=financialModel(p,contract),baseC=fin.currentC;
  const financial=baseC?Math.max(0,Math.min(100,R(fin.grossC/baseC*100))):0;
  const visits=A(db?.visits).filter(v=>active(v)&&v.projectId===p?.id&&Number.isFinite(Number(v.physical))).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||N(a.number)-N(b.number));
  const lastVisit=visits.at(-1),physical=lastVisit?Math.max(0,Math.min(100,R(lastVisit.physical))):Math.max(0,Math.min(100,R(p?.physicalProgress||0)));
  const lastEstimate=fin.est.slice().sort((a,b)=>String(a.end||a.start||'').localeCompare(String(b.end||b.start||''))).at(-1);
  return{physical,financial,source:fin.est.length?'Estimaciones aprobadas/pagadas':'Sin estimaciones certificadas',date:lastEstimate?.end||lastEstimate?.start||'',physicalSource:lastVisit?`Visita N.º ${lastVisit.number||'—'}`:'Sin visita de campo'};
}

window.projectFinancials=financialModel;
window.projectAutomaticProgress=automaticProgress;
window.estimateIsPaid=paid;
window.estimateAutomaticProgress=function(c,e,estimates=null){
  if(!c||!e)return 0;
  const list=A(estimates??A(db?.estimates).filter(x=>x.contractId===c.id)).filter(certified).sort((a,b)=>N(a.number)-N(b.number));
  const baseC=C(currentAmount(c));if(!baseC)return 0;
  let grossC=0;for(const row of list){grossC+=C(row.gross);if(row.id===e.id)break}
  return Math.max(0,Math.min(100,R(grossC/baseC*100)));
};
window.syncAllProjectProgress=function(){
  A(db?.projects).forEach(p=>{const c=A(db?.contracts).find(x=>x.projectId===p.id),a=automaticProgress(p,c);p.financialProgress=a.financial;if(a.physicalSource!=='Sin visita de campo')p.physicalProgress=a.physical});
};

function estimateLimit(c,editing){
  const currentC=C(currentAmount(c));
  const priorC=A(db?.estimates).filter(x=>x.contractId===c.id&&x.id!==editing?.id&&certified(x)).reduce((s,x)=>s+C(x.gross),0);
  return{currentC,priorC,availableC:Math.max(0,currentC-priorC)};
}
function protectEstimateForm(c,editing){
  const form=document.getElementById('estForm'),gross=document.getElementById('eGross'),status=document.getElementById('eStatus');
  if(!form||!gross||form.dataset.integrityBound==='1')return;form.dataset.integrityBound='1';
  const update=()=>{
    const lim=estimateLimit(c,editing),thisC=C(gross.value),counts=certified({status:status?.value}),afterC=lim.priorC+(counts?thisC:0),bad=thisC>lim.availableC;
    let panel=form.querySelector('.cc-eng-impact');if(!panel){panel=document.createElement('section');panel.className='cc-eng-impact';form.querySelector('.modal-actions')?.before(panel)}
    panel.className='cc-eng-impact '+(bad?'bad':'ok');
    const money=v=>typeof fmtC==='function'?fmtC(v):`L ${F(v).toLocaleString('en-US',{minimumFractionDigits:2})}`;
    panel.innerHTML=`<h4>Control previo al registro</h4><div class="cc-eng-impact-grid"><div><small>Monto contractual vigente</small><b>${money(lim.currentC)}</b></div><div><small>Certificado previamente</small><b>${money(lim.priorC)}</b></div><div><small>Esta estimación</small><b>${money(thisC)}</b></div><div><small>Saldo máximo disponible</small><b>${money(lim.availableC)}</b></div></div><div class="cc-human-note">${bad?`No se puede guardar: la estimación excede el saldo contractual disponible en ${money(thisC-lim.availableC)}.`:counts?`Al guardar, el avance financiero certificado será ${lim.currentC?R(afterC/lim.currentC*100).toFixed(2):'0.00'}%.`:'El estado seleccionado no alimentará el avance financiero hasta que la estimación sea aprobada o pagada.'}</div>`;
  };
  gross.addEventListener('input',update);status?.addEventListener('change',update);update();
  form.addEventListener('submit',ev=>{const lim=estimateLimit(c,editing),thisC=C(gross.value);if(thisC>lim.availableC){ev.preventDefault();ev.stopImmediatePropagation();say(`La estimación supera el saldo contractual disponible. Máximo: ${F(lim.availableC).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}.`);gross.focus()}},true);
}
if(typeof estimateModal==='function'&&!estimateModal.__ccIntegrity){const base=estimateModal;const wrapped=function(p,c,e){const out=base.apply(this,arguments);queueMicrotask(()=>protectEstimateForm(c,e));return out};wrapped.__ccIntegrity=true;window.estimateModal=wrapped}

async function rpcVoid(name,body,notFound){
  let connected=false;try{connected=!!(cloudLoaded&&session?.accessToken&&navigator.onLine&&typeof sbFetch==='function')}catch{}
  if(!connected)return;
  try{await sbFetch(`/rest/v1/rpc/${name}`,{method:'POST',body})}catch(err){const msg=String(err?.message||err);if(notFound.test(msg)||/PGRST202|could not find/i.test(msg))return;throw err}
}
function archive(activeKey,archiveKey,id,status,reason){
  db[activeKey]=A(db?.[activeKey]);db[archiveKey]=A(db?.[archiveKey]);const i=db[activeKey].findIndex(x=>x.id===id);if(i<0)return null;
  const row=db[activeKey][i];Object.assign(row,{status,voidedAt:now(),voidedBy:session?.userId||null,voidReason:reason});db[activeKey].splice(i,1);db[archiveKey].unshift(row);return row;
}
async function voidEstimate(id){
  const row=A(db?.estimates).find(x=>x.id===id);if(!row)return;const reason=prompt(`Motivo de anulación de la estimación N.º ${row.number}:`);if(!reason?.trim())return;
  try{await rpcVoid('void_estimate',{p_estimate_id:id,p_reason:reason.trim()},/ESTIMACION_NO_ENCONTRADA/i);archive('estimates','voidedEstimates',id,'Anulada',reason.trim());A(db?.payments).filter(x=>x.estimateId===id).forEach(x=>archive('payments','voidedPayments',x.id,'Anulado',`Estimación anulada: ${reason.trim()}`));audit?.('ANULAR','Estimación',id,{reason:reason.trim(),number:row.number,projectId:row.projectId,contractId:row.contractId});saveDB();renderProject();say('Estimación anulada; su historial fue conservado.')}catch(err){console.error(err);say(err.message||'No se pudo anular la estimación.')}
}

function deriveOriginalDays(c,approved){
  const delta=approved.reduce((s,x)=>s+Math.trunc(N(x.daysDelta)),0),amountDelta=approved.reduce((s,x)=>s+N(x.amountDelta),0),currentDays=Math.max(1,Math.trunc(N(c.executionDays)||(c.start&&c.end&&typeof daysBetween==='function'?daysBetween(c.start,c.end):1)));
  if(N(c.originalExecutionDays)>0)return Math.trunc(N(c.originalExecutionDays));
  if(c.start&&c.originalEnd&&typeof daysBetween==='function')return Math.max(1,daysBetween(c.start,c.originalEnd));
  const alreadyApplied=Math.abs(N(c.currentAmount)-(N(c.originalAmount)+amountDelta))<0.02;
  return Math.max(1,alreadyApplied?currentDays-delta:currentDays);
}
window.recalcContract=function(c){
  if(!c)return;const approved=A(db?.changes).filter(x=>active(x)&&x.contractId===c.id&&norm(x.status)==='aprobado'),amountDelta=approved.reduce((s,x)=>s+N(x.amountDelta),0),daysDelta=approved.reduce((s,x)=>s+Math.trunc(N(x.daysDelta)),0);
  c.originalExecutionDays=deriveOriginalDays(c,approved);if(!c.originalEnd&&c.start&&typeof addExecutionDays==='function')c.originalEnd=addExecutionDays(c.start,c.originalExecutionDays);
  c.currentAmount=R(N(c.originalAmount)+amountDelta);c.executionDays=Math.max(1,c.originalExecutionDays+daysDelta);if(c.start&&typeof addExecutionDays==='function')c.end=addExecutionDays(c.start,c.executionDays);
  c.approvedChangeAmount=R(amountDelta);c.approvedChangeDays=daysDelta;c.updatedAt=now();const p=A(db?.projects).find(x=>x.id===c.projectId);if(p){p.end=c.end||p.end;p.executionDays=c.executionDays;p.updatedAt=c.updatedAt}
};
function protectChangeForm(){const form=document.getElementById('chForm'),status=document.getElementById('chStatus'),just=document.getElementById('chJust');if(!form||form.dataset.integrityBound==='1')return;form.dataset.integrityBound='1';form.addEventListener('submit',ev=>{if(norm(status?.value)==='aprobado'&&!just?.value.trim()){ev.preventDefault();ev.stopImmediatePropagation();say('Una modificación aprobada requiere justificación técnica y contractual.');just?.focus()}},true)}
if(typeof changeModal==='function'&&!changeModal.__ccIntegrity){const base=changeModal;const wrapped=function(){const out=base.apply(this,arguments);queueMicrotask(protectChangeForm);return out};wrapped.__ccIntegrity=true;window.changeModal=wrapped}
async function voidChange(id){const row=A(db?.changes).find(x=>x.id===id);if(!row)return;const reason=prompt(`Motivo de anulación de la modificación ${row.number||''}:`);if(!reason?.trim())return;try{await rpcVoid('void_contract_change',{p_change_id:id,p_reason:reason.trim()},/MODIFICACION_NO_ENCONTRADA|CAMBIO_NO_ENCONTRADO/i);archive('changes','voidedChanges',id,'Anulada',reason.trim());const c=A(db?.contracts).find(x=>x.id===row.contractId);if(c)recalcContract(c);audit?.('ANULAR','Modificación',id,{reason:reason.trim(),number:row.number,projectId:row.projectId,contractId:row.contractId});saveDB();renderProject();say('Modificación anulada; su historial fue conservado.')}catch(err){console.error(err);say(err.message||'No se pudo anular la modificación.')}}

function addMonths(date,months){if(!date)return'';const d=new Date(`${date}T12:00:00`);d.setMonth(d.getMonth()+Math.max(0,Math.trunc(N(months))));return d.toISOString().slice(0,10)}
function guaranteeIssues(g,c){
  const out=[];if(!String(g?.number||'').trim())out.push('Falta el número de garantía.');if(!String(g?.issuer||'').trim())out.push('Falta la institución emisora.');if(!String(g?.document||g?.document_ref||'').trim())out.push('Falta la referencia documental.');if(!g?.start||!g?.end)out.push('La vigencia está incompleta.');
  if(!c)return out;
  const rawCtrl=c.controls&&typeof c.controls==='object'?c.controls:{};
  const ctrl=typeof contractControlDefaults==='function'?contractControlDefaults(rawCtrl):rawCtrl;
  const amount=currentAmount(c),applied=N(g?.applied),type=norm(g?.type);
  if(type==='anticipo'&&N(c.advancePaid)>0&&applied+0.01<N(c.advancePaid))out.push('La garantía de anticipo no cubre el anticipo pagado.');
  if(type==='cumplimiento'){
    if(!hasExplicit(rawCtrl,'performanceGuaranteePct')){
      out.push('Definir el porcentaje de la Garantía de Cumplimiento según contrato.');
    }else{
      const configuredPct=N(rawCtrl.performanceGuaranteePct),expected=R(amount*configuredPct/100);
      if(applied+0.01<expected)out.push(`La garantía de cumplimiento es menor al ${configuredPct}% configurado.`);
    }
    if(hasExplicit(rawCtrl,'performanceExtraMonths')&&N(rawCtrl.performanceExtraMonths)>0){
      const minEnd=addMonths(c.end,N(rawCtrl.performanceExtraMonths));if(minEnd&&g.end&&g.end<minEnd)out.push(`La vigencia debe cubrir al menos hasta ${minEnd}.`);
    }
  }
  if(type==='calidad'){
    if(!hasExplicit(rawCtrl,'qualityGuaranteePct')){
      out.push('Definir el porcentaje de la Garantía de Calidad según contrato.');
    }else{
      const configuredPct=N(rawCtrl.qualityGuaranteePct),expected=R(amount*configuredPct/100);
      if(applied+0.01<expected)out.push(`La garantía de calidad es menor al ${configuredPct}% configurado.`);
    }
    if(hasExplicit(rawCtrl,'qualityGuaranteeDays')&&N(rawCtrl.qualityGuaranteeDays)>0&&g.start&&g.end&&typeof daysBetween==='function'&&daysBetween(g.start,g.end)<N(rawCtrl.qualityGuaranteeDays))out.push(`La vigencia es menor a ${N(rawCtrl.qualityGuaranteeDays)} días.`);
  }
  return out;
}
function protectGuaranteeForm(){const form=document.getElementById('gForm');if(!form||form.dataset.integrityBound==='1')return;form.dataset.integrityBound='1';['gNumber','gIssuer','gDoc'].forEach(id=>{const el=document.getElementById(id);if(el){el.required=true;el.closest('.field')?.querySelector('span')?.append(' *')}});form.addEventListener('submit',ev=>{for(const id of ['gNumber','gIssuer','gDoc']){const el=document.getElementById(id);if(!el?.value.trim()){ev.preventDefault();ev.stopImmediatePropagation();say('Completa el número, la institución emisora y la referencia documental.');el?.focus();return}}},true)}
if(typeof guaranteeModal==='function'&&!guaranteeModal.__ccIntegrity){const base=guaranteeModal;const wrapped=function(){const out=base.apply(this,arguments);queueMicrotask(protectGuaranteeForm);return out};wrapped.__ccIntegrity=true;window.guaranteeModal=wrapped}
function decorateGuarantees(c,gs){const cards=[...document.querySelectorAll('#tabBody .project-grid > article.card')];A(gs).forEach((g,i)=>{const issues=guaranteeIssues(g,c),card=cards[i];if(!card||!issues.length||card.querySelector('[data-guarantee-integrity]'))return;const box=document.createElement('div');box.dataset.guaranteeIntegrity='1';box.className='alert danger';box.innerHTML=`<b>Documentación por completar:</b><br>${issues.map(x=>`• ${String(x).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}`).join('<br>')}`;card.querySelector('.actions')?.before(box)||card.appendChild(box)})}
if(typeof renderGuarantees==='function'&&!renderGuarantees.__ccIntegrity){const base=renderGuarantees;const wrapped=function(p,c,gs){const out=base.apply(this,arguments);queueMicrotask(()=>decorateGuarantees(c,gs));return out};wrapped.__ccIntegrity=true;window.renderGuarantees=wrapped}
if(typeof contractControlAlerts==='function'&&!contractControlAlerts.__ccIntegrity){const base=contractControlAlerts;const wrapped=function(p,c){const out=A(base.apply(this,arguments)).slice();A(db?.guarantees).filter(g=>active(g)&&g.contractId===c?.id).forEach(g=>guaranteeIssues(g,c).forEach(issue=>out.push({level:'danger',text:`Garantía ${g.type||'sin tipo'}${g.number?` ${g.number}`:''}: ${issue}`})));return out};wrapped.__ccIntegrity=true;window.contractControlAlerts=wrapped}

window.procurementSuggestion=function(p){const offers=A(typeof projectProcurement==='function'?projectProcurement(p).offers:p?.procurement?.offers);return offers.filter(qualifiedOffer).filter(o=>N(o.correctedAmount??o.amount)>0).sort((a,b)=>N(a.correctedAmount??a.amount)-N(b.correctedAmount??b.amount))[0]||null};
function validAwardForm(form){
  const finalId=form?.querySelector('#prFinal')?.value||'',status=form?.querySelector('#prStatus')?.value||'';if(!finalId||norm(status)!=='adjudicado')return true;
  const p=A(db?.projects).find(x=>x.id===view?.projectId),proc=p&&(typeof projectProcurement==='function'?projectProcurement(p):p.procurement),award=A(proc?.offers).find(o=>String(o.id)===String(finalId)),suggestion=p?window.procurementSuggestion(p):null;
  if(!qualifiedOffer(award)){say('No se puede adjudicar una oferta sin evaluación técnica “Cumple” o “Admisible”.');form.querySelector('#prFinal')?.focus();return false}
  if(suggestion&&String(suggestion.id)!==String(finalId)&&!form.querySelector('#prDiff')?.value.trim()){say('Justifica por qué la adjudicación difiere de la oferta recomendada.');form.querySelector('#prDiff')?.focus();return false}
  return true;
}
function validScannedEstimates(){
  const target=document.getElementById('scanTarget'),rows=[...document.querySelectorAll('[data-scan-row]')];if(!target||!rows.length)return true;
  const p=target.value==='new'?null:A(db?.projects).find(x=>x.id===target.value),c=p?A(db?.contracts).find(x=>x.projectId===p.id):null,currentC=C(c?currentAmount(c):(document.getElementById('scanContractAmount')?.value||0));if(!currentC)return true;
  const imported=rows.map(row=>({number:N(row.querySelector('[data-f="number"]')?.value),grossC:C(row.querySelector('[data-f="gross"]')?.value),status:row.querySelector('[data-f="status"]')?.value||'Borrador'}));
  const numbers=new Set(imported.map(x=>x.number)),priorC=c?A(db?.estimates).filter(x=>x.contractId===c.id&&certified(x)&&!numbers.has(N(x.number))).reduce((s,x)=>s+C(x.gross),0):0;
  const certifiedC=imported.filter(x=>certified({status:x.status})).reduce((s,x)=>s+x.grossC,0),availableC=Math.max(0,currentC-priorC),largestC=Math.max(0,...imported.map(x=>x.grossC));
  if(certifiedC>availableC||largestC>availableC){say(`La importación supera el saldo contractual disponible. Máximo disponible: ${F(availableC).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}.`);return false}
  return true;
}
document.addEventListener('click',ev=>{const btn=ev.target.closest?.('#procForm .modal-actions .primary');if(btn&&!validAwardForm(btn.closest('#procForm'))){ev.preventDefault();ev.stopImmediatePropagation()}},true);
document.addEventListener('submit',ev=>{if(ev.target?.id==='procForm'&&!validAwardForm(ev.target)){ev.preventDefault();ev.stopImmediatePropagation()}},true);

async function voidByClick(ev){
  const scan=ev.target.closest?.('#scanSave');if(scan&&!validScannedEstimates()){ev.preventDefault();ev.stopImmediatePropagation();return}
  const est=ev.target.closest?.('[data-del-est]');if(est){ev.preventDefault();ev.stopImmediatePropagation();voidEstimate(est.dataset.delEst);return}
  const change=ev.target.closest?.('[data-del-ch]');if(change){ev.preventDefault();ev.stopImmediatePropagation();voidChange(change.dataset.delCh);return}
  const offer=ev.target.closest?.('[data-del-offer]');if(offer){ev.preventDefault();ev.stopImmediatePropagation();const p=A(db?.projects).find(x=>x.id===view?.projectId),proc=p&&(typeof projectProcurement==='function'?projectProcurement(p):p.procurement),row=A(proc?.offers).find(x=>String(x.id)===String(offer.dataset.delOffer));if(!p||!proc||!row)return;const reason=prompt(`Motivo de anulación de la oferta de ${row.bidder||'este oferente'}:`);if(!reason?.trim())return;proc.voidedOffers=A(proc.voidedOffers);Object.assign(row,{status:'Anulada',voidedAt:now(),voidedBy:session?.userId||null,voidReason:reason.trim()});proc.offers=A(proc.offers).filter(x=>x.id!==row.id);proc.voidedOffers.unshift(row);if(proc.finalAwardOfferId===row.id){proc.finalAwardOfferId='';proc.finalAwardName='';proc.finalAwardAmount=0}const sg=window.procurementSuggestion(p);proc.suggestedOfferId=sg?.id||'';audit?.('ANULAR','Oferta',row.id,{projectId:p.id,bidder:row.bidder,reason:reason.trim()});saveDB();const c=A(db?.contracts).find(x=>x.projectId===p.id);renderProcurement(p,c);say('Oferta anulada; su historial fue conservado.')}
}
document.addEventListener('click',voidByClick,true);
function relabel(){document.querySelectorAll('[data-del-est],[data-del-ch]').forEach(b=>{b.textContent='Anular';b.title='Anula el registro y conserva la trazabilidad.'})}
new MutationObserver(relabel).observe(document.documentElement,{childList:true,subtree:true});queueMicrotask(relabel);

// Las correcciones de contratos específicos no se ejecutan desde el runtime.
// Cualquier ajuste contractual debe provenir de datos validados y quedar trazado
// mediante el flujo normal de edición/migración, nunca por temporizadores ocultos.
window.__ccContractIntegrity={active,certified,paid,qualifiedOffer,currentAmount,financialModel,automaticProgress,estimateLimit,guaranteeIssues,deriveOriginalDays,validScannedEstimates};
})();
