/* ===== CONTROL CONTRACTUAL · CORRECCIÓN DE ADJUDICACIÓN V2 ===== */
(()=>{
'use strict';
if(window.__CC_PROCUREMENT_AWARD_FIX_V2__)return;
window.__CC_PROCUREMENT_AWARD_FIX_V2__=true;

const normText=v=>String(v??'').trim().toLowerCase();
const say=m=>{try{toast(m)}catch{console.log(m)}};
const nowIso=()=>{try{return typeof iso==='function'?iso():new Date().toISOString()}catch{return new Date().toISOString()}};

function normalizeProcurement(p){
  const proc=projectProcurement(p),offers=Array.isArray(proc.offers)?proc.offers:[];
  const inv=proc.invitationSettings||{};
  let changed=false;
  // Reutiliza los datos ya ingresados en Invitaciones cuando el proceso aún no los tiene.
  if(!proc.receiptDate&&inv.receiptDate){proc.receiptDate=inv.receiptDate;changed=true;}
  if(!proc.receiptTime&&inv.receiptTime){proc.receiptTime=inv.receiptTime;changed=true;}
  if(!proc.processType&&inv.processType){proc.processType=inv.processType;changed=true;}
  if(!proc.finalAwardOfferId&&proc.finalAwardName){
    const byName=offers.find(o=>normText(o.bidder)===normText(proc.finalAwardName));
    if(byName){proc.finalAwardOfferId=byName.id;changed=true;}
  }
  let awarded=offers.find(o=>String(o.id)===String(proc.finalAwardOfferId))||null;
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
  const awarded=offers.find(o=>String(o.id)===String(proc.finalAwardOfferId))||null;
  const card=document.querySelector('#tabBody .offer-summary>div:nth-child(4)');
  if(!card)return;
  const strong=card.querySelector('strong');
  if(!strong)return;
  const status=String(proc.decisionStatus||'Pendiente');
  if(awarded||proc.finalAwardName){strong.textContent=awarded?.bidder||proc.finalAwardName;return;}
  card.querySelector('.money-dual')?.remove();
  strong.textContent=status==='No adjudicado'?'No adjudicado':status==='Devuelto para revisión'?'Devuelto para revisión':status==='Adjudicado'?'Falta seleccionar adjudicatario':'Pendiente';
}

function patchProcessModal(p,c){
  const form=document.getElementById('procForm');
  if(!form)return;
  const m=form.closest('.modal')||document;
  const {proc,offers}=normalizeProcurement(p);
  const status=m.querySelector('#prStatus'),finalSel=m.querySelector('#prFinal');
  if(!status||!finalSel)return;

  // Trae al formulario los datos del proceso o, si faltan, los ya registrados en Invitaciones.
  const inv=proc.invitationSettings||{};
  const date=m.querySelector('#prDate'),time=m.querySelector('#prTime'),type=m.querySelector('#prType');
  if(date&&!date.value&&(proc.receiptDate||inv.receiptDate))date.value=proc.receiptDate||inv.receiptDate;
  if(time&&!time.value&&(proc.receiptTime||inv.receiptTime))time.value=proc.receiptTime||inv.receiptTime;
  if(type&&!type.value&&(proc.processType||inv.processType))type.value=proc.processType||inv.processType;
  status.value=proc.decisionStatus||'Pendiente';
  finalSel.value=proc.finalAwardOfferId||'';

  if(form.dataset.awardFixBound==='2')return;
  form.dataset.awardFixBound='2';

  let msg=m.querySelector('#ccProcSaveMsg');
  if(!msg){msg=document.createElement('div');msg.id='ccProcSaveMsg';msg.style.cssText='grid-column:1/-1;display:none;padding:9px 11px;border-radius:9px;font-size:11px';form.querySelector('.modal-actions')?.before(msg);}
  const show=(text,good=false)=>{if(!msg)return;say(text);msg.textContent=text;msg.style.display='block';msg.style.background=good?'#edf9f3':'#fff3f4';msg.style.border=`1px solid ${good?'#bce0cb':'#efc4c8'}`;msg.style.color=good?'#13794f':'#a92f3a';};

  const syncFromAward=()=>{if(finalSel.value)status.value='Adjudicado';};
  const syncFromStatus=()=>{if(status.value==='No adjudicado'||status.value==='Devuelto para revisión')finalSel.value='';};
  finalSel.addEventListener('change',syncFromAward);
  status.addEventListener('change',syncFromStatus);

  const saveBtn=form.querySelector('.modal-actions .primary');
  if(saveBtn){saveBtn.type='button';saveBtn.textContent='Guardar';}

  let saving=false;
  const save=async e=>{
    e?.preventDefault?.();e?.stopPropagation?.();
    if(saving)return;
    let decisionStatus=status.value||'Pendiente';
    const finalAwardOfferId=finalSel.value||'';
    if(finalAwardOfferId)decisionStatus='Adjudicado';
    if(decisionStatus==='Adjudicado'&&!finalAwardOfferId){show('Selecciona el adjudicatario final antes de guardar como Adjudicado.');finalSel.focus();return;}
    const awarded=offers.find(o=>String(o.id)===String(finalAwardOfferId))||null;
    const old=saveBtn?.textContent;
    saving=true;if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='Guardando…';}
    try{
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
        updatedAt:nowIso()
      });
      try{const sg=typeof procurementSuggestion==='function'?procurementSuggestion(p):null;proc.suggestedOfferId=sg?.id||'';}catch(err){console.warn('Sugerencia no actualizada',err)}
      p.updatedAt=nowIso();
      try{if(typeof audit==='function')audit('EDITAR','Adjudicación',p.id,{projectId:p.id,decisionStatus:proc.decisionStatus,finalAwardName:proc.finalAwardName,receiptDate:proc.receiptDate,decisionDate:proc.decisionDate});}catch(err){console.warn('Auditoría no bloqueante',err)}
      if(typeof saveDB==='function')await Promise.resolve(saveDB());
      show(proc.decisionStatus==='Adjudicado'?'Adjudicación final guardada correctamente.':'Datos del proceso guardados correctamente.',true);
      setTimeout(()=>{try{m.remove();if(typeof renderProcurement==='function')renderProcurement(p,c)}catch(err){console.warn(err)}},180);
    }catch(err){console.error('Error guardando adjudicación',err);show('No se pudo guardar. Se corrigió el formulario para mostrar este error; intenta nuevamente.');}
    finally{saving=false;if(saveBtn){saveBtn.disabled=false;saveBtn.textContent=old||'Guardar';}}
  };

  form.onsubmit=save;
  if(saveBtn)saveBtn.onclick=save;
}

