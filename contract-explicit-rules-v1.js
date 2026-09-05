/* ===== CONTROL CONTRACTUAL · REGLAS CONTRACTUALES EXPLÍCITAS V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_EXPLICIT_RULES_V1__)return;
window.__CC_CONTRACT_EXPLICIT_RULES_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const rawControls=c=>c?.controls&&typeof c.controls==='object'?c.controls:{};
const hasNumber=(o,k)=>!!o&&Object.prototype.hasOwnProperty.call(o,k)&&o[k]!==''&&o[k]!==null&&o[k]!==undefined&&Number.isFinite(Number(o[k]));
const pctText=v=>typeof pct==='function'?pct(v):`${N(v).toFixed(2)}%`;
const say=m=>{try{toast(m)}catch{console.log(m)}};

const CONTRACT_NUMERIC_FIELDS=[
  'orderStartAfterAdvanceDays','penaltyDailyPct','qualityRetentionPct','advanceGuaranteePct',
  'performanceGuaranteePct','performanceExtraMonths','qualityGuaranteePct','qualityGuaranteeDays',
  'changeOrderLimitPct','contractorResolutionThresholdPct','accumulatedChangeLimitPct',
  'rescissionCureDays','emergencyNoticeDays','emergencyReviewDays','successionSuspensionDays'
];

/* El núcleo histórico contenía porcentajes y plazos de una plantilla. Desde esta
   capa, un dato ausente permanece ausente. Los valores que sí estén guardados en
   el contrato se respetan, incluido cero cuando haya sido registrado de forma expresa. */
const baseDefaults=typeof contractControlDefaults==='function'?contractControlDefaults:null;
window.contractControlDefaults=function(existing={}){
  const raw=existing&&typeof existing==='object'?existing:{};
  const out=baseDefaults?baseDefaults(raw):Object.assign({},raw);
  for(const key of CONTRACT_NUMERIC_FIELDS){if(!hasNumber(raw,key))out[key]=null}
  return out;
};

/* Las alertas automáticas no pueden fabricar obligaciones ni límites cuando el
   contrato no los contiene. Las alertas de integridad no contractuales se conservan. */
const baseAlerts=typeof contractControlAlerts==='function'?contractControlAlerts:null;
window.contractControlAlerts=function(p,c){
  const raw=rawControls(c),items=baseAlerts?A(baseAlerts(p,c)):[];
  return items.filter(item=>{
    const text=String(item?.text||'');
    if(!hasNumber(raw,'penaltyDailyPct')&&/multa diaria aplicada/i.test(text))return false;
    if(!hasNumber(raw,'accumulatedChangeLimitPct')&&/límite de control configurado/i.test(text))return false;
    if(!hasNumber(raw,'performanceGuaranteePct')&&/no se ha registrado la Garantía de Cumplimiento/i.test(text))return false;
    if(!hasNumber(raw,'qualityGuaranteePct')&&/no se ha registrado Garantía de Calidad/i.test(text))return false;
    if(!hasNumber(raw,'advanceGuaranteePct')&&/no se ha registrado la Garantía de Anticipo/i.test(text))return false;
    return true;
  });
};

function currentContract(){
  try{
    const pid=view?.projectId;if(!pid)return null;
    return A(db?.contracts).find(c=>c.projectId===pid)||null;
  }catch{return null}
}

/* Sustituye 10/20/25 universales por los límites realmente configurados en el
   contrato. Si faltan, la interfaz solicita definirlos en vez de clasificar sola. */
window.changeClass=function(original,deltaAccum,contract=null){
  const o=Math.abs(N(original)),p=o?Math.round(Math.abs(N(deltaAccum))/o*10000)/100:0;
  const c=contract||currentContract(),raw=rawControls(c);
  const orderLimit=hasNumber(raw,'changeOrderLimitPct')?N(raw.changeOrderLimitPct):null;
  const resolutionLimit=hasNumber(raw,'contractorResolutionThresholdPct')?N(raw.contractorResolutionThresholdPct):null;
  const accumulatedLimit=hasNumber(raw,'accumulatedChangeLimitPct')?N(raw.accumulatedChangeLimitPct):null;
  const suggested=orderLimit===null?'Definir según contrato':(p<=orderLimit?'Orden de Cambio':'Adenda');
  let alert='Definir límites de modificación según contrato.';
  if(accumulatedLimit!==null&&p>accumulatedLimit)alert=`REVISIÓN CONTRACTUAL: supera ${accumulatedLimit.toFixed(2)}% configurado como límite acumulado.`;
  else if(resolutionLimit!==null&&p>resolutionLimit)alert=`ATENCIÓN CONTRACTUAL: supera ${resolutionLimit.toFixed(2)}% configurado como umbral de resolución/revisión.`;
  else if(orderLimit!==null&&p>orderLimit)alert=`Supera ${orderLimit.toFixed(2)}% configurado para Orden de Cambio; revisar Adenda.`;
  else if(orderLimit!==null)alert=`Dentro del límite de Orden de Cambio configurado de ${orderLimit.toFixed(2)}%.`;
  return{pct:p,suggested,alert,limits:{orderLimit,resolutionLimit,accumulatedLimit}};
};

