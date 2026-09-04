/* ===== PERSISTENCIA SEGURA · CONTROL DE CUOTA LOCAL V3 ===== */
(()=>{
'use strict';
if(window.__CC_STORAGE_QUOTA_FIX_V3__)return;
window.__CC_STORAGE_QUOTA_FIX_V3__=true;
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
        /* No afirmar que la imagen está en nube. Esta copia reducida solo
           indica que el navegador omitió el Base64 para no exceder la cuota. */
        out.photoLocalCacheOmitted=true;
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
  try{localStorage.setItem(STORE,JSON.stringify(value));return true}
  catch(err){console.warn('Guardado local no disponible',err);return false}
}

function signalDataChanged(){
  try{window.dispatchEvent(new CustomEvent('cc:data-changed',{detail:{source:'saveDB'}}))}catch{}
}

function install(){
  try{
    if(typeof saveDB!=='function'||saveDB.__ccSafeStorageV3)return;
    const originalSave=saveDB;
    const safeSave=function(){
      try{if(typeof syncAllProjectProgress==='function')syncAllProjectProgress()}catch(e){console.warn('No se pudo recalcular avance antes de guardar',e)}

      let localSaved=false;
      try{
        localSaved=tryStore(db);
        if(!localSaved){
          const slim=slimLocalState(db);
          try{localStorage.removeItem(STORE)}catch{}
          localSaved=tryStore(slim);
          if(localSaved){try{sessionStorage.setItem('cc_storage_quota_notice','1')}catch{}}
        }
      }catch(err){console.error('Persistencia local no bloqueante',err)}

      let cloudQueued=false;
      try{
        if(typeof cloudLoaded!=='undefined'&&cloudLoaded&&session?.accessToken&&typeof scheduleCloudSave==='function'){
          scheduleCloudSave();
          cloudQueued=true;
        }
      }catch(e){console.warn('Sincronización en nube pendiente',e)}

      signalDataChanged();
      /* El guardado puede continuar aunque localStorage esté lleno, siempre
         que la sincronización remota haya sido programada. Nunca se informa
         aquí que una foto ya está en nube: eso solo debe hacerlo el uploader. */
      return localSaved||cloudQueued;
    };
    safeSave.__ccSafeStorageV3=true;
    safeSave.__ccSafeStorageV2=true;
    safeSave.__ccOriginalSave=originalSave;
    saveDB=safeSave;
    window.__ccSafeSlimState=slimLocalState;
  }catch(e){console.error('No se pudo instalar la persistencia segura V3',e)}
}

function notifyIfNeeded(){
  try{
    if(sessionStorage.getItem('cc_storage_quota_notice')!=='1')return;
    sessionStorage.removeItem('cc_storage_quota_notice');
    setTimeout(()=>{
      try{toast('La copia local se redujo para evitar bloqueo. Las fotografías solo se consideran sincronizadas cuando Supabase confirma su carga.')}catch{}
    },250);
  }catch{}
}

install();
notifyIfNeeded();
setTimeout(install,250);
setTimeout(install,1000);
})();
