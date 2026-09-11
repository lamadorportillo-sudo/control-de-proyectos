/* CONTROL CONTRACTUAL · GUARDIA DE OBSERVADOR DEL CONTROL TÉCNICO V2
   Se carga inmediatamente antes de technical-control-v1.js. Intercepta únicamente
   el observador global que ese módulo histórico instala sobre documentElement y
   evita que reaccione a mutaciones internas provocadas por su propio render. */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_TECH_CONTROL_OBSERVER_GUARD_V2__)return;
window.__CC_TECH_CONTROL_OBSERVER_GUARD_V2__=true;
window.__CC_TECH_CONTROL_OBSERVER_GUARD_V1__=true;

const Native=window.__ccNativeMutationObserver||window.MutationObserver;
if(typeof Native!=='function')return;
window.__ccNativeMutationObserver=Native;
const Original=window.MutationObserver;
let restored=false;

function touchesShell(node){
  if(!node||node.nodeType!==1)return false;
  const el=node;
  return el.id==='tabBody'||el.matches?.('nav.tabs')||!!el.querySelector?.('nav.tabs,#tabBody');
}

function relevant(mutations){
  for(const m of mutations||[]){
    /* Una modificación DENTRO de #tabBody no es por sí sola una razón para
       volver a montar el control técnico: el propio mount() modifica ese nodo
       y antes generaba un ciclo MutationObserver -> mount -> mutation infinito. */
    for(const node of m.addedNodes||[])if(touchesShell(node))return true;
    for(const node of m.removedNodes||[])if(touchesShell(node))return true;

    const target=m.target;
    if(target?.nodeType===1&&target.id==='content'){
      if([...m.addedNodes||[]].some(touchesShell)||[...m.removedNodes||[]].some(touchesShell))return true;
    }
  }
  return false;
}

class TechnicalControlMutationObserver{
  constructor(callback){
    this.callback=callback;
    this.filtered=false;
    this.native=new Native((mutations,observer)=>{
      if(!this.filtered||relevant(mutations))callback(mutations,observer);
    });
  }
  observe(target,options){
    this.filtered=target===document.documentElement&&!!options?.childList&&!!options?.subtree;
    return this.native.observe(target,options);
  }
  disconnect(){return this.native.disconnect()}
  takeRecords(){return this.native.takeRecords()}
}

window.MutationObserver=TechnicalControlMutationObserver;

const started=Date.now();
function restore(){
  if(restored)return;
  if(window.__CC_TECHNICAL_CONTROL_V1__===true||Date.now()-started>5000){
    restored=true;
    if(window.MutationObserver===TechnicalControlMutationObserver)window.MutationObserver=Original;
    return;
  }
  setTimeout(restore,16);
}
setTimeout(restore,16);
})();
