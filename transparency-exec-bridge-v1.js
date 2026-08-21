/* ===== PUENTE EJECUTIVO PARA TRANSPARENCIA V1 ===== */
(()=>{
'use strict';
if(window.__CC_TRANSPARENCY_EXEC_BRIDGE_V1__)return;
window.__CC_TRANSPARENCY_EXEC_BRIDGE_V1__=true;
let active=false,queued=false;
function css(){if(document.getElementById('cc-transparency-exec-bridge-style'))return;const s=document.createElement('style');s.id='cc-transparency-exec-bridge-style';s.textContent=`#ccxNav [data-tr-nav]{display:none!important}#ccxNav [data-tr-exec]{border:0;background:transparent;color:#91a5bd;padding:9px 12px;border-radius:9px;font-size:11px;font-weight:800;white-space:nowrap}#ccxNav [data-tr-exec].active{background:#17345e;color:#fff}`;document.head.appendChild(s)}
function ensureNav(){css();const nav=document.getElementById('ccxNav');if(!nav)return;let b=nav.querySelector('[data-tr-exec]');if(!b){b=document.createElement('button');b.type='button';b.dataset.trExec='1';b.textContent='Transparencia';nav.appendChild(b)}b.classList.toggle('active',active);if(active)nav.querySelectorAll('[data-ccx]').forEach(x=>x.classList.remove('active'))}
function pulse(){const c=document.getElementById('content');if(!c)return;const x=document.createElement('i');x.hidden=true;x.dataset.trPulse='1';c.appendChild(x);x.remove()}
function openDirect(){active=true;try{view.screen='transparency';view.projectId=null;view.tab='summary'}catch{}const h=document.querySelector('.topbar h1');if(h)h.textContent='Portal de Transparencia';ensureNav();pulse();setTimeout(()=>{pulse();ensureNav()},40);setTimeout(()=>{pulse();ensureNav()},180)}
function closeDirect(){active=false;ensureNav()}
document.addEventListener('click',e=>{const t=e.target.closest?.('[data-tr-exec],[data-go="transparency"]');if(t){e.preventDefault();e.stopImmediatePropagation();openDirect();return}if(e.target.closest?.('[data-ccx], [data-open], #backBtn'))closeDirect()},true);
function maintain(){ensureNav();let screen='';try{screen=view?.screen||''}catch{}if(screen==='transparency')active=true;else if(screen&&screen!=='transparency')active=false;const c=document.getElementById('content');if(active&&screen==='transparency'&&c&&!c.querySelector('.tr-page')){if(!queued){queued=true;setTimeout(()=>{queued=false;pulse()},25)}}ensureNav()}
new MutationObserver(()=>maintain()).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(maintain,0);setTimeout(maintain,300);setTimeout(maintain,900);
window.__ccOpenTransparencyDirect=openDirect;
})();