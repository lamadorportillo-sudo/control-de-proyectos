/* ===== FIX ROBUSTO: SELECTOR DE ARCHIVOS CONTRACTUALES V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_FILE_UPLOAD_FIX_V1__)return;
window.__CC_CONTRACT_FILE_UPLOAD_FIX_V1__=true;

const ACCEPT='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.heic,.heif';
const say=m=>{try{if(typeof toast==='function')toast(m);else console.log(m)}catch{}};

function handoff(files,category){
  const target=document.getElementById('ccContractArchiveInput');
  if(!target){say('El archivo contractual todavía no está listo. Actualiza la página e inténtalo nuevamente.');return;}
  try{
    const dt=new DataTransfer();
    [...files].forEach(f=>dt.items.add(f));
    target.dataset.category=category;
    target.files=dt.files;
    target.dispatchEvent(new Event('change',{bubbles:true}));
  }catch(err){
    console.error('No se pudo transferir el archivo seleccionado',err);
    say('No se pudo iniciar la carga. Inténtalo nuevamente.');
  }
}

function openPicker(category){
  const input=document.createElement('input');
  input.type='file';
  input.multiple=true;
  input.accept=ACCEPT;
  input.setAttribute('aria-label','Seleccionar documento para archivar');
  Object.assign(input.style,{position:'fixed',left:'-9999px',top:'0',width:'1px',height:'1px',opacity:'0',pointerEvents:'none'});
  document.body.appendChild(input);
  let done=false;
  const cleanup=()=>{if(done)return;done=true;setTimeout(()=>{try{input.remove()}catch{}},300)};
  input.addEventListener('change',()=>{
    if(input.files?.length)handoff(input.files,category);
    cleanup();
  },{once:true});
  window.addEventListener('focus',()=>setTimeout(()=>{if(!input.files?.length)cleanup()},600),{once:true});
  try{
    if(typeof input.showPicker==='function')input.showPicker();
    else input.click();
  }catch(err){
    console.warn('showPicker falló; usando click()',err);
    try{input.click()}catch(err2){console.error(err2);say('El navegador bloqueó el selector de archivos.');cleanup();}
  }
}

window.addEventListener('click',e=>{
  const upload=e.target?.closest?.('[data-cc-upload-category]');
  const inline=e.target?.closest?.('[data-cc-inline-upload]');
  const btn=upload||inline;
  if(!btn)return;
  const category=upload?upload.dataset.ccUploadCategory:inline.dataset.ccInlineUpload;
  if(!category)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  openPicker(category);
},true);

window.ccContractFileUploadFix={openPicker};
})();