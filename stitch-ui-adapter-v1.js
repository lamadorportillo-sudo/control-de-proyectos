/* CONTROL CONTRACTUAL · STITCH UI ADAPTER V1
   Keeps the approved Stitch design layer authoritative without changing domain logic. */
(()=>{
'use strict';
if(window.__CC_STITCH_UI_V1__)return;
window.__CC_STITCH_UI_V1__=true;

const VERSION='20260916-stitch1';
const CSS_ID='ccStitchDesignCss';
const CSS_HREF='stitch-design-system-v1.css?v='+VERSION;

function ensureCss(){
  let link=document.getElementById(CSS_ID);
  if(!link){
    link=document.createElement('link');
    link.id=CSS_ID;
    link.rel='stylesheet';
    link.href=CSS_HREF;
  }else if(!String(link.getAttribute('href')||'').includes(VERSION)){
    link.href=CSS_HREF;
  }
  /* Reappend after late inline theme styles so the approved design wins cascade. */
  if(document.head.lastElementChild!==link)document.head.appendChild(link);
}

function mark(){
  document.documentElement.dataset.ccDesign='stitch-v1';
  document.body?.classList.add('cc-stitch-design');
}

function normalizeActiveNav(){
  const side=document.querySelector('#ccSidebar');
  if(!side)return;
  const active=[...side.querySelectorAll('.cc-side-btn.active[data-route]')];
  if(active.length<=1)return;
  const route=String(document.body?.dataset?.ccMainRoute||window.__ccMainRoute||localStorage.getItem('cc_main_route_v2')||'').toLowerCase();
  const keeper=active.find(x=>String(x.dataset.route||'').toLowerCase()===route)||active[active.length-1];
  active.forEach(x=>{if(x!==keeper)x.classList.remove('active')});
}

function removeRawIconNames(){
  const raw=/^(?:dashboard|apartment|account_balance_wallet|payments|engineering|verified_user|report_problem|folder_special|folder|assessment|policy|badge|receipt_long|settings|photo_camera|play_arrow|add_a_photo|calendar_today|notifications|smart_toy|home)$/i;
  document.querySelectorAll('.material-symbols-outlined').forEach(el=>{
    const value=String(el.textContent||'').trim();
    if(!value||!raw.test(value))return;
    /* When the external icon font fails, never expose implementation names. */
    const loaded=getComputedStyle(el).fontFamily.toLowerCase().includes('material symbols');
    if(!loaded){el.textContent='';el.setAttribute('aria-hidden','true')}
  });
}

function apply(){
  ensureCss();
  mark();
  normalizeActiveNav();
  removeRawIconNames();
}

apply();
document.addEventListener('cc:authenticated-critical-ready',()=>setTimeout(apply,0));
document.addEventListener('cc:authenticated-web-ready',()=>setTimeout(apply,0));
document.addEventListener('cc:authenticated-modules-ready',()=>setTimeout(apply,0));
document.addEventListener('cc:route-changed',()=>setTimeout(apply,0));
const NativeMO=window.__ccNativeMutationObserver||window.MutationObserver;
if(NativeMO){
  const mo=new NativeMO(()=>{clearTimeout(window.__ccStitchUiTimer);window.__ccStitchUiTimer=setTimeout(apply,32)});
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-cc-main-route']});
}
})();
