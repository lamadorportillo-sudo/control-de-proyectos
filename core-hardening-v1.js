/* ===== CONTROL CONTRACTUAL · NUCLEO DE INTEGRIDAD Y CONCURRENCIA V1 ===== */
(()=>{
'use strict';
if(window.__CC_CORE_HARDENING_V1__)return;
window.__CC_CORE_HARDENING_V1__=true;

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const arr=v=>Array.isArray(v)?v:[];
const n=v=>Number(v)||0;
const say=m=>{try{toast(m)}catch{console.log(m)}};
const scopedKey=()=>{try{return cloudWorkspaceId&&session?.userId?`${STORE}:${cloudWorkspaceId}:${session.userId}`:STORE}catch{return STORE}};
const safeLocal=v=>{try{return typeof window.__ccSafeSlimState==='function'?window.__ccSafeSlimState(v):v}catch{return v}};
let baseState=clone(window.__ccCloudBaseState||null);
let stateVersion=Number(window.__ccCloudVersion||0)||null;
let conflictOpen=false;
let recoveryReadOnly=false;
let canonicalHydrationPromise=null;
let recoveredCloudRole='consulta';

/* El arranque completo comparte un solo presupuesto de tiempo. Antes cada
   petición podía consumir 12 s por separado. Ahora el presupuesto protege la
   recuperación ligera; el estado JSON grande se hidrata después de la primera pintura. */
const STARTUP_TIMEOUT_MS=12000;
let startupDeadline=0;
function beginStartupBudget(){
  if(!startupDeadline||Date.now()>=startupDeadline)startupDeadline=Date.now()+STARTUP_TIMEOUT_MS;
  return startupDeadline;
}
function clearStartupBudget(){startupDeadline=0}
function withStartupTimeout(promise,label='La conexión con Supabase',deadline=beginStartupBudget()){
  const remaining=Math.max(1,deadline-Date.now());
  let timer=null;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} agotó el tiempo total de arranque de ${Math.round(STARTUP_TIMEOUT_MS/1000)} segundos.`)),remaining)});
  return Promise.race([Promise.resolve(promise),timeout]).finally(()=>{if(timer)clearTimeout(timer)});
}
function startupSbFetch(path,options,deadline=beginStartupBudget()){return withStartupTimeout(sbFetch(path,options),'La conexión con Supabase',deadline)}
async function hardenedEnsureCloudSession(){
  if(!session?.accessToken)return false;
  const deadline=beginStartupBudget();
  if(session.expiresAt&&Date.now()>session.expiresAt-60000){
    try{return await withStartupTimeout(refreshCloudSession(),'La renovación de la sesión',deadline)}
    catch(error){console.warn('La renovación de sesión excedió el tiempo de arranque.',error?.message||error);return false}
  }
  return true;
}
function showStartupState(){
  const app=document.getElementById('app');
  if(!app||app.children.length)return;
  app.innerHTML='<div class="auth"><div class="auth-card"><div class="logo">CC</div><p class="eyebrow">CONTROL DE PROYECTOS</p><h1>Abriendo tu espacio de trabajo</h1><p class="muted">Verificando la sesión y sincronizando la información con Supabase…</p><p class="notice">Recuperando primero tus proyectos para no dejar la pantalla bloqueada.</p></div></div>';
}
try{ensureCloudSession=hardenedEnsureCloudSession}catch{}
showStartupState();

function stripSecrets(source){
  const out=clone(source)||{};
  out.users=arr(out.users).map(u=>{const x={...u};delete x.password;return x});
  return out;
}
function saveLocalSnapshot(source=db){
  const key=scopedKey(),payload=safeLocal(source);let text='';
  try{text=JSON.stringify(payload)}catch(e){console.warn('No se pudo serializar la copia local',e);return false}
  /* Evita congelamientos y QuotaExceeded: el estado oficial grande permanece en Supabase.
     La copia local solo se usa cuando cabe con margen y nunca se duplica en dos claves. */
  if(text.length>1800000){console.warn('Copia local omitida por tamaño; Supabase conserva el estado oficial.',text.length);return false}
  try{localStorage.setItem(key,text);return true}catch(e){console.warn('Copia local por espacio no disponible',e);return false}
}
function entityMap(list){const m=new Map();arr(list).forEach((x,i)=>m.set(x&&x.id!=null?String(x.id):`__idx_${i}`,x));return m}
function mergeArray(base,local,server,path,conflicts){
  const bm=entityMap(base),lm=entityMap(local),sm=entityMap(server),keys=new Set([...bm.keys(),...lm.keys(),...sm.keys()]),out=[];
  for(const k of keys){
    const b=bm.get(k),l=lm.get(k),s=sm.get(k),lc=!eq(l,b),sc=!eq(s,b);
    if(!lc){if(s!==undefined)out.push(s);continue}
    if(!sc){if(l!==undefined)out.push(l);continue}
    if(eq(l,s)){if(l!==undefined)out.push(l);continue}
    conflicts.push(`${path}:${k}`);
    if(s!==undefined)out.push(s);
  }
  return out;
}
function threeWayMerge(base,local,server){
  const b=base&&typeof base==='object'?base:{},l=local&&typeof local==='object'?local:{},s=server&&typeof server==='object'?server:{},out={},conflicts=[];
  const keys=new Set([...Object.keys(b),...Object.keys(l),...Object.keys(s)]);
  for(const key of keys){
    const bv=b[key],lv=l[key],sv=s[key];
    if(Array.isArray(bv)||Array.isArray(lv)||Array.isArray(sv)){out[key]=mergeArray(bv,lv,sv,key,conflicts);continue}
    const lc=!eq(lv,bv),sc=!eq(sv,bv);
    if(!lc)out[key]=sv;else if(!sc)out[key]=lv;else if(eq(lv,sv))out[key]=lv;else{conflicts.push(key);out[key]=sv}
  }
  return{data:out,conflicts};
}
async function readCloudRow(deadline=0){
  if(!cloudWorkspaceId)return null;
  const path=`/rest/v1/app_state?select=data,version,updated_at&workspace_id=eq.${encodeURIComponent(cloudWorkspaceId)}&limit=1`;
  const r=deadline?await startupSbFetch(path,undefined,deadline):await sbFetch(path);
  return r.data?.[0]||null;
}
function showConflict(serverData,serverVersion,conflicts){
  window.__ccSyncConflict={serverData:clone(serverData),serverVersion,conflicts:[...conflicts],localData:clone(db),at:new Date().toISOString()};
  if(conflictOpen)return;
  conflictOpen=true;
  setTimeout(()=>{
    try{
      if(typeof openModal!=='function'){say('Hay cambios simultáneos. Recarga el expediente antes de continuar.');conflictOpen=false;return}
      const list=conflicts.slice(0,10).map(x=>`<li>${typeof esc==='function'?esc(x):x}</li>`).join('');
      const m=openModal('Cambios simultáneos detectados',`<div class="alert danger"><b>No se sobrescribió información.</b> Otro usuario modificó el mismo expediente mientras trabajabas. Tu copia local quedó protegida.</div><p class="muted">Conflictos detectados: ${conflicts.length}.</p>${list?`<ul>${list}</ul>`:''}<div class="actions"><button class="btn" id="ccConflictBackup">Guardar respaldo local</button><button class="btn primary" id="ccConflictReload">Recargar versión de la nube</button></div>`);
      const b=m.querySelector('#ccConflictBackup');if(b)b.onclick=()=>{try{exportBackup()}catch{} };
      const r=m.querySelector('#ccConflictReload');if(r)r.onclick=()=>{if(!confirm('Se reemplazará la copia de trabajo actual por la versión más reciente de la nube. ¿Continuar?'))return;db=Object.assign(defaultDB(),clone(serverData)||{});stateVersion=Number(serverVersion)||stateVersion;baseState=clone(serverData)||{};window.__ccCloudVersion=stateVersion;window.__ccCloudBaseState=clone(baseState);recoveryReadOnly=false;cloudRole=recoveredCloudRole;saveLocalSnapshot(db);window.__ccSyncConflict=null;m.remove();conflictOpen=false;try{renderApp()}catch{render()}};
      const close=m.querySelector('.close');if(close)close.addEventListener('click',()=>{conflictOpen=false},{once:true});
    }catch(e){console.warn(e);conflictOpen=false}
  },0);
}

const numOrNull=v=>v==null||v===''?null:n(v);
function projectFromRow(r){return{id:r.id,code:r.code||'',name:r.name||'',description:r.description||'',location:r.location||'',type:r.project_type||'Obra',budget:n(r.budget_estimate),status:r.status||'Planificación',start:r.start_date||'',end:r.end_date||'',executionDays:n(r.execution_days),deletedAt:r.archived_at||null}}
function contractFromRow(r){return{id:r.id,projectId:r.project_id,number:r.number||'',contractor:r.contractor||'',originalAmount:n(r.original_amount),currentAmount:n(r.legacy_current_amount||r.original_amount),signature:r.signature_date||'',start:r.start_date||'',end:r.end_date||'',executionDays:n(r.execution_days),status:r.status||'Vigente',advanceStatus:r.advance_status||'',advanceRequestedPct:n(r.advance_requested_pct),advanceApproved:n(r.advance_approved),advancePaid:n(r.advance_paid),advancePaymentDate:r.advance_payment_date||'',recoveryTarget:numOrNull(r.recovery_target_pct),recoveryBasis:r.advance_recovery_basis||'',notes:r.notes||''}}
function estimateFromRow(r){return{id:r.id,projectId:r.project_id,contractId:r.contract_id,number:n(r.number),start:r.period_start||'',end:r.period_end||'',gross:n(r.gross),advanceCalculated:n(r.advance_calculated),advanceApplied:n(r.advance_applied),qualityPct:n(r.quality_pct),qualityCalculated:n(r.quality_calculated),qualityApplied:n(r.quality_applied),isrPct:n(r.isr_pct),isrCalculated:n(r.isr_calculated),isrApplied:n(r.isr_applied),other:n(r.other_deductions),totalDeductions:n(r.total_deductions),net:n(r.net),status:r.status||'',paymentDate:r.payment_date||'',paymentOrder:r.payment_order||'',invoice:r.invoice||'',receipt:r.receipt||'',manual:!!r.manual_adjustment,manualReason:r.manual_reason||'',notes:r.notes||'',paymentNotes:r.payment_notes||''}}
function guaranteeFromRow(r){return{id:r.id,projectId:r.project_id,contractId:r.contract_id,type:r.guarantee_type||'',number:r.number||'',issuer:r.issuer||'',document:r.document_ref||'',base:n(r.calculation_base),percentage:n(r.percentage),calculated:n(r.calculated_amount),applied:n(r.applied_amount),start:r.start_date||'',end:r.end_date||'',notes:r.notes||'',extensions:[]}}
function visitFromRow(r){return{id:r.id,projectId:r.project_id,number:n(r.visit_number),date:r.visit_date||'',inspector:r.inspector||'',notes:r.summary||''}}
function paymentFromRow(r){return{id:r.id,projectId:r.project_id,contractId:r.contract_id,estimateId:r.estimate_id,type:r.movement_type||'',amount:n(r.amount),date:r.payment_date||'',paymentOrder:r.payment_order||'',receipt:r.receipt||'',status:r.status||'',notes:r.notes||''}}
function changeFromRow(r){return{id:r.id,projectId:r.project_id,contractId:r.contract_id,number:r.number||'',type:r.change_type||'',date:r.change_date||'',amountDelta:n(r.amount_delta),daysDelta:n(r.days_delta),status:r.status||'',document:r.document_ref||'',reason:r.justification||'',notes:r.justification||''}}

async function readNormalizedRecovery(deadline){
  const wid=encodeURIComponent(cloudWorkspaceId);
  const specs=[
    ['projects','id,code,name,description,location,project_type,budget_estimate,status,start_date,end_date,execution_days,archived_at',projectFromRow],
    ['contracts','id,project_id,number,contractor,original_amount,legacy_current_amount,signature_date,start_date,end_date,execution_days,status,advance_status,advance_requested_pct,advance_approved,advance_paid,advance_payment_date,recovery_target_pct,advance_recovery_basis,notes',contractFromRow],
    ['estimates','id,project_id,contract_id,number,period_start,period_end,gross,advance_calculated,advance_applied,quality_pct,quality_calculated,quality_applied,isr_pct,isr_calculated,isr_applied,other_deductions,total_deductions,net,status,payment_date,payment_order,invoice,receipt,manual_adjustment,manual_reason,notes,payment_notes',estimateFromRow],
    ['guarantees','id,project_id,contract_id,guarantee_type,number,issuer,document_ref,calculation_base,percentage,calculated_amount,applied_amount,start_date,end_date,notes',guaranteeFromRow],
    ['visits','id,project_id,visit_number,visit_date,inspector,summary',visitFromRow],
    ['payments','id,project_id,contract_id,estimate_id,movement_type,amount,payment_date,payment_order,receipt,status,notes',paymentFromRow],
    ['contract_changes','id,project_id,contract_id,number,change_type,change_date,amount_delta,days_delta,status,document_ref,justification',changeFromRow]
  ];
  const settled=await Promise.allSettled(specs.map(([table,fields])=>startupSbFetch(`/rest/v1/${table}?select=${fields}&workspace_id=eq.${wid}&order=created_at.asc`,undefined,deadline)));
  const recovered={projects:[],contracts:[],estimates:[],guarantees:[],visits:[],payments:[],changes:[]};
  specs.forEach(([table,,map],i)=>{const result=settled[i],key=table==='contract_changes'?'changes':table;if(result.status==='fulfilled')recovered[key]=arr(result.value?.data).map(map);else console.warn(`Recuperación ligera ${table}:`,result.reason?.message||result.reason)});
  return recovered;
}
function addSessionUser(role=cloudRole){
  const u={id:session.userId,name:cloudProfile?.full_name||session.email||'Usuario',email:session.email,role:role||'consulta',active:true};
  db.users=arr(db.users).filter(x=>x.id!==u.id);db.users.unshift(u);
}
async function hydrateCanonicalState(deadline=0){
  try{
    const row=deadline?await readCloudRow(deadline):await readCloudRow();
    if(!row?.data||cloudStateEmpty(row.data))return false;
    stateVersion=Number(row.version||1);window.__ccCloudVersion=stateVersion;
    db=Object.assign(defaultDB(),clone(row.data));
    baseState=clone(row.data);window.__ccCloudBaseState=clone(baseState);
    recoveryReadOnly=false;cloudRole=recoveredCloudRole;cloudLoaded=true;addSessionUser(cloudRole);
    saveLocalSnapshot(db);
    try{ensureProjectLinks()}catch{}
    try{syncAllProjectProgress()}catch{}
    try{renderApp()}catch(e){console.warn('No se pudo refrescar el dashboard hidratado',e)}
    cloudLastSaved=new Date(row.updated_at||Date.now());try{updateCloudBadge()}catch{}
    window.__ccCloudRecovery={mode:'canonical',projects:arr(db.projects).length,at:new Date().toISOString()};
    return true;
  }catch(error){
    window.__ccCloudRecovery={mode:'normalized-readonly',projects:arr(db.projects).length,error:String(error?.message||error),at:new Date().toISOString()};
    console.warn('La copia completa de Supabase seguirá pendiente; se mantienen visibles los datos normalizados.',error);
    return false;
  }
}
function scheduleCanonicalHydration(){
  if(canonicalHydrationPromise)return canonicalHydrationPromise;
  canonicalHydrationPromise=new Promise(resolve=>setTimeout(resolve,350)).then(()=>hydrateCanonicalState()).finally(()=>{canonicalHydrationPromise=null});
  return canonicalHydrationPromise;
}

async function hardenedLoadCloudData(){
  const deadline=beginStartupBudget();
  try{
    const mem=(await startupSbFetch(`/rest/v1/workspace_members?select=workspace_id,role,active&user_id=eq.${encodeURIComponent(session.userId)}&limit=1`,undefined,deadline)).data?.[0];
    if(!mem)throw new Error('No se encontró un espacio de trabajo para este usuario.');
    if(mem.active===false)throw new Error('La membresía de este espacio de trabajo está desactivada.');
    cloudWorkspaceId=mem.workspace_id;recoveredCloudRole=mem.role||'consulta';cloudRole=recoveredCloudRole;
    const prof=(await startupSbFetch(`/rest/v1/profiles?select=full_name,active&user_id=eq.${encodeURIComponent(session.userId)}&limit=1`,undefined,deadline)).data?.[0];
    cloudProfile=prof||{full_name:session.email||'Usuario',active:true};
    if(cloudProfile.active===false)throw new Error('Este acceso está desactivado.');

    /* La copia grande se consulta después de pintar. La ruta histórica se conserva
       en hydrateCanonicalState: deadline ? readCloudRow(deadline) : readCloudRow(). */
    const recovered=await readNormalizedRecovery(deadline);
    if(arr(recovered.projects).length){
      const localBase=Object.assign(defaultDB(),clone(db)||{});
      db=Object.assign(localBase,recovered);
      recoveryReadOnly=true;cloudRole='consulta';cloudLoaded=true;stateVersion=null;baseState=null;
      window.__ccCloudVersion=null;window.__ccCloudBaseState=null;
      addSessionUser('consulta');
      window.__ccCloudRecovery={mode:'normalized-readonly',projects:arr(db.projects).length,at:new Date().toISOString()};
      scheduleCanonicalHydration();
      return{recovered:true};
    }

    /* Fallback: solo si las tablas normalizadas no devolvieron proyectos. */
    const row=await readCloudRow(deadline);
    stateVersion=Number(row?.version||1);window.__ccCloudVersion=stateVersion;
    if(row?.data&&!cloudStateEmpty(row.data))db=Object.assign(defaultDB(),clone(row.data));
    else{let scoped=null;try{scoped=JSON.parse(localStorage.getItem(scopedKey())||'null')}catch{};db=scoped&&typeof scoped==='object'?Object.assign(defaultDB(),scoped):defaultDB()}
    baseState=clone(row?.data||db||{});window.__ccCloudBaseState=clone(baseState);cloudLoaded=true;recoveryReadOnly=false;cloudRole=recoveredCloudRole;addSessionUser(cloudRole);saveLocalSnapshot(db);
    return{recovered:false};
  }finally{
    clearStartupBudget();
  }
}

async function hardenedSaveCloudNow(retryMerge=false){
  if(recoveryReadOnly){console.warn('Guardado bloqueado mientras se hidrata la copia canónica.');return false}
  if(!cloudLoaded||!cloudWorkspaceId||!session?.accessToken||cloudSaving)return false;
  cloudSaving=true;
  try{
    if(!stateVersion){const row=await readCloudRow();stateVersion=Number(row?.version||1);baseState=clone(row?.data||{});window.__ccCloudVersion=stateVersion;window.__ccCloudBaseState=clone(baseState)}
    const safe=stripSecrets(db);
    const r=await sbFetch('/rest/v1/rpc/save_app_state',{method:'POST',body:{p_workspace_id:cloudWorkspaceId,p_expected_version:stateVersion,p_data:safe}});
    const x=Array.isArray(r.data)?r.data[0]:r.data;
    if(!x?.saved){
      const serverData=clone(x?.server_data||{}),serverVersion=Number(x?.new_version||stateVersion);
      const merged=threeWayMerge(baseState||{},safe,serverData);
      stateVersion=serverVersion;window.__ccCloudVersion=stateVersion;
      if(!merged.conflicts.length&&!retryMerge){
        db=Object.assign(defaultDB(),merged.data);baseState=serverData;window.__ccCloudBaseState=clone(baseState);saveLocalSnapshot(db);
        cloudSaving=false;
        return hardenedSaveCloudNow(true);
      }
      saveLocalSnapshot(safe);showConflict(serverData,serverVersion,merged.conflicts.length?merged.conflicts:['estado_general']);
      throw new Error('CONFLICTO_DE_VERSION: otro usuario guardó cambios sobre el mismo expediente.');
    }
    stateVersion=Number(x.new_version||stateVersion+1);window.__ccCloudVersion=stateVersion;
    baseState=clone(safe);window.__ccCloudBaseState=clone(baseState);window.__ccSyncConflict=null;
    cloudLastSaved=new Date();saveLocalSnapshot(safe);try{updateCloudBadge()}catch{}
    return true;
  }finally{cloudSaving=false}
}
function hardenedScheduleCloudSave(){
  if(recoveryReadOnly)return false;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer=setTimeout(()=>hardenedSaveCloudNow().catch(e=>{console.error(e);if(!String(e?.message||e).includes('CONFLICTO_DE_VERSION'))say('No se pudo sincronizar con Supabase. Los cambios permanecen protegidos en este dispositivo.')}),450);
}
function hardenedSaveDB(){
  try{syncAllProjectProgress()}catch(e){console.warn('No se pudo recalcular el avance',e)}
  if(!recoveryReadOnly)saveLocalSnapshot(db);
  if(!recoveryReadOnly&&cloudLoaded&&session?.accessToken)hardenedScheduleCloudSave();
}
async function hardenedSignOut(){
  try{if(session?.accessToken)await sbFetch('/auth/v1/logout',{method:'POST',body:{},retry:false})}catch{}
  session=null;cloudLoaded=false;cloudWorkspaceId=null;cloudProfile=null;stateVersion=null;baseState=null;recoveryReadOnly=false;canonicalHydrationPromise=null;window.__ccCloudVersion=null;window.__ccCloudBaseState=null;window.__ccSyncConflict=null;
  localStorage.removeItem(SESSION);render();
}

try{loadCloudData=hardenedLoadCloudData}catch{}
try{saveCloudNow=hardenedSaveCloudNow}catch{}
try{scheduleCloudSave=hardenedScheduleCloudSave}catch{}
try{saveDB=hardenedSaveDB}catch{}
try{cloudSignOut=hardenedSignOut}catch{}

const certified=e=>!!e&&/^(aprobada|aprobado|pagada|pagado)$/i.test(String(e.status||''));
function progressForProject(p,c=null){
  const contract=c||arr(db.contracts).find(x=>x.projectId===p.id),es=contract?arr(db.estimates).filter(e=>e.contractId===contract.id):[],base=Math.max(0,n(contract?.currentAmount??p.budget)),allGross=es.reduce((s,e)=>s+n(e.gross),0),certGross=es.filter(certified).reduce((s,e)=>s+n(e.gross),0),paidNet=es.filter(e=>/^(pagada|pagado)$/i.test(String(e.status||''))).reduce((s,e)=>s+n(e.net),0),moves=arr(db.payments).filter(x=>x.projectId===p.id&&x.status==='Pagado').reduce((s,x)=>s+n(x.amount),0),advance=n(contract?.advancePaid),visits=arr(db.visits).filter(v=>v.projectId===p.id&&v.date&&Number.isFinite(Number(v.physical))).sort((a,b)=>String(a.date).localeCompare(String(b.date))||n(a.number)-n(b.number)),last=visits.at(-1),physical=last?Math.max(0,Math.min(100,n(last.physical))):0;
  return{physical,physicalAvailable:!!last,financial:base?Math.max(0,Math.min(100,Math.round(certGross/base*10000)/100)):0,proposed:base?Math.max(0,Math.min(100,Math.round(allGross/base*10000)/100)):0,paid:base?Math.max(0,Math.min(100,Math.round((advance+paidNet+moves)/base*10000)/100)):0,source:last?`Visita N.º ${last.number||'—'} · ${last.date}`:'Sin avance físico de campo registrado',date:last?.date||'',certifiedGross:certGross,proposedGross:allGross};
}
function hardenedProjectAutomaticProgress(p,c=null){return progressForProject(p,c)}
function hardenedSyncProgress(){
  arr(db.projects).forEach(p=>{const c=arr(db.contracts).find(x=>x.projectId===p.id),a=progressForProject(p,c);p.physicalProgress=a.physicalAvailable?a.physical:null;p.financialProgress=a.financial;p.proposedFinancialProgress=a.proposed;p.paidProgress=a.paid;p.progressSource=a.source});
}
try{projectAutomaticProgress=hardenedProjectAutomaticProgress}catch{}
try{syncAllProjectProgress=hardenedSyncProgress}catch{}

try{procurementMode=function(){return 'Según Gaceta y año fiscal'}}catch{}

async function hardenedAuditModal(){
  try{
    if(!cloudWorkspaceId||!navigator.onLine)throw new Error('Sin conexión');
    const r=await sbFetch(`/rest/v1/audit_events?select=id,created_at,user_name,entity_type,entity_id,action,before_data,after_data,event_hash,hash_valid,chain_valid&workspace_id=eq.${encodeURIComponent(cloudWorkspaceId)}&order=created_at.desc&limit=200`),rows=arr(r.data);
    openModal('Historial de cambios · PostgreSQL',`<div class="alert info">Historial oficial del servidor con validación de integridad.</div><div class="table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Integridad</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${new Date(a.created_at).toLocaleString('es-HN')}</td><td>${typeof esc==='function'?esc(a.user_name||'Sistema'):a.user_name}</td><td>${typeof esc==='function'?esc(a.action):a.action}</td><td>${typeof esc==='function'?esc(`${a.entity_type||''} · ${a.entity_id||''}`):''}</td><td>${a.hash_valid&&a.chain_valid?'✓ Correcta':'⚠ Revisar'}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">Sin movimientos.</td></tr>'}</tbody></table></div>`);
  }catch{say('La auditoría oficial requiere conexión con Supabase.')}
}
try{auditModal=hardenedAuditModal}catch{}

