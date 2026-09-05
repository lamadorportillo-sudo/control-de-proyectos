/* ===== GOBERNADOR GLOBAL DE MUTATIONOBSERVER V2 · ENTREGA POR FRAME + DOM IDÉMPOTENTE ===== */
(()=>{
'use strict';
if(window.__CC_MUTATION_OBSERVER_GOVERNOR_V2__)return;
const Native=window.MutationObserver;
if(typeof Native!=='function')return;
window.__CC_MUTATION_OBSERVER_GOVERNOR_V2__=true;
window.__CC_MUTATION_OBSERVER_GOVERNOR_V1__=true;
window.__CC_NATIVE_MUTATION_OBSERVER__=window.__CC_NATIVE_MUTATION_OBSERVER__||Native;

/* El núcleo histórico tiene observadores creados antes de esta capa. Algunos de
   sus callbacks vuelven a asignar exactamente el mismo textContent/atributo que
   acaban de leer. El navegador considera ciertas asignaciones como mutaciones y
   vuelve a despertar a todos los observadores. Hacer esas escrituras realmente
   idempotentes corta el ciclo sin cambiar el resultado visible ni los datos. */
function installIdempotentDomWrites(){
  if(window.__CC_IDEMPOTENT_DOM_WRITES_V1__)return;
  window.__CC_IDEMPOTENT_DOM_WRITES_V1__=true;
  try{
    const d=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
    if(d?.get&&d?.set&&d.configurable){
      Object.defineProperty(Node.prototype,'textContent',{
        configurable:true,enumerable:d.enumerable,
        get:d.get,
        set(value){
          const next=value==null?'':String(value);
          let current='';
          try{current=d.get.call(this)??''}catch{}
          if(String(current)===next)return;
          return d.set.call(this,value);
        }
      });
    }
  }catch(error){console.warn('No se pudo instalar textContent idempotente.',error)}
  try{
    const nativeSetAttribute=Element.prototype.setAttribute;
    if(!nativeSetAttribute.__ccIdempotent){
      const guarded=function(name,value){
        const key=String(name),next=String(value);
        try{if(this.getAttribute(key)===next)return}catch{}
        return nativeSetAttribute.call(this,key,value);
      };
      Object.defineProperty(guarded,'__ccIdempotent',{value:true});
      Element.prototype.setAttribute=guarded;
    }
  }catch(error){console.warn('No se pudo instalar setAttribute idempotente.',error)}
}
installIdempotentDomWrites();

class GovernedMutationObserver extends Native{
  constructor(callback){
    if(typeof callback!=='function')throw new TypeError('MutationObserver callback must be a function');
    let self=null;
    super((records)=>{if(self)self.__ccDeliver(records)});
    self=this;
    this.__ccCallback=callback;
    this.__ccBroad=false;
    this.__ccQueue=[];
    this.__ccFrame=0;
    this.__ccDisconnected=false;
  }
  __ccDeliver(records){
    if(this.__ccDisconnected||!records?.length)return;
    if(!this.__ccBroad){this.__ccCallback(records,this);return}
    this.__ccQueue.push(...records);
    if(this.__ccFrame)return;
    const run=()=>{
      this.__ccFrame=0;
      if(this.__ccDisconnected||!this.__ccQueue.length)return;
      const batch=this.__ccQueue.splice(0,this.__ccQueue.length);
      this.__ccCallback(batch,this);
    };
    this.__ccFrame=typeof requestAnimationFrame==='function'?requestAnimationFrame(run):setTimeout(run,16);
  }
  observe(target,options){
    this.__ccDisconnected=false;
    const root=target===document.documentElement||target===document.body||target===document;
    this.__ccBroad=!!(root&&options?.subtree&&(options?.childList||options?.attributes||options?.characterData));
    return super.observe(target,options);
  }
  disconnect(){
    this.__ccDisconnected=true;
    this.__ccQueue.length=0;
    if(this.__ccFrame){
      if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(this.__ccFrame);else clearTimeout(this.__ccFrame);
      this.__ccFrame=0;
    }
    return super.disconnect();
  }
  takeRecords(){
    const pending=this.__ccQueue.splice(0,this.__ccQueue.length);
    return pending.concat(super.takeRecords());
  }
}

Object.defineProperty(GovernedMutationObserver,'name',{value:'MutationObserver'});
window.MutationObserver=GovernedMutationObserver;
window.addEventListener('pagehide',()=>{
  window.__CC_MUTATION_OBSERVER_GOVERNOR_PAGEHIDE__=true;
},{once:true});
})();
