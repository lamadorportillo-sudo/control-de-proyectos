/* ===== DASHBOARD EVALUATIVO POR PROYECTO V2 · REGLAS CONTRACTUALES EXPLÍCITAS ===== */
(()=>{
'use strict';
if(window.__CC_PROJECT_EVALUATION_DASHBOARD_V2__)return;
window.__CC_PROJECT_EVALUATION_DASHBOARD_V2__=true;
window.__CC_PROJECT_EVALUATION_DASHBOARD_V1__=true;

const A=value=>Array.isArray(value)?value:[];
const N=value=>Number.isFinite(Number(value))?Number(value):0;
const H=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,N(value)));
const present=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
const lower=value=>String(value||'').trim().toLowerCase();
const todayISO=()=>new Date().toISOString().slice(0,10);
const hasNumber=(obj,key)=>!!obj&&Object.prototype.hasOwnProperty.call(obj,key)&&obj[key]!==''&&obj[key]!==null&&obj[key]!==undefined&&Number.isFinite(Number(obj[key]));

function dateValue(value){
  if(!value)return null;
  const date=new Date(`${String(value).slice(0,10)}T12:00:00`);
  return Number.isNaN(date.getTime())?null:date;
}
function calendarDays(start,end){
  const a=dateValue(start),b=dateValue(end);
  if(!a||!b)return null;
  return Math.max(0,Math.floor((b-a)/86400000));
}
function percent(value){return `${clamp(value).toFixed(1)}%`}
function moneyCents(value){
  try{if(typeof fmtC==='function')return fmtC(N(value))}catch{}
  return new Intl.NumberFormat('es-HN',{style:'currency',currency:'HNL',minimumFractionDigits:2}).format(N(value)/100);
}
function dateLabel(value){
  try{if(value&&typeof dmy==='function')return dmy(value)}catch{}
  const date=dateValue(value);
  return date?date.toLocaleDateString('es-HN'):'—';
}
function scoreMeta(score){
  if(score===null||score===undefined||!Number.isFinite(Number(score)))return{label:'SIN DATOS',className:'na'};
  const value=clamp(score);
  if(value>=90)return{label:'CONTROLADO',className:'good'};
  if(value>=80)return{label:'EN LÍNEA',className:'ok'};
  if(value>=65)return{label:'ATENCIÓN',className:'warn'};
  return{label:'CRÍTICO',className:'danger'};
}
function guaranteeScore(guarantee,cutoff){
  if(!guarantee)return 0;
  const remaining=calendarDays(cutoff,guarantee.end);
  if(remaining===null)return 45;
  if(dateValue(guarantee.end)<dateValue(cutoff))return 0;
  if(remaining<=7)return 35;
  if(remaining<=15)return 50;
  if(remaining<=30)return 70;
  if(remaining<=60)return 85;
  return 100;
}
function fallbackFinancials(project,contract,estimates){
  const toCents=value=>Math.round(N(value)*100);
  const grossC=estimates.reduce((sum,item)=>sum+toCents(item.gross),0);
  const netC=estimates.reduce((sum,item)=>sum+toCents(item.net),0);
  const paidEstimatesC=estimates.filter(item=>/^(pagada|pagado)$/i.test(String(item.status||''))).reduce((sum,item)=>sum+toCents(item.net),0);
  const advancePaidC=toCents(contract?.advancePaid);
  const currentC=toCents(contract?.currentAmount??project?.budget);
  const advanceAmortizedC=estimates.reduce((sum,item)=>sum+toCents(item.advanceApplied),0);
  return{grossC,netC,currentC,advancePaidC,advanceAmortizedC,totalPaidC:advancePaidC+paidEstimatesC,advancePendingC:Math.max(0,advancePaidC-advanceAmortizedC),saldoEstimarC:Math.max(0,currentC-grossC)};
}
function processItem(id,label,weight,score,detail,tab){
  const numeric=score===null||score===undefined?null:clamp(score);
  return{id,label,weight,score:numeric,detail,tab:tab||'summary',...scoreMeta(numeric)};
}
function contractRules(contract){
  const controls=contract?.controls&&typeof contract.controls==='object'?contract.controls:{};
  return{
    controls,
    recoveryTarget:hasNumber(contract,'recoveryTarget')&&N(contract.recoveryTarget)>0?N(contract.recoveryTarget):null,
    performancePct:hasNumber(controls,'performanceGuaranteePct')?N(controls.performanceGuaranteePct):null,
    advancePct:hasNumber(controls,'advanceGuaranteePct')?N(controls.advanceGuaranteePct):null,
    qualityPct:hasNumber(controls,'qualityGuaranteePct')?N(controls.qualityGuaranteePct):null,
    changeLimit:hasNumber(controls,'changeOrderLimitPct')?N(controls.changeOrderLimitPct):null,
    resolutionLimit:hasNumber(controls,'contractorResolutionThresholdPct')?N(controls.contractorResolutionThresholdPct):null,
    accumulatedLimit:hasNumber(controls,'accumulatedChangeLimitPct')?N(controls.accumulatedChangeLimitPct):null,
  };
}

