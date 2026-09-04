/* ===== CONTROL CONTRACTUAL · BLINDAJE DE DOCUMENTOS V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_DOCUMENT_SAFETY_V1__)return;
window.__CC_CONTRACT_DOCUMENT_SAFETY_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const own=(o,k)=>!!o&&Object.prototype.hasOwnProperty.call(o,k);
const text=(o,k)=>own(o,k)?String(o[k]??'').trim():'';
const number=(o,k)=>own(o,k)&&o[k]!==''&&o[k]!==null&&o[k]!==undefined&&Number.isFinite(Number(o[k]))?Number(o[k]):null;
const eq=(a,b,tol=.0001)=>a!==null&&Math.abs(Number(a)-Number(b))<=tol;
const say=m=>{try{toast(m)}catch{try{alert(m)}catch{console.warn(m)}}};

const PROFILE_REQUIRED=[
  'mayorName','mayorDni','contractorGender','contractorDni','contractorProfession',
  'contractorCivilStatus','contractorNationality','contractorAddress','treasuryRecipient',
  'treasuryDepartment','supervisorName','supervisorUnit'
];

function context(){
  let project=null,contract=null;
  try{
    const pid=view?.projectId||window.ccCurrentProjectId?.();
    project=A(db?.projects).find(p=>String(p.id)===String(pid)&&!p.deletedAt)||null;
    if(project)contract=A(db?.contracts).filter(c=>String(c.projectId)===String(project.id)).slice(-1)[0]||null;
  }catch{}
  return{project,contract};
}
function profileMissing(c){
  const p=c?.documentProfile&&typeof c.documentProfile==='object'?c.documentProfile:{};
  return PROFILE_REQUIRED.filter(k=>!text(p,k));
}
function contractCompatibility(p,c){
  const issues=[];
  if(!c)return['Primero registre el contrato.'];
  const ctl=c.controls&&typeof c.controls==='object'?c.controls:{};
  const profile=c.documentProfile&&typeof c.documentProfile==='object'?c.documentProfile:{};
  const missing=profileMissing(c);
  if(missing.length)issues.push(`Confirme los datos del documento en “Revisar datos” (${missing.length} campo${missing.length===1?'':'s'} pendiente${missing.length===1?'':'s'}).`);
  if(!text(ctl,'financingSource'))issues.push('Defina la fuente de financiamiento en Cláusulas y controles.');
  if(!(N(c.executionDays)>0))issues.push('Defina el plazo contractual en días.');
  if(number(ctl,'penaltyDailyPct')===null)issues.push('Defina expresamente la multa diaria, incluso si es 0%.');
  if(number(ctl,'performanceGuaranteePct')===null)issues.push('Defina expresamente la Garantía de Cumplimiento.');

  /* La plantilla Word actual todavía contiene estas condiciones como texto fijo.
     Hasta que cada párrafo sea parametrizado, solo se permite generar si el
     contrato confirmó exactamente las condiciones que la plantilla contiene. */
  const advanceOn=!['No solicitado','Rechazado'].includes(String(c.advanceStatus||'No solicitado'));
  if(!advanceOn)issues.push('La plantilla contractual actual vincula la orden de inicio al anticipo; use una plantilla compatible para contratos sin anticipo.');
  if(advanceOn&&number(c,'advanceRequestedPct')===null&&!(N(c.advanceApproved)>0&&N(c.originalAmount)>0))issues.push('Defina el porcentaje o monto aprobado del anticipo.');
  if(!eq(number(c,'recoveryTarget'),80))issues.push('La plantilla actual establece amortización total del anticipo al 80%; confirme 80% o adapte la plantilla.');
  if(String(ctl.orderStartMode||'')!=='Después del pago/entrega del anticipo'||!eq(number(ctl,'orderStartAfterAdvanceDays'),15))issues.push('La plantilla actual establece orden de inicio 15 días después del anticipo; confirme esa condición o adapte la plantilla.');
  if(ctl.taxApplies!==true||!eq(number(ctl,'taxRatePct'),15))issues.push('La plantilla actual contiene una cláusula tributaria de 15%; confirme esa condición o adapte la plantilla.');
  if(!eq(number(ctl,'advanceGuaranteePct'),100))issues.push('La plantilla actual establece Garantía de Anticipo del 100%; confirme esa condición o adapte la plantilla.');
  if(!eq(number(ctl,'performanceExtraMonths'),3))issues.push('La plantilla actual mantiene la Garantía de Cumplimiento 3 meses adicionales; confirme esa condición o adapte la plantilla.');
  if(!eq(number(ctl,'qualityGuaranteePct'),5)||!eq(number(ctl,'qualityGuaranteeDays'),365))issues.push('La plantilla actual establece Garantía de Calidad de 5% por un año; confirme esa condición o adapte la plantilla.');
  if(!eq(number(ctl,'changeOrderLimitPct'),10)||!eq(number(ctl,'accumulatedChangeLimitPct'),25))issues.push('La plantilla actual establece 10% para Orden de Cambio y 25% acumulado; confirme esos límites o adapte la plantilla.');
  if(!eq(number(ctl,'rescissionCureDays'),10))issues.push('La plantilla actual establece 10 días hábiles para subsanar incumplimientos; confirme ese plazo o adapte la plantilla.');
  if(ctl.successionClauseEnabled!==true||!eq(number(ctl,'successionSuspensionDays'),30))issues.push('La plantilla contiene procedimiento sucesorio con suspensión máxima de 30 días; confírmelo o adapte la plantilla.');
  if(ctl.emergencyClauseEnabled!==true||!eq(number(ctl,'emergencyNoticeDays'),5)||!eq(number(ctl,'emergencyReviewDays'),10))issues.push('La plantilla contiene contingencia por emergencia con plazos de 5 y 10 días; confírmelos o adapte la plantilla.');
  if(String(ctl.priceType||'')!=='Fijo'||ctl.priceAdjustmentAllowed===true)issues.push('La plantilla declara precio fijo sin reajuste automático; confirme esa condición o adapte la plantilla.');
  if(!text(ctl,'governingLaw'))issues.push('Defina la normativa aplicable.');
  if(!text(ctl,'disputeJurisdiction'))issues.push('Defina la jurisdicción o mecanismo de solución de conflictos.');
  return issues;
}
function noteCompatibility(p,c){
  const issues=[];
  if(!c)return['Primero registre el contrato.'];
  const ctl=c.controls&&typeof c.controls==='object'?c.controls:{};
  const missing=profileMissing(c);if(missing.length)issues.push('Confirme los datos del documento en “Revisar datos”.');
  if(!text(ctl,'financingSource'))issues.push('Defina la fuente de financiamiento.');
  const pct=number(c,'advanceRequestedPct'),approved=N(c.advanceApproved),amount=N(c.originalAmount||c.currentAmount||p?.budget);
  if(!(approved>0||(pct!==null&&pct>0&&amount>0)))issues.push('No existe un anticipo solicitado o aprobado válido.');
  return issues;
}
function startCompatibility(p,c){
  const issues=[];
  if(!c)return['Primero registre el contrato.'];
  const ctl=c.controls&&typeof c.controls==='object'?c.controls:{},profile=c.documentProfile&&typeof c.documentProfile==='object'?c.documentProfile:{};
  for(const key of ['mayorName','supervisorName','projectDepartment','projectMunicipality','projectVillage','officialStartDate'])if(!text(profile,key))issues.push(`Falta ${key} en los datos para la orden de inicio.`);
  if(!text(ctl,'financingSource'))issues.push('Defina la fuente de financiamiento.');
  return issues;
}
function validate(kind,p,c){
  if(kind==='contract')return contractCompatibility(p,c);
  if(kind==='advanceRemittance')return noteCompatibility(p,c);
  if(kind==='startOrder')return startCompatibility(p,c);
  if(kind==='all')return[...contractCompatibility(p,c),...noteCompatibility(p,c),...startCompatibility(p,c)].filter((v,i,a)=>a.indexOf(v)===i);
  return[];
}
function block(kind,p,c){
  const issues=validate(kind,p,c);if(!issues.length)return false;
  say(`Documento bloqueado por control contractual: ${issues[0]}${issues.length>1?` (${issues.length} revisiones pendientes)`:''}`);
  try{audit?.('BLOQUEAR DOCUMENTO','Control contractual',c?.id||p?.id||'',{projectId:p?.id||null,contractId:c?.id||null,kind,issues})}catch{}
  return true;
}
function kindFromControl(control){
  if(control.matches?.('[data-cc-doc-contract],[data-cc-contract-preview]'))return'contract';
  if(control.matches?.('[data-cc-doc-note]'))return'advanceRemittance';
  if(control.matches?.('[data-cc-doc-start]'))return'startOrder';
  if(control.matches?.('[data-cc-doc-all]'))return'all';
  return'';
}

document.addEventListener('click',event=>{
  const control=event.target?.closest?.('[data-cc-doc-contract],[data-cc-doc-note],[data-cc-doc-start],[data-cc-doc-all],[data-cc-contract-preview]');
  if(!control)return;const kind=kindFromControl(control),{project,contract}=context();
  if(!kind||!block(kind,project,contract))return;
  event.preventDefault();event.stopImmediatePropagation();
},true);

function wrapApi(){
  const api=window.ccContractPaymentDocuments;if(!api||api.__ccDocumentSafetyWrapped||typeof api.generate!=='function')return false;
  const generate=api.generate.bind(api);
  api.generate=async function(p,c,kind){if(block(kind,p,c))return false;return generate(p,c,kind)};
  api.__ccDocumentSafetyWrapped=true;return true;
}
wrapApi();setTimeout(wrapApi,0);setTimeout(wrapApi,500);
new MutationObserver(()=>wrapApi()).observe(document.documentElement,{childList:true,subtree:true});
window.__ccContractDocumentSafety={validate,contractCompatibility,noteCompatibility,startCompatibility,profileMissing,block};
})();
