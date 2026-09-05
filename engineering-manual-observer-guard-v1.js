/* CONTROL CONTRACTUAL · GUARDIA DEL OBSERVADOR DEL MANUAL V1
   El módulo histórico del Manual observa documentElement y reescribe el texto
   de su propio botón en cada callback. Esa escritura vuelve a disparar el
   observador y puede crear un ciclo permanente de renderizado. Esta guardia
   deja pasar únicamente mutaciones que realmente introducen los contenedores
   donde el Manual debe enlazarse. */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_ENGINEERING_MANUAL_OBSERVER_GUARD_V1__)return;
window.__CC_ENGINEERING_MANUAL_OBSERVER_GUARD_V1__=true;

const Native=window.__ccNativeMutationObserver||window.MutationObserver;
if(typeof Native!=='function')return;
window.__ccNativeMutationObserver=Native;
const Original=window.MutationObserver;
let intercepted=false,restored=false;
const SELECTOR='.top-actions,#ccEngineerChat,[data-ccpc-root]';

function containsRelevantElement(nodes){
  for(const node of nodes||[]){
    if(node.nodeType!==1)continue;
    const el=node;
    if(el.matches?.(SELECTOR)||el.querySelector?.(SELECTOR))return true;
  }
  return false;
}
function relevant(mutations){
  for(const m of mutations||[]){
    if(containsRelevantElement(m.addedNodes)||containsRelevantElement(m.removedNodes))return true;
  }
  return false;
}

class EngineeringManualMutationObserver{
  constructor(callback){
    this.callback=callback;
    this.filtered=false;
    this.native=new Native((mutations,observer)=>{
      if(!this.filtered||relevant(mutations))callback(mutations,observer);
    });
  }
  observe(target,options){
    this.filtered=target===document.documentElement&&!!options?.childList&&!!options?.subtree;
    if(this.filtered){
      intercepted=true;
      window.__CC_ENGINEERING_MANUAL_OBSERVER_FILTERED__=true;
    }
    return this.native.observe(target,options);
  }
  disconnect(){return this.native.disconnect()}
  takeRecords(){return this.native.takeRecords()}
}

window.MutationObserver=EngineeringManualMutationObserver;
const started=Date.now();
function restore(){
  if(restored)return;
  if((intercepted&&window.__CC_ENGINEERING_MANUAL_REFERENCE_V2__===true)||Date.now()-started>5000){
    restored=true;
    if(window.MutationObserver===EngineeringManualMutationObserver)window.MutationObserver=Original;
    return;
  }
  setTimeout(restore,8);
}
setTimeout(restore,8);
})();
