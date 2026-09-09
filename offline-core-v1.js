/* ===== CONTROL CONTRACTUAL · MODO CAMPO OFFLINE V1 ===== */
(()=>{
'use strict';
if(window.__CC_OFFLINE_FIELD_CORE_V1__)return;
window.__CC_OFFLINE_FIELD_CORE_V1__=true;

const IDB_NAME='cc_control_contractual_offline_v1';
const IDB_VERSION=1;
const SNAPSHOTS='snapshots';
const META='meta';
const MAX_SYNC_RETRIES=2;
const clone=v=>{
  if(v==null)return v;
  try{return typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v))}
  catch{return JSON.parse(JSON.stringify(v))}
};
const arr=v=>Array.isArray(v)?v:[];
const eq=(a,b)=>{try{return JSON.stringify(a)===JSON.stringify(b)}catch{return a===b}};
const now=()=>new Date().toISOString();
const say=m=>{try{toast(m)}catch{console.log(m)}};
let idbPromise=null;
let lastWorkspaceId='';
let editSeq=0;
let syncTimer=null;
let syncPromise=null;
let runtimeState={status:navigator.onLine?'synced':'offline',pendingCount:0,lastSyncAt:'',message:''};

function emit(status,detail={}){
  runtimeState={...runtimeState,...detail,status};
  window.__ccOfflineState={...runtimeState};
  try{window.dispatchEvent(new CustomEvent('cc:offline-state',{detail:{...runtimeState}}))}catch{}
  return runtimeState;
}
function openDB(){
  if(idbPromise)return idbPromise;
  if(!('indexedDB'in window))return Promise.reject(new Error('IndexedDB no está disponible en este navegador.'));
  idbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(IDB_NAME,IDB_VERSION);
    req.onupgradeneeded=()=>{
      const dbx=req.result;
      if(!dbx.objectStoreNames.contains(SNAPSHOTS))dbx.createObjectStore(SNAPSHOTS,{keyPath:'key'});
      if(!dbx.objectStoreNames.contains(META))dbx.createObjectStore(META,{keyPath:'key'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('No se pudo abrir el almacenamiento offline.'));
  });
  return idbPromise;
}
async function idbGet(store,key){
  const dbx=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=dbx.transaction(store,'readonly'),req=tx.objectStore(store).get(key);
    req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  });
}
async function idbPut(store,value){
  const dbx=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=dbx.transaction(store,'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Transacción offline cancelada.'));
  });
}
function userId(){try{return session?.userId||''}catch{return''}}
function workspaceId(){try{return cloudWorkspaceId||lastWorkspaceId||''}catch{return lastWorkspaceId||''}}
function snapshotKey(uid=userId(),wid=workspaceId()){return uid&&wid?`${uid}|${wid}`:''}
function metaKey(uid=userId()){return uid?`last-workspace:${uid}`:''}
async function rememberWorkspace(){
  const uid=userId(),wid=workspaceId();if(!uid||!wid)return false;
  lastWorkspaceId=wid;
  await idbPut(META,{key:metaKey(uid),userId:uid,workspaceId:wid,updatedAt:now()});
  return true;
}
async function readSnapshot(){
  const uid=userId();if(!uid)return null;
  let wid=workspaceId();
  if(!wid){const meta=await idbGet(META,metaKey(uid));wid=meta?.workspaceId||'';if(wid)lastWorkspaceId=wid}
  if(!wid)return null;
  return idbGet(SNAPSHOTS,snapshotKey(uid,wid));
}
function safeState(source){
  const out=clone(source)||{};
  out.users=arr(out.users).map(u=>{const x={...u};delete x.password;return x});
  return out;
}
async function persistSnapshot({pending=true,pendingCount=null,lastCloudAt='',baseState=null,stateVersion=null}={}){
  const uid=userId(),wid=workspaceId();if(!uid||!wid||typeof db==='undefined')return false;
  lastWorkspaceId=wid;
  let previous=null;try{previous=await idbGet(SNAPSHOTS,snapshotKey(uid,wid))}catch{}
  const count=pending?(pendingCount==null?Math.max(1,Number(previous?.pendingCount||0)+1):Number(pendingCount)||1):0;
  const record={
    key:snapshotKey(uid,wid),userId:uid,workspaceId:wid,
    role:(typeof cloudRole!=='undefined'&&cloudRole)||previous?.role||'consulta',
    profile:clone((typeof cloudProfile!=='undefined'&&cloudProfile)||previous?.profile||null),
    data:safeState(db),pending:!!pending,pendingCount:count,updatedAt:now(),
    lastCloudAt:lastCloudAt||previous?.lastCloudAt||'',
    stateVersion:stateVersion??window.__ccCloudVersion??previous?.stateVersion??null,
    baseState:clone(baseState??window.__ccCloudBaseState??previous?.baseState??null)
  };
  try{
    await rememberWorkspace();
    await idbPut(SNAPSHOTS,record);
    emit(navigator.onLine?(record.pending?'pending':'synced'):'offline',{pendingCount:record.pendingCount,lastSyncAt:record.lastCloudAt||runtimeState.lastSyncAt});
    return true;
  }catch(error){
    console.warn('No se pudo guardar la copia completa en IndexedDB.',error);
    emit('error',{message:'No se pudo actualizar la copia offline en este dispositivo.'});
    return false;
  }
}
async function hasSnapshot(){try{return !!(await readSnapshot())}catch{return false}}
function localFallbackAllowed(error){
  if(!navigator.onLine)return true;
  const m=String(error?.message||error||'');
  return /failed to fetch|network|conexi[oó]n|timeout|agot[oó] el tiempo|tiempo total de arranque|load failed/i.test(m);
}
async function restoreSnapshot(reason='offline'){
  const record=await readSnapshot();if(!record?.data)return false;
  lastWorkspaceId=record.workspaceId||lastWorkspaceId;
  try{cloudWorkspaceId=record.workspaceId}catch{}
  try{cloudRole=record.role||'consulta'}catch{}
  try{cloudProfile=record.profile||{full_name:session?.email||'Usuario',active:true}}catch{}
  try{cloudLoaded=true}catch{}
  try{cloudSaving=false}catch{}
  try{cloudLastSaved=record.lastCloudAt?new Date(record.lastCloudAt):null}catch{}
  db=Object.assign(defaultDB(),clone(record.data));
  window.__ccCloudVersion=record.stateVersion??null;
  window.__ccCloudBaseState=clone(record.baseState||record.data||{});
  window.__CC_LOCAL_CLOUD_FALLBACK__=true;
  window.__CC_OFFLINE_BOOT__=true;
  emit(navigator.onLine?(record.pending?'pending':'local'):'offline',{pendingCount:Number(record.pendingCount||0),lastSyncAt:record.lastCloudAt||'',message:reason});
  return true;
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
    if(l!==undefined)out.push(l);
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
    if(!lc)out[key]=sv;else if(!sc)out[key]=lv;else if(eq(lv,sv))out[key]=lv;else{conflicts.push(key);out[key]=lv}
  }
  return{data:out,conflicts};
}
function conflictModal(serverData,serverVersion,conflicts){
  window.__ccOfflineSyncConflict={serverData:clone(serverData),serverVersion,localData:clone(db),conflicts:[...conflicts],at:now()};
  emit('conflict',{message:'Hay cambios del mismo expediente en la nube y en este dispositivo.'});
  if(typeof openModal!=='function'){say('Hay un conflicto de sincronización. Tus cambios locales siguen guardados.');return}
  const items=conflicts.slice(0,8).map(x=>`<li>${String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</li>`).join('');
  const m=openModal('Cambios pendientes por revisar',`<div class="alert danger"><b>No se sobrescribió información.</b> El mismo registro cambió en la nube mientras este dispositivo trabajaba sin conexión.</div><p class="muted">Tus cambios permanecen guardados en este dispositivo.</p>${items?`<ul>${items}</ul>`:''}<div class="actions"><button class="btn" id="ccOfflineBackup">Guardar respaldo</button><button class="btn" id="ccOfflineKeep">Revisar después</button><button class="btn danger" id="ccOfflineUseCloud">Usar versión de la nube</button></div>`);
  m.querySelector('#ccOfflineBackup')?.addEventListener('click',()=>{try{exportBackup()}catch{say('No se pudo generar el respaldo desde esta pantalla.')}});
  m.querySelector('#ccOfflineKeep')?.addEventListener('click',()=>m.remove());
  m.querySelector('#ccOfflineUseCloud')?.addEventListener('click',async()=>{
    if(!confirm('Se reemplazará la copia de trabajo local por la versión actual de la nube. ¿Continuar?'))return;
    db=Object.assign(defaultDB(),clone(serverData)||{});
    window.__ccCloudVersion=serverVersion;window.__ccCloudBaseState=clone(serverData)||{};window.__ccOfflineSyncConflict=null;
    await persistSnapshot({pending:false,lastCloudAt:now(),baseState:serverData,stateVersion:serverVersion});
    m.remove();try{renderApp()}catch{try{render()}catch{}}
  });
}
async function readServerRow(){
  const wid=workspaceId();if(!wid)throw new Error('No hay espacio de trabajo asociado a esta copia offline.');
  const r=await sbFetch(`/rest/v1/app_state?select=data,version,updated_at&workspace_id=eq.${encodeURIComponent(wid)}&limit=1`);
  return r.data?.[0]||{data:{},version:1,updated_at:null};
}
async function saveMerged(expectedVersion,payload){
  const r=await sbFetch('/rest/v1/rpc/save_app_state',{method:'POST',body:{p_workspace_id:workspaceId(),p_expected_version:Number(expectedVersion||1),p_data:safeState(payload)}});
  return Array.isArray(r.data)?r.data[0]:r.data;
}
async function syncNow(retry=0){
  if(syncPromise)return syncPromise;
  syncPromise=(async()=>{
    if(!navigator.onLine){await persistSnapshot({pending:true,pendingCount:Math.max(1,runtimeState.pendingCount||1)});emit('offline',{message:'Sin conexión. Los cambios siguen guardados localmente.'});return false}
    if(!session?.accessToken||!workspaceId()){emit('pending',{message:'La sesión debe volver a conectarse antes de sincronizar.'});return false}
    const record=await readSnapshot();
    if(!record?.pending){emit('synced',{pendingCount:0,lastSyncAt:record?.lastCloudAt||runtimeState.lastSyncAt});return true}
    emit('syncing',{pendingCount:Number(record.pendingCount||1),message:'Enviando cambios pendientes a Supabase…'});
    const capturedSeq=editSeq;
    const capturedLocal=safeState(record.data||db);
    try{
      const row=await readServerRow(),serverData=clone(row.data||{}),serverVersion=Number(row.version||1);
      const baseData=clone(record.baseState||window.__ccCloudBaseState||serverData||{});
      const merged=threeWayMerge(baseData,capturedLocal,serverData);
      if(merged.conflicts.length){conflictModal(serverData,serverVersion,merged.conflicts);return false}
      let result=await saveMerged(serverVersion,merged.data);
      if(!result?.saved&&retry<MAX_SYNC_RETRIES){
        const latestServer=clone(result?.server_data||serverData),latestVersion=Number(result?.new_version||serverVersion);
        const retried=threeWayMerge(baseData,capturedLocal,latestServer);
        if(retried.conflicts.length){conflictModal(latestServer,latestVersion,retried.conflicts);return false}
        result=await saveMerged(latestVersion,retried.data);
        merged.data=retried.data;
      }
      if(!result?.saved)throw new Error('La nube cambió durante la sincronización. Se intentará nuevamente.');
      const newVersion=Number(result.new_version||serverVersion+1),savedState=safeState(merged.data),syncedAt=now();
      window.__ccCloudVersion=newVersion;window.__ccCloudBaseState=clone(savedState);window.__ccOfflineSyncConflict=null;window.__CC_LOCAL_CLOUD_FALLBACK__=false;
      try{cloudLastSaved=new Date(syncedAt)}catch{}
      if(editSeq===capturedSeq){db=Object.assign(defaultDB(),clone(savedState));await persistSnapshot({pending:false,lastCloudAt:syncedAt,baseState:savedState,stateVersion:newVersion})}
      else{
        const follow=threeWayMerge(capturedLocal,safeState(db),savedState);
        if(!follow.conflicts.length)db=Object.assign(defaultDB(),clone(follow.data));
        await persistSnapshot({pending:true,pendingCount:Math.max(1,runtimeState.pendingCount||1),lastCloudAt:syncedAt,baseState:savedState,stateVersion:newVersion});
        scheduleSync(120);
      }
      emit(editSeq===capturedSeq?'synced':'pending',{pendingCount:editSeq===capturedSeq?0:Math.max(1,runtimeState.pendingCount||1),lastSyncAt:syncedAt,message:editSeq===capturedSeq?'Todo sincronizado.':'Hay cambios nuevos esperando sincronización.'});
      try{updateCloudBadge()}catch{}
      return true;
    }catch(error){
      console.warn('Sincronización offline pendiente.',error);
      await persistSnapshot({pending:true,pendingCount:Math.max(1,Number(record?.pendingCount||runtimeState.pendingCount||1))});
      emit(navigator.onLine?'pending':'offline',{message:String(error?.message||'No se pudo sincronizar todavía.')});
      return false;
    }
  })().finally(()=>{syncPromise=null});
  return syncPromise;
}
function scheduleSync(delay=500){
  clearTimeout(syncTimer);
  if(!navigator.onLine){persistSnapshot({pending:true,pendingCount:Math.max(1,runtimeState.pendingCount||1)});return false}
  syncTimer=setTimeout(()=>syncNow(),Math.max(0,delay));
  return true;
}
function markPending(){editSeq++;persistSnapshot({pending:true});if(navigator.onLine)scheduleSync();return true}