function evaluateProject(projectId,cutoff=todayISO()){
  const project=A(db?.projects).find(item=>item.id===projectId&&!item.deletedAt);
  if(!project)return null;
  const contract=A(db?.contracts).find(item=>item.projectId===project.id)||null;
  const rules=contractRules(contract);
  const estimates=contract?A(db?.estimates).filter(item=>item.contractId===contract.id):[];
  const visits=A(db?.visits).filter(item=>item.projectId===project.id).slice().sort((a,b)=>String(a.date||a.createdAt||'').localeCompare(String(b.date||b.createdAt||''))||N(a.number)-N(b.number));
  const guarantees=A(db?.guarantees).filter(item=>item.projectId===project.id||contract&&item.contractId===contract.id);
  const changes=A(db?.changes).filter(item=>item.projectId===project.id||contract&&item.contractId===contract.id);
  const procurement=project.procurement&&typeof project.procurement==='object'?project.procurement:{};
  const latestVisit=visits.at(-1)||null;
  const observations=visits.flatMap(visit=>A(visit.observations));
  const pendingObservations=observations.filter(item=>lower(item.status)!=='atendida');
  const attendedObservations=observations.length-pendingObservations.length;
  let financials=fallbackFinancials(project,contract,estimates);
  try{if(typeof projectFinancials==='function')financials={...financials,...projectFinancials(project,contract,estimates)}}catch{}

  const currentC=Math.max(0,N(financials.currentC));
  const grossC=Math.max(0,N(financials.grossC));
  const totalPaidC=Math.max(0,N(financials.totalPaidC));
  const financialProgress=currentC?clamp(grossC/currentC*100):0;
  const paidProgress=currentC?clamp(totalPaidC/currentC*100):0;
  let automaticPhysical=financialProgress;
  try{if(typeof projectAutomaticProgress==='function')automaticPhysical=clamp(projectAutomaticProgress(project,contract).physical)}catch{}
  const visitHasPhysical=latestVisit&&latestVisit.physical!==''&&latestVisit.physical!==null&&latestVisit.physical!==undefined&&Number.isFinite(Number(latestVisit.physical));
  const physicalProgress=visitHasPhysical?clamp(latestVisit.physical):automaticPhysical;

  const start=contract?.start||project.start||'';
  const end=contract?.end||project.end||'';
  const configuredDays=Math.max(0,Math.trunc(N(contract?.executionDays||project.executionDays)));
  const calculatedDays=start&&end?Math.max(1,(calendarDays(start,end)??0)+1):0;
  const totalDays=configuredDays||calculatedDays;
  const beforeStart=!!(start&&dateValue(cutoff)<dateValue(start));
  const elapsedDays=start&&!beforeStart?Math.min(totalDays||Infinity,(calendarDays(start,cutoff)??0)+1):0;
  const timeProgress=totalDays?clamp(elapsedDays/totalDays*100):null;
  const scheduleGap=timeProgress===null?null:physicalProgress-timeProgress;
  const statusText=lower(project.status);
  const isPlanning=/planific/.test(statusText);
  const isProcurement=/contrataci|adjudic/.test(statusText);
  const isExecution=/ejecuci|suspend/.test(statusText);
  const isFinished=/finaliz|cerrad/.test(statusText);
  const contractExpected=isProcurement||isExecution||isFinished;

  const baseChecks=[project.code,project.name,project.location,N(project.budget)>0,project.status];
  const baseScore=baseChecks.filter(Boolean).length/baseChecks.length*100;
  let procurementScore=null,procurementDetail='Aún no corresponde evaluar este proceso.';
  if(contract){procurementScore=100;procurementDetail='El proceso culminó con un contrato registrado.'}
  else if(!isPlanning||Object.keys(procurement).length){
    const offers=A(procurement.offers);
    const checks=[procurement.receiptDate,offers.length>0,procurement.processType||procurement.modality,procurement.decisionStatus,procurement.finalAwardOfferId||procurement.finalAwardName];
    procurementScore=checks.filter(Boolean).length/checks.length*100;
    procurementDetail=`${offers.length} oferta${offers.length===1?'':'s'} registrada${offers.length===1?'':'s'} · decisión ${procurement.decisionStatus||'pendiente'}.`;
  }

  let contractScore=null;
  if(contract||contractExpected){
    const checks=[contract,contract?.number,contract?.contractor,N(contract?.currentAmount||contract?.originalAmount)>0,contract?.signature,contract?.start,totalDays>0,contract?.end];
    contractScore=checks.filter(Boolean).length/checks.length*100;
  }

  let scheduleScore=null;
  if(contract||isExecution||isFinished){
    if(!start||!totalDays)scheduleScore=25;
    else if(beforeStart)scheduleScore=100;
    else if(/suspend/.test(statusText))scheduleScore=80;
    else scheduleScore=clamp(100+Math.min(0,N(scheduleGap))*2);
  }

  let financeScore=null;
  if(contract){
    const divergence=Math.abs(physicalProgress-financialProgress);
    financeScore=clamp(100-divergence*2);
    if(isExecution&&timeProgress!==null&&timeProgress>5&&!estimates.length)financeScore=Math.min(financeScore,40);
  }

  const advancePaidC=Math.max(0,N(financials.advancePaidC));
  const advanceAmortizedC=Math.max(0,N(financials.advanceAmortizedC));
  const advancePendingC=Math.max(0,N(financials.advancePendingC));
  const advanceProgress=advancePaidC?clamp(advanceAmortizedC/advancePaidC*100):null;
  const performanceGuarantee=guarantees.find(item=>/cumplimiento/i.test(item.type||''))||null;
  const advanceGuarantee=guarantees.find(item=>/anticipo/i.test(item.type||''))||null;
  const qualityGuarantee=guarantees.find(item=>/calidad/i.test(item.type||''))||null;

  let advanceScore=null;
  let advanceDetail='No existe anticipo pagado registrado.';
  if(advancePaidC>0||/pagado/i.test(contract?.advanceStatus||'')){
    if(rules.recoveryTarget===null){
      advanceScore=null;
      advanceDetail=`Pagado ${moneyCents(advancePaidC)} · meta de recuperación: definir según contrato.`;
    }else{
      const expected=clamp(financialProgress/rules.recoveryTarget*100);
      const amortizationScore=clamp(100-Math.max(0,expected-N(advanceProgress))*2);
      const guaranteePenalty=rules.advancePct!==null&&rules.advancePct>0&&!advanceGuarantee?35:0;
      advanceScore=clamp(amortizationScore-guaranteePenalty);
      advanceDetail=`Pagado ${moneyCents(advancePaidC)} · amortizado ${percent(advanceProgress)} · pendiente ${moneyCents(advancePendingC)} · meta ${rules.recoveryTarget.toFixed(2)}%.`;
    }
  }

  const trackedGuarantees=[];
  const addGuarantee=(label,value,required)=>{if(value||required)trackedGuarantees.push({label,value,required})};
  if(contract){
    addGuarantee('Cumplimiento',performanceGuarantee,rules.performancePct!==null&&rules.performancePct>0);
    addGuarantee('Anticipo',advanceGuarantee,advancePaidC>0&&rules.advancePct!==null&&rules.advancePct>0);
    const qualityStage=isFinished||present(rules.controls.provisionalReceptionDate);
    addGuarantee('Calidad',qualityGuarantee,qualityStage&&rules.qualityPct!==null&&rules.qualityPct>0);
  }
  const guaranteeProcessScore=trackedGuarantees.length?trackedGuarantees.reduce((sum,item)=>sum+guaranteeScore(item.value,cutoff),0)/trackedGuarantees.length:null;
  const guaranteeDetail=trackedGuarantees.length?trackedGuarantees.map(item=>`${item.label}: ${item.value?dateLabel(item.value.end):(item.required?'requerida y no registrada':'sin dato')}`).join(' · '):'No hay garantías contractualmente configuradas ni registradas para evaluar.';

  const sinceLastVisit=latestVisit?.date?calendarDays(latestVisit.date,cutoff):null;
  let supervisionScore=null;
  if(isExecution||isFinished||visits.length){
    if(!visits.length)supervisionScore=20;
    else if(isFinished)supervisionScore=100;
    else if(sinceLastVisit===null)supervisionScore=55;
    else if(sinceLastVisit<=14)supervisionScore=100;
    else if(sinceLastVisit<=30)supervisionScore=80;
    else if(sinceLastVisit<=60)supervisionScore=55;
    else supervisionScore=30;
  }
  const observationScore=observations.length?attendedObservations/observations.length*100:(visits.length?100:null);

  let changeScore=null;
  if(contract){
    if(!changes.length)changeScore=100;
    else{
      const controlled=changes.filter(item=>/^(aprobado|rechazado)$/i.test(String(item.status||''))&&present(item.justification)).length;
      changeScore=controlled/changes.length*100;
    }
  }

  let closeoutScore=null;
  if(isFinished){
    const closeout=project.closeoutEvaluation&&typeof project.closeoutEvaluation==='object'?project.closeoutEvaluation:{};
    const questions=A(closeout.questions);
    const answered=questions.filter(item=>N(item.score)>0);
    const questionScore=answered.length?answered.reduce((sum,item)=>sum+clamp(N(item.score)/5*100),0)/questions.length:0;
    const completion=[closeout.completedAt,closeout.projectResult,closeout.lessonsLearned,closeout.generalObservation].filter(Boolean).length/4*100;
    closeoutScore=questionScore*.75+completion*.25;
  }

  const processes=[
    processItem('base','Datos del proyecto',8,baseScore,`${baseChecks.filter(Boolean).length} de ${baseChecks.length} datos esenciales registrados.`,'summary'),
    processItem('procurement','Contratación y adjudicación',8,procurementScore,procurementDetail,'procurement'),
    processItem('contract','Contrato y orden de inicio',12,contractScore,contract?`${contract.number||'Sin número'} · ${contract.contractor||'contratista no registrado'}.`:'Contrato todavía no registrado.','contract'),
    processItem('schedule','Plazo vs. avance',15,scheduleScore,timeProgress===null?'Faltan fechas o plazo contractual.':`Tiempo ${percent(timeProgress)} · avance físico ${percent(physicalProgress)} · diferencia ${scheduleGap>=0?'+':''}${N(scheduleGap).toFixed(1)} puntos.`,'summary'),
    processItem('finance','Control financiero',12,financeScore,contract?`Estimado ${percent(financialProgress)} · pagado ${percent(paidProgress)} · ${estimates.length} estimación${estimates.length===1?'':'es'}.`:'Sin contrato para evaluar.','estimates'),
    processItem('advance','Anticipo y amortización',10,advanceScore,advanceDetail,'estimates'),
    processItem('guarantees','Garantías',10,guaranteeProcessScore,guaranteeDetail,'guarantees'),
    processItem('supervision','Supervisión de campo',10,supervisionScore,latestVisit?`${visits.length} visita${visits.length===1?'':'s'} · última ${dateLabel(latestVisit.date)}${sinceLastVisit===null?'':` · hace ${sinceLastVisit} días`}.`:'No hay visitas registradas.','visits'),
    processItem('observations','Observaciones y calidad',7,observationScore,observations.length?`${attendedObservations} atendida${attendedObservations===1?'':'s'} · ${pendingObservations.length} pendiente${pendingObservations.length===1?'':'s'}.`:'Sin observaciones individuales registradas.','visits'),
    processItem('changes','Modificaciones',4,changeScore,changes.length?`${changes.length} modificación${changes.length===1?'':'es'} · ${changes.filter(item=>item.status==='Aprobado').length} aprobada${changes.filter(item=>item.status==='Aprobado').length===1?'':'s'}.`:'Sin modificaciones registradas.','changes'),
    processItem('closeout','Recepción y cierre',4,closeoutScore,isFinished?'Evaluación final y documentación de cierre.':'Se evaluará cuando el proyecto pase a Finalizado o Cerrado.','summary'),
  ];

  const applicable=processes.filter(item=>item.score!==null);
  const weightSum=applicable.reduce((sum,item)=>sum+item.weight,0);
  const overall=weightSum?applicable.reduce((sum,item)=>sum+item.score*item.weight,0)/weightSum:0;
  const overallMeta=scoreMeta(overall);

  const alerts=[];
  const alert=(level,title,detail,tab)=>alerts.push({level,title,detail,tab});
  if(baseScore<100)alert('warning','Completar datos básicos',`Faltan ${baseChecks.length-baseChecks.filter(Boolean).length} datos esenciales del proyecto.`,'summary');
  if(contractExpected&&!contract)alert('danger','Contrato no registrado','El estado del proyecto requiere incorporar el contrato y sus datos de control.','contract');
  if(contract&&!start)alert('danger','Falta orden o fecha de inicio','No se puede calcular el vencimiento contractual ni el tiempo consumido.','contract');
  if(scheduleGap!==null&&scheduleGap<-15)alert('danger','Atraso físico crítico',`El avance está ${Math.abs(scheduleGap).toFixed(1)} puntos por debajo del tiempo consumido.`,'visits');
  else if(scheduleGap!==null&&scheduleGap<-7)alert('warning','Avance físico requiere atención',`El avance está ${Math.abs(scheduleGap).toFixed(1)} puntos por debajo del tiempo consumido.`,'visits');
  if(isExecution&&!estimates.length)alert('warning','Sin estimaciones registradas','El proyecto está en ejecución y no tiene estimaciones vinculadas.','estimates');
  if(physicalProgress-financialProgress>15)alert('warning','Rezago en estimaciones',`El avance físico supera al financiero por ${(physicalProgress-financialProgress).toFixed(1)} puntos.`,'estimates');
  if(financialProgress-physicalProgress>10)alert('warning','Revisar coherencia financiera',`El avance financiero supera al físico por ${(financialProgress-physicalProgress).toFixed(1)} puntos.`,'estimates');

  if(advancePaidC>0&&rules.recoveryTarget===null)alert('warning','Meta de amortización no definida','Existe anticipo pagado, pero la meta de recuperación debe definirse según el contrato.','contract');
  if(advancePaidC>0&&rules.recoveryTarget!==null&&financialProgress>=rules.recoveryTarget&&advancePendingC>1)alert('danger','Anticipo sin amortizar completamente',`Queda pendiente ${moneyCents(advancePendingC)} al alcanzar la meta contractual de ${rules.recoveryTarget.toFixed(2)}%.`,'estimates');

  trackedGuarantees.forEach(item=>{
    if(item.required&&!item.value)return alert('danger',`Falta garantía de ${item.label.toLowerCase()}`,'La obligación está configurada expresamente en el contrato y no aparece registrada.','guarantees');
    if(!item.value)return;
    const guaranteeEnd=dateValue(item.value.end);
    if(!guaranteeEnd)return alert('warning',`Garantía de ${item.label.toLowerCase()} sin vencimiento`,'Complete la fecha final de vigencia para activar las alertas.','guarantees');
    const remaining=calendarDays(cutoff,item.value.end);
    if(guaranteeEnd<dateValue(cutoff))alert('danger',`Garantía de ${item.label.toLowerCase()} vencida`,`Venció el ${dateLabel(item.value.end)}.`,'guarantees');
    else if(remaining!==null&&remaining<=30)alert('warning',`Garantía de ${item.label.toLowerCase()} próxima a vencer`,`Vence el ${dateLabel(item.value.end)} · ${remaining} días restantes.`,'guarantees');
  });

  if(isExecution&&!visits.length)alert('danger','Sin supervisión registrada','No existen visitas de campo vinculadas al proyecto.','visits');
  else if(isExecution&&sinceLastVisit!==null&&sinceLastVisit>30)alert('warning','Supervisión desactualizada',`Han transcurrido ${sinceLastVisit} días desde la última visita.`,'visits');
  if(pendingObservations.length)alert(pendingObservations.some(item=>/crítica/i.test(item.priority||''))?'danger':'warning','Observaciones pendientes',`${pendingObservations.length} observación${pendingObservations.length===1?'':'es'} requiere${pendingObservations.length===1?'':'n'} seguimiento.`,'visits');

  const originalC=Math.max(0,N(contract?.originalAmount)*100);
  const approvedDeltaC=changes.filter(item=>item.status==='Aprobado').reduce((sum,item)=>sum+Math.round(N(item.amountDelta)*100),0);
  const changePct=originalC?Math.abs(approvedDeltaC)/originalC*100:0;
  if(changes.length&&rules.changeLimit===null&&rules.resolutionLimit===null&&rules.accumulatedLimit===null){
    alert('warning','Definir límites contractuales de modificación',`Las variaciones aprobadas acumulan ${changePct.toFixed(1)}%, pero el contrato no tiene límites de control configurados.`,'changes');
  }else if(rules.accumulatedLimit!==null&&changePct>rules.accumulatedLimit){
    alert('danger','Modificaciones sobre el límite contractual',`Las variaciones aprobadas acumulan ${changePct.toFixed(1)}% y superan el límite configurado de ${rules.accumulatedLimit.toFixed(2)}%.`,'changes');
  }else if(rules.resolutionLimit!==null&&changePct>rules.resolutionLimit){
    alert('warning','Modificaciones superan umbral contractual',`Las variaciones aprobadas acumulan ${changePct.toFixed(1)}% y superan el umbral configurado de ${rules.resolutionLimit.toFixed(2)}%.`,'changes');
  }else if(rules.changeLimit!==null&&changePct>rules.changeLimit){
    alert('warning','Verificar adenda contractual',`Las variaciones aprobadas acumulan ${changePct.toFixed(1)}% y superan el límite de Orden de Cambio configurado de ${rules.changeLimit.toFixed(2)}%.`,'changes');
  }
  if(isFinished&&N(closeoutScore)<80)alert('warning','Cierre documental incompleto','Complete la evaluación final, recepción y documentación de liquidación.','summary');

  alerts.sort((a,b)=>({danger:0,warning:1,info:2}[a.level]??3)-({danger:0,warning:1,info:2}[b.level]??3));
  return{project,contract,estimates,visits,guarantees,changes,processes,alerts,overall,overallMeta,applicableCount:applicable.length,totalProcessCount:processes.length,physicalProgress,financialProgress,paidProgress,timeProgress,scheduleGap,currentC,grossC,totalPaidC,cutoff,latestVisit,pendingObservations,rules,trackedGuarantees};
}