function setInfoText(label,text){
  const body=document.getElementById('tabBody');if(!body)return;
  for(const card of body.querySelectorAll('.info')){
    if(card.querySelector('small')?.textContent?.trim()!==label)continue;
    const strong=card.querySelector('strong');if(strong)strong.textContent=text;
    else{const value=card.querySelector('.money,strong,b');if(value)value.textContent=text}
  }
}

function decorateControlSummary(c){
  const raw=rawControls(c);
  const missing=(key,label)=>{if(!hasNumber(raw,key))setInfoText(label,'Definir según contrato')};
  missing('penaltyDailyPct','Multa diaria %');
  if(!hasNumber(raw,'penaltyDailyPct'))setInfoText('Multa diaria aplicada','Definir según contrato');
  missing('qualityRetentionPct','Retención de calidad en estimaciones');
  missing('advanceGuaranteePct','Garantía anticipo');
  if(!hasNumber(raw,'performanceGuaranteePct'))setInfoText('Garantía cumplimiento','Definir según contrato');
  else if(!hasNumber(raw,'performanceExtraMonths'))setInfoText('Garantía cumplimiento',`${pctText(raw.performanceGuaranteePct)} · vigencia adicional: definir según contrato`);
  if(!hasNumber(raw,'qualityGuaranteePct'))setInfoText('Garantía calidad','Definir según contrato');
  else if(!hasNumber(raw,'qualityGuaranteeDays'))setInfoText('Garantía calidad',`${pctText(raw.qualityGuaranteePct)} · vigencia: definir según contrato`);
  missing('changeOrderLimitPct','Orden de Cambio');
  missing('contractorResolutionThresholdPct','Alerta resolución contratista');
  missing('accumulatedChangeLimitPct','Límite modificaciones acumuladas');
  missing('rescissionCureDays','Plazo para subsanar incumplimiento');
  missing('emergencyNoticeDays','Emergencia: notificación');
}

if(typeof renderContractControls==='function'&&!renderContractControls.__ccExplicitRules){
  const base=renderContractControls;
  const wrapped=function(p,c){const out=base.apply(this,arguments);queueMicrotask(()=>decorateControlSummary(c));return out};
  wrapped.__ccExplicitRules=true;window.renderContractControls=wrapped;
}

const controlInputs={
  ctStartAfterAdvance:'orderStartAfterAdvanceDays',ctPenaltyPct:'penaltyDailyPct',ctQualityRetention:'qualityRetentionPct',
  ctAdvG:'advanceGuaranteePct',ctPerfG:'performanceGuaranteePct',ctPerfMonths:'performanceExtraMonths',
  ctQualG:'qualityGuaranteePct',ctQualDays:'qualityGuaranteeDays',ctChangeLimit:'changeOrderLimitPct',
  ctResolutionLimit:'contractorResolutionThresholdPct',ctAccumLimit:'accumulatedChangeLimitPct',
  ctCureDays:'rescissionCureDays',ctEmergencyNotice:'emergencyNoticeDays',ctEmergencyReview:'emergencyReviewDays',
  ctSuccDays:'successionSuspensionDays'
};

if(typeof contractControlsModal==='function'&&!contractControlsModal.__ccExplicitRules){
  const base=contractControlsModal;
  const wrapped=function(p,c){
    const before=Object.assign({},rawControls(c)),out=base.apply(this,arguments);
    queueMicrotask(()=>{
      const form=document.getElementById('ctrlForm');if(!form)return;
      for(const [id,key] of Object.entries(controlInputs)){
        const input=document.getElementById(id);if(input&&!hasNumber(before,key)){input.value='';input.placeholder='Según contrato'}
      }
      const penaltyNote=document.getElementById('ctPenaltyAuto');
      if(penaltyNote&&!hasNumber(before,'penaltyDailyPct'))penaltyNote.textContent='Defina la tasa indicada en el contrato.';
      const baseSubmit=form.onsubmit;
      if(typeof baseSubmit==='function')form.onsubmit=function(ev){
        const blankKeys=Object.entries(controlInputs).filter(([id])=>document.getElementById(id)?.value==='').map(([,key])=>key);
        const result=baseSubmit.call(this,ev);
        queueMicrotask(()=>{
          if(document.body.contains(form)||!c?.controls)return;
          for(const key of blankKeys)c.controls[key]=null;
          try{saveDB()}catch{}
        });
        return result;
      };
    });
    return out;
  };
  wrapped.__ccExplicitRules=true;window.contractControlsModal=wrapped;
}

