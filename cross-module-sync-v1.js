/* ===== SINCRONIZACION ENTRE MODULOS V1 ===== */
(()=>{
'use strict';
if(window.__CC_CROSS_MODULE_SYNC_V1__)return;
window.__CC_CROSS_MODULE_SYNC_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const snapshot=()=>{
  try{return{
    projects:A(db?.projects).length,
    contracts:A(db?.contracts).length,
    estimates:A(db?.estimates).length,
    payments:A(db?.payments).length,
    guarantees:A(db?.guarantees).length,
    changes:A(db?.changes).length,
    visits:A(db?.visits).length,
    budgets:A(db?.projectBudgets||db?.budgets).length,
    budgetMovements:A(db?.budgetMovements).length
  }}catch{return{}}
};
function emit(name,detail={}){
  try{window.dispatchEvent(new CustomEvent(name,{detail:{...snapshot(),...detail,at:new Date().toISOString()}}))}catch(e){console.warn(e)}
}

if(typeof saveDB==='function'&&!saveDB.__ccCrossModule){
  const base=saveDB;
  const wrapped=function(){
    const result=base.apply(this,arguments);
    emit('cc:data-changed',{source:'saveDB'});
    setTimeout(()=>emit('cc:cloud-synced',{source:'saveDB'}),1400);
    return result;
  };
  wrapped.__ccCrossModule=true;
  try{saveDB=wrapped}catch{}
  try{window.saveDB=wrapped}catch{}
}

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')emit('cc:data-changed',{source:'visibility'});
});
window.addEventListener('focus',()=>emit('cc:data-changed',{source:'focus'}));
window.__ccCrossModuleSync={snapshot,emit};
})();