function hookEditButton(p,c){
  const btn=document.getElementById('editProcurement');
  if(!btn||btn.dataset.awardFixV2==='1')return;
  btn.dataset.awardFixV2='1';
  const baseClick=btn.onclick;
  btn.onclick=function(){const r=typeof baseClick==='function'?baseClick.apply(this,arguments):undefined;setTimeout(()=>patchProcessModal(p,c),0);setTimeout(()=>patchProcessModal(p,c),80);return r;};
}

if(typeof renderProcurement==='function'&&!renderProcurement.__ccAwardFixV2){
  const baseRenderProcurement=renderProcurement;
  const fixed=function(p,c){
    const normalized=normalizeProcurement(p);
    const result=baseRenderProcurement(p,c);
    patchSummary(p);hookEditButton(p,c);
    if(normalized.changed&&typeof roleCanEdit==='function'&&roleCanEdit())setTimeout(()=>{try{saveDB()}catch{}},0);
    return result;
  };
  fixed.__ccAwardFixV2=true;renderProcurement=fixed;
}

// Respaldo: si otro módulo abre/reemplaza el modal después, se vuelve a enlazar sin observar toda la página.
document.addEventListener('click',e=>{
  if(!e.target.closest?.('#editProcurement'))return;
  setTimeout(()=>{try{const p=(db?.projects||[]).find(x=>x.id===view?.projectId),c=(db?.contracts||[]).find(x=>x.projectId===p?.id);if(p)patchProcessModal(p,c)}catch(err){console.warn(err)}},60);
},true);
})();