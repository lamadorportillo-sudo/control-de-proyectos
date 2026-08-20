/* ===== PERSISTENCIA SEGURA · CONTROL DE CUOTA LOCAL V2 ===== */
(()=>{
'use strict';
if(window.__CC_STORAGE_QUOTA_FIX_V2__)return;
window.__CC_STORAGE_QUOTA_FIX_V2__=true;

const isImageData=v=>typeof v==='string'&&/^data:image\//i.test(v);
function slimLocalState(source){
  const seen=new WeakSet();
  const walk=(v,key='')=>{
    if(v==null||typeof v!=='object'){
      if(isImageData(v))return '';
      if(typeof v==='bigint')return Number(v);
      if(typeof v==='function'||typeof v==='symbol')return undefined;
      return v;
    }
    if(typeof Node!=='undefined'&&v instanceof Node)return undefined;
    if(seen.has(v))return null;
    seen.add(v);
    if(Array.isArray(v))return v.map((x,i)=>walk(x,String(i))).filter(x=>x!==undefined);
    const out={};
    for(const [k,val] of Object.entries(v)){
      if(isImageData(val)&&(k==='src'||k==='dataUrl'||k==='data_url'||k==='image'||k==='url')){
        out[k]='';
        out.photoStoredInCloud=true;
        continue;
      }
      const next=walk(val,k);
      if(next!==undefined)out[k]=next;
    }
    return out;
  };
  return walk(source);
}
function tryStore(value){
  try{localStorage.setItem(STORE,JSON.stringify(value));return true}catch(err){console.warn('Guardado local completo no disponible',err);return false}
}
function install(){
  try{
    if(typeof saveDB!=='function'||saveDB.__ccSafeStorageV2)return;
    const safeSave=function(){
      try{if(typeof syncAllProjectProgress==='function')syncAllProjectProgress()}catch(e){console.warn('No se pudo recalcular avance antes de guardar',e)}
      let fullSaved=false,localSaved=false;
      try{
        fullSaved=tryStore(db);
        localSaved=fullSaved;
        if(!localSaved){
          const slim=slimLocalState(db);
          try{localStorage.removeItem(STORE)}catch{}
          localSaved=tryStore(slim);
          if(localSaved){try{sessionStorage.setItem('cc_storage_quota_notice','1')}catch{}}
        }
      }catch(err){console.error('Persistencia local no bloqueante',err)}
      try{
        if(typeof cloudLoaded!=='undefined'&&cloudLoaded&&session?.accessToken&&typeof scheduleCloudSave==='function')scheduleCloudSave();
      }catch(e){console.warn('Sincronización en nube pendiente',e)}
      // Nunca bloquea un formulario por un problema del almacenamiento local.
      return localSaved||fullSaved;
    };
    safeSave.__ccSafeStorageV2=true;
    saveDB=safeSave;
    window.__ccSafeSlimState=slimLocalState;
  }catch(e){console.error('No se pudo instalar la persistencia segura V2',e)}
}
function notifyIfNeeded(){
  try{
    if(sessionStorage.getItem('cc_storage_quota_notice')!=='1')return;
    sessionStorage.removeItem('cc_storage_quota_notice');
    setTimeout(()=>{try{toast('La copia local se optimizó para evitar bloqueos. Los cambios continúan sincronizándose en la nube.')}catch{}},250);
  }catch{}
}
install();notifyIfNeeded();
setTimeout(install,250);setTimeout(install,1000);
})();