const baseEnsure=typeof ensureCloudSession==='function'?ensureCloudSession:null;
const baseLoad=typeof loadCloudData==='function'?loadCloudData:null;
const baseSave=typeof saveDB==='function'?saveDB:null;
const baseSignOut=typeof cloudSignOut==='function'?cloudSignOut:null;

if(baseEnsure){
  ensureCloudSession=async function(){
    if(!session?.userId)return false;
    if(!navigator.onLine&&await hasSnapshot()){window.__CC_OFFLINE_BOOT__=true;emit('offline',{message:'Acceso local disponible.'});return true}
    try{return await baseEnsure.apply(this,arguments)}
    catch(error){if(localFallbackAllowed(error)&&await hasSnapshot()){window.__CC_OFFLINE_BOOT__=true;emit('local',{message:'Usando copia local porque la nube no respondió.'});return true}throw error}
  };
}
if(baseLoad){
  loadCloudData=async function(){
    if(!navigator.onLine){if(await restoreSnapshot('Sin conexión'))return{offline:true};throw new Error('No hay una copia offline disponible todavía. Conéctate una vez para prepararla.')}
    try{
      const result=await baseLoad.apply(this,arguments);
      lastWorkspaceId=workspaceId();
      await persistSnapshot({pending:false,lastCloudAt:now(),baseState:window.__ccCloudBaseState||db,stateVersion:window.__ccCloudVersion});
      setTimeout(()=>persistSnapshot({pending:false,lastCloudAt:now(),baseState:window.__ccCloudBaseState||db,stateVersion:window.__ccCloudVersion}),1800);
      return result;
    }catch(error){
      if(localFallbackAllowed(error)&&await restoreSnapshot(String(error?.message||'La nube no respondió')))return{offline:true,fallback:true};
      throw error;
    }
  };
  loadCloudData.__ccPendingRestoreV2=true;
}
if(baseSave){
  saveDB=function(){
    let priorLoaded=false;
    try{priorLoaded=!!cloudLoaded;cloudLoaded=false}catch{}
    let result=true;
    try{result=baseSave.apply(this,arguments)}catch(error){console.warn('Guardado local base no disponible.',error)}
    finally{try{cloudLoaded=priorLoaded}catch{}}
    markPending();
    return result!==false;
  };
  saveDB.__ccOfflineFieldCore=true;
  saveDB.__ccPendingV2=true;
}
scheduleCloudSave=function(){return scheduleSync(500)};
scheduleCloudSave.__ccOfflineFieldCore=true;
scheduleCloudSave.__ccOfflineV2=true;
saveCloudNow=function(){return syncNow()};
saveCloudNow.__ccOfflineFieldCore=true;
if(baseSignOut){
  cloudSignOut=async function(){
    clearTimeout(syncTimer);
    return baseSignOut.apply(this,arguments);
  };
}

window.ccOffline={
  version:1,
  getState:()=>({...runtimeState}),
  readSnapshot,
  persist:opts=>persistSnapshot(opts||{}),
  markPending,
  syncNow,
  scheduleSync,
  restore:restoreSnapshot
};

window.addEventListener('offline',()=>{emit('offline',{message:'Sin conexión. Puedes seguir trabajando; los cambios se guardan en este dispositivo.'});persistSnapshot({pending:runtimeState.pendingCount>0,pendingCount:runtimeState.pendingCount||0})});
window.addEventListener('online',()=>{emit(runtimeState.pendingCount?'pending':'local',{message:'Conexión disponible.'});scheduleSync(120)});
window.addEventListener('pagehide',()=>{if(runtimeState.pendingCount>0)persistSnapshot({pending:true,pendingCount:runtimeState.pendingCount})});

(async()=>{
  try{
    const record=await readSnapshot();
    if(record){runtimeState.pendingCount=Number(record.pendingCount||0);runtimeState.lastSyncAt=record.lastCloudAt||'';if(!navigator.onLine)emit('offline',{pendingCount:runtimeState.pendingCount})}
  }catch{}
})();
})();
