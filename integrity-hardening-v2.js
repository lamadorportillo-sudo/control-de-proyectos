/* ===== ENDURECIMIENTO DE INTEGRIDAD V2 ===== */
(()=>{
'use strict';
if(window.__CC_INTEGRITY_HARDENING_V2__)return;
window.__CC_INTEGRITY_HARDENING_V2__=true;
const A=v=>Array.isArray(v)?v:[];
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const say=m=>{try{toast(m)}catch{console.warn(m)}};
const currentProject=()=>A(db?.projects).find(p=>p.id===view?.projectId)||null;

function syncVisitStatus(v){
  if(!v)return false;
  const obs=A(v.observations),pending=obs.filter(o=>!/^atendida$/i.test(String(o?.status||'')));
  const next=obs.length?(pending.length?'Con observaciones':'Cerrada'):v.status;
  if(next===v.status)return false;
  v.status=next;v.updatedAt=typeof iso==='function'?iso():new Date().toISOString();return true;
}
function syncAllVisitStatuses(){
  let changed=false;A(db?.visits).forEach(v=>{if(syncVisitStatus(v))changed=true});
  if(changed){try{saveDB()}catch{}}
  return changed;
}
function protectContractForm(form){
  if(!form||form.dataset.integrityV2==='1')return;form.dataset.integrityV2='1';
  form.addEventListener('submit',ev=>{
    const p=currentProject(),input=form.querySelector('#cContractor'),value=input?.value.trim()||'';
    if(p&&norm(value)===norm(p.name)){
      ev.preventDefault();ev.stopImmediatePropagation();say('El contratista no puede ser igual al nombre del proyecto. Registra la persona o empresa contratista.');input?.focus();
    }
  },true);
}
function protectVisitForm(form){
  if(!form||form.dataset.integrityV2==='1')return;form.dataset.integrityV2='1';
  const p=currentProject(),number=Number(form.querySelector('#vNumber')?.value||0),visit=A(db?.visits).find(v=>v.projectId===p?.id&&Number(v.number)===number);
  if(visit&&syncVisitStatus(visit)){const status=form.querySelector('#vStatus');if(status)status.value=visit.status}
  const status=form.querySelector('#vStatus');if(status){status.disabled=true;status.title='El estado se determina por las observaciones pendientes o atendidas.'}
  form.addEventListener('submit',()=>{if(status)status.disabled=false},true);
}
function decorateLifecycle(root){
  if(!root||root.dataset.integrityV2==='1')return;root.dataset.integrityV2='1';
  root.querySelectorAll('[data-lc-check]').forEach(check=>{
    const key=check.dataset.lcCheck,note=root.querySelector(`[data-lc-note="${key}"]`),date=root.querySelector(`[data-lc-date="${key}"]`);
    check.addEventListener('click',ev=>{
      if(check.checked&&!String(note?.value||'').trim()){
        ev.preventDefault();ev.stopImmediatePropagation();check.checked=false;say('Para completar el control, registra el documento, acta, resolución o evidencia de respaldo.');note?.focus();
      }
    },true);
    if(!check.parentElement?.querySelector('[data-lc-na]')){
      const btn=document.createElement('button');btn.type='button';btn.className='btn ghost';btn.dataset.lcNa=key;btn.textContent='No aplica';btn.title='Excluye justificadamente este requisito del cálculo de avance.';
      btn.onclick=()=>{
        if(!String(note?.value||'').trim()){say('Justifica en la observación por qué este requisito no aplica.');note?.focus();return}
        const [phase,item]=key.split('|'),p=currentProject();if(!p)return;
        p.contractLifecycle=p.contractLifecycle||{};p.contractLifecycle.items=p.contractLifecycle.items||{};const k=`${phase}.${item}`,row=p.contractLifecycle.items[k]||{};
        p.contractLifecycle.items[k]={...row,done:false,notApplicable:true,date:date?.value||row.date||'',note:note.value.trim(),updatedAt:typeof iso==='function'?iso():new Date().toISOString()};
        audit?.('ACTUALIZAR','Proceso contractual',p.id,{fase:phase,requisito:item,noAplica:true,justificacion:note.value.trim()});saveDB();renderProject();
      };
      note?.insertAdjacentElement('afterend',btn);
    }
  });
}
function scan(){protectContractForm(document.getElementById('contractForm'));protectVisitForm(document.getElementById('visitForm'));if(view?.tab==='lifecycle')decorateLifecycle(document.getElementById('tabBody'))}
new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(()=>{syncAllVisitStatuses();scan()},500);
window.__ccIntegrityV2={syncVisitStatus,syncAllVisitStatuses};
})();
