/* ===== CONTROL CONTRACTUAL · RESPALDO + ENDURECIMIENTO TRANSICIONAL V3 ===== */
(()=>{
'use strict';
if(window.__CP_HARDENING_V3__)return;
window.__CP_HARDENING_V3__=true;
window.__CP_EXCEL_LOGIN_V2__=true;
window.__CP_EXCEL_BACKUP_V1__=true;

/* --------------------------------------------------------------------------
   UTILIDADES
---------------------------------------------------------------------------- */
const SHEETJS_URL='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
let sheetJsPromise=null;
let cloudStateVersion=null;
let versionBaselinePromise=null;
const safeArray=v=>Array.isArray(v)?v:[];
const r2=v=>Math.round((Number(v)||0)*100)/100;
const dateStamp=()=>{try{if(typeof today==='function')return today();}catch(_e){}return new Date().toISOString().slice(0,10)};
const notify=msg=>{try{if(typeof toast==='function')return toast(msg)}catch(_e){}console.info(msg)};
const html=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const isAdmin=()=>{try{return typeof currentUser==='function'&&currentUser()?.role==='admin'}catch(_e){return false}};

function loadSheetJS(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  if(sheetJsPromise)return sheetJsPromise;
  sheetJsPromise=new Promise((resolve,reject)=>{
    const old=document.querySelector('script[data-cp-sheetjs]');
    if(old){
      old.addEventListener('load',()=>window.XLSX?resolve(window.XLSX):reject(new Error('No se pudo iniciar Excel.')),{once:true});
      old.addEventListener('error',()=>reject(new Error('No se pudo cargar Excel.')),{once:true});
      return;
    }
    const s=document.createElement('script');
    s.src=SHEETJS_URL;s.async=true;s.dataset.cpSheetjs='1';
    s.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error('No se pudo iniciar Excel.'));
    s.onerror=()=>reject(new Error('No se pudo cargar el generador de Excel.'));
    document.head.appendChild(s);
  });
  return sheetJsPromise;
}

/* --------------------------------------------------------------------------
   CONCURRENCIA OPTIMISTA + GUARDADO ATÓMICO JSONB/RELACIONAL
---------------------------------------------------------------------------- */
async function refreshVersionBaseline(){
  if(typeof sbFetch!=='function'||!cloudWorkspaceId||!session?.accessToken)return null;
  const row=(await sbFetch(`/rest/v1/app_state?select=version,updated_at&workspace_id=eq.${encodeURIComponent(cloudWorkspaceId)}&limit=1`)).data?.[0];
  if(!row)throw new Error('No se encontró el estado del espacio de trabajo.');
  cloudStateVersion=Number(row.version);
  return cloudStateVersion;
}

async function ensureVersionBaseline(){
  if(Number.isFinite(cloudStateVersion))return cloudStateVersion;
  if(!versionBaselinePromise){
    versionBaselinePromise=refreshVersionBaseline().finally(()=>{versionBaselinePromise=null});
  }
  return versionBaselinePromise;
}

try{
  if(typeof loadCloudData==='function'&&!loadCloudData.__ccVersioned){
    const baseLoadCloudData=loadCloudData;
    const wrapped=async function(){
      const result=await baseLoadCloudData.apply(this,arguments);
      await refreshVersionBaseline();
      return result;
    };
    wrapped.__ccVersioned=true;
    loadCloudData=wrapped;
  }
}catch(e){console.error('No se pudo envolver loadCloudData',e)}

try{
  if(typeof saveCloudNow==='function'&&!saveCloudNow.__ccVersioned){
    const versionedSave=async function(){
      if(!cloudLoaded||!cloudWorkspaceId||!session?.accessToken||cloudSaving)return;
      cloudSaving=true;
      try{
        await ensureVersionBaseline();
        const safe=JSON.parse(JSON.stringify(db));
        safe.users=safeArray(safe.users).map(u=>{
          const v={...u};
          delete v.password;delete v.accessToken;delete v.refreshToken;delete v.token;delete v.apiKey;delete v.secret;
          return v;
        });
        const response=await sbFetch('/rest/v1/rpc/save_app_state',{
          method:'POST',
          body:{p_workspace_id:cloudWorkspaceId,p_expected_version:cloudStateVersion,p_data:safe}
        });
        const result=Array.isArray(response.data)?response.data[0]:response.data;
        if(!result?.saved){
          localStorage.setItem('control_contractual_conflict_backup',JSON.stringify({createdAt:new Date().toISOString(),workspaceId:cloudWorkspaceId,localVersion:cloudStateVersion,serverVersion:Number(result?.new_version),localData:safe}));
          notify('Conflicto de edición: otro usuario guardó cambios antes. Tu copia local fue preservada; recarga para comparar antes de continuar.');
          throw new Error('CONFLICTO_DE_VERSION');
        }
        cloudStateVersion=Number(result.new_version);
        cloudLastSaved=new Date();
        if(typeof updateCloudBadge==='function')updateCloudBadge();
      }catch(err){
        if(String(err?.message||'').includes('CONFLICTO_DE_VERSION'))throw err;
        console.error('Guardado endurecido falló',err);
        throw err;
      }finally{cloudSaving=false}
    };
    versionedSave.__ccVersioned=true;
    saveCloudNow=versionedSave;
  }
}catch(e){console.error('No se pudo instalar saveCloudNow versionado',e)}

if(typeof cloudLoaded!=='undefined'&&cloudLoaded&&typeof cloudWorkspaceId!=='undefined'&&cloudWorkspaceId){refreshVersionBaseline().catch(console.error)}

/* --------------------------------------------------------------------------
   MONTO CONTRACTUAL VIGENTE: SOLO LECTURA
---------------------------------------------------------------------------- */
function approvedChangeDelta(contractId){
  return safeArray(db?.changes).filter(ch=>ch.contractId===contractId&&ch.status==='Aprobado'&&!ch.voidedAt&&!ch.voided_at).reduce((sum,ch)=>sum+(typeof cents==='function'?cents(ch.amountDelta||0):Math.round((Number(ch.amountDelta)||0)*100)),0);
}
function currentAmountFor(contract,originalOverride=null){
  const original=originalOverride==null?Number(contract?.originalAmount||0):Number(originalOverride||0);
  const deltaC=contract?.id?approvedChangeDelta(contract.id):0;
  return typeof fromCents==='function'?fromCents((typeof cents==='function'?cents(original):Math.round(original*100))+deltaC):r2(original+deltaC/100);
}
function hardenContractForm(p,c){
  const form=document.getElementById('contractForm'),current=document.getElementById('cCurrent'),original=document.getElementById('cOriginal');
  if(!form||!current||!original||form.dataset.ccHardened)return;
  form.dataset.ccHardened='1';current.readOnly=true;current.setAttribute('aria-readonly','true');current.title='Calculado automáticamente: monto original + modificaciones aprobadas.';current.style.cursor='not-allowed';
  const refresh=()=>{const val=currentAmountFor(c||{},original.value||0);current.value=r2(val).toFixed(2);const words=document.getElementById('cCurrentWords');if(words&&typeof amountWords==='function')words.textContent=amountWords(val)};
  original.addEventListener('input',refresh);form.addEventListener('submit',refresh,true);refresh();
}
try{if(typeof contractModal==='function'&&!contractModal.__ccHardened){const base=contractModal;const wrapped=function(p,c){const out=base.apply(this,arguments);queueMicrotask(()=>hardenContractForm(p,c));return out};wrapped.__ccHardened=true;contractModal=wrapped}}catch(e){console.error(e)}

/* --------------------------------------------------------------------------
   VALIDACIÓN PREVENTIVA DE ESTIMACIONES
---------------------------------------------------------------------------- */
function hardenEstimateForm(p,c,e){
  const form=document.getElementById('estForm');if(!form||form.dataset.ccHardened)return;form.dataset.ccHardened='1';
  form.addEventListener('submit',ev=>{
    const gross=Number(document.getElementById('eGross')?.value||0),contractC=typeof cents==='function'?cents(currentAmountFor(c)):Math.round(currentAmountFor(c)*100);
    const otherC=safeArray(db?.estimates).filter(x=>x.contractId===c.id&&x.id!==e?.id&&x.status!=='Anulada'&&!x.voidedAt&&!x.voided_at).reduce((s,x)=>s+(typeof cents==='function'?cents(x.gross||0):Math.round((Number(x.gross)||0)*100)),0);
    const requestedC=typeof cents==='function'?cents(gross):Math.round(gross*100),availableC=Math.max(0,contractC-otherC);
    if(requestedC>availableC){ev.preventDefault();ev.stopImmediatePropagation();notify(`La estimación supera el saldo contractual disponible. Máximo permitido: ${typeof fmtC==='function'?fmtC(availableC):'L. '+(availableC/100).toFixed(2)}`);return}
    const advInput=document.getElementById('eAdvApplied');
    if(advInput&&advInput.value!==''){
      const prior=safeArray(db?.estimates).filter(x=>x.contractId===c.id&&x.id!==e?.id&&x.status!=='Anulada'&&!x.voidedAt&&!x.voided_at).reduce((s,x)=>s+Number(x.advanceApplied||0),0),max=Math.max(0,Number(c.advancePaid||0)-prior);
      if(Number(advInput.value)>max+0.005){ev.preventDefault();ev.stopImmediatePropagation();notify(`La amortización aplicada supera el anticipo pendiente. Máximo: L. ${max.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`);return}
    }
    const reason=document.getElementById('reasonField');if(reason&&!reason.classList.contains('hidden')&&!isAdmin()){ev.preventDefault();ev.stopImmediatePropagation();notify('Las correcciones manuales de amortización requieren perfil ADMIN y justificación.')}
  },true);
}
try{if(typeof estimateModal==='function'&&!estimateModal.__ccHardened){const base=estimateModal;const wrapped=function(p,c,e){const out=base.apply(this,arguments);queueMicrotask(()=>hardenEstimateForm(p,c,e));return out};wrapped.__ccHardened=true;estimateModal=wrapped}}catch(e){console.error(e)}

/* --------------------------------------------------------------------------
   MODIFICACIONES: REFERENCIA DOCUMENTAL OBLIGATORIA AL APROBAR
---------------------------------------------------------------------------- */
function hardenChangeForm(p,c,x){
  const form=document.getElementById('chForm');if(!form||form.dataset.ccHardened)return;form.dataset.ccHardened='1';
  const just=document.getElementById('chJust'),holder=document.createElement('label');holder.className='field wide';holder.innerHTML=`<span>Documento / referencia de respaldo</span><input id="chDocumentRef" value="${html(x?.documentRef||x?.document||'')}" placeholder="Acta, resolución, orden firmada, adenda o referencia documental"><small>Obligatorio cuando la modificación quede Aprobada.</small>`;(just?.closest('.field')||form.querySelector('.modal-actions'))?.insertAdjacentElement('beforebegin',holder);
  form.addEventListener('submit',ev=>{
    const status=document.getElementById('chStatus')?.value||'',doc=document.getElementById('chDocumentRef')?.value.trim()||'',justification=document.getElementById('chJust')?.value.trim()||'';
    if(status==='Aprobado'&&(!doc||!justification)){ev.preventDefault();ev.stopImmediatePropagation();notify('Una modificación aprobada requiere referencia documental y justificación.');return}
    const number=document.getElementById('chNumber')?.value.trim()||'';
    setTimeout(()=>{const row=x||safeArray(db?.changes).find(z=>z.contractId===c.id&&z.number===number);if(row){row.documentRef=doc;row.updatedAt=typeof iso==='function'?iso():new Date().toISOString();try{saveDB()}catch(_e){}}},0);
  },true);
}
try{if(typeof changeModal==='function'&&!changeModal.__ccHardened){const base=changeModal;const wrapped=function(p,c,x){const out=base.apply(this,arguments);queueMicrotask(()=>hardenChangeForm(p,c,x));return out};wrapped.__ccHardened=true;changeModal=wrapped}}catch(e){console.error(e)}

/* --------------------------------------------------------------------------
   GARANTÍAS Y MOVIMIENTOS PRESUPUESTARIOS: DOCUMENTACIÓN OBLIGATORIA
---------------------------------------------------------------------------- */
function hardenGuaranteeForm(){
  const form=document.getElementById('gForm');if(!form||form.dataset.ccHardened)return;form.dataset.ccHardened='1';['gNumber','gIssuer','gDoc'].forEach(id=>{const el=document.getElementById(id);if(el)el.required=true});
  form.addEventListener('submit',ev=>{const missing=[['gNumber','número'],['gIssuer','institución emisora'],['gDoc','referencia documental']].find(([id])=>!document.getElementById(id)?.value.trim());if(missing){ev.preventDefault();ev.stopImmediatePropagation();notify(`La garantía requiere ${missing[1]}.`)}},true);
}
try{if(typeof guaranteeModal==='function'&&!guaranteeModal.__ccHardened){const base=guaranteeModal;const wrapped=function(){const out=base.apply(this,arguments);queueMicrotask(hardenGuaranteeForm);return out};wrapped.__ccHardened=true;guaranteeModal=wrapped}}catch(e){console.error(e)}

document.addEventListener('submit',ev=>{const form=ev.target;if(form?.id==='budgetMoveForm'){const ref=form.elements?.reference;if(!ref?.value.trim()){ev.preventDefault();ev.stopImmediatePropagation();notify('Todo movimiento presupuestario requiere documento o referencia de respaldo.');ref?.focus()}}},true);

/* --------------------------------------------------------------------------
   ANULACIÓN LÓGICA EN CAPA DE COMPATIBILIDAD JSONB + RPC RELACIONAL
---------------------------------------------------------------------------- */
async function rpcVoid(name,id,reason){
  if(typeof sbFetch!=='function'||!session?.accessToken)return false;
  try{await sbFetch(`/rest/v1/rpc/${name}`,{method:'POST',body:name==='void_estimate'?{p_estimate_id:id,p_reason:reason}:name==='void_contract_change'?{p_change_id:id,p_reason:reason}:{p_payment_id:id,p_reason:reason}});return true}catch(err){if(/NO_ENCONTRAD/i.test(String(err?.message||'')))return false;throw err}
}
function archiveRecord(activeKey,archiveKey,id,status='Anulada',reason=''){
  if(!db)return null;db[activeKey]=safeArray(db[activeKey]);db[archiveKey]=safeArray(db[archiveKey]);const idx=db[activeKey].findIndex(x=>x.id===id);if(idx<0)return null;const row=db[activeKey][idx];row.voidedAt=typeof iso==='function'?iso():new Date().toISOString();row.voidedBy=session?.userId||null;row.voidReason=reason;row.status=status;db[activeKey].splice(idx,1);db[archiveKey].unshift(row);return row;
}
try{if(typeof deleteEstimate==='function'){deleteEstimate=async function(id){const e=safeArray(db?.estimates).find(x=>x.id===id);if(!e)return;const reason=prompt(`Motivo de anulación de la estimación N.º ${e.number}:`);if(!reason?.trim())return;try{await rpcVoid('void_estimate',id,reason.trim())}catch(err){console.error(err);return notify(err.message||'No se pudo anular la estimación.')}archiveRecord('estimates','voidedEstimates',id,'Anulada',reason.trim());safeArray(db?.payments).filter(p=>p.estimateId===id).forEach(p=>archiveRecord('payments','voidedPayments',p.id,'Anulado','Estimación anulada: '+reason.trim()));try{if(typeof audit==='function')audit('ANULAR','Estimación',id,{number:e.number,reason:reason.trim()});saveDB();renderProject();notify('Estimación anulada. El historial fue conservado.')}catch(err){console.error(err)}}}}catch(e){console.error(e)}

function wireChangeVoidButtons(){document.querySelectorAll('[data-del-ch]').forEach(btn=>{btn.onclick=async()=>{const x=safeArray(db?.changes).find(z=>z.id===btn.dataset.delCh);if(!x)return;const reason=prompt(`Motivo de anulación de la modificación ${x.number||''}:`);if(!reason?.trim())return;try{await rpcVoid('void_contract_change',x.id,reason.trim())}catch(err){console.error(err);return notify(err.message||'No se pudo anular la modificación.')}archiveRecord('changes','voidedChanges',x.id,'Anulado',reason.trim());try{if(typeof audit==='function')audit('ANULAR','Modificación',x.id,{reason:reason.trim()});if(typeof recalcContract==='function'){const c=safeArray(db?.contracts).find(c=>c.id===x.contractId);if(c)recalcContract(c)}saveDB();renderProject();notify('Modificación anulada; se conserva en historial.')}catch(err){console.error(err)}}})}
function wirePaymentVoidButtons(){document.querySelectorAll('[data-del-movement]').forEach(btn=>{btn.onclick=async()=>{const x=safeArray(db?.payments).find(z=>z.id===btn.dataset.delMovement);if(!x)return;const reason=prompt('Motivo de anulación del movimiento financiero:');if(!reason?.trim())return;try{await rpcVoid('void_payment',x.id,reason.trim())}catch(err){console.error(err)}archiveRecord('payments','voidedPayments',x.id,'Anulado',reason.trim());try{if(typeof audit==='function')audit('ANULAR','Movimiento financiero',x.id,{reason:reason.trim()});saveDB();renderProject();notify('Movimiento anulado; se conserva en historial.')}catch(err){console.error(err)}}})}
try{if(typeof renderChanges==='function'&&!renderChanges.__ccVoid){const base=renderChanges;const wrapped=function(){const out=base.apply(this,arguments);queueMicrotask(wireChangeVoidButtons);return out};wrapped.__ccVoid=true;renderChanges=wrapped}if(typeof renderEstimates==='function'&&!renderEstimates.__ccVoid){const base=renderEstimates;const wrapped=function(){const out=base.apply(this,arguments);queueMicrotask(wirePaymentVoidButtons);return out};wrapped.__ccVoid=true;renderEstimates=wrapped}}catch(e){console.error(e)}

/* --------------------------------------------------------------------------
   RESPALDO EXCEL CORREGIDO Y SANITIZADO
---------------------------------------------------------------------------- */
const SENSITIVE_KEY=/password|passwd|token|access[_-]?token|refresh[_-]?token|api[_-]?key|secret/i;
function sanitizeBackup(value){if(Array.isArray(value))return value.map(sanitizeBackup);if(value&&typeof value==='object'){const out={};for(const [k,v] of Object.entries(value)){if(SENSITIVE_KEY.test(k))continue;out[k]=sanitizeBackup(v)}return out}return value}
function projectOf(id){return safeArray(db?.projects).find(p=>p.id===id)||safeArray(db?.voidedProjects).find(p=>p.id===id)}
function contractOf(id){return safeArray(db?.contracts).find(c=>c.id===id)||safeArray(db?.voidedContracts).find(c=>c.id===id)}
function projectFromRecord(x){if(x?.projectId)return projectOf(x.projectId);if(x?.contractId){const c=contractOf(x.contractId);return c?projectOf(c.projectId):null}return null}
function baseLink(x){const p=projectFromRecord(x),c=x?.contractId?contractOf(x.contractId):safeArray(db?.contracts).find(z=>z.projectId===p?.id);return{'Código proyecto':p?.code||'','Nombre proyecto':p?.name||'','Contrato':c?.number||''}}
function flatten(obj){const out={};Object.entries(obj||{}).forEach(([k,v])=>{if(v==null||['string','number','boolean'].includes(typeof v))out[k]=v??'';else out[k]=JSON.stringify(sanitizeBackup(v))});return out}
function rowsLinked(arr){return safeArray(arr).map(x=>Object.assign({},baseLink(x),flatten(x)))}
function allRows(active,archived){return [...safeArray(db?.[active]),...safeArray(db?.[archived])]}
function budgetSnapshot(p){const b=p?.budgetControl||{};let assigned=+b.assigned||0,decrease=+b.decrease||0,expansion=+b.expansion||0,tp=+b.transferPositive||0,tn=+b.transferNegative||0,paid=+b.paid||0;safeArray(b.movements).forEach(m=>{const a=+m.amount||0;if(m.type==='Ampliación')expansion+=a;else if(m.type==='Disminución')decrease+=a;else if(m.type==='Transferencia +')tp+=a;else if(m.type==='Transferencia -')tn+=a;else if(m.type==='Pago')paid+=a});const vigente=r2(assigned-decrease+expansion+tp-tn),disponible=r2(vigente-paid);return{assigned:r2(assigned),decrease:r2(decrease),expansion:r2(expansion),tp:r2(tp),tn:r2(tn),vigente,paid:r2(paid),disponible,pct:vigente?r2(paid/vigente*100):0}}
function budgetRows(){return safeArray(db?.projects).filter(p=>p.budgetControl).map(p=>{const s=budgetSnapshot(p),b=p.budgetControl||{};return{'Código':p.code||'','Proyecto':p.name||'','Fuente':b.source||'','Fecha de corte':b.cutDate||'','Asignado':s.assigned,'Disminuciones':s.decrease,'Ampliaciones':s.expansion,'Transferencia +':s.tp,'Transferencia -':s.tn,'Presupuesto vigente':s.vigente,'Pagado':s.paid,'Disponible':s.disponible,'% pagado':s.pct}})}
function budgetMovementRows(){const out=[];safeArray(db?.projects).forEach(p=>safeArray(p.budgetControl?.movements).forEach(m=>out.push(Object.assign({'Código proyecto':p.code||'','Nombre proyecto':p.name||''},flatten(m)))));return out}
function auditRows(){return safeArray(db?.audit).map(a=>{const u=safeArray(db?.users).find(x=>x.id===a.userId);return Object.assign({'Usuario':u?.name||u?.email||''},flatten(a))})}
function technicalRows(){const raw=JSON.stringify(sanitizeBackup(db),null,2),size=30000,out=[];for(let i=0,n=1;i<raw.length;i+=size,n++)out.push({'Parte':n,'Contenido JSON':raw.slice(i,i+size)});return out}
function addSheet(XLSX,wb,name,rows){const data=rows?.length?rows:[{'Sin datos':'No hay registros en esta sección.'}],ws=XLSX.utils.json_to_sheet(data),headers=Object.keys(data[0]||{});if(headers.length)ws['!autofilter']={ref:`A1:${XLSX.utils.encode_col(headers.length-1)}${data.length+1}`};ws['!cols']=headers.map(h=>{let m=String(h).length;for(let i=0;i<Math.min(250,data.length);i++)m=Math.max(m,String(data[i]?.[h]??'').length);return{wch:Math.max(10,Math.min(/proyecto|nombre|descrip|observ|detalle|contenido/i.test(h)?50:24,m+2))}});const range=XLSX.utils.decode_range(ws['!ref']||'A1:A1');for(let c=range.s.c;c<=range.e.c;c++){const h=String(ws[XLSX.utils.encode_cell({r:0,c})]?.v||'');if(/monto|presupuesto|pagado|disponible|asignado|ampliacion|disminucion|retencion|anticipo|transferencia|precio|total|saldo|neto|bruto/i.test(h))for(let r=1;r<=range.e.r;r++){const cell=ws[XLSX.utils.encode_cell({r,c})];if(cell&&cell.t==='n')cell.z='"L" #,##0.00'}}XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31))}

