/* ===== COORDINADOR DE RENDIMIENTO DEL DOM V1 ===== */
(()=>{
'use strict';
if(window.__CC_PERFORMANCE_RUNTIME_V1__)return;window.__CC_PERFORMANCE_RUNTIME_V1__=true;
const NativeObserver=window.MutationObserver;if(!NativeObserver)return;
const schedule=window.requestAnimationFrame?callback=>requestAnimationFrame(callback):callback=>setTimeout(callback,16);
class BatchedMutationObserver{
  constructor(callback){
    if(typeof callback!=='function')throw new TypeError('MutationObserver callback must be a function');
    this.callback=callback;this.records=[];this.queued=false;
    this.native=new NativeObserver(records=>{this.records.push(...records);if(this.queued)return;this.queued=true;schedule(()=>{this.queued=false;const batch=this.records.splice(0);if(batch.length)this.callback(batch,this)})});
  }
  observe(target,options){return this.native.observe(target,options)}
  disconnect(){this.records.length=0;this.queued=false;return this.native.disconnect()}
  takeRecords(){return this.records.splice(0).concat(this.native.takeRecords())}
}
window.MutationObserver=BatchedMutationObserver;
window.__ccNativeMutationObserver=NativeObserver;
})();
