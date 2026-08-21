/* ===== CORRECCION DE INDICADORES EN TARJETAS V1 ===== */
(()=>{
'use strict';
if(window.__CC_PROJECT_CARD_ENGINEERING_FIX_V1__)return;
window.__CC_PROJECT_CARD_ENGINEERING_FIX_V1__=true;
function css(){if(document.getElementById('cc-project-card-engineering-fix-style'))return;const s=document.createElement('style');s.id='cc-project-card-engineering-fix-style';s.textContent=`
.project-grid-v3>.cc-eng-progress{display:none!important}
.project-v3 .cc-eng-progress{display:flex!important;gap:5px!important;flex-wrap:wrap!important;margin:8px 0 0!important;grid-column:1/-1!important;width:100%!important;min-height:0!important;height:auto!important;align-items:center!important}
.project-v3 .cc-eng-chip{display:inline-flex!important;align-items:center!important;gap:3px!important;width:auto!important;max-width:100%!important;min-width:0!important;min-height:25px!important;height:auto!important;padding:5px 8px!important;border-radius:999px!important;font-size:8px!important;line-height:1.1!important;white-space:nowrap!important}
.project-v3 .cc-eng-chip b{display:inline!important;margin:0!important;font-size:8px!important}
`;
document.head.appendChild(s)}
function repair(){css();document.querySelectorAll('.project-grid-v3>.cc-eng-progress').forEach(box=>{let card=box.previousElementSibling;while(card&&!card.classList?.contains('project-v3'))card=card.previousElementSibling;if(!card)return;const main=card.querySelector('.project-v3-main'),progress=main?.querySelector('.project-v3-progress');if(progress)progress.insertAdjacentElement('afterend',box);else if(main)main.appendChild(box)});document.querySelectorAll('.project-v3').forEach(card=>{const sibling=card.nextElementSibling;if(sibling?.classList?.contains('cc-eng-progress')){const main=card.querySelector('.project-v3-main'),progress=main?.querySelector('.project-v3-progress');if(progress)progress.insertAdjacentElement('afterend',sibling);else main?.appendChild(sibling)}})}
let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;repair()})}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(repair,0);setTimeout(repair,300);setTimeout(repair,900);
})();