async function exportBackupExcelHardened(){
  try{
    if(typeof db==='undefined'||!db)throw new Error('No hay información cargada para respaldar.');notify('Preparando respaldo seguro en Excel…');
    const XLSX=await loadSheetJS(),wb=XLSX.utils.book_new(),budgets=budgetRows(),bt=budgets.reduce((a,r)=>{a.v+=Number(r['Presupuesto vigente'])||0;a.p+=Number(r.Pagado)||0;a.d+=Number(r.Disponible)||0;return a},{v:0,p:0,d:0}),estimates=allRows('estimates','voidedEstimates'),changes=allRows('changes','voidedChanges'),payments=allRows('payments','voidedPayments');
    const paidEstimateRows=estimates.filter(e=>e.status==='Pagada'||e.status==='Anulada').map(e=>({...baseLink(e),'Tipo':'Estimación','Estimación':e.number,'Estado':e.status,'Fecha pago':e.paymentDate||'','Monto bruto':Number(e.gross||0),'Neto pagado':Number(e.net||0),'Orden':e.paymentOrder||'','Comprobante':e.receipt||'','Anulada':e.voidedAt?'Sí':'No','Motivo anulación':e.voidReason||''}));
    const otherPaymentRows=payments.map(p=>({...baseLink(p),'Tipo':p.movementType||'Otro desembolso','Estado':p.status||'','Fecha pago':p.date||'','Monto':Number(p.amount||0),'Orden':p.order||'','Comprobante':p.receipt||'','Anulado':p.voidedAt?'Sí':'No','Motivo anulación':p.voidReason||''}));
    addSheet(XLSX,wb,'Resumen',[{'Concepto':'Fecha de generación','Valor':new Date().toLocaleString('es-HN')},{'Concepto':'Sistema','Valor':'Control Contractual – Control de Proyectos'},{'Concepto':'Versión app_state','Valor':Number.isFinite(cloudStateVersion)?cloudStateVersion:''},{'Concepto':'Proyectos activos','Valor':safeArray(db.projects).filter(p=>!p.deletedAt).length},{'Concepto':'Contratos','Valor':safeArray(db.contracts).length},{'Concepto':'Estimaciones activas','Valor':safeArray(db.estimates).length},{'Concepto':'Estimaciones anuladas','Valor':safeArray(db.voidedEstimates).length},{'Concepto':'Garantías','Valor':safeArray(db.guarantees).length},{'Concepto':'Presupuesto vigente S.A.M.I.','Valor':r2(bt.v)},{'Concepto':'Pagado S.A.M.I.','Valor':r2(bt.p)},{'Concepto':'Disponible S.A.M.I.','Valor':r2(bt.d)}]);
    addSheet(XLSX,wb,'Proyectos',safeArray(db.projects).map(flatten));addSheet(XLSX,wb,'Contratos',rowsLinked(db.contracts));addSheet(XLSX,wb,'Estimaciones',rowsLinked(estimates));addSheet(XLSX,wb,'Pagos',[...paidEstimateRows,...otherPaymentRows]);addSheet(XLSX,wb,'Garantías',rowsLinked(db.guarantees));addSheet(XLSX,wb,'Modificaciones',rowsLinked(changes));addSheet(XLSX,wb,'Visitas',rowsLinked(db.visits));addSheet(XLSX,wb,'Disponibilidad',budgets);addSheet(XLSX,wb,'Mov Presupuestarios',budgetMovementRows());addSheet(XLSX,wb,'Usuarios',safeArray(db.users).map(u=>flatten(sanitizeBackup(u))));addSheet(XLSX,wb,'Auditoría',auditRows());addSheet(XLSX,wb,'Respaldo técnico',technicalRows());
    XLSX.writeFile(wb,`control-contractual-respaldo-${dateStamp()}.xlsx`,{compression:true});notify('Respaldo Excel seguro generado correctamente.');
  }catch(err){console.error(err);notify(err?.message||'No se pudo generar el respaldo Excel.')}
}
window.exportBackupExcel=exportBackupExcelHardened;try{if(typeof exportBackup!=='undefined')exportBackup=exportBackupExcelHardened}catch(_e){}function wireBackup(){const b=document.getElementById('backupBtn');if(!b)return;b.textContent='⇩ Respaldo Excel';b.onclick=exportBackupExcelHardened}

