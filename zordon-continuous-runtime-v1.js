/* ===== ZORDON · NÚCLEO DE APRENDIZAJE CONTINUO V1 ===== */
(()=>{
'use strict';
if(window.__CC_ZORDON_CONTINUOUS_V1__)return;
window.__CC_ZORDON_CONTINUOUS_V1__=true;

const VERSION=1;
const now=()=>new Date().toISOString();
let applying=false;

function learningStore(){
  try{
    if(!window.db||typeof db!=='object')return null;
    if(!db.adaptiveLearning||typeof db.adaptiveLearning!=='object')db.adaptiveLearning={};
    const store=db.adaptiveLearning;
    store.enabled=true;
    store.mode='continuous';
    store.engine='ZORDON';
    store.version=Math.max(Number(store.version)||0,2);
    if(!store.reportUsage||typeof store.reportUsage!=='object')store.reportUsage={};
    store.lastPolicyAppliedAt=store.lastPolicyAppliedAt||now();
    return store;
  }catch{return null}
}

function persistPolicy(){
  if(applying)return;
  const store=learningStore();
  if(!store)return;
  applying=true;
  try{if(typeof saveDB==='function')saveDB()}catch{}finally{applying=false}
}

function enforceCore(){
  const store=learningStore();
  if(!store)return;
  if(store.enabled!==true||store.mode!=='continuous'){
    store.enabled=true;
    store.mode='continuous';
  }
  try{window.__ccZordonLearning?.installAuditHook?.()}catch{}
}

function fixLearningPanel(root=document){
  const toggle=root?.querySelector?.('#learnOn');
  if(toggle){
    try{toggle.checked=true;toggle.disabled=true}catch{}
    const row=toggle.closest?.('label');
    if(row&&!row.dataset.zordonContinuous){
      row.dataset.zordonContinuous='1';
      row.innerHTML='<span><b>Aprendizaje continuo ZORDON</b><small class="muted" style="display:block">Activo permanentemente. Puedes corregir, actualizar, marcar como temporal, dejar de usar o borrar recuerdos sin desactivar el aprendizaje.</small></span><span class="status good">Activo</span>';
    }
  }
  const title=[...root.querySelectorAll?.('h2,h3,b')||[]].find(el=>/aprendizaje adaptativo/i.test(el.textContent||''));
  if(title&&/aprendizaje adaptativo/i.test(title.textContent||''))title.textContent=(title.textContent||'').replace(/aprendizaje adaptativo/ig,'Aprendizaje continuo ZORDON');
  const btn=root?.querySelector?.('#learnBtn');
  if(btn)btn.textContent='🧠 Memoria ZORDON';
}

function protectToggle(event){
  const target=event.target;
  if(target?.id!=='learnOn')return;
  event.preventDefault();
  event.stopImmediatePropagation();
  try{target.checked=true;target.disabled=true}catch{}
  enforceCore();
}

document.addEventListener('click',protectToggle,true);
document.addEventListener('change',protectToggle,true);

const observer=new MutationObserver(()=>{
  try{enforceCore();fixLearningPanel(document)}catch(error){console.warn('ZORDON: no se pudo aplicar el núcleo continuo.',error)}
});
observer.observe(document.documentElement,{subtree:true,childList:true});

// Reaplica el enlace con auditoría porque otros módulos pueden redefinirla al cargar.
const timer=setInterval(()=>{try{enforceCore();fixLearningPanel(document)}catch{}},4000);
window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});

// API visible para diagnóstico y control de memoria, sin exponer secretos ni credenciales.
window.__ccZordonContinuousCore={
  engine:'ZORDON',
  version:VERSION,
  mode:'continuous',
  status(){
    const stats=window.__ccZordonLearning?.stats?.()||{};
    return{engine:'ZORDON',mode:'continuous',active:true,policyVersion:VERSION,learningVersion:stats.version||null,updatedAt:stats.updatedAt||null,pendingConfirmations:stats.pendingConfirmations||0};
  },
  enforce:enforceCore,
  forget(query){return window.__ccZordonLearning?.forget?.(query)||0},
  suppress(query){return window.__ccZordonLearning?.suppress?.(query)||0},
  markTemporary(query){return window.__ccZordonLearning?.markTemporary?.(query)||0}
};

enforceCore();
fixLearningPanel(document);
setTimeout(()=>{enforceCore();fixLearningPanel(document);persistPolicy()},0);
})();
