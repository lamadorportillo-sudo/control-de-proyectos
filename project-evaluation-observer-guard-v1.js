/* ===== GUARDIA DE OBSERVADOR DEL DASHBOARD EVALUATIVO V1 =====
   El dashboard evaluativo histórico observa todo documentElement y agenda su
   render mediante microtareas. Al cambiar una pestaña del expediente, varios
   módulos reconstruyen el DOM en la misma interacción y esa combinación podía
   encadenar observaciones sin devolver el control al navegador.

   Esta guardia se carga inmediatamente antes de project-evaluation-dashboard-v1.js.
   Solo intercepta el observador global creado por ese módulo, agrupa sus avisos
   a un máximo de uno por frame y descarta mutaciones producidas únicamente por
   el propio dashboard. Después restaura MutationObserver para no afectar a los
   módulos siguientes. */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_PROJECT_EVALUATION_OBSERVER_GUARD_V1__)return;
window.__CC_PROJECT_EVALUATION_OBSERVER_GUARD_V1__=true;

const Native=window.__ccNativeMutationObserver||window.MutationObserver;
if(typeof Native!=='function')return;
window.__ccNativeMutationObserver=Native;
const Original=window.MutationObserver;
const instances=new Set();
let restored=false;

function ownNode(node){
  if(!node||node.nodeType!==1)return false;
  const el=node;
  return el.matches?.('[data-project-evaluation]')||!!el.closest?.('[data-project-evaluation]');
}

function onlyOwnDashboardMutations(mutations){
  if(!mutations?.length)return false;
  return mutations.every(m=>{
    const nodes=[...(m.addedNodes||[]),...(m.removedNodes||[])].filter(n=>n.nodeType===1);
    if(!nodes.length)return ownNode(m.target);
    return nodes.every(ownNode);
  });
}

class ProjectEvaluationMutationObserver{
  constructor(callback){
    this.callback=callback;
    this.filtered=false;
    this.queued=false;
    this.pending=[];
    this.native=new Native((mutations,observer)=>{
      if(!this.filtered){callback(mutations,observer);return}
      if(onlyOwnDashboardMutations(mutations))return;
      this.pending.push(...mutations);
      if(this.queued)return;
      this.queued=true;
      const flush=()=>{
        this.queued=false;
        const batch=this.pending.splice(0);
        if(batch.length)callback(batch,observer);
      };
      if(typeof requestAnimationFrame==='function')requestAnimationFrame(flush);
      else setTimeout(flush,0);
    });
    instances.add(this);
  }
  observe(target,options){
    this.filtered=target===document.documentElement&&!!options?.childList&&!!options?.subtree;
    return this.native.observe(target,options);
  }
  disconnect(){this.pending.length=0;this.queued=false;instances.delete(this);return this.native.disconnect()}
  takeRecords(){return this.native.takeRecords()}
}

window.MutationObserver=ProjectEvaluationMutationObserver;

const started=Date.now();
function restore(){
  if(restored)return;
  if(window.__CC_PROJECT_EVALUATION_DASHBOARD_V2__===true||Date.now()-started>5000){
    restored=true;
    if(window.MutationObserver===ProjectEvaluationMutationObserver)window.MutationObserver=Original;
    return;
  }
  setTimeout(restore,0);
}
setTimeout(restore,0);

window.addEventListener('pagehide',()=>{
  for(const instance of [...instances])instance.disconnect();
},{once:true});
})();
