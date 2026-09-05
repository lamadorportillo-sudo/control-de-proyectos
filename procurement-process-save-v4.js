/* ===== GUARDADO DIRECTO DEL PROCESO DE ADJUDICACION V4 ===== */
(()=>{
'use strict';
if(window.__CC_PROCUREMENT_PROCESS_SAVE_V4__)return;
window.__CC_PROCUREMENT_PROCESS_SAVE_V4__=true;

const A=v=>Array.isArray(v)?v:[];
const now=()=>{try{return typeof iso==='function'?iso():new Date().toISOString()}catch{return new Date().toISOString()}};
const tell=(m)=>{try{toast(m)}catch{console.log(m)}};

function currentProject(){
  try{return A(db?.projects).find(x=>x.id===view?.projectId&&!x.deletedAt)||null}catch{return null}
}
function getProc(p){
  if(!p)return null;
  try{return typeof projectProcurement==='function'?projectProcurement(p):(p.procurement||(p.procurement={offers:[]}))}catch{return p.procurement||(p.procurement={offers:[]})}
}
function slimState(source){
  const seen=new WeakSet();
  const walk=v=>{
    if(v==null||typeof v!=='object')return v;
    if(seen.has(v))return null;
    seen.add(v);
    if(Array.isArray(v))return v.map(walk);
    const o={};
    for(const [k,val] of Object.entries(v)){
      if(typeof val==='string'&&/^data:image\//i.test(val)&&['src','url','dataUrl','data_url','image'].includes(k)){o[k]='';o.photoStoredInCloud=true;continue}
      o[k]=walk(val);
    }
    return o;
  };
  return walk(source);
}
function localPersist(){
  try{localStorage.setItem(STORE,JSON.stringify(db));return true}catch(e){
    console.warn('Guardado local completo no disponible; usando copia liviana.',e);
    try{localStorage.setItem(STORE,JSON.stringify(slimState(db)));return true}catch(e2){
      console.warn('No se pudo actualizar copia local.',e2);return false;
    }
  }
}
async function cloudPersist(){
  try{
    if(typeof cloudLoaded!=='undefined'&&cloudLoaded&&session?.accessToken){
      if(typeof saveCloudNow==='function'){await saveCloudNow();return true}
      if(typeof scheduleCloudSave==='function'){scheduleCloudSave();return true}
    }
  }catch(e){console.warn('Sincronización inmediata pendiente.',e)}
  return false;
}
function msgBox(form){
  let x=form.querySelector('#ccProcSaveV4Msg');
  if(!x){x=document.createElement('div');x.id='ccProcSaveV4Msg';x.style.cssText='grid-column:1/-1;display:none;padding:10px 12px;border-radius:9px;font-size:11px;white-space:normal';form.querySelector('.modal-actions')?.before(x)}
  return x;
}
function show(form,text,good=false){
  const x=msgBox(form);x.textContent=text;x.style.display='block';x.style.background=good?'#edf9f3':'#fff3f4';x.style.border=`1px solid ${good?'#bce0cb':'#efc4c8'}`;x.style.color=good?'#13794f':'#a92f3a';tell(text)
}
async function saveForm(form){
  if(form.dataset.ccSavingV4==='1')return;
  const p=currentProject();if(!p){show(form,'No se encontró el proyecto activo.');return}
  const proc=getProc(p);if(!proc){show(form,'No se pudo abrir la ficha del proceso.');return}
  const q=id=>form.querySelector(id);
  const status=q('#prStatus'),finalSel=q('#prFinal');
  let decisionStatus=status?.value||'Pendiente';
  const finalAwardOfferId=finalSel?.value||'';
  if(finalAwardOfferId)decisionStatus='Adjudicado';
  if(decisionStatus==='Adjudicado'&&!finalAwardOfferId){show(form,'Selecciona el adjudicatario final antes de guardar como Adjudicado.');finalSel?.focus();return}
  const offers=A(proc.offers),awarded=offers.find(o=>String(o.id)===String(finalAwardOfferId))||null;
  const btn=form.querySelector('.modal-actions .primary');const old=btn?.textContent||'Guardar';
  form.dataset.ccSavingV4='1';if(btn){btn.disabled=true;btn.textContent='Guardando…'}
  try{
    Object.assign(proc,{
      receiptDate:q('#prDate')?.value||'',
      receiptTime:q('#prTime')?.value||'',
      processType:(q('#prType')?.value||'').trim(),
      corporationPresentationDate:q('#prCorp')?.value||'',
      decisionDate:q('#prDecision')?.value||'',
      decisionStatus,
      resolutionRef:(q('#prRef')?.value||'').trim(),
      finalAwardOfferId:decisionStatus==='Adjudicado'?finalAwardOfferId:'',
      finalAwardName:decisionStatus==='Adjudicado'?(awarded?.bidder||''):'',
      finalAwardAmount:decisionStatus==='Adjudicado'?Number(awarded?.correctedAmount??awarded?.amount??0):0,
      differenceObservation:(q('#prDiff')?.value||'').trim(),
      notes:(q('#prNotes')?.value||'').trim(),
      updatedAt:now()
    });
    try{const sg=typeof procurementSuggestion==='function'?procurementSuggestion(p):null;proc.suggestedOfferId=sg?.id||''}catch{}
    p.updatedAt=now();
    try{if(typeof audit==='function')audit('EDITAR','Adjudicación',p.id,{projectId:p.id,decisionStatus:proc.decisionStatus,finalAwardName:proc.finalAwardName})}catch{}

    const localOk=localPersist();
    const cloudOk=await cloudPersist();
    if(!localOk&&!cloudOk)throw new Error('No fue posible persistir los cambios ni localmente ni en la nube.');

    show(form,cloudOk?'Datos del proceso guardados y sincronizados.':'Datos del proceso guardados. La sincronización en la nube continuará automáticamente.',true);
    setTimeout(()=>{
      try{
        /* openModal devuelve el contenedor .modal-bg. El guardado V4 antiguo
           eliminaba solo .modal y dejaba una capa transparente capturando todos
           los clics del expediente. Se retira siempre el contenedor completo. */
        const overlay=form.closest('.modal-bg');
        if(overlay)overlay.remove();else form.closest('.modal')?.remove();
        const c=A(db?.contracts).find(x=>x.projectId===p.id)||null;
        if(typeof renderProcurement==='function')renderProcurement(p,c)
      }catch(e){console.warn(e)}
    },180);
  }catch(err){console.error('Guardado V4',err);show(form,`No se pudo guardar: ${String(err?.message||err)}`)}
  finally{form.dataset.ccSavingV4='';if(btn){btn.disabled=false;btn.textContent=old}}
}

// Intercepta el botón antes que cualquier manejador antiguo.
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('#procForm .modal-actions .primary');
  if(!btn)return;
  const form=btn.closest('#procForm');if(!form)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  saveForm(form);
},true);

document.addEventListener('submit',e=>{
  const form=e.target;if(!form||form.id!=='procForm')return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  saveForm(form);
},true);

window.saveProcurementProcessV4=saveForm;
})();