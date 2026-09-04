/* ===== CONTROL TÉCNICO · PERMISOS E IDIOMA V5 ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_TECH_CONTROL_PERMISSIONS_V5__)return;
window.__CC_TECH_CONTROL_PERMISSIONS_V5__=true;
window.__CC_TECH_CONTROL_PERMISSIONS_V4__=true;
window.__CC_TECH_CONTROL_PERMISSIONS_V3__=true;
window.__CC_TECH_CONTROL_PERMISSIONS_V2__=true;
window.__CC_TECH_CONTROL_PERMISSIONS_V1__=true;

let canEdit=false,loaded=false,busy=false,flushQueued=false;
const ROOT_SELECTOR='[data-cct-shell],.modal-bg';

function workspaceId(){try{return typeof cloudWorkspaceId!=='undefined'?String(cloudWorkspaceId||''):''}catch{return''}}
function userId(){try{return String(session?.userId||'')}catch{return''}}
function installCss(){
  if(document.getElementById('cc-tech-control-permissions-style'))return;
  const s=document.createElement('style');
  s.id='cc-tech-control-permissions-style';
  s.textContent=`body.cc-cct-readonly [data-cct-new],body.cc-cct-readonly [data-cct-edit],body.cc-cct-readonly .cct-form-actions button[type="submit"]{display:none!important}`;
  document.head.appendChild(s);
}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function translateRoot(root){
  if(!root||root.nodeType!==1)return;
  root.querySelectorAll('option').forEach(o=>{
    const v=String(o.value||'').toUpperCase();
    if(v==='RFI')setText(o,'Solicitud de información (RFI)');
    if(v==='SUBMITTAL')setText(o,'Presentación técnica');
    if(v==='MATERIAL')setText(o,'Aprobación de material');
    if(v==='PLANO')setText(o,'Consulta de plano');
    if(v==='ACLARACION')setText(o,'Aclaración técnica');
    if(v==='CAMBIO_PROPUESTO')setText(o,'Cambio propuesto');
  });
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
    const before=String(node.nodeValue||'');
    const after=before.replace(/submittals/gi,'presentaciones técnicas')
      .replace(/\bSUBMITTAL\b/g,'Presentación técnica')
      .replace(/Motivo de paro\s*\/\s*stand-by/gi,'Motivo de paro / espera improductiva');
    if(after!==before)node.nodeValue=after;
  }
  root.querySelectorAll('.cct-table td').forEach(td=>{
    const x=String(td.textContent||'').trim().toUpperCase();
    if(x==='RFI')setText(td,'Solicitud de información (RFI)');
    if(x==='SUBMITTAL')setText(td,'Presentación técnica');
  });
}
function translateTechnicalUi(){document.querySelectorAll(ROOT_SELECTOR).forEach(translateRoot)}
function apply(){
  installCss();
  const body=document.body;
  if(body&&body.classList.contains('cc-cct-readonly')===canEdit)body.classList.toggle('cc-cct-readonly',!canEdit);
  window.__ccTechnicalCanEdit=()=>canEdit;
  translateTechnicalUi();
}
function scheduleApply(delay=0){
  if(delay){setTimeout(()=>scheduleApply(0),delay);return}
  if(flushQueued)return;
  flushQueued=true;
  const go=()=>{flushQueued=false;apply()};
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(go);
}
function armAfterBoot(){
  if(window.__CC_AUTH_MODULES_READY__===true){scheduleApply();return}
  document.addEventListener('cc:authenticated-modules-ready',scheduleApply,{once:true});
  document.addEventListener('cc:authenticated-modules-partial',scheduleApply,{once:true});
}
async function resolve(){
  if(busy)return canEdit;
  busy=true;installCss();
  try{
    const w=workspaceId(),u=userId(),token=String(session?.accessToken||'');
    if(!w||!u||!token){canEdit=false;loaded=true;return canEdit}
    const url=`${SUPABASE_URL}/rest/v1/workspace_members?select=role,active&workspace_id=eq.${encodeURIComponent(w)}&user_id=eq.${encodeURIComponent(u)}&limit=1`;
    const r=await fetch(url,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`},cache:'no-store'});
    const rows=await r.json().catch(()=>[]),row=Array.isArray(rows)?rows[0]:null;
    canEdit=!!row?.active&&['admin','editor'].includes(String(row.role||'').toLowerCase());loaded=true;
  }catch{canEdit=false;loaded=true}
  finally{busy=false;scheduleApply()}
  return canEdit;
}

document.addEventListener('click',e=>{
  const blocked=e.target.closest?.('[data-cct-new],[data-cct-edit]');
  if(blocked&&!canEdit){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(typeof say==='function')say('Esta cuenta tiene acceso de consulta. No puede modificar el control técnico.');
    return;
  }
  if(e.target.closest?.('[data-cc-technical-control],[data-cct-module],[data-cct-new],[data-cct-edit]')){
    scheduleApply(0);scheduleApply(40);
  }
},true);

window.addEventListener('cc:route-changed',()=>scheduleApply());
document.addEventListener('cc:data-changed',()=>scheduleApply());
setTimeout(resolve,0);
setTimeout(()=>{if(!loaded&&!busy)resolve()},800);
armAfterBoot();
})();
