/* ===== PERSISTENCIA SEGURA · CONTROL DE CUOTA LOCAL V1 ===== */
(()=>{
'use strict';
if(window.__CC_STORAGE_QUOTA_FIX_V1__)return;
window.__CC_STORAGE_QUOTA_FIX_V1__=true;

const isImageData=v=>typeof v==='string'&&/^data:image\//i.test(v);
function slimLocalState(source){
  const seen=new WeakSet();
  const walk=(v,key='')=>{
    if(v==null||typeof v!=='object'){
      if(isImageData(v))return '';
      return v;
    }
    if(seen.has(v))return null;
    seen.add(v);
    if(Array.isArray(v))return v.map((x,i)=>walk(x,String(i)));
    const out={};
    for(const [k,val] of Object.entries(v)){
      if(isImageData(val)&&(k==='src'||k==='dataUrl'||k==='data_url'||k==='image'||k==='url')){
        out[k]='';
        out.photoStoredInCloud=true;
        continue;
      }
      out[k]=walk(val,k);
    }
    return out;
  };
  return walk(source);
}
function quotaLike(err){return !!err&&(/quota|storage|exceeded/i.test(String(err.name||''))||/quota|storage|exceeded/i.test(String(err.message||'')))}
function install(){
  try{
    if(typeof saveDB!=='function'||saveDB.__ccSafeQuotaV1)return;
    const safeSave=function(){
      try{if(typeof syncAllProjectProgress==='function')syncAllProjectProgress()}catch(e){console.warn('No se pudo recalcular avance antes de guardar',e)}
      let fullSaved=false;
      try{
        localStorage.setItem(STORE,JSON.stringify(db));
        fullSaved=true;
      }catch(err){
        if(!quotaLike(err))throw err;
        console.warn('Cuota local alcanzada. Se guardará una copia liviana local y el expediente completo seguirá sincronizándose en la nube.',err);
        try{
          const slim=slimLocalState(db);
          localStorage.setItem(STORE,JSON.stringify(slim));
          try{sessionStorage.setItem('cc_storage_quota_notice','1')}catch{}
        }catch(err2){
          console.error('No se pudo guardar ni la copia local reducida',err2);
          try{localStorage.removeItem(STORE);localStorage.setItem(STORE,JSON.stringify(slimLocalState(db)))}catch(err3){console.error(err3)}
        }
      }
      try{if(typeof cloudLoaded!=='undefined'&&cloudLoaded&&session?.accessToken&&typeof scheduleCloudSave==='function')scheduleCloudSave()}catch(e){console.warn('Sincronización en nube pendiente',e)}
      return fullSaved;
    };
    safeSave.__ccSafeQuotaV1=true;
    saveDB=safeSave;
  }catch(e){console.error('No se pudo instalar la persistencia segura',e)}
}
function notifyIfNeeded(){
  try{
    if(sessionStorage.getItem('cc_storage_quota_notice')!=='1')return;
    sessionStorage.removeItem('cc_storage_quota_notice');
    setTimeout(()=>{try{toast('Se alcanzó el límite local del navegador. Los datos se siguen guardando; las fotografías se conservan en la nube y la copia local se redujo para evitar bloqueos.')}catch{}},250);
  }catch{}
}
install();notifyIfNeeded();
setTimeout(install,500);
})();