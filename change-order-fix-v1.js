/* ===== CORRECCIÓN DE ÓRDENES DE CAMBIO / ADENDAS V2 · GUARDADO ÚNICO ===== */
(()=>{
'use strict';
if(window.__CC_CHANGE_ORDER_FIX_V2__)return;
window.__CC_CHANGE_ORDER_FIX_V2__=true;
window.__CC_CHANGE_ORDER_FIX_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const money2=v=>Math.round(N(v)*100)/100;

window.recalcContract=function(c){
  if(!c)return;
  const approved=A(db?.changes).filter(x=>x.contractId===c.id&&x.status==='Aprobado');
  const amountDelta=approved.reduce((s,x)=>s+N(x.amountDelta),0);
  const daysDelta=approved.reduce((s,x)=>s+Math.trunc(N(x.daysDelta)),0);

  if(!Number.isFinite(Number(c.originalExecutionDays))||N(c.originalExecutionDays)<=0){
    c.originalExecutionDays=Math.max(1,Math.trunc(N(c.executionDays)||1));
  }
  if(!c.originalEnd&&c.end)c.originalEnd=c.end;

  c.currentAmount=money2(N(c.originalAmount)+amountDelta);
  c.executionDays=Math.max(1,Math.trunc(N(c.originalExecutionDays)+daysDelta));
  if(c.start&&typeof addExecutionDays==='function')c.end=addExecutionDays(c.start,c.executionDays);
  c.approvedChangeAmount=money2(amountDelta);
  c.approvedChangeDays=daysDelta;
  c.updatedAt=typeof iso==='function'?iso():new Date().toISOString();

  try{
    const p=A(db?.projects).find(x=>x.id===c.projectId);
    if(p){
      p.end=c.end||p.end;
      p.executionDays=c.executionDays;
      p.updatedAt=c.updatedAt;
    }
  }catch{}

  /* Recalcular no persiste por sí mismo. El flujo que crea, edita o elimina
     una modificación guarda una sola vez DESPUÉS de esta función. Así se evita
     que dos sincronizaciones simultáneas compitan y una respuesta antigua
     restaure el estado previo de la orden de cambio. */
};

function decorate(){
  let screen='',tab='';try{screen=view?.screen||'';tab=view?.tab||''}catch{}
  if(screen!=='project'||tab!=='changes')return;
  const p=A(db?.projects).find(x=>x.id===view?.projectId&&!x.deletedAt);
  const c=p?A(db?.contracts).find(x=>x.projectId===p.id):null;
  const body=document.getElementById('tabBody');
  if(!p||!c||!body)return;
  const approved=A(db?.changes).filter(x=>x.contractId===c.id&&x.status==='Aprobado');
  const amount=approved.reduce((s,x)=>s+N(x.amountDelta),0);
  const days=approved.reduce((s,x)=>s+Math.trunc(N(x.daysDelta)),0);
  const pct=N(c.originalAmount)?Math.abs(amount)/Math.abs(N(c.originalAmount))*100:0;
  let box=body.querySelector('[data-cc-change-summary]');
  if(!box){
    box=document.createElement('div');
    box.dataset.ccChangeSummary='1';
    box.className='advance';
    const head=body.querySelector('.panel-head');
    head?.insertAdjacentElement('afterend',box);
  }
  box.innerHTML=`
    <div><small>Monto original</small><strong>L ${N(c.originalAmount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
    <div><small>Variación aprobada</small><strong>${amount>=0?'+':''}L ${N(amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
    <div><small>Monto vigente</small><strong>L ${N(c.currentAmount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
    <div><small>Variación acumulada</small><strong>${pct.toFixed(2)}%</strong></div>
    <div><small>Plazo original</small><strong>${Math.trunc(N(c.originalExecutionDays)||N(c.executionDays))} días</strong></div>
    <div><small>Variación de plazo</small><strong>${days>=0?'+':''}${days} días</strong></div>
    <div><small>Plazo vigente</small><strong>${Math.trunc(N(c.executionDays))} días</strong></div>
    <div><small>Fecha final vigente</small><strong>${c.end&&typeof dmy==='function'?dmy(c.end):(c.end||'—')}</strong></div>`;
}

let q=false;
new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;decorate()})}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(decorate,0);setTimeout(decorate,250);
})();