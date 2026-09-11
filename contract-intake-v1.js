/* ===== CONTROL CONTRACTUAL · INGRESO Y CORRECCIÓN DE CONTRATO V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_INTAKE_V1__)return;
window.__CC_CONTRACT_INTAKE_V1__=true;

const ACCEPT='.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,.heif';
const A=v=>Array.isArray(v)?v:[];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const say=m=>{try{if(typeof toast==='function')toast(m);else alert(m)}catch{console.log(m)}};
const now=()=>{try{return typeof iso==='function'?iso():new Date().toISOString()}catch{return new Date().toISOString()}};
const makeId=()=>{try{return typeof uid==='function'?uid():(crypto.randomUUID?crypto.randomUUID():'c_'+Date.now())}catch{return 'c_'+Date.now()}};

function data(){
  let d=null;try{d=db}catch{}return d||window.db||{};
}
function current(){
  let p=null,c=null;
  try{if(typeof getProject==='function')p=getProject()}catch{}
  try{if(p&&typeof getContract==='function')c=getContract(p)}catch{}
  const d=data();
  let v=null;try{v=view}catch{}v=v||window.view||{};
  const pid=p?.id||v.projectId||window.currentProjectId||window.selectedProjectId||'';
  p=p||A(d.projects).find(x=>String(x.id)===String(pid))||null;
  c=c||(p?A(d.contracts).filter(x=>String(x.projectId)===String(p.id)&&!x.voidedAt&&!x.voided_at).slice(-1)[0]:null);
  return{p,c,d,v};
}
function canEdit(){try{return typeof roleCanEdit==='function'?roleCanEdit():true}catch{return true}}
function save(){
  try{if(typeof saveDB==='function')saveDB()}catch(err){console.error('contract-intake save',err)}
}
function refresh(){
  try{if(typeof renderProject==='function')renderProject();else if(typeof renderApp==='function')renderApp()}catch(err){console.error('contract-intake render',err)}
}
function openEditor(p,c){
  if(typeof contractModal!=='function')return say('El formulario de contrato todavía no está disponible.');
  contractModal(p,c||null);
}
function controls(){
  try{return typeof contractControlDefaults==='function'?contractControlDefaults({}):{}}catch{return{}}
}
function blankContract(p){
  return{
    id:makeId(),projectId:p.id,
    number:'',contractor:'',originalAmount:null,currentAmount:null,
    signature:'',start:'',executionDays:0,end:'',durationManual:false,
    status:'Borrador',advanceStatus:'No solicitado',advanceRequestedPct:0,
    advanceApproved:0,advancePaid:0,advancePaymentDate:'',recoveryTarget:null,
    controls:controls(),notes:'',storedDocuments:[],
    intakeStatus:'pending_review',createdAt:now(),updatedAt:now()
  };
}
function complete(c){
  return !!(c&&String(c.number||'').trim()&&String(c.contractor||'').trim()&&Number(c.originalAmount)>0);
}
function uploader(label='Adjuntar contrato firmado'){
  return `<label class="btn primary cc-contract-intake-upload" role="button"><span>↑ ${esc(label)}</span><input type="file" data-cc-contract-intake-file accept="${ACCEPT}"></label>`;
}
function css(){
  if(document.getElementById('cc-contract-intake-style'))return;
  const s=document.createElement('style');s.id='cc-contract-intake-style';s.textContent=`
  .cc-contract-intake-box{margin:14px 0;padding:16px;border:1px solid #294260;border-radius:16px;background:linear-gradient(180deg,#0d1a2a,#0a1420);text-align:left}
  .cc-contract-intake-box h3{margin:0 0 5px;font-size:16px}.cc-contract-intake-box p{margin:0;color:#9db0c6;max-width:820px}
  .cc-contract-intake-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px}
  .cc-contract-intake-upload{position:relative;display:inline-flex!important;align-items:center;justify-content:center;overflow:hidden}
  .cc-contract-intake-upload input{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:0!important;cursor:pointer!important;z-index:2}
  .cc-contract-intake-upload span{pointer-events:none}.cc-contract-intake-upload.busy{opacity:.65;pointer-events:none}
  .cc-contract-continue{margin:10px 0 14px;padding:11px 12px;border:1px solid #294260;border-radius:12px;background:#0a1522;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .cc-contract-continue-copy b{display:block}.cc-contract-continue-copy small{display:block;color:#91a5bd;margin-top:2px}
  .cc-contract-continue.warn{border-color:#725421;background:#221b0c}.cc-contract-continue.warn .cc-contract-continue-copy small{color:#e8cf8c}
  @media(max-width:720px){.cc-contract-intake-actions,.cc-contract-continue .actions{width:100%}.cc-contract-intake-actions .btn,.cc-contract-continue .btn{flex:1 1 100%;width:100%}}
  `;document.head.appendChild(s);
}

function decorate(){
  css();
  const body=document.getElementById('tabBody');if(!body)return;
  const {p,c,v}=current();if(!p)return;
  const active=(v?.tab||'').toLowerCase();
  if(active&&active!=='contract')return;

  const old=body.querySelector('[data-cc-contract-intake]');
  if(!c){
    if(old)return;
    const empty=body.querySelector('.empty')||body;
    const legacy=body.querySelector('#contractBtn');
    if(legacy)legacy.style.display='none';
    const box=document.createElement('section');
    box.className='cc-contract-intake-box';box.dataset.ccContractIntake='new';
    box.innerHTML=`<h3>Registrar contrato</h3>
      <p>El proyecto ya está vinculado. Puedes ingresar los datos manualmente o adjuntar el contrato firmado; si lo subes, el sistema lo archivará, intentará leer sus datos y después te abrirá la ficha para revisarlos y completarlos.</p>
      <div class="cc-contract-intake-actions">
        <button type="button" class="btn" data-cc-contract-manual>Ingresar datos del contrato</button>
        ${uploader('Adjuntar contrato firmado')}
      </div>`;
    empty.appendChild(box);
    return;
  }

  if(old)old.remove();
  const head=body.querySelector('.panel-head')||body.querySelector('.project-context');
  if(!head||body.querySelector('[data-cc-contract-continue]'))return;
  const bar=document.createElement('div');
  bar.className='cc-contract-continue'+(complete(c)?'':' warn');
  bar.dataset.ccContractContinue='1';
  bar.innerHTML=`<div class="cc-contract-continue-copy"><b>${complete(c)?'Contrato registrado · puedes seguir corrigiéndolo':'Contrato pendiente de completar'}</b>
    <small>${complete(c)?'Los datos no quedan bloqueados: puedes editar, completar o reemplazar el archivo de respaldo cuando sea necesario.':'Hay datos contractuales pendientes. Revisa y completa la ficha antes de utilizarla para controles definitivos.'}</small></div>
    <div class="actions" style="margin:0">
      <button type="button" class="btn" data-cc-contract-manual>Editar / completar datos</button>
      ${uploader('Adjuntar contrato firmado')}
    </div>`;
  head.insertAdjacentElement('afterend',bar);
  const legacy=body.querySelector('#contractBtn');
  if(legacy)legacy.textContent='Editar / completar contrato';
}

async function repository(){
  const api=window.ccContractFileRepository;
  if(!api||typeof api.uploadFiles!=='function')throw new Error('El archivo contractual todavía no está disponible. Actualiza la página e inténtalo nuevamente.');
  return api;
}
async function intakeFile(input){
  if(!canEdit())return say('Tu usuario no tiene permiso para modificar el expediente.');
  const file=input.files?.[0];if(!file)return;
  const label=input.closest('.cc-contract-intake-upload'),span=label?.querySelector('span'),old=span?.textContent;
  if(label)label.classList.add('busy');if(span)span.textContent='Guardando y revisando…';input.disabled=true;
  try{
    const {p,c,d}=current();if(!p)throw new Error('No se pudo identificar el proyecto activo.');
    const api=await repository();
    if(c){
      await api.uploadFiles('signed_contract',[file],p,c,null);
      c.updatedAt=now();save();refresh();say('Contrato adjuntado. Puedes seguir completando o corrigiendo sus datos.');
      return;
    }
    const draft=blankContract(p);
    await api.uploadFiles('signed_contract',[file],p,draft,null);
    if(!Array.isArray(d.contracts))d.contracts=[];
    const existing=d.contracts.find(x=>String(x.id)===String(draft.id));
    if(!existing)d.contracts.push(draft);
    try{if(typeof audit==='function')audit('CREAR','Contrato',draft.id,{projectId:p.id,source:'document_upload',status:'Borrador'})}catch{}
    save();refresh();
    say('Contrato archivado. Revisa los datos detectados y completa lo que falte.');
    setTimeout(()=>openEditor(p,draft),120);
  }catch(err){
    console.error('contract-intake',err);
    say(err?.message||'No se pudo adjuntar el contrato.');
  }finally{
    input.disabled=false;input.value='';if(label)label.classList.remove('busy');if(span)span.textContent=old||'↑ Adjuntar contrato firmado';
  }
}

document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-cc-contract-manual]');if(!b)return;
  e.preventDefault();e.stopPropagation();
  const {p,c}=current();if(p)openEditor(p,c);
},true);
document.addEventListener('change',e=>{
  const input=e.target.closest?.('[data-cc-contract-intake-file]');if(input){e.stopPropagation();intakeFile(input)}
},true);

let queued=false;
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('cc:authenticated-modules-ready',queue);
document.addEventListener('cc:authenticated-modules-partial',queue);
document.addEventListener('click',e=>{if(e.target.closest?.('nav.tabs button'))setTimeout(queue,40)},true);
decorate();setTimeout(decorate,250);setTimeout(decorate,900);

window.ccContractIntake={decorate};
})();