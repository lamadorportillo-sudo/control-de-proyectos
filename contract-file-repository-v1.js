/* ===== CONTROL CONTRACTUAL · ARCHIVO DOCUMENTAL DEL CONTRATO V2 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_FILE_REPOSITORY_V1__)return;
window.__CC_CONTRACT_FILE_REPOSITORY_V1__=true;

const BUCKET='project-files';
const ACCEPT='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.heic,.heif';
const TYPES=[
  {id:'signed_contract',label:'Contrato firmado',group:'Principal'},
  {id:'signed_start_order',label:'Orden de inicio firmada',group:'Principal'},
  {id:'payment_order',label:'Orden de pago',group:'Pagos'},
  {id:'payment_summary',label:'Resumen de pago',group:'Pagos'},
  {id:'advance_guarantee',label:'Garantía de anticipo',group:'Garantías'},
  {id:'maintenance_guarantee',label:'Garantía de mantenimiento',group:'Garantías'},
  {id:'performance_guarantee',label:'Garantía de cumplimiento',group:'Garantías'},
  {id:'quality_guarantee',label:'Garantía de calidad',group:'Garantías'},
  {id:'provisional_acceptance',label:'Acta de recepción provisional',group:'Recepción'},
  {id:'final_acceptance',label:'Acta de recepción definitiva',group:'Recepción'}
];
const A=v=>Array.isArray(v)?v:[];
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const safe=v=>String(v||'archivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,120)||'archivo';
const encPath=p=>String(p).split('/').map(encodeURIComponent).join('/');
const makeId=()=>{try{return typeof uid==='function'?uid():(crypto.randomUUID?crypto.randomUUID():'f_'+Date.now()+Math.random().toString(36).slice(2))}catch{return 'f_'+Date.now()+Math.random().toString(36).slice(2)}};
const now=()=>{try{return typeof iso==='function'?iso():new Date().toISOString()}catch{return new Date().toISOString()}};
const say=m=>{try{if(typeof toast==='function')toast(m);else alert(m)}catch{console.log(m)}};
const info=id=>TYPES.find(x=>x.id===id)||{id,label:id,group:'Otros'};
const bytes=n=>{n=Number(n)||0;if(n<1024)return `${n} B`;if(n<1048576)return `${(n/1024).toFixed(1)} KB`;return `${(n/1048576).toFixed(1)} MB`};
const dateLabel=v=>{if(!v)return '';try{return new Intl.DateTimeFormat('es-HN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch{return String(v)}};

function context(){
  let p=null,c=null;
  try{if(typeof getProject==='function')p=getProject()}catch{}
  try{if(p&&typeof getContract==='function')c=getContract(p)}catch{}
  if(p&&c)return{p,c};
  let d=null,v=null;
  try{d=db}catch{d=window.db||window.DB||null}
  try{v=view}catch{v=window.view||null}
  d=d||window.db||window.DB||{};v=v||window.view||{};
  const pid=v.projectId||window.currentProjectId||window.selectedProjectId||window.activeProjectId||(typeof window.ccCurrentProjectId==='function'?window.ccCurrentProjectId():'');
  p=p||A(d.projects).find(x=>String(x.id)===String(pid));
  c=c||(p?A(d.contracts).filter(x=>String(x.projectId)===String(p.id)&&!x.voidedAt&&!x.voided_at).slice(-1)[0]:null);
  return{p,c};
}
function canEdit(){try{return typeof roleCanEdit==='function'?roleCanEdit():true}catch{return true}}
function docs(c){if(!c)return[];if(!Array.isArray(c.storedDocuments))c.storedDocuments=[];return c.storedDocuments}

async function authReady(){
  if(typeof ensureCloudSession==='function'){
    const ok=await ensureCloudSession();
    if(!ok)throw new Error('La sesión de Supabase venció. Vuelve a ingresar.');
  }
  if(!session?.accessToken)throw new Error('No hay sesión activa en Supabase.');
  if(!cloudWorkspaceId)throw new Error('No se pudo identificar el espacio de trabajo.');
}

async function uploadOne(file,category,p,c){
  await authReady();
  if(!canEdit())throw new Error('Tu usuario no tiene permiso para cargar documentos.');
  if(file.size>25*1024*1024)throw new Error(`${file.name}: supera el límite de 25 MB.`);
  const id=makeId();
  const path=`${cloudWorkspaceId}/contracts/${safe(p.id)}/${safe(c.id)}/${safe(category)}/${id}_${safe(file.name)}`;
  const res=await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encPath(path)}`,{
    method:'POST',
    headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.accessToken}`,'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},
    body:file
  });
  if(!res.ok){let msg=`No se pudo cargar ${file.name}.`;try{const d=await res.json();msg=d.message||d.error||msg}catch{}throw new Error(msg)}
  const meta={id,category,label:info(category).label,name:file.name,mime:file.type||'application/octet-stream',size:file.size,lastModified:file.lastModified||null,addedAt:now(),storageBucket:BUCKET,storagePath:path,projectId:p.id,contractId:c.id,cloud:true};
  docs(c).push(meta);
  try{if(typeof audit==='function')audit('ARCHIVAR','Documento contractual',id,{projectId:p.id,contractId:c.id,category,name:file.name,size:file.size})}catch{}
  try{if(typeof saveDB==='function')saveDB()}catch{}
  return meta;
}

async function fetchBlob(meta){
  await authReady();
  if(!meta?.storagePath)throw new Error('Este registro no tiene archivo almacenado.');
  const res=await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/${BUCKET}/${encPath(meta.storagePath)}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.accessToken}`},cache:'no-store'});
  if(!res.ok)throw new Error('No se pudo abrir el documento almacenado.');
  return res.blob();
}
async function openStored(meta,download=false){
  const blob=await fetchBlob(meta),url=URL.createObjectURL(blob),mime=meta.mime||blob.type||'';
  if(!download&&mime==='application/pdf'&&typeof window.__ccOpenInAppDocument==='function'){
    window.__ccOpenInAppDocument(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,iframe{margin:0;width:100%;height:100%;border:0}</style></head><body><iframe src="${url}"></iframe></body></html>`,meta.name||'PDF');
    setTimeout(()=>URL.revokeObjectURL(url),120000);return;
  }
  if(!download&&/^image\//i.test(mime)&&typeof window.__ccOpenInAppDocument==='function'){
    window.__ccOpenInAppDocument(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;display:grid;place-items:center;background:#eef2ee}img{max-width:100%;max-height:100vh;object-fit:contain}</style></head><body><img src="${url}"></body></html>`,meta.name||'Imagen');
    setTimeout(()=>URL.revokeObjectURL(url),120000);return;
  }
  const a=document.createElement('a');a.href=url;a.download=meta.name||'documento';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}

function uploadControl(category,text='＋ Subir',extra=''){
  return `<label class="btn primary cc-native-upload ${extra}" role="button" tabindex="0"><span>${E(text)}</span><input type="file" data-cc-native-upload="${E(category)}" accept="${ACCEPT}" multiple></label>`;
}
function cardHTML(t,c){
  const items=docs(c).filter(x=>x.category===t.id),latest=items.at(-1),count=items.length,g=t.group==='Garantías';
  return `<article class="cc-archive-card${g?' cc-archive-guarantee':''}" data-cc-category="${t.id}"><div class="cc-archive-card-top"><div class="cc-archive-icon">${g?'🛡️':t.group==='Pagos'?'💳':t.group==='Recepción'?'✅':'📄'}</div><div><b>${E(t.label)}</b><small>${count?`${count} archivo${count===1?'':'s'} almacenado${count===1?'':'s'}`:'Sin documento cargado'}</small></div><span class="cc-archive-state ${count?'ok':''}">${count?'ARCHIVADO':'PENDIENTE'}</span></div>${latest?`<div class="cc-archive-latest"><span>${E(latest.name)}</span><small>${E(dateLabel(latest.addedAt))}</small></div>`:'<div class="cc-archive-latest empty">Se puede subir PDF, Word, Excel o imagen.</div>'}<div class="cc-archive-actions">${uploadControl(t.id)}${count?`<button class="btn" type="button" data-cc-list-category="${t.id}">Ver archivos</button>`:''}</div></article>`;
}

function css(){
  if(document.getElementById('cc-contract-file-repository-style'))return;
  const s=document.createElement('style');s.id='cc-contract-file-repository-style';s.textContent=`
  .cc-contract-archive{margin-top:14px;padding:15px;border:1px solid #c9d8e5;border-radius:14px;background:#f8fbfd;color:#173247}.cc-archive-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:12px}.cc-archive-head small{display:block;color:#0b6f89;font-size:9px;font-weight:900;letter-spacing:.11em}.cc-archive-head h3{margin:2px 0 3px;color:#173247!important}.cc-archive-head p{margin:0;color:#5b7185;font-size:11px}.cc-archive-cloud{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:#e6f6ec;color:#17623a;font-size:9px;font-weight:850}.cc-archive-cloud i{width:7px;height:7px;border-radius:50%;background:#28a66a}.cc-archive-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.cc-archive-card{border:1px solid #d5e0e9;border-radius:12px;background:#fff;padding:11px;min-width:0}.cc-archive-card-top{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center}.cc-archive-icon{width:30px;height:30px;border-radius:9px;background:#edf4f8;display:grid;place-items:center}.cc-archive-card-top b{display:block;color:#18384a;font-size:11px}.cc-archive-card-top small{display:block;color:#71879a;font-size:9px}.cc-archive-state{font-size:8px;font-weight:900;border-radius:999px;padding:4px 6px;background:#f2f4f6;color:#8392a0}.cc-archive-state.ok{background:#e8f7ee;color:#197146}.cc-archive-latest{margin-top:8px;padding:7px 8px;border-radius:8px;background:#f4f8fb;min-width:0}.cc-archive-latest span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#36546c;font-size:9px}.cc-archive-latest small{display:block;color:#8a99a5;font-size:8px;margin-top:2px}.cc-archive-latest.empty{color:#8594a0;font-size:9px}.cc-archive-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.cc-archive-actions .btn{padding:7px 9px;font-size:9px}.cc-native-upload{position:relative;display:inline-flex!important;align-items:center;justify-content:center;overflow:hidden;cursor:pointer}.cc-native-upload input{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:0!important;cursor:pointer!important;z-index:3}.cc-native-upload span{pointer-events:none}.cc-native-upload.busy{opacity:.6;pointer-events:none}.cc-archive-guarantee.cc-archive-highlight{box-shadow:0 0 0 3px rgba(31,135,90,.18);border-color:#3ca574}.cc-inline-signed-upload{background:#0e5c43!important;border-color:#207c5e!important;color:#eafff6!important}.cc-archive-modal-bg{position:fixed;inset:0;z-index:120;background:rgba(4,12,20,.68);display:grid;place-items:center;padding:15px}.cc-archive-modal{width:min(760px,100%);max-height:88vh;overflow:auto;border-radius:15px;background:#fff;color:#173247;box-shadow:0 28px 90px rgba(0,0,0,.35)}.cc-archive-modal-head{position:sticky;top:0;background:#f5f9fc;border-bottom:1px solid #dce5ec;padding:13px 15px;display:flex;align-items:center;justify-content:space-between}.cc-archive-modal-body{padding:12px;display:grid;gap:8px}.cc-archive-file{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border:1px solid #dbe4eb;border-radius:11px}.cc-archive-file-main b{display:block;color:#19394d}.cc-archive-file-main small{display:block;color:#7c8d99;font-size:9px}.cc-archive-file-actions{display:flex;gap:6px}.cc-archive-file-actions .btn{padding:7px 9px;font-size:9px}@media(max-width:760px){.cc-archive-grid{grid-template-columns:1fr}.cc-archive-head{align-items:flex-start;flex-direction:column}.cc-archive-file{align-items:flex-start;flex-direction:column}.cc-archive-file-actions{width:100%}.cc-archive-file-actions .btn{flex:1}}`;
  document.head.appendChild(s);
}

function decorateSigned(box){
  if(!box)return;
  box.querySelectorAll('.cc-doc-download').forEach(row=>{
    const title=(row.querySelector('b')?.textContent||'').toLowerCase();
    const category=title.includes('contrato de obra')?'signed_contract':title.includes('orden de inicio')?'signed_start_order':'';
    if(!category||row.querySelector(`[data-cc-native-upload="${category}"]`))return;
    row.insertAdjacentHTML('beforeend',uploadControl(category,'↑ Subir firmado','cc-inline-signed-upload'));
  });
}
function renderCard(card,force=false){
  if(!card)return;css();const {p,c}=context();if(!p||!c)return;
  const sig=docs(c).map(x=>`${x.id}:${x.category}:${x.storagePath||''}:${x.addedAt||''}`).join('|');
  let section=card.querySelector('[data-cc-contract-archive]');
  if(section&&!force&&section.dataset.sig===sig){decorateSigned(card.querySelector('[data-cc-manual-downloads]'));return}
  if(!section){section=document.createElement('section');section.className='cc-contract-archive';section.setAttribute('data-cc-contract-archive','');card.appendChild(section)}
  section.dataset.sig=sig;
  section.innerHTML=`<div class="cc-archive-head"><div><small>EXPEDIENTE DIGITAL · SUPABASE</small><h3>Documentos firmados y soporte contractual</h3><p>Selecciona el archivo desde tu computadora; quedará guardado en Supabase y vinculado a este contrato.</p></div><span class="cc-archive-cloud"><i></i> ARCHIVO EN NUBE</span></div><div class="cc-archive-grid">${TYPES.map(x=>cardHTML(x,c)).join('')}</div>`;
  decorateSigned(card.querySelector('[data-cc-manual-downloads]'));
}
function renderAll(force=false){document.querySelectorAll('[data-cc-payment-docs]').forEach(x=>renderCard(x,force))}

async function handleNativeInput(input){
  const files=A([...input.files||[]]);if(!files.length)return;
  const category=input.dataset.ccNativeUpload,{p,c}=context();if(!p||!c){input.value='';return say('No se pudo identificar el proyecto y contrato activos.');}
  if(!canEdit()){input.value='';return say('Tu usuario no tiene permiso para cargar documentos.');}
  const label=input.closest('.cc-native-upload'),span=label?.querySelector('span'),old=span?.textContent;
  if(label)label.classList.add('busy');if(span)span.textContent='Cargando…';
  let ok=0;
  try{
    for(const file of files){await uploadOne(file,category,p,c);ok++}
    say(`${ok} documento${ok===1?'':'s'} almacenado${ok===1?'':'s'} correctamente en Supabase.`);
  }catch(err){console.error('Carga contractual',err);say(err.message||'No se pudo completar la carga.');}
  finally{input.value='';if(label)label.classList.remove('busy');if(span)span.textContent=old||'＋ Subir';renderAll(true)}
}

document.addEventListener('change',e=>{
  const input=e.target?.closest?.('[data-cc-native-upload]');if(!input)return;
  e.stopPropagation();handleNativeInput(input);
},true);

document.addEventListener('click',async e=>{
  const list=e.target?.closest?.('[data-cc-list-category]');
  if(list){e.preventDefault();e.stopImmediatePropagation();const {c}=context(),category=list.dataset.ccListCategory,items=docs(c).filter(x=>x.category===category).slice().reverse(),t=info(category);if(!items.length)return say(`Todavía no hay archivos en ${t.label}.`);const modal=document.createElement('div');modal.className='cc-archive-modal-bg';modal.innerHTML=`<div class="cc-archive-modal"><div class="cc-archive-modal-head"><div><small>ARCHIVO CONTRACTUAL</small><h3>${E(t.label)}</h3></div><button class="btn" data-cc-close-files>✕</button></div><div class="cc-archive-modal-body">${items.map(x=>`<div class="cc-archive-file" data-cc-file-id="${E(x.id)}"><div class="cc-archive-file-main"><b>${E(x.name)}</b><small>${E(dateLabel(x.addedAt))} · ${E(bytes(x.size))}</small></div><div class="cc-archive-file-actions"><button class="btn" data-cc-open-file>Ver</button><button class="btn" data-cc-download-file>Descargar</button></div></div>`).join('')}</div></div>`;modal.querySelector('[data-cc-close-files]').onclick=()=>modal.remove();modal.addEventListener('mousedown',ev=>{if(ev.target===modal)modal.remove()});document.body.appendChild(modal);return;}
  const open=e.target?.closest?.('[data-cc-open-file]'),download=e.target?.closest?.('[data-cc-download-file]');
  if(open||download){e.preventDefault();e.stopImmediatePropagation();const id=(open||download).closest('[data-cc-file-id]')?.dataset.ccFileId,{c}=context(),meta=docs(c).find(x=>String(x.id)===String(id));if(!meta)return;const b=open||download;b.disabled=true;try{await openStored(meta,!!download)}catch(err){console.error(err);say(err.message||'No se pudo abrir el archivo.')}finally{b.disabled=false}}
},true);

function focusArchive(guarantees=false){const s=document.querySelector('[data-cc-contract-archive]');if(!s){renderAll(true);setTimeout(()=>focusArchive(guarantees),100);return}s.scrollIntoView({behavior:'smooth',block:'start'});if(guarantees){s.querySelectorAll('.cc-archive-guarantee').forEach(x=>x.classList.add('cc-archive-highlight'));setTimeout(()=>s.querySelectorAll('.cc-archive-guarantee').forEach(x=>x.classList.remove('cc-archive-highlight')),2200)}}
window.ccContractFileRepository={focusArchive:()=>focusArchive(false),focusGuarantees:()=>focusArchive(true),render:()=>renderAll(true)};
renderAll();let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;renderAll(false)})}).observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>renderAll(true),300);setTimeout(()=>renderAll(true),900);
})();