const guaranteeControlKey=type=>({Cumplimiento:'performanceGuaranteePct',Anticipo:'advanceGuaranteePct',Calidad:'qualityGuaranteePct'})[type]||null;

if(typeof guaranteeModal==='function'&&!guaranteeModal.__ccExplicitRules){
  const base=guaranteeModal;
  const wrapped=function(p,c,g=null){
    const raw=rawControls(c),beforeIds=new Set(A(db?.guarantees).map(x=>x.id)),out=base.apply(this,arguments);
    queueMicrotask(()=>{
      const form=document.getElementById('gForm'),type=document.getElementById('gType'),pctInput=document.getElementById('gPct'),applied=document.getElementById('gApplied');
      if(!form||!type||!pctInput||!applied)return;
      const refresh=()=>{
        const key=guaranteeControlKey(type.value),configured=key&&hasNumber(raw,key)?raw[key]:null;
        pctInput.value=configured===null?'':configured;
        applied.value='';
        pctInput.dispatchEvent(new Event('input',{bubbles:true}));
        if(configured===null){
          const calc=document.getElementById('gCalc');if(calc)calc.value='';
          const note=document.getElementById('gCalcWords');if(note)note.textContent='Definir porcentaje según contrato o ingresar monto aplicado.';
        }
      };
      if(!g)refresh();
      type.onchange=()=>{
        const baseInput=document.getElementById('gBase');if(baseInput)baseInput.value=type.value==='Anticipo'?(c?.advancePaid||0):(c?.currentAmount??p?.budget??0);
        refresh();
      };
      const baseSubmit=form.onsubmit;
      if(typeof baseSubmit==='function')form.onsubmit=function(ev){
        const pctBlank=pctInput.value==='';
        if(pctBlank&&applied.value===''){ev.preventDefault();say('Define el porcentaje contractual o ingresa el monto aplicado de la garantía.');pctInput.focus();return false}
        const result=baseSubmit.call(this,ev);
        queueMicrotask(()=>{
          if(document.body.contains(form))return;
          const target=g||A(db?.guarantees).find(x=>!beforeIds.has(x.id)&&x.projectId===p?.id&&x.contractId===(c?.id||null));
          if(target&&pctBlank){target.percentage=null;try{saveDB()}catch{}}
        });
        return result;
      };
    });
    return out;
  };
  wrapped.__ccExplicitRules=true;window.guaranteeModal=wrapped;
}

if(typeof estimateModal==='function'&&!estimateModal.__ccExplicitRules){
  const base=estimateModal;
  const wrapped=function(p,c,e=null){
    const raw=rawControls(c),beforeIds=new Set(A(db?.estimates).map(x=>x.id)),out=base.apply(this,arguments);
    queueMicrotask(()=>{
      const form=document.getElementById('estForm'),quality=document.getElementById('eQualityPct');if(!form||!quality)return;
      const shouldBlank=(!e&&!hasNumber(raw,'qualityRetentionPct'))||(e&&(e.qualityPct===''||e.qualityPct===null||e.qualityPct===undefined));
      if(shouldBlank){quality.value='';quality.placeholder='Según contrato';quality.dispatchEvent(new Event('input',{bubbles:true}))}
      const label=quality.closest('label')?.querySelector('span');if(label)label.textContent='Garantía / retención de Calidad % (según contrato)';
      const baseSubmit=form.onsubmit;
      if(typeof baseSubmit==='function')form.onsubmit=function(ev){
        const blank=quality.value==='';const result=baseSubmit.call(this,ev);
        queueMicrotask(()=>{
          if(document.body.contains(form))return;
          const target=e||A(db?.estimates).find(x=>!beforeIds.has(x.id)&&x.contractId===c?.id);
          if(target&&blank){target.qualityPct=null;try{saveDB()}catch{}}
        });
        return result;
      };
    });
    return out;
  };
  wrapped.__ccExplicitRules=true;window.estimateModal=wrapped;
}

window.__ccContractExplicitRules={fields:[...CONTRACT_NUMERIC_FIELDS],hasNumber,changeClass:window.changeClass};
})();
