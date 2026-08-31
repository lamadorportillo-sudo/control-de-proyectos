/* ===== CONTROL TÉCNICO · PERMISOS DE EDICIÓN V1 ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_TECH_CONTROL_PERMISSIONS_V1__)return;
window.__CC_TECH_CONTROL_PERMISSIONS_V1__=true;
let canEdit=false,loaded=false,busy=false;
function workspaceId(){try{return typeof cloudWorkspaceId!=='undefined'?String(cloudWorkspaceId||''):''}catch{return''}}
function userId(){try{return String(session?.userId||'')}catch{return''}}
function installCss(){if(document.getElementById('cc-tech-control-permissions-style'))return;const s=document.createElement('style');s.id='cc-tech-control-permissions-style';s.textContent=`body.cc-cct-readonly [data-cct-new],body.cc-cct-readonly [data-cct-edit],body.cc-cct-readonly .cct-form-actions button[type="submit"]{display:none!important}`;document.head.appendChild(s)}
async function resolve(){
 if(busy)return canEdit;busy=true;installCss();
 try{
  const w=workspaceId(),u=userId();
  if(!w||!u||!session?.accessToken){canEdit=false;return canEdit}
  const url=`${SUPABASE_URL}/rest/v1/workspace_members?select=role,active&workspace_id=eq.${encodeURIComponent(w)}&user_id=eq.${encodeURIComponent(u)}&limit=1`;
  const r=await fetch(url,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.accessToken}`},cache:'no-store'});
  const rows=await r.json().catch(()=>[]),row=Array.isArray(rows)?rows[0]:null;
  canEdit=!!row?.active&&['admin','editor'].includes(String(row.role||'').toLowerCase());loaded=true;
 }catch{canEdit=false;loaded=true}finally{busy=false;apply()}
 return canEdit;
}
function apply(){installCss();document.body?.classList.toggle('cc-cct-readonly',!canEdit);window.__ccTechnicalCanEdit=()=>canEdit}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-cct-new],[data-cct-edit]');if(!b||canEdit)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(typeof say==='function')say('Esta cuenta tiene acceso de consulta. No puede modificar el control técnico.')},true);
new MutationObserver(()=>{apply();if(!loaded&&!busy)resolve()}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(resolve,0);setTimeout(resolve,800);setTimeout(apply,1500);
})();
