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

/* El arranque completo comparte un solo presupuesto de tiempo. Antes cada
   petición podía consumir 12 s por separado, de modo que membresía + perfil +
   estado podían inmovilizar la interfaz durante decenas de segundos. */
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
  app.innerHTML='<div class="auth"><div class="auth-card"><div class="logo">CC</div><p class="eyebrow">CONTROL DE PROYECTOS</p><h1>Abriendo tu espacio de trabajo</h1><p class="muted">Verificando la sesión y sincronizando la información con Supabase…</p><p class="notice">Si la conexión no responde, el sistema mostrará una opción para reintentar en pocos segundos.</p></div></div>';
}
try{ensureCloudSession=hardenedEnsureCloudSession}catch{}
showStartupState();

function stripSecrets(source){
  const out=clone(source)||{};
  out.users=arr(out.users).map(u=>{const x={...u};delete x.password;return x});
  return out;
}
function saveLocalSnapshot(source=db){
  const key=scopedKey(),payload=safeLocal(source);
  try{localStorage.setItem(key,JSON.stringify(payload))}catch(e){console.warn('Copia local por espacio no disponible',e)}
  try{localStorage.setItem(STORE,JSON.stringify(payload))}catch{}
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
      const r=m.querySelector('#ccConflictReload');if(r)r.onclick=()=>{if(!confirm('Se reemplazará la copia de trabajo actual por la versión más reciente de la nube. ¿Continuar?'))return;db=Object.assign(defaultDB(),clone(serverData)||{});stateVersion=Number(serverVersion)||stateVersion;baseState=clone(serverData)||{};window.__ccCloudVersion=stateVersion;window.__ccCloudBaseState=clone(baseState);saveLocalSnapshot(db);window.__ccSyncConflict=null;m.remove();conflictOpen=false;try{renderApp()}catch{render()}};
      const close=m.querySelector('.close');if(close)close.addEventListener('click',()=>{conflictOpen=false},{once:true});
    }catch(e){console.warn(e);conflictOpen=false}
  },0);
}

async function hardenedLoadCloudData(){
  const deadline=beginStartupBudget();
  try{
    const mem=(await startupSbFetch(`/rest/v1/workspace_members?select=workspace_id,role,active&user_id=eq.${encodeURIComponent(session.userId)}&limit=1`,undefined,deadline)).data?.[0];
    if(!mem)throw new Error('No se encontró un espacio de trabajo para este usuario.');
    cloudWorkspaceId=mem.workspace_id;cloudRole=mem.role||'consulta';
    const prof=(await startupSbFetch(`/rest/v1/profiles?select=full_name,active&user_id=eq.${encodeURIComponent(session.userId)}&limit=1`,undefined,deadline)).data?.[0];
    cloudProfile=prof||{full_name:session.email||'Usuario',active:true};
    if(cloudProfile.active===false)throw new Error('Este acceso está desactivado.');
    const row=await readCloudRow(deadline);
    stateVersion=Number(row?.version||1);window.__ccCloudVersion=stateVersion;
    if(row?.data&&!cloudStateEmpty(row.data)){
      db=Object.assign(defaultDB(),clone(row.data));
    }else{
      let scoped=null;try{scoped=JSON.parse(localStorage.getItem(scopedKey())||'null')}catch{}
      db=scoped&&typeof scoped==='object'?Object.assign(defaultDB(),scoped):defaultDB();
    }
    baseState=clone(row?.data||db||{});window.__ccCloudBaseState=clone(baseState);
    cloudLoaded=true;
    const u={id:session.userId,name:cloudProfile.full_name||session.email,email:session.email,role:cloudRole,active:true};
    db.users=arr(db.users).filter(x=>x.id!==u.id);db.users.unshift(u);
    saveLocalSnapshot(db);
  }finally{
    clearStartupBudget();
  }
}

async function hardenedSaveCloudNow(retryMerge=false){
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
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer=setTimeout(()=>hardenedSaveCloudNow().catch(e=>{console.error(e);if(!String(e?.message||e).includes('CONFLICTO_DE_VERSION'))say('No se pudo sincronizar con Supabase. Los cambios permanecen protegidos en este dispositivo.')}),450);
}
function hardenedSaveDB(){
  try{syncAllProjectProgress()}catch(e){console.warn('No se pudo recalcular el avance',e)}
  saveLocalSnapshot(db);
  if(cloudLoaded&&session?.accessToken)hardenedScheduleCloudSave();
}
async function hardenedSignOut(){
  try{if(session?.accessToken)await sbFetch('/auth/v1/logout',{method:'POST',body:{},retry:false})}catch{}
  try{localStorage.removeItem(STORE)}catch{}
  session=null;cloudLoaded=false;cloudWorkspaceId=null;cloudProfile=null;stateVersion=null;baseState=null;window.__ccCloudVersion=null;window.__ccCloudBaseState=null;window.__ccSyncConflict=null;
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
})();