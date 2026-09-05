/* ===== GOBERNADOR GLOBAL DE MUTATIONOBSERVER V1 · UNA ENTREGA POR FRAME ===== */
(()=>{
'use strict';
if(window.__CC_MUTATION_OBSERVER_GOVERNOR_V1__)return;
const Native=window.MutationObserver;
if(typeof Native!=='function')return;
window.__CC_MUTATION_OBSERVER_GOVERNOR_V1__=true;
window.__CC_NATIVE_MUTATION_OBSERVER__=window.__CC_NATIVE_MUTATION_OBSERVER__||Native;

class GovernedMutationObserver extends Native{
  constructor(callback){
    if(typeof callback!=='function')throw new TypeError('MutationObserver callback must be a function');
    let self=null;
    super((records)=>{ if(self)self.__ccDeliver(records); });
    self=this;
    this.__ccCallback=callback;
    this.__ccBroad=false;
    this.__ccQueue=[];
    this.__ccFrame=0;
    this.__ccDisconnected=false;
  }
  __ccDeliver(records){
    if(this.__ccDisconnected||!records?.length)return;
    if(!this.__ccBroad){this.__ccCallback(records,this);return;}
    this.__ccQueue.push(...records);
    if(this.__ccFrame)return;
    const run=()=>{
      this.__ccFrame=0;
      if(this.__ccDisconnected||!this.__ccQueue.length)return;
      const batch=this.__ccQueue.splice(0,this.__ccQueue.length);
      this.__ccCallback(batch,this);
    };
    this.__ccFrame=(typeof requestAnimationFrame==='function')?requestAnimationFrame(run):setTimeout(run,16);
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
  // Las instancias conservan su propio ciclo de vida; este evento solo evita que
  // futuros módulos interpreten la página en salida como un contexto activo.
  window.__CC_MUTATION_OBSERVER_GOVERNOR_PAGEHIDE__=true;
},{once:true});
})();