function decorate(){
  try{
    const ef=document.getElementById('ePhysical');
    if(ef){const field=ef.closest('.field'),sp=field?.querySelector('span'),sm=field?.querySelector('small');if(sp)sp.textContent='Avance financiero proyectado %';if(sm)sm.textContent='Proyección acumulada de estimaciones. No representa avance físico de obra.'}
    document.querySelectorAll('.project-card-premium,.project-v3').forEach(card=>{
      const open=card.querySelector('[data-open]');if(!open)return;const p=arr(db.projects).find(x=>x.id===open.dataset.open);if(!p)return;const a=progressForProject(p);const label=card.querySelector('.progress-label span');const val=card.querySelector('.progress-label b');const fill=card.querySelector('.progress-fill');if(label)label.textContent=a.physicalAvailable?'Avance físico observado · última visita':'Avance físico sin registrar';if(val)val.textContent=a.physicalAvailable?`${a.physical.toFixed(2)}%`:'—';if(fill)fill.style.width=`${a.physicalAvailable?a.physical:0}%`;
    });
    const body=document.getElementById('tabBody');if(body&&!body.dataset.ccProgressDecorated&&view?.screen==='project'&&view?.tab==='summary'){
      const p=arr(db.projects).find(x=>x.id===view.projectId);if(p){const a=progressForProject(p),cells=[...body.querySelectorAll('.info')],auto=cells.find(x=>/Avance automático/i.test(x.querySelector('small')?.textContent||''));if(auto){auto.innerHTML=`<small>Avance físico observado</small><strong>${a.physicalAvailable?a.physical.toFixed(2)+'%':'Sin registrar'}</strong><small>${a.source}</small>`;auto.insertAdjacentHTML('afterend',`<div class="info"><small>Avance certificado</small><strong>${a.financial.toFixed(2)}%</strong><small>Solo estimaciones aprobadas o pagadas</small></div><div class="info"><small>Avance financiero propuesto</small><strong>${a.proposed.toFixed(2)}%</strong><small>Incluye estimaciones aún no certificadas</small></div><div class="info"><small>Avance pagado</small><strong>${a.paid.toFixed(2)}%</strong><small>Desembolsos registrados</small></div>`);body.dataset.ccProgressDecorated='1'}}
    }
    document.querySelectorAll('.field span').forEach(sp=>{if(sp.textContent.trim()==='Modalidad sugerida')sp.textContent='Modalidad de referencia'});
  }catch(e){console.warn('Decoración de integridad',e)}
}
new MutationObserver(()=>setTimeout(decorate,0)).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(()=>{decorate();try{hardenedSyncProgress()}catch{}},0);
window.ccProgressForProject=progressForProject;
window.ccSaveCloudNow=hardenedSaveCloudNow;
window.ccHydrateCanonicalState=hydrateCanonicalState;
})();