function css(){
  if(document.getElementById('cc-project-evaluation-dashboard-style'))return;
  const style=document.createElement('style');style.id='cc-project-evaluation-dashboard-style';style.textContent=`
  .ped-shell{--ped-blue:#185f9d;--ped-navy:#10243f;--ped-green:#2b7a55;--ped-gold:#d8a629;--ped-red:#b42318;margin:0 0 16px;border:1px solid #d6e0ea;border-radius:18px;background:#f5f8fc;box-shadow:0 14px 36px rgba(16,36,63,.08);overflow:hidden;color:#17263a}
  .ped-head{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;padding:20px 22px;background:linear-gradient(118deg,#10243f,#185f9d);color:#fff}.ped-eyebrow{margin:0 0 4px;font-size:10px;font-weight:900;letter-spacing:.12em;color:#d9e9f7}.ped-head h3{margin:0;color:#fff;font-size:22px}.ped-head p:last-child{margin:5px 0 0;color:#d9e7f4;font-size:11px}
  .ped-health{--score:0deg;width:92px;height:92px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#43a66e var(--score),rgba(255,255,255,.18) 0);position:relative}.ped-health:after{content:'';position:absolute;inset:8px;border-radius:50%;background:#fff}.ped-health>span{position:relative;z-index:1;text-align:center;color:#10243f}.ped-health b{display:block;font-size:24px}.ped-health small{display:block;font-size:8px;font-weight:900;text-transform:uppercase}
  .ped-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;background:#dbe4ee}.ped-kpi{background:#fff;padding:14px 15px;min-width:0}.ped-kpi small{display:block;color:#5d6b7a;font-size:9px;font-weight:900;text-transform:uppercase}.ped-kpi strong{display:block;margin-top:5px;color:#173b63;font-size:18px}.ped-kpi span{display:block;margin-top:3px;color:#667789;font-size:9px}
  .ped-body{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.75fr);gap:14px;padding:15px}.ped-panel{background:#fff;border:1px solid #dbe3ec;border-radius:14px;padding:14px;min-width:0}.ped-panel-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:12px}.ped-panel-head h4{margin:0;color:#17324f;font-size:14px}.ped-panel-head p{margin:3px 0 0;color:#657587;font-size:9px}.ped-badge{border-radius:999px;padding:5px 8px;font-size:8px;font-weight:900}.ped-badge.good,.ped-badge.ok{background:#e0f3e8;color:#236a49}.ped-badge.warn{background:#fff2cf;color:#8a5100}.ped-badge.danger{background:#fde5e2;color:#9d241b}.ped-badge.na{background:#edf1f5;color:#5d6c7b}
  .ped-comparison{display:grid;gap:10px;margin-bottom:16px}.ped-compare-row{display:grid;grid-template-columns:110px minmax(0,1fr) 54px;align-items:center;gap:9px}.ped-compare-row span,.ped-compare-row b{font-size:10px}.ped-track{height:9px;border-radius:999px;background:#e7edf3;overflow:hidden}.ped-track i{display:block;height:100%;border-radius:999px;background:#185f9d}.ped-track i.time{background:#b88700}.ped-track i.financial{background:#2b7a55}.ped-track i.paid{background:#70559d}
  .ped-process-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ped-process{border:1px solid #e0e6ed;border-radius:11px;padding:10px;background:#fbfcfe}.ped-process-top{display:flex;justify-content:space-between;gap:8px}.ped-process h5{margin:0;color:#213852;font-size:10px}.ped-process-score{font-size:10px;font-weight:900;color:#173b63}.ped-process .ped-track{height:6px;margin:8px 0}.ped-process.good .ped-track i,.ped-process.ok .ped-track i{background:#2b7a55}.ped-process.warn .ped-track i{background:#b88700}.ped-process.danger .ped-track i{background:#b42318}.ped-process.na .ped-track i{background:#8796a5}.ped-process p{margin:0;color:#5d6d7e;font-size:8.5px;line-height:1.4;min-height:23px}.ped-process button{margin-top:7px;border:0;background:transparent;color:#185f9d;font-size:8.5px;font-weight:900;cursor:pointer}
  .ped-alerts{display:grid;gap:8px}.ped-alert{display:grid;grid-template-columns:9px minmax(0,1fr) auto;gap:9px;align-items:center;width:100%;border:1px solid #e1e7ed;border-radius:11px;background:#fff;padding:10px;text-align:left;color:#243b53;cursor:pointer}.ped-alert>i{width:8px;height:8px;border-radius:50%;background:#b88700}.ped-alert.danger>i{background:#b42318}.ped-alert b{display:block;font-size:9.5px}.ped-alert small{display:block;margin-top:2px;color:#617183;font-size:8.5px;line-height:1.35}.ped-alert>span:last-child{font-weight:900;color:#185f9d}.ped-empty{padding:14px;border-radius:11px;background:#e2f3e9;color:#236a49;font-size:10px;font-weight:800}.ped-foot{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding-top:10px;border-top:1px solid #e2e7ed;color:#657587;font-size:8.5px}
  @media(max-width:1050px){.ped-kpis{grid-template-columns:repeat(3,1fr)}.ped-body{grid-template-columns:1fr}.ped-process-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:760px){.ped-head{padding:17px}.ped-health{width:78px;height:78px}.ped-kpis{grid-template-columns:1fr 1fr}.ped-body{padding:10px}.ped-process-grid{grid-template-columns:1fr 1fr}.ped-kpi strong{font-size:15px}}@media(max-width:480px){.ped-head{grid-template-columns:1fr}.ped-health{width:72px;height:72px}.ped-kpis,.ped-process-grid{grid-template-columns:1fr}.ped-compare-row{grid-template-columns:90px minmax(0,1fr) 48px}.ped-foot{display:block}}
  `;document.head.appendChild(style);
}
function comparisonRow(label,value,className=''){
  const available=value!==null&&value!==undefined,shown=available?clamp(value):0;
  return`<div class="ped-compare-row"><span>${H(label)}</span><div class="ped-track" role="progressbar" aria-label="${H(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${shown.toFixed(1)}"><i class="${H(className)}" style="width:${shown}%"></i></div><b>${available?percent(shown):'—'}</b></div>`;
}
function dashboardHTML(model){
  const topAlerts=model.alerts.slice(0,6);
  return`<section class="ped-shell" data-project-evaluation="${H(model.project.id)}" aria-label="Dashboard evaluativo del proyecto">
  <header class="ped-head"><div><p class="ped-eyebrow">CONTROL INTEGRAL AUTOMÁTICO</p><h3>Evaluación del proyecto</h3><p>Resultado calculado con datos registrados y condiciones contractuales expresas.</p></div><div class="ped-health" style="--score:${clamp(model.overall)*3.6}deg"><span><b>${Math.round(model.overall)}</b><small>${H(model.overallMeta.label)}</small></span></div></header>
  <div class="ped-kpis"><article class="ped-kpi"><small>Avance físico</small><strong>${percent(model.physicalProgress)}</strong><span>${model.latestVisit?'Última visita registrada':'Cálculo desde estimaciones'}</span></article><article class="ped-kpi"><small>Avance financiero</small><strong>${percent(model.financialProgress)}</strong><span>${model.estimates.length} estimación${model.estimates.length===1?'':'es'}</span></article><article class="ped-kpi"><small>Tiempo consumido</small><strong>${model.timeProgress===null?'SIN DATOS':percent(model.timeProgress)}</strong><span>Corte ${dateLabel(model.cutoff)}</span></article><article class="ped-kpi"><small>Total pagado</small><strong>${moneyCents(model.totalPaidC)}</strong><span>${percent(model.paidProgress)} del monto vigente</span></article><article class="ped-kpi"><small>Alertas activas</small><strong>${model.alerts.length}</strong><span>${model.alerts.filter(item=>item.level==='danger').length} crítica${model.alerts.filter(item=>item.level==='danger').length===1?'':'s'}</span></article></div>
  <div class="ped-body"><div class="ped-panel"><div class="ped-panel-head"><div><h4>Evaluación por procesos</h4><p>${model.applicableCount} de ${model.totalProcessCount} procesos evaluables con los datos actuales.</p></div><span class="ped-badge ${H(model.overallMeta.className)}">${Math.round(model.overall)}/100</span></div><div class="ped-comparison">${comparisonRow('Tiempo',model.timeProgress,'time')}${comparisonRow('Avance físico',model.physicalProgress)}${comparisonRow('Avance financiero',model.financialProgress,'financial')}${comparisonRow('Pagado',model.paidProgress,'paid')}</div><div class="ped-process-grid">${model.processes.map(item=>`<article class="ped-process ${H(item.className)}"><div class="ped-process-top"><h5>${H(item.label)}</h5><span class="ped-process-score">${item.score===null?'—':Math.round(item.score)+'/100'}</span></div><div class="ped-track" role="progressbar" aria-label="${H(item.label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.score===null?0:item.score.toFixed(1)}"><i style="width:${item.score===null?0:item.score}%"></i></div><p>${H(item.detail)}</p><button type="button" data-eval-jump="${H(item.tab)}">Abrir ${H(item.label.toLowerCase())} →</button></article>`).join('')}</div></div><aside class="ped-panel"><div class="ped-panel-head"><div><h4>Prioridades de seguimiento</h4><p>Las alertas abren la sección que debe revisarse.</p></div><span class="ped-badge ${model.alerts.some(item=>item.level==='danger')?'danger':model.alerts.length?'warn':'good'}">${model.alerts.length||'OK'}</span></div><div class="ped-alerts">${topAlerts.length?topAlerts.map(item=>`<button type="button" class="ped-alert ${H(item.level)}" data-eval-jump="${H(item.tab)}"><i></i><span><b>${H(item.title)}</b><small>${H(item.detail)}</small></span><span>›</span></button>`).join(''):'<div class="ped-empty">✓ No se detectan asuntos críticos con la información registrada.</div>'}</div><div class="ped-foot"><b>${H(model.project.code||'Proyecto')}</b><span>Actualización automática · datos del expediente</span></div></aside></div></section>`;
}
function signature(model){return JSON.stringify([model.project.id,model.project.updatedAt,model.project.status,model.contract?.updatedAt,model.estimates.length,model.estimates.at(-1)?.updatedAt,model.visits.length,model.latestVisit?.updatedAt,model.guarantees.length,model.guarantees.map(item=>item.end).join('|'),model.changes.length,model.pendingObservations.length,Math.round(model.overall*100),model.alerts.length,JSON.stringify(model.rules)])}
function jump(tab){const button=document.querySelector(`[data-tab="${String(tab||'summary').replace(/"/g,'')}"]`);if(button){button.click();setTimeout(()=>document.querySelector('nav.tabs')?.scrollIntoView({behavior:'smooth',block:'start'}),60)}}
function render(){
  let screen='',projectId='';try{screen=view?.screen||'';projectId=view?.projectId||''}catch{}
  const content=document.getElementById('content');if(!content||screen!=='project'||!projectId)return;
  const model=evaluateProject(projectId);if(!model)return;css();const nextSignature=signature(model);let section=content.querySelector('[data-project-evaluation]');if(section?.dataset.evalSignature===nextSignature)return;
  const wrapper=document.createElement('div');wrapper.innerHTML=dashboardHTML(model);const replacement=wrapper.firstElementChild;replacement.dataset.evalSignature=nextSignature;
  if(section)section.replaceWith(replacement);else{const actions=content.querySelector('.project-portfolio-actions'),kpis=content.querySelector('.grid-kpi');if(actions)actions.insertAdjacentElement('afterend',replacement);else if(kpis)content.insertBefore(replacement,kpis);else content.appendChild(replacement)}
  replacement.querySelectorAll('[data-eval-jump]').forEach(button=>button.addEventListener('click',()=>jump(button.dataset.evalJump)));
}
let queued=false;function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;try{render()}catch(error){console.warn('No se pudo actualizar el dashboard evaluativo.',error)}})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',event=>{if(event.target.closest?.('[data-open],[data-tab],#backBtn'))setTimeout(schedule,0)},true);
window.addEventListener?.('cc:cloud-saved',schedule);
window.__ccProjectEvaluationDashboard={evaluateProject,render,scoreMeta,contractRules};
schedule();
})();
