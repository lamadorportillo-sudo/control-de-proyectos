/* ===== ACCIONES FUNCIONALES DEL EXPEDIENTE V1 ===== */
(()=>{
'use strict';
if(window.__CC_PROJECT_FUNCTIONAL_ACTIONS_V1__)return;
window.__CC_PROJECT_FUNCTIONAL_ACTIONS_V1__=true;

const LABELS={
  summary:'Resumen ejecutivo',
  estimates:'＋ Nueva estimación',
  visits:'＋ Registrar visita',
  guarantees:'＋ Agregar garantía',
  changes:'＋ Orden de cambio',
  reports:'Informes'
};

function current(){
  try{
    const pid=view?.projectId;
    const p=(db?.projects||[]).find(x=>x.id===pid&&!x.deletedAt)||null;
    const c=p?(db?.contracts||[]).find(x=>x.projectId===p.id)||null:null;
    return{p,c};
  }catch{return{p:null,c:null}}
}
function editable(){try{return typeof roleCanEdit==='function'?roleCanEdit():true}catch{return true}}
function msg(text){try{if(typeof toast==='function')return toast(text)}catch{}alert(text)}
function tab(id){
  const b=document.querySelector(`[data-tab="${id}"]`);
  if(b){b.click();setTimeout(()=>document.querySelector('.tabs')?.scrollIntoView({behavior:'smooth',block:'start'}),70);return true}
  return false;
}
function needContract(p){
  msg('Primero registra el contrato. Te llevo directamente a esa sección.');
  tab('contract');
  setTimeout(()=>{
    const b=document.getElementById('contractBtn');
    if(b&&editable())b.click();
    else if(editable()&&typeof contractModal==='function')contractModal(p,null);
  },120);
}
function runAction(kind){
  const{p,c}=current();
  if(!p)return;
  if(kind==='summary')return tab('summary');
  if(kind==='reports')return tab('reports');
  if(kind==='estimates'){
    if(!c)return needContract(p);
    if(editable()&&typeof estimateModal==='function')return estimateModal(p,c,null);
    return tab('estimates');
  }
  if(kind==='visits'){
    if(editable()&&typeof visitModal==='function')return visitModal(p,c,null);
    return tab('visits');
  }
  if(kind==='guarantees'){
    if(editable()&&typeof guaranteeModal==='function')return guaranteeModal(p,c,null);
    return tab('guarantees');
  }
  if(kind==='changes'){
    if(!c)return needContract(p);
    if(editable()&&typeof changeModal==='function')return changeModal(p,c,null);
    return tab('changes');
  }
}

function improveQuickButtons(){
  document.querySelectorAll('.project-portfolio-actions [data-project-jump]').forEach(b=>{
    const kind=b.dataset.projectJump;
    const label=LABELS[kind];
    if(label&&b.textContent!==label)b.textContent=label;
    if(['estimates','visits','guarantees','changes'].includes(kind))b.classList.add('functional-action');
  });
}
function improveDeadEnds(){
  let screen='',pid='',active='';
  try{screen=view?.screen||'';pid=view?.projectId||'';active=view?.tab||''}catch{}
  if(screen!=='project'||!pid)return;
  const{p,c}=current(),body=document.getElementById('tabBody');
  if(!p||!body)return;
  if(!c&&active==='estimates'&&!body.querySelector('[data-create-contract-for-estimate]')){
    body.innerHTML=`<div class="cc-action-empty"><div class="cc-action-empty-icon">E</div><h3>Para registrar una estimación necesitas el contrato</h3><p>El proyecto ya está seleccionado. Registra el contrato y después podrás crear la estimación sin volver a escribir el código o nombre del proyecto.</p>${editable()?'<button class="btn primary" data-create-contract-for-estimate>Registrar contrato ahora</button>':''}</div>`;
    body.querySelector('[data-create-contract-for-estimate]')?.addEventListener('click',()=>typeof contractModal==='function'&&contractModal(p,null));
  }
  if(!c&&active==='changes'&&!body.querySelector('[data-create-contract-for-change]')){
    body.innerHTML=`<div class="cc-action-empty"><div class="cc-action-empty-icon">OC</div><h3>La orden de cambio debe quedar vinculada a un contrato</h3><p>Registra primero el contrato del proyecto. Al guardarlo podrás crear inmediatamente la orden de cambio o adenda.</p>${editable()?'<button class="btn primary" data-create-contract-for-change>Registrar contrato ahora</button>':''}</div>`;
    body.querySelector('[data-create-contract-for-change]')?.addEventListener('click',()=>typeof contractModal==='function'&&contractModal(p,null));
  }
}
function css(){
  if(document.getElementById('cc-project-functional-actions-style'))return;
  const s=document.createElement('style');s.id='cc-project-functional-actions-style';s.textContent=`
  .project-portfolio-actions .functional-action{background:#f5f8f3!important;border-color:#cfdacb!important;color:#35513a!important}
  .project-portfolio-actions .functional-action:hover{background:#eaf1e6!important;border-color:#93aa8a!important;transform:translateY(-1px)}
  .cc-action-empty{max-width:720px;margin:18px auto;padding:28px;border:1px solid #dfe6dc;background:#f8faf7;border-radius:16px;text-align:center;color:#34423a}
  .cc-action-empty-icon{width:48px;height:48px;margin:0 auto 12px;border-radius:13px;display:grid;place-items:center;background:#587747;color:#fff;font-weight:900}
  .cc-action-empty h3{margin-bottom:7px;color:#26372b}.cc-action-empty p{color:#68756c;max-width:580px;margin:0 auto 16px}
  `;document.head.appendChild(s);
}
function refresh(){css();improveQuickButtons();improveDeadEnds()}

document.addEventListener('click',e=>{
  const b=e.target.closest?.('.project-portfolio-actions [data-project-jump]');
  if(!b)return;
  const kind=b.dataset.projectJump;
  if(!LABELS[kind])return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  runAction(kind);
},true);

let queued=false;
new MutationObserver(()=>{
  if(queued)return;queued=true;
  queueMicrotask(()=>{queued=false;refresh()});
}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(refresh,0);setTimeout(refresh,200);
})();