/* ===== ARCHIVOS REALES DE TRANSPARENCIA EN SUPABASE STORAGE V1 ===== */
(()=>{
'use strict';
if(window.__CC_TRANSPARENCY_STORAGE_V1__)return;
window.__CC_TRANSPARENCY_STORAGE_V1__=true;

const PERIOD_KEY='cc_transparency_period_v1';
const BUCKET='project-files';
const A=v=>Array.isArray(v)?v:[];
const safe=v=>String(v||'archivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,120)||'archivo';
const encPath=p=>String(p).split('/').map(encodeURIComponent).join('/');
const id=()=>typeof uid==='function'?uid():(crypto.randomUUID?crypto.randomUUID():'f_'+Date.now()+Math.random().toString(36).slice(2));
const now=()=>typeof iso==='function'?iso():new Date().toISOString();
const say=m=>{try{if(typeof toast==='function')toast(m);else console.log(m)}catch{}};
const period=()=>localStorage.getItem(PERIOD_KEY)||new Date().toISOString().slice(0,7);

function record(){
  try{
    if(!db||!Array.isArray(db.transparencyMonths))return null;
    return db.transparencyMonths.find(x=>x.period===period())||null;
  }catch{return null}
}

async function authReady(){
  if(typeof ensureCloudSession==='function'){
    const ok=await ensureCloudSession();
    if(!ok)throw new Error('La sesión de Supabase venció. Vuelve a ingresar.');
  }
  if(!session?.accessToken)throw new Error('No hay sesión activa en Supabase.');
  if(!cloudWorkspaceId)throw new Error('No se pudo identificar el espacio de trabajo.');
}

async function upload(file){
  await authReady();
  if(file.size>25*1024*1024)throw new Error(`${file.name}: supera el límite de 25 MB.`);
  const path=`${cloudWorkspaceId}/transparency/${period()}/${id()}_${safe(file.name)}`;
  const res=await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encPath(path)}`,{
    method:'POST',
    headers:{
      apikey:SUPABASE_KEY,
      Authorization:`Bearer ${session.accessToken}`,
      'Content-Type':file.type||'application/octet-stream',
      'x-upsert':'false'
    },
    body:file
  });
  if(!res.ok){
    let msg=`No se pudo cargar ${file.name}.`;
    try{const d=await res.json();msg=d.message||d.error||msg}catch{}
    throw new Error(msg);
  }
  return{
    id:id(),
    name:file.name,
    type:file.type||'archivo',
    size:file.size,
    lastModified:file.lastModified,
    addedAt:now(),
    storageBucket:BUCKET,
    storagePath:path,
    cloud:true
  };
}

async function downloadSource(source){
  await authReady();
  if(!source?.storagePath)return say('Este registro antiguo no tiene archivo almacenado en la nube.');
  const res=await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/${BUCKET}/${encPath(source.storagePath)}`,{
    headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.accessToken}`}
  });
  if(!res.ok)throw new Error('No se pudo abrir el archivo almacenado.');
  const blob=await res.blob();
  const url=URL.createObjectURL(blob);
  const type=source.type||blob.type||'';
  if(/^image\//i.test(type)&&typeof window.__ccOpenInAppDocument==='function'){
    window.__ccOpenInAppDocument(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#eef2ee;height:100%;display:grid;place-items:center}img{max-width:100%;max-height:100vh;object-fit:contain}</style></head><body><img src="${url}" alt="${safe(source.name)}"></body></html>`,source.name||'Imagen');
    setTimeout(()=>URL.revokeObjectURL(url),120000);
    return;
  }
  if(type==='application/pdf'&&typeof window.__ccOpenInAppDocument==='function'){
    window.__ccOpenInAppDocument(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,iframe{margin:0;width:100%;height:100%;border:0}</style></head><body><iframe src="${url}"></iframe></body></html>`,source.name||'PDF');
    setTimeout(()=>URL.revokeObjectURL(url),120000);
    return;
  }
  const a=document.createElement('a');
  a.href=url;
  a.download=source.name||'archivo';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}

function decorate(){
  let screen='';try{screen=view?.screen||''}catch{}
  if(screen!=='transparency')return;
  const r=record(),list=document.querySelector('.tr-source-list');
  if(!r||!list)return;
  const sig=A(r.sources).map(s=>`${s.id||s.name}:${s.storagePath||''}:${s.size||0}`).join('|');
  if(list.dataset.storageSig===sig)return;
  list.dataset.storageSig=sig;
  if(!r.sources.length){list.innerHTML='<span class="muted">Todavía no hay archivos fuente registrados en este periodo.</span>';return}
  list.innerHTML=A(r.sources).map(s=>`<span class="tr-source-chip" data-source-id="${String(s.id||'')}"><span>${String(s.name||'Archivo').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}${s.storagePath?' · NUBE':' · SOLO REFERENCIA'}</span>${s.storagePath?'<button type="button" data-tr-open-stored>Ver</button>':''}</span>`).join('');
}

function injectCss(){
  if(document.getElementById('cc-transparency-storage-style'))return;
  const s=document.createElement('style');
  s.id='cc-transparency-storage-style';
  s.textContent=`.tr-source-chip{display:inline-flex!important;align-items:center;gap:6px}.tr-source-chip button{border:0;background:#587747;color:#fff;border-radius:999px;padding:4px 8px;font-size:8px;font-weight:800;cursor:pointer}.tr-source-chip button:active{transform:translateY(1px)}`;
  document.head.appendChild(s);
}

document.addEventListener('change',async e=>{
  const input=e.target;
  if(!(input instanceof HTMLInputElement)||input.id!=='trFiles')return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const files=A([...input.files||[]]);
  if(!files.length)return;
  const r=record();
  if(!r)return say('No se encontró el periodo de Transparencia activo.');
  input.disabled=true;
  say(`Cargando ${files.length} archivo${files.length===1?'':'s'} a la nube…`);
  let ok=0;
  try{
    for(const file of files){
      const meta=await upload(file);
      r.sources=A(r.sources);
      r.sources.push(meta);
      ok++;
    }
    r.updatedAt=now();
    if(typeof saveDB==='function')saveDB();
    say(`${ok} archivo${ok===1?'':'s'} guardado${ok===1?'':'s'} realmente en Supabase.`);
    const month=document.getElementById('trMonth');
    if(month)month.dispatchEvent(new Event('change',{bubbles:true}));
    else decorate();
  }catch(err){
    console.error(err);
    r.updatedAt=now();
    if(typeof saveDB==='function')saveDB();
    say(err.message||'No se pudo completar la carga de archivos.');
    decorate();
  }finally{
    input.disabled=false;
    input.value='';
  }
},true);

document.addEventListener('click',async e=>{
  const b=e.target.closest?.('[data-tr-open-stored]');
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  const chip=b.closest('[data-source-id]'),r=record();
  const s=A(r?.sources).find(x=>String(x.id||'')===String(chip?.dataset.sourceId||''));
  if(!s)return;
  b.disabled=true;
  try{await downloadSource(s)}catch(err){console.error(err);say(err.message||'No se pudo abrir el archivo.')}finally{b.disabled=false}
},true);

injectCss();
let q=false;
new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;decorate()})}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(decorate,0);setTimeout(decorate,400);
})();