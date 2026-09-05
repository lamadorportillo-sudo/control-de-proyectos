/* ===== CORRECCIÓN DE VISIBILIDAD INGENIERÍA V2 ===== */
(()=>{
'use strict';
if(window.__CC_ENGINEERING_VISIBILITY_FIX_V2__)return;
window.__CC_ENGINEERING_VISIBILITY_FIX_V2__=true;
window.__CC_ENGINEERING_VISIBILITY_FIX_V1__=true;

const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let queued=false,observer=null;

function inject(){
  if(document.getElementById('cc-engineering-visibility-fix-style'))return;
  const s=document.createElement('style');
  s.id='cc-engineering-visibility-fix-style';
  s.textContent=`
    /* engineering-ux-v1 ocultaba estas dos acciones globales */
    body:not(.print-report) #backupBtn,
    body:not(.print-report) #newProjectBtn{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      visibility:visible!important;
      opacity:1!important;
    }

    /* Mantener la eliminación definitiva oculta; se conserva la trazabilidad */
    body:not(.print-report) [data-purge]{display:none!important}

    body:not(.print-report) .cc-eng-chip{
      background:#f7f9f5!important;border-color:#d8e1d5!important;color:#4f5e53!important;
    }
    body:not(.print-report) .cc-eng-chip b{color:#203027!important}
    body:not(.print-report) .cc-eng-chip.warn{
      background:#fff8e8!important;border-color:#ead99f!important;color:#866112!important;
    }
    body:not(.print-report) .cc-eng-chip.danger{
      background:#fff2f2!important;border-color:#e9c1c1!important;color:#8b3333!important;
    }

    body:not(.print-report) .cc-eng-impact{
      background:#f7faf5!important;border-color:#cddcc7!important;color:#26352b!important;
    }
    body:not(.print-report) .cc-eng-impact h4{color:#26352b!important}
    body:not(.print-report) .cc-eng-impact-grid div{
      background:#fff!important;border-color:#dce5d9!important;
    }
    body:not(.print-report) .cc-eng-impact-grid small{color:#6d786f!important}
    body:not(.print-report) .cc-eng-impact-grid b{color:#203027!important}
    body:not(.print-report) .cc-eng-impact.bad{
      background:#fff4f4!important;border-color:#e6bcbc!important;
    }
    body:not(.print-report) .cc-eng-impact.bad .cc-eng-balance{color:#9a3434!important}
    body:not(.print-report) .cc-human-note{
      background:#eef5fb!important;border-color:#cbdbe7!important;color:#3f6078!important;
    }

    body:not(.print-report) .cc-data-quality{
      background:#fff9e9!important;border-color:#e6d59f!important;color:#6f5716!important;
    }
    body:not(.print-report) .cc-data-quality summary{color:#765b12!important}
    body:not(.print-report) .cc-data-quality-row{
      background:#fffdf6!important;border-color:#eadcae!important;color:#5d5029!important;
    }
    body:not(.print-report) .cc-data-quality-row b{color:#6c571a!important}
    body:not(.print-report) .cc-data-quality-row small{color:#877646!important}
    body:not(.print-report) .cc-void-note{color:#6d786f!important}

    @media(max-width:720px){
      body:not(.print-report) #backupBtn,
      body:not(.print-report) #newProjectBtn{flex:1 1 150px!important;min-height:44px!important}
    }
  `;
  document.head.appendChild(s);
}

function setButton(button,text,title){
  if(!button)return;
  if(button.textContent!==text)button.textContent=text;
  if(button.title!==title)button.title=title;
}
function relabel(){
  setButton(document.getElementById('backupBtn'),'⇩ Respaldo','Descargar respaldo del expediente');
  setButton(document.getElementById('newProjectBtn'),'＋ Nuevo proyecto','Crear un nuevo proyecto');
}
function run(){queued=false;inject();relabel()}
function schedule(){
  if(queued)return;
  queued=true;
  const go=()=>run();
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(go);
}
function containsTarget(nodes){
  for(const node of nodes||[]){
    if(node.nodeType!==1)continue;
    const el=node;
    if(el.id==='backupBtn'||el.id==='newProjectBtn'||el.querySelector?.('#backupBtn,#newProjectBtn'))return true;
  }
  return false;
}
function bindObserver(){
  const root=document.getElementById('app');
  if(!root||!NativeObserver)return;
  observer?.disconnect?.();
  observer=new NativeObserver(mutations=>{
    if(mutations.some(m=>containsTarget(m.addedNodes)||containsTarget(m.removedNodes)))schedule();
  });
  observer.observe(root,{childList:true,subtree:true});
}

run();bindObserver();
window.addEventListener('cc:route-changed',schedule);
document.addEventListener('cc:data-changed',schedule);
setTimeout(schedule,350);setTimeout(schedule,1000);
window.addEventListener('pagehide',()=>observer?.disconnect?.(),{once:true});
})();