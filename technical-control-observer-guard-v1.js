/* CONTROL CONTRACTUAL · GUARDIA DE OBSERVADOR DEL CONTROL TÉCNICO V1
   Se carga inmediatamente antes de technical-control-v1.js. Intercepta únicamente
   el observador global que ese módulo histórico instala sobre documentElement y
   evita que reaccione a cada mutación ajena al expediente. */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_TECH_CONTROL_OBSERVER_GUARD_V1__)return;
window.__CC_TECH_CONTROL_OBSERVER_GUARD_V1__=true;

const Native=window.__ccNativeMutationObserver||window.MutationObserver;
if(typeof Native!=='function')return;
window.__ccNativeMutationObserver=Native;
const Original=window.MutationObserver;
let restored=false;

function relevant(mutations){
  for(const m of mutations||[]){
    const target=m.target;
    if(target?.nodeType===1){
      if(target.id==='content'||target.id==='tabBody'||target.matches?.('nav.tabs')){
        if(document.querySelector('nav.tabs')&&document.getElementById('tabBody'))return true;
      }
    }
    for(const node of m.addedNodes||[]){
      if(node.nodeType!==1)continue;
      const el=node;
      if(el.id==='tabBody'||el.matches?.('nav.tabs')||el.querySelector?.('nav.tabs,#tabBody'))return true;
    }
    for(const node of m.removedNodes||[]){
      if(node.nodeType!==1)continue;
      const el=node;
      if(el.id==='tabBody'||el.matches?.('nav.tabs')||el.querySelector?.('nav.tabs,#tabBody'))return true;
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
  setTimeout(restore,0);
}
setTimeout(restore,0);
})();
