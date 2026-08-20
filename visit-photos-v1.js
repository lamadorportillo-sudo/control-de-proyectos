/* ===== FOTOGRAFIAS DE VISITAS V2 ===== */
(()=>{
'use strict';
if(window.__CC_VISIT_PHOTOS_V2__)return;
window.__CC_VISIT_PHOTOS_V2__=true;

const A=v=>Array.isArray(v)?v:[];
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const say=m=>{try{toast(m)}catch{console.log(m)}};
const MAX_PHOTOS=20,MAX_DIM=1280,TARGET_BYTES=180000;
let pendingPhotoSave=null;

function photoSrc(p){
  if(typeof p==='string')return p;
  return String(p?.src||p?.url||p?.dataUrl||p?.data_url||p?.image||'');
}
function normalizePhoto(p,i=0){
  if(typeof p==='string')return{id:`legacy_${i}`,name:`Fotografía ${i+1}`,src:p,createdAt:''};
  if(!p||typeof p!=='object')return null;
  const src=photoSrc(p);
  return{...p,id:p.id||`legacy_${i}`,name:p.name||p.filename||`Fotografía ${i+1}`,src};
}
function visitPhotos(v){
  const raw=A(v?.photos).length?A(v.photos):A(v?.images).length?A(v.images):A(v?.evidencePhotos).length?A(v.evidencePhotos):[];
  return raw.map(normalizePhoto).filter(Boolean);
}
function css(){
  if(document.getElementById('cc-visit-photo-style'))return;
  const s=document.createElement('style');s.id='cc-visit-photo-style';s.textContent=`
.cc-photo-field{grid-column:1/-1;border:1px solid #d7e2ed;background:#f7fafc;border-radius:12px;padding:12px}.cc-photo-field>span{display:block;font-size:12px;font-weight:800;color:#27435e;margin-bottom:6px}.cc-photo-help{display:block;color:#6c8297;font-size:10px;margin:5px 0 9px}.cc-photo-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:9px}.cc-photo-card{position:relative;border:1px solid #cedae6;background:#fff;border-radius:11px;overflow:hidden;min-height:110px}.cc-photo-card img{display:block;width:100%;aspect-ratio:4/3;object-fit:contain;background:#f3f6f9}.cc-photo-card .cc-photo-meta{padding:7px 8px;font-size:9px;color:#72869a;line-height:1.35}.cc-photo-card .cc-photo-meta b{display:block;color:#233c55;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cc-photo-remove{position:absolute;right:6px;top:6px;width:28px;height:28px;border:1px solid rgba(0,0,0,.15);border-radius:50%;background:rgba(255,255,255,.94);color:#b4232f;font-weight:900;z-index:2}.cc-photo-empty{grid-column:1/-1;border:1px dashed #c5d4e2;border-radius:10px;padding:13px;text-align:center;color:#71869a;font-size:10px}.cc-photo-btn{white-space:nowrap}.cc-photo-view{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}.cc-photo-view .cc-photo-card img{cursor:zoom-in}.cc-photo-pending{display:grid;place-items:center;aspect-ratio:4/3;padding:12px;text-align:center;color:#7e91a3;background:#f3f6f9;font-size:10px}.cc-photo-full{position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.92);display:grid;place-items:center;padding:18px}.cc-photo-full img{max-width:96vw;max-height:92vh;object-fit:contain}.cc-photo-full button{position:absolute;right:15px;top:15px;width:42px;height:42px;border:1px solid #526175;border-radius:50%;background:#111b28;color:#fff;font-size:22px}.cc-photo-saving{opacity:.7;pointer-events:none}
@media(max-width:520px){.cc-photo-gallery{grid-template-columns:repeat(2,minmax(0,1fr))}.cc-photo-view{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s);
}
function bytesFromDataUrl(src){const i=String(src||'').indexOf(',');return i<0?0:Math.floor((src.length-i-1)*.75)}
function fmtBytes(n){if(!n)return'';return n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(0)} KB`:`${(n/1048576).toFixed(1)} MB`}
function loadImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>resolve(im);im.src=r.result};r.readAsDataURL(file)})}
function renderCanvas(im,w,h,q){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{alpha:false});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);return c.toDataURL('image/jpeg',q)}
async function optimize(file){
  const im=await loadImage(file);let scale=Math.min(1,MAX_DIM/Math.max(im.naturalWidth||im.width,im.naturalHeight||im.height)),w=Math.max(1,Math.round((im.naturalWidth||im.width)*scale)),h=Math.max(1,Math.round((im.naturalHeight||im.height)*scale)),q=.86,src=renderCanvas(im,w,h,q),size=bytesFromDataUrl(src);
  while(size>TARGET_BYTES&&q>.62){q-=.04;src=renderCanvas(im,w,h,q);size=bytesFromDataUrl(src)}
  if(size>TARGET_BYTES&&Math.max(w,h)>1000){scale=1000/Math.max(w,h);w=Math.round(w*scale);h=Math.round(h*scale);q=.72;src=renderCanvas(im,w,h,q);size=bytesFromDataUrl(src)}
  return{id:(typeof uid==='function'?uid():crypto.randomUUID()),name:String(file.name||'foto').replace(/\.[^.]+$/,'')+'.jpg',src,width:w,height:h,size,originalSize:file.size||0,capturedAt:'',createdAt:new Date().toISOString(),optimized:true};
}
function photoCard(p,editable=false){const src=photoSrc(p);return `<article class="cc-photo-card" data-photo-id="${H(p?.id||'')}">${editable?`<button type="button" class="cc-photo-remove" data-photo-remove="${H(p?.id||'')}" title="Quitar fotografía">×</button>`:''}${src?`<img src="${H(src)}" alt="Evidencia fotográfica de la visita" loading="eager" data-photo-zoom>`:`<div class="cc-photo-pending">Fotografía registrada<br>sin archivo de imagen disponible</div>`}<div class="cc-photo-meta"><b>${H(p?.name||'Fotografía')}</b>${p?.capturedAt?`${H(new Date(p.capturedAt).toLocaleString('es-HN'))}<br>`:''}${p?.size?`Optimizada · ${H(fmtBytes(p.size))}`:(p?.status?H(p.status):'')}</div></article>`}
function preview(form){
  const box=form.querySelector('[data-photo-preview]');if(!box)return;const photos=A(form.__ccVisitPhotos);
  box.innerHTML=photos.length?photos.map(p=>photoCard(p,true)).join(''):'<div class="cc-photo-empty">Todavía no hay fotografías adjuntas.</div>';
  box.querySelectorAll('[data-photo-remove]').forEach(b=>b.onclick=()=>{form.__ccVisitPhotos=A(form.__ccVisitPhotos).filter(x=>String(x.id)!==String(b.dataset.photoRemove));preview(form)});
}
function currentVisitForForm(form){
  try{
    const pid=view?.projectId,number=Number(form.querySelector('#vNumber')?.value||0);
    return A(db?.visits).find(v=>v.projectId===pid&&Number(v.number)===number)||null;
  }catch{return null}
}
function applyPendingPhotos(){
  if(!pendingPhotoSave)return;
  try{
    const q=pendingPhotoSave;
    let v=q.visitId?A(db?.visits).find(x=>x.id===q.visitId):null;
    if(!v)v=A(db?.visits).find(x=>x.projectId===q.projectId&&Number(x.number)===Number(q.number));
    if(!v)return;
    v.photos=A(q.photos).map((x,i)=>normalizePhoto(x,i)).filter(Boolean);
    v.photoCount=v.photos.length;
    v.photoCompression={maxDimension:MAX_DIM,targetBytes:TARGET_BYTES,format:'JPEG',mode:'proporcional-sin-recorte',updatedAt:new Date().toISOString()};
    v.updatedAt=typeof iso==='function'?iso():new Date().toISOString();
    if(typeof audit==='function')audit('ACTUALIZAR','Fotografías de visita',v.id,{projectId:q.projectId,visitNumber:q.number,photoCount:v.photos.length});
    pendingPhotoSave=null;
  }catch(e){console.error('No se pudieron vincular las fotografías a la visita',e)}
}
function installSaveHook(){
  if(typeof saveDB!=='function'||saveDB.__ccVisitPhotosV2)return;
  const base=saveDB;
  const wrapped=function(){applyPendingPhotos();return base.apply(this,arguments)};
  wrapped.__ccVisitPhotosV2=true;saveDB=wrapped;
}
function enhanceForm(form){
  if(!form||form.dataset.ccPhotosV2==='1')return;form.dataset.ccPhotosV2='1';
  const existing=currentVisitForForm(form);form.__ccVisitExistingId=existing?.id||'';form.__ccVisitPhotos=visitPhotos(existing).map(x=>({...x}));
  const actions=form.querySelector('.modal-actions');if(!actions)return;
  const field=document.createElement('div');field.className='cc-photo-field';field.innerHTML=`<span>Fotografías de la visita</span><input id="vPhotos" type="file" accept="image/*" multiple><small class="cc-photo-help">Puedes adjuntar hasta ${MAX_PHOTOS} fotografías. Se optimizan automáticamente para que queden guardadas con la visita y puedan salir en el informe e impresión.</small><div class="cc-photo-gallery" data-photo-preview></div>`;actions.before(field);preview(form);
  const input=field.querySelector('#vPhotos');input.onchange=async()=>{
    const files=[...input.files||[]];if(!files.length)return;const room=Math.max(0,MAX_PHOTOS-form.__ccVisitPhotos.length);if(!room){say(`Máximo ${MAX_PHOTOS} fotografías por visita.`);input.value='';return}
    field.classList.add('cc-photo-saving');say('Procesando fotografías…');
    try{for(const f of files.slice(0,room)){if(!/^image\//i.test(f.type||''))continue;form.__ccVisitPhotos.push(await optimize(f))}preview(form);say(`${form.__ccVisitPhotos.length} fotografía${form.__ccVisitPhotos.length===1?'':'s'} lista${form.__ccVisitPhotos.length===1?'':'s'} para guardar.`)}catch(e){console.error(e);say('No se pudo procesar una de las fotografías.')}finally{field.classList.remove('cc-photo-saving');input.value=''}
  };
  form.addEventListener('submit',()=>{
    pendingPhotoSave={projectId:view?.projectId||'',visitId:form.__ccVisitExistingId||'',number:Number(form.querySelector('#vNumber')?.value||0),photos:A(form.__ccVisitPhotos).map(x=>({...x}))};
  },true);
}
function openViewer(v){
  const photos=visitPhotos(v);const content=photos.length?`<div class="cc-photo-view">${photos.map(p=>photoCard(p,false)).join('')}</div>`:'<div class="empty">Esta visita no tiene fotografías guardadas.</div>';let m;try{m=openModal(`Fotografías · Visita N.º ${v.number}`,content)}catch{return}
  m.querySelectorAll('[data-photo-zoom]').forEach(im=>im.onclick=()=>{const full=document.createElement('div');full.className='cc-photo-full';full.innerHTML=`<button type="button" aria-label="Cerrar">×</button><img src="${H(im.src)}" alt="Fotografía ampliada">`;document.body.appendChild(full);full.onclick=e=>{if(e.target===full||e.target.tagName==='BUTTON')full.remove()}})
}
function rowVisitNumber(tr){const t=tr.querySelector('td')?.textContent||'';const m=t.match(/\d+/);return m?Number(m[0]):0}
function decorateVisitTable(){
  let pid;try{pid=view?.projectId}catch{return}if(!pid)return;
  document.querySelectorAll('#tabBody .table tbody tr').forEach(tr=>{
    const number=rowVisitNumber(tr);if(!number)return;const v=A(db?.visits).find(x=>x.projectId===pid&&Number(x.number)===number);if(!v)return;
    const cells=tr.querySelectorAll('td'),cell=cells[cells.length-1];if(!cell)return;
    let b=cell.querySelector('[data-cc-photo-view]');if(!b){b=document.createElement('button');b.type='button';b.className='btn cc-photo-btn';b.dataset.ccPhotoView='1';cell.append(' ',b)}
    b.textContent=`Fotos (${visitPhotos(v).filter(p=>photoSrc(p)).length})`;b.onclick=()=>openViewer(v);
  })
}
function run(){css();installSaveHook();const f=document.getElementById('visitForm');if(f)enhanceForm(f);decorateVisitTable()}
const mo=new MutationObserver(()=>queueMicrotask(run));mo.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-edit-visit],#newVisit,[data-visit-obs]'))setTimeout(run,0)},true);
run();
})();