/* --------------------------------------------------------------------------
   ACCESO INSTITUCIONAL
---------------------------------------------------------------------------- */
function installLoginStyles(){if(document.getElementById('cp-login-institutional-style'))return;const s=document.createElement('style');s.id='cp-login-institutional-style';s.textContent=`.cp-login-page{min-height:100vh;display:grid;place-items:center;padding:28px;background:radial-gradient(circle at 15% 10%,rgba(37,99,235,.18),transparent 32%),radial-gradient(circle at 90% 90%,rgba(14,165,233,.12),transparent 30%),#060a10;color:#eef4fb}.cp-login-shell{width:min(1180px,100%);min-height:650px;display:grid;grid-template-columns:1.18fr .82fr;border:1px solid #20314a;border-radius:28px;overflow:hidden;background:#0a111b;box-shadow:0 38px 110px rgba(0,0,0,.48)}.cp-login-brand{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:58px;background:linear-gradient(145deg,#0b2241,#0b1728 48%,#08111c);text-align:center}.cp-login-mark{width:126px;height:126px;border-radius:34px;display:grid;place-items:center;background:linear-gradient(145deg,#2563eb,#0ea5e9);font-size:42px;font-weight:950;box-shadow:0 24px 60px rgba(37,99,235,.32);margin-bottom:24px}.cp-login-brand h1{font-size:46px;line-height:1;margin:0}.cp-login-brand h2{font-size:20px;font-weight:500;color:#9cb5cf;margin:10px 0 0}.cp-login-brand p{max-width:560px;color:#7991aa;font-size:13px;margin:24px 0 0;line-height:1.65}.cp-login-access{display:flex;align-items:center;justify-content:center;padding:58px 64px;background:linear-gradient(180deg,#0b121c,#080e16);border-left:1px solid #243854}.cp-login-formbox{width:100%;max-width:390px}.cp-login-kicker{font-size:10px;font-weight:900;letter-spacing:.18em;color:#68a4ff;margin-bottom:9px}.cp-login-formbox h3{font-size:27px;margin:0 0 7px}.cp-login-sub{color:#7f94aa;font-size:12px;margin:0 0 30px}.cp-login-mode{display:flex;gap:4px;padding:4px;border:1px solid #1e2d40;border-radius:11px;background:#070c13;margin-bottom:22px}.cp-login-mode button{flex:1;border:0;border-radius:8px;padding:9px;background:transparent;color:#70869d;font-weight:800}.cp-login-mode button.active{background:#15263b;color:#e8f2ff}.cp-login-field{display:block;margin-bottom:17px}.cp-login-field>span{display:block;font-size:12px;font-weight:850;color:#dce7f4;margin-bottom:7px}.cp-login-field input{width:100%;height:47px;background:#f8fafc;color:#111827;border:1px solid #cbd5e1;border-radius:7px;padding:0 13px}.cp-login-submit{width:100%;height:46px;border:1px solid #58a6df;border-radius:9px;background:linear-gradient(180deg,#60b8eb,#2787c6);color:#062348;font-size:14px;font-weight:950}.cp-login-message{min-height:18px;margin:13px 0 0;color:#8298ae;font-size:10px}.cp-login-message.error{color:#fca5a5}.cp-login-foot{margin-top:26px;padding-top:16px;border-top:1px solid #182536;color:#5f758b;font-size:9px;text-align:center}@media(max-width:900px){.cp-login-page{padding:16px}.cp-login-shell{grid-template-columns:1fr;min-height:0}.cp-login-brand{padding:34px 24px}.cp-login-mark{width:82px;height:82px;border-radius:24px;font-size:29px;margin-bottom:16px}.cp-login-brand h1{font-size:32px}.cp-login-brand h2{font-size:15px}.cp-login-brand p{display:none}.cp-login-access{border-left:0;border-top:1px solid #243854;padding:36px 28px}}@media(max-width:480px){.cp-login-page{padding:0;display:block}.cp-login-shell{min-height:100vh;border:0;border-radius:0}.cp-login-brand{padding:28px 18px 25px}.cp-login-access{padding:31px 20px}}`;document.head.appendChild(s)}
function institutionalRenderAuth(){installLoginStyles();const app=document.getElementById('app');if(!app)return;app.innerHTML=`<div class="cp-login-page"><main class="cp-login-shell"><section class="cp-login-brand"><div class="cp-login-mark">CC</div><h1>CONTROL</h1><h2>Contractual · Proyectos</h2><p>Sistema de seguimiento financiero, contractual y técnico de proyectos. Información centralizada y sincronizada de forma segura.</p></section><section class="cp-login-access"><div class="cp-login-formbox"><div class="cp-login-kicker">ACCESO AL SISTEMA</div><h3 id="cpLoginTitle">Iniciar sesión</h3><p class="cp-login-sub" id="cpLoginSub">Ingrese sus credenciales para continuar.</p><div class="cp-login-mode"><button type="button" class="active" id="loginTab">Ingresar</button><button type="button" id="registerTab">Crear acceso</button></div><form id="authForm"><label class="cp-login-field reg" style="display:none"><span>Nombre completo:</span><input id="authName" autocomplete="name"></label><label class="cp-login-field"><span>Usuario / Correo:</span><input id="authEmail" type="email" required autocomplete="email"></label><label class="cp-login-field"><span>Clave:</span><input id="authPass" type="password" minlength="8" required autocomplete="current-password"></label><button class="cp-login-submit" id="authSubmit">Ingresar</button><p class="cp-login-message" id="authMessage">Acceso protegido mediante Supabase.</p></form><div class="cp-login-foot">CONTROL CONTRACTUAL · CONTROL DE PROYECTOS</div></div></section></main></div>`;let mode='login';const setMode=m=>{mode=m;document.getElementById('loginTab')?.classList.toggle('active',m==='login');document.getElementById('registerTab')?.classList.toggle('active',m==='register');const name=document.querySelector('.cp-login-field.reg'),submit=document.getElementById('authSubmit'),pass=document.getElementById('authPass'),title=document.getElementById('cpLoginTitle'),sub=document.getElementById('cpLoginSub'),msg=document.getElementById('authMessage');if(name)name.style.display=m==='register'?'block':'none';if(submit)submit.textContent=m==='login'?'Ingresar':'Crear acceso';if(pass)pass.autocomplete=m==='login'?'current-password':'new-password';if(title)title.textContent=m==='login'?'Iniciar sesión':'Crear acceso';if(sub)sub.textContent=m==='login'?'Ingrese sus credenciales para continuar.':'Registre el usuario que tendrá acceso al sistema.';if(msg){msg.classList.remove('error');msg.textContent=m==='login'?'Acceso protegido mediante Supabase.':'La cuenta quedará vinculada a su espacio de trabajo en la nube.'}};document.getElementById('loginTab').onclick=()=>setMode('login');document.getElementById('registerTab').onclick=()=>setMode('register');document.getElementById('authForm').onsubmit=async ev=>{ev.preventDefault();const email=document.getElementById('authEmail').value.trim().toLowerCase(),password=document.getElementById('authPass').value,name=document.getElementById('authName').value.trim(),btn=document.getElementById('authSubmit'),msg=document.getElementById('authMessage');btn.disabled=true;msg.classList.remove('error');msg.textContent='Procesando…';try{if(mode==='register'){if(!name)throw new Error('Escriba el nombre completo.');const r=await fetch(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:{full_name:name}})}),d=await r.json();if(!r.ok)throw new Error(d.msg||d.message||d.error_description||'No se pudo crear el acceso.');if(!d.access_token){msg.textContent='Cuenta creada. Revise su correo para confirmar el acceso y luego ingrese.';setMode('login');return}session={userId:d.user.id,email:d.user.email,accessToken:d.access_token,refreshToken:d.refresh_token,expiresAt:Date.now()+(d.expires_in||3600)*1000};localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;cloudStateVersion=null;await render()}else{const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})}),d=await r.json();if(!r.ok)throw new Error(d.error_description||d.msg||d.message||'Usuario o clave incorrectos.');session={userId:d.user.id,email:d.user.email,accessToken:d.access_token,refreshToken:d.refresh_token,expiresAt:Date.now()+(d.expires_in||3600)*1000};localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;cloudStateVersion=null;await render()}}catch(err){msg.classList.add('error');msg.textContent=err.message||'No se pudo completar la operación.'}finally{btn.disabled=false}}}
function installUiOverrides(){installLoginStyles();try{if(typeof renderAuth==='function'&&!renderAuth.__cpInstitutional){institutionalRenderAuth.__cpInstitutional=true;renderAuth=institutionalRenderAuth}}catch(_e){}try{if(typeof renderApp==='function'&&!renderApp.__cpHardeningWire){const base=renderApp;const wrapped=function(){const result=base.apply(this,arguments);queueMicrotask(()=>{wireBackup();wireChangeVoidButtons();wirePaymentVoidButtons()});return result};wrapped.__cpHardeningWire=true;renderApp=wrapped}}catch(_e){}wireBackup();const authVisible=!document.querySelector('.shell')&&!!document.getElementById('authForm');if(authVisible&&!document.querySelector('.cp-login-page'))institutionalRenderAuth()}
installUiOverrides();setTimeout(installUiOverrides,0);setTimeout(installUiOverrides,250);setTimeout(installUiOverrides,900);
})();