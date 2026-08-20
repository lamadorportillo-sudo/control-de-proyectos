/* ===== CONTROL CONTRACTUAL · CORRECCIÓN DE ADJUDICACIÓN V1 ===== */
(()=>{
'use strict';
if(window.__CC_PROCUREMENT_AWARD_FIX_V1__)return;
window.__CC_PROCUREMENT_AWARD_FIX_V1__=true;

const normText=v=>String(v??'').trim().toLowerCase();

function normalizeProcurement(p){
  const proc=projectProcurement(p),offers=Array.isArray(proc.offers)?proc.offers:[];
  let changed=false;
  if(!proc.finalAwardOfferId&&proc.finalAwardName){
    const byName=offers.find(o=>normText(o.bidder)===normText(proc.finalAwardName));
    if(byName){proc.finalAwardOfferId=byName.id;changed=true;}
  }
  let awarded=offers.find(o=>o.id===proc.finalAwardOfferId)||null;
  const status=String(proc.decisionStatus||'Pendiente');
  if(/^no adjudicado$/i.test(status)||/devuelto para revisión/i.test(status)){
    if(proc.finalAwardOfferId||proc.finalAwardName||Number(proc.finalAwardAmount||0)){
      proc.finalAwardOfferId='';proc.finalAwardName='';proc.finalAwardAmount=0;changed=true;
    }
    awarded=null;
  }else if(awarded){
    const amount=Number(awarded.correctedAmount??awarded.amount??0);
    if(proc.finalAwardName!==awarded.bidder){proc.finalAwardName=awarded.bidder||'';changed=true;}
    if(Number(proc.finalAwardAmount||0)!==amount){proc.finalAwardAmount=amount;changed=true;}
    if(!proc.decisionStatus||proc.decisionStatus==='Pendiente'){
      proc.decisionStatus='Adjudicado';changed=true;
    }
  }
  return {proc,offers,awarded,changed};
}

function patchSummary(p){
  const {proc,offers}=normalizeProcurement(p);
  const awarded=offers.find(o=>o.id===proc.finalAwardOfferId)||null;
  const card=document.querySelector('#tabBody .offer-summary>div:nth-child(4)');
  if(!card)return;
  const strong=card.querySelector('strong');
  if(!strong)return;
  const status=String(proc.decisionStatus||'Pendiente');
  if(awarded||proc.finalAwardName){
    strong.textContent=awarded?.bidder||proc.finalAwardName;
    return;
  }
  card.querySelector('.money-dual')?.remove();
  if(status==='No adjudicado')strong.textContent='No adjudicado';
  else if(status==='Devuelto para revisión')strong.textContent='Devuelto para revisión';
  else if(status==='Adjudicado')strong.textContent='Falta seleccionar adjudicatario';
  else strong.textContent='Pendiente';
}

function patchProcessModal(p,c){
  const form=document.getElementById('procForm');
  if(!form||form.dataset.awardFixBound==='1')return;
  form.dataset.awardFixBound='1';
  const m=form.closest('.modal')||document;
  const proc=projectProcurement(p),offers=Array.isArray(proc.offers)?proc.offers:[];
  const status=m.querySelector('#prStatus'),finalSel=m.querySelector('#prFinal');
  if(!status||!finalSel)return;

  const syncFromAward=()=>{
    if(finalSel.value)status.value='Adjudicado';
  };
  const syncFromStatus=()=>{
    if(status.value==='No adjudicado'||status.value==='Devuelto para revisión')finalSel.value='';
  };
  finalSel.addEventListener('change',syncFromAward);
  status.addEventListener('change',syncFromStatus);

  form.onsubmit=e=>{
    e.preventDefault();
    let decisionStatus=status.value||'Pendiente';
    let finalAwardOfferId=finalSel.value||'';
    if(finalAwardOfferId)decisionStatus='Adjudicado';
    if(decisionStatus==='Adjudicado'&&!finalAwardOfferId){
      toast('Selecciona el adjudicatario final antes de guardar la decisión como Adjudicado.');
      finalSel.focus();
      return;
    }
    const awarded=offers.find(o=>o.id===finalAwardOfferId)||null;
    Object.assign(proc,{
      receiptDate:m.querySelector('#prDate')?.value||'',
      receiptTime:m.querySelector('#prTime')?.value||'',
      processType:(m.querySelector('#prType')?.value||'').trim(),
      corporationPresentationDate:m.querySelector('#prCorp')?.value||'',
      decisionDate:m.querySelector('#prDecision')?.value||'',
      decisionStatus,
      resolutionRef:(m.querySelector('#prRef')?.value||'').trim(),
      finalAwardOfferId:decisionStatus==='Adjudicado'?finalAwardOfferId:'',
      finalAwardName:decisionStatus==='Adjudicado'?(awarded?.bidder||''):'',
      finalAwardAmount:decisionStatus==='Adjudicado'?Number(awarded?.correctedAmount??awarded?.amount??0):0,
      differenceObservation:(m.querySelector('#prDiff')?.value||'').trim(),
      notes:(m.querySelector('#prNotes')?.value||'').trim(),
      updatedAt:iso()
    });
    const sg=procurementSuggestion(p);
    proc.suggestedOfferId=sg?.id||'';
    p.updatedAt=iso();
    audit('EDITAR','Adjudicación',p.id,{projectId:p.id,decisionStatus:proc.decisionStatus,finalAwardName:proc.finalAwardName,receiptDate:proc.receiptDate,decisionDate:proc.decisionDate});
    saveDB();
    m.remove();
    renderProcurement(p,c);
    toast(proc.decisionStatus==='Adjudicado'?'Adjudicación final guardada correctamente.':'Datos del proceso guardados correctamente.');
  };
}

if(typeof renderProcurement==='function'&&!renderProcurement.__ccAwardFix){
  const baseRenderProcurement=renderProcurement;
  const fixedRenderProcurement=function(p,c){
    const normalized=normalizeProcurement(p);
    const result=baseRenderProcurement(p,c);
    patchSummary(p);
    const btn=document.getElementById('editProcurement');
    if(btn&&typeof btn.onclick==='function'){
      const baseClick=btn.onclick;
      btn.onclick=function(){
        const r=baseClick.apply(this,arguments);
        setTimeout(()=>patchProcessModal(p,c),0);
        return r;
      };
    }
    if(normalized.changed&&typeof roleCanEdit==='function'&&roleCanEdit()){
      setTimeout(()=>{try{saveDB()}catch{}},0);
    }
    return result;
  };
  fixedRenderProcurement.__ccAwardFix=true;
  renderProcurement=fixedRenderProcurement;
}
})();
