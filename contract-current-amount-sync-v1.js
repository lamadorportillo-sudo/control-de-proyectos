/* ===== CONTROL CONTRACTUAL · MONTO VIGENTE CALCULADO V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_CURRENT_AMOUNT_SYNC_V1__)return;
window.__CC_CONTRACT_CURRENT_AMOUNT_SYNC_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const R=v=>typeof round2==='function'?round2(v):Math.round(N(v)*100)/100;
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const active=x=>!!x&&!x.voidedAt&&!x.voided_at&&!/anulad/i.test(String(x.status||''));

function approvedDelta(contract){
  if(!contract?.id)return 0;
  try{
    return R(A(db?.changes)
      .filter(x=>active(x)&&String(x.contractId)===String(contract.id)&&['aprobado','aprobada'].includes(norm(x.status)))
      .reduce((sum,x)=>sum+N(x.amountDelta),0));
  }catch{return 0}
}

function syncCurrentAmount(contract=null){
  const original=document.getElementById('cOriginal');
  const current=document.getElementById('cCurrent');
  if(!original||!current)return null;
  const amount=R(N(original.value)+approvedDelta(contract));
  const value=String(amount);
  if(current.value!==value)current.value=value;
  current.readOnly=true;
  current.setAttribute('aria-readonly','true');
  current.title='Calculado automáticamente: monto original + modificaciones aprobadas.';
  const words=document.getElementById('cCurrentWords');
  if(words&&typeof amountWords==='function')words.textContent=amountWords(amount);
  return amount;
}

function protectContractForm(contract){
  const original=document.getElementById('cOriginal');
  const current=document.getElementById('cCurrent');
  if(!original||!current)return;
  const form=current.closest('form')||original.closest('form');
  if(form?.dataset.ccCurrentAmountBound==='1'){
    syncCurrentAmount(contract);
    return;
  }
  if(form)form.dataset.ccCurrentAmountBound='1';
  original.addEventListener('input',()=>syncCurrentAmount(contract));
  form?.addEventListener('submit',()=>syncCurrentAmount(contract),true);
  syncCurrentAmount(contract);
}

function wrapContractModal(){
  if(typeof contractModal!=='function'||contractModal.__ccCurrentAmountSync)return false;
  const base=contractModal;
  const wrapped=function(p,c){
    const out=base.apply(this,arguments);
    queueMicrotask(()=>protectContractForm(c||null));
    return out;
  };
  wrapped.__ccCurrentAmountSync=true;
  window.contractModal=wrapped;
  try{contractModal=wrapped}catch{}
  return true;
}

wrapContractModal();
setTimeout(wrapContractModal,0);
setTimeout(wrapContractModal,250);
window.__ccContractCurrentAmountSync={approvedDelta,syncCurrentAmount,protectContractForm,wrapContractModal};
})();
