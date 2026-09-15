/* CONTROL CONTRACTUAL · HERO INDUSTRIAL CON FOTOGRAFÍAS REALES V1
   Paso 2/30: portada con identidad de ingeniería. Usa fotografías ya registradas
   en proyectos/visitas/documentos del sistema y cambia la fotografía al abrir. */
(()=>{
'use strict';
if(window.__CC_HOME_INDUSTRIAL_HERO_V1__)return;
window.__CC_HOME_INDUSTRIAL_HERO_V1__=true;

const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const LAST_KEY='cc_home_hero_last_v1';
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let queued=false,working=false;

function safeDB(){try{return typeof db!=='undefined'&&db?db:{}}catch{return{}}}
function arr(v){return Array.isArray(v)?v:[]}
function currentRoute(){
  try{
    const active=String(Q('#ccSidebar .cc-side-btn.active[data-route]')?.dataset?.route||'').toLowerCase();
    if(active)return active;
    return String(document.body?.dataset?.ccMainRoute||window.__ccMainRoute||localStorage.getItem('cc_main_route_v2')||'').toLowerCase()
  }
  catch{return''}
}
function validSrc(value){
  const s=String(value||'').trim();
  if(!s)return'';
  if(/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(s))return s;
  if(/^blob:/i.test(s))return s;
  if(/^https?:\/\//i.test(s))return s;
  if(/^\.{0,2}\//.test(s))return s;
  return'';
}
function firstSrc(obj){
  if(!obj||typeof obj!=='object')return'';
  for(const key of ['src','url','publicUrl','public_url','signedUrl','signed_url','dataUrl','data_url','downloadUrl','download_url','imageUrl','image_url','coverImage','cover_image']){
    const s=validSrc(obj[key]);if(s)return s;
  }
  return'';
}
function imageLike(obj){
  const mime=String(obj?.mime_type||obj?.mimeType||obj?.type||'').toLowerCase();
  const name=String(obj?.name||obj?.file_name||obj?.fileName||'').toLowerCase();
  return /^image\//.test(mime)||/\.(?:jpe?g|png|webp)$/i.test(name)||!!firstSrc(obj);
}
function projectMeta(id,map){
  const p=map.get(String(id||''))||{};
  return{
    projectId:p.id||id||'',
    project:p.name||p.shortName||p.code||'Proyecto municipal',
    code:p.code||p.contractCode||'',
    location:p.location||p.community||p.neighborhood||''
  };
}
function add(out,seen,obj,meta={}){
  if(!obj||!imageLike(obj))return;
  const src=firstSrc(obj);if(!src||seen.has(src))return;
  seen.add(src);
  out.push({
    src,
    projectId:meta.projectId||'',
    project:meta.project||'Proyecto municipal',
    code:meta.code||'',
    location:meta.location||'',
    caption:String(obj.caption||obj.title||obj.description||obj.analysis?.summary||obj.extracted_text||'Evidencia fotográfica registrada').trim(),
    date:obj.capturedAt||obj.captured_at||obj.date||obj.createdAt||obj.created_at||''
  });
}
function collect(){
  const d=safeDB(),out=[],seen=new Set(),projects=new Map();
  arr(d.projects).forEach(p=>projects.set(String(p.id||''),p));

  for(const p of arr(d.projects)){
    const meta=projectMeta(p.id,projects);
    const raw=p.rawData||p.raw_data||{};
    for(const item of [
      p.coverImage,p.cover_image,p.image,p.photo,
      ...arr(p.images),...arr(p.photos),
      raw.coverImage,raw.cover_image,raw.image,raw.photo,
      ...arr(raw.images),...arr(raw.photos)
    ])add(out,seen,typeof item==='string'?{src:item}:item,meta);
  }

  for(const v of arr(d.visits)){
    const meta=projectMeta(v.projectId||v.project_id,projects);
    const raw=v.rawData||v.raw_data||{};
    const photos=[...arr(v.photos),...arr(raw.photos),...arr(v.evidence),...arr(raw.evidence)];
    photos.forEach(p=>add(out,seen,p,{...meta,caption:p?.caption||v.summary||v.objective||''}));
  }

  for(const doc of arr(d.documents)){
    if(!imageLike(doc))continue;
    const meta=projectMeta(doc.projectId||doc.project_id,projects);
    add(out,seen,doc,meta);
  }
  return out;
}
function randomIndex(items){
  if(!items.length)return-1;
  if(items.length===1)return 0;
  let last=-1;try{last=Number(localStorage.getItem(LAST_KEY))}catch{}
  let n;
  if(window.crypto?.getRandomValues){
    const a=new Uint32Array(1);crypto.getRandomValues(a);n=a[0]%items.length;
  }else n=Math.floor(Math.random()*items.length);
  if(n===last)n=(n+1)%items.length;
  try{localStorage.setItem(LAST_KEY,String(n))}catch{}
  return n;
}
function ensureStyle(){
  if(Q('#cc-home-industrial-hero-style-v1'))return;
  const s=document.createElement('style');s.id='cc-home-industrial-hero-style-v1';s.textContent=`
body.cc-portal-v2:not(.print-report) #content .cc-home-hero-v7.cc-industrial-home-v1{
  position:relative!important;display:block!important;overflow:hidden!important;isolation:isolate!important;
  min-height:320px!important;padding:0!important;border:1px solid #28465f!important;border-radius:16px!important;
  background:#071522!important;box-shadow:0 22px 55px rgba(5,18,31,.28)!important;
}
#content .cc-industrial-photo-v1{position:absolute;inset:0;z-index:0;background:linear-gradient(135deg,#0a2238,#123655)}
#content .cc-industrial-photo-v1 img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;transition:opacity .28s ease}
#content .cc-industrial-shade-v1{position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,16,27,.94) 0%,rgba(4,16,27,.78) 38%,rgba(4,16,27,.28) 69%,rgba(4,16,27,.16) 100%)}
#content .cc-industrial-grid-v1{position:absolute;inset:0;opacity:.12;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:36px 36px;mask-image:linear-gradient(90deg,#000,transparent 70%)}
#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-copy-v7{position:relative;z-index:3;width:min(720px,70%);padding:36px 40px 34px!important}
#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-chip-v7{color:#92d9ff!important;letter-spacing:.22em!important;font-size:10px!important}
#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-copy-v7 h2{max-width:700px!important;margin:10px 0 12px!important;font-size:clamp(30px,3.4vw,50px)!important;line-height:1.02!important;letter-spacing:-.035em!important;color:#fff!important;text-shadow:0 3px 24px rgba(0,0,0,.28)}
#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-copy-v7 p{max-width:640px!important;margin:0!important;color:#e5eef6!important;font-size:clamp(13px,1vw,16px)!important;line-height:1.5!important}
#content .cc-industrial-actions-v1{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
#content .cc-industrial-actions-v1 button{min-width:150px;border-radius:9px;padding:11px 16px;font-weight:850;border:1px solid rgba(255,255,255,.45);background:rgba(7,24,39,.34);color:#fff;backdrop-filter:blur(8px)}
#content .cc-industrial-actions-v1 button.primary{background:#1597e5;border-color:#1597e5}
#content .cc-industrial-caption-v1{display:none!important}
#content .cc-industrial-caption-v1 small{display:block;color:#b8d4e7;font-size:9px;text-transform:uppercase;letter-spacing:.09em;margin-bottom:3px}
#content .cc-industrial-caption-v1 b{display:block;font-size:12px;line-height:1.3}
#content .cc-industrial-caption-v1 span{display:block;color:#c9d8e3;font-size:9px;margin-top:3px}
#content .cc-industrial-arrows-v1{position:absolute;z-index:5;right:24px;top:98px;display:flex;gap:7px}
#content .cc-industrial-arrows-v1 button{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.45);background:rgba(4,17,29,.58);color:#fff;font-size:18px;display:grid;place-items:center}
#content .cc-industrial-film-v1{display:none!important}
#content .cc-industrial-thumb-v1{position:relative;width:92px;height:58px;padding:0;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,.5);background:#0b2133}
#content .cc-industrial-thumb-v1 img{width:100%;height:100%;object-fit:cover;display:block}
#content .cc-industrial-thumb-v1.active{outline:2px solid #35baff;outline-offset:1px}
#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-stats-v7{display:none!important}
#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-stats-v7 article{background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:10px!important;padding:9px 11px!important;min-width:0}
#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-stats-v7 small,#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-stats-v7 span{color:#b9ccda!important}
#content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-stats-v7 strong{color:#fff!important}
#content .cc-industrial-no-photo-v1{position:absolute;z-index:2;right:16px;bottom:14px;color:#b7c8d4;font-size:9px;background:rgba(4,17,29,.62);padding:6px 8px;border-radius:8px}
@media(max-width:900px){
 #content .cc-home-hero-v7.cc-industrial-home-v1{min-height:340px!important}
 #content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-copy-v7{width:100%;padding:30px 24px 26px!important}
 #content .cc-industrial-arrows-v1{display:none!important}
}
@media(max-width:580px){
 #content .cc-home-hero-v7.cc-industrial-home-v1{min-height:360px!important;border-radius:13px!important}
 #content .cc-industrial-shade-v1{background:linear-gradient(180deg,rgba(4,16,27,.88),rgba(4,16,27,.58) 58%,rgba(4,16,27,.82))}
 #content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-copy-v7{padding:26px 18px 24px!important}
 #content .cc-home-hero-v7.cc-industrial-home-v1 .cc-home-copy-v7 h2{font-size:32px!important}
}
@media(prefers-reduced-motion:reduce){#content .cc-industrial-photo-v1 img{transition:none!important}}
`;
  document.head.appendChild(s);
}
function nav(route){
  const b=Q('#ccSidebar [data-route="'+route+'"]');if(b){b.click();return true}
  return false;
}
function build(hero){
  if(hero.dataset.ccIndustrialReady==='1')return;
  hero.dataset.ccIndustrialReady='1';
  hero.classList.add('cc-industrial-home-v1');

  const copy=Q('.cc-home-copy-v7',hero);
  if(copy){
    const chip=Q('.cc-home-chip-v7',copy);if(chip)chip.textContent='CONTROL CONTRACTUAL · INFRAESTRUCTURA Y OBRA PÚBLICA';
    const h=Q('h2',copy);if(h)h.textContent='Control técnico y contractual.';
    const p=Q('p',copy);if(p)p.textContent='Proyectos, contratos, pagos, garantías y supervisión en un solo lugar.';
    if(!Q('.cc-industrial-actions-v1',copy)){
      const a=document.createElement('div');a.className='cc-industrial-actions-v1';
      a.innerHTML='<button class="primary" type="button" data-cc-industrial-route="proyectos">Ver proyectos →</button><button type="button" data-cc-industrial-route="transparencia">Transparencia</button>';
      copy.appendChild(a);
      QA('[data-cc-industrial-route]',a).forEach(b=>b.onclick=()=>nav(b.dataset.ccIndustrialRoute));
    }
  }

  const stage=document.createElement('div');stage.className='cc-industrial-photo-v1';
  stage.innerHTML='<img alt="" decoding="async"><div class="cc-industrial-shade-v1"></div><div class="cc-industrial-grid-v1"></div>';
  hero.insertBefore(stage,hero.firstChild);

  const caption=document.createElement('div');caption.className='cc-industrial-caption-v1';caption.hidden=true;hero.appendChild(caption);
  const arrows=document.createElement('div');arrows.className='cc-industrial-arrows-v1';arrows.hidden=true;arrows.innerHTML='<button type="button" aria-label="Fotografía anterior">‹</button><button type="button" aria-label="Fotografía siguiente">›</button>';hero.appendChild(arrows);
  const film=document.createElement('div');film.className='cc-industrial-film-v1';hero.appendChild(film);
}
function refresh(hero){
  const items=collect(),stage=Q('.cc-industrial-photo-v1 img',hero),caption=Q('.cc-industrial-caption-v1',hero),arrows=Q('.cc-industrial-arrows-v1',hero),film=Q('.cc-industrial-film-v1',hero);
  const sig=items.map(x=>x.src.slice(0,80)).join('|');
  if(hero.dataset.ccIndustrialSig===sig&&hero.dataset.ccIndustrialApplied==='1')return;
  hero.dataset.ccIndustrialSig=sig;hero.dataset.ccIndustrialApplied='1';
  QA('.cc-industrial-no-photo-v1',hero).forEach(x=>x.remove());

  if(!items.length){
    if(stage){stage.removeAttribute('src');stage.alt=''}
    caption.hidden=true;arrows.hidden=true;film.innerHTML='';
    const note=document.createElement('div');note.className='cc-industrial-no-photo-v1';note.textContent='La portada usará fotografías reales cuando existan evidencias de imagen registradas.';hero.appendChild(note);
    return;
  }

  let current=randomIndex(items);
  function apply(index,remember=false){
    current=(index+items.length)%items.length;
    const item=items[current];
    if(stage){stage.src=item.src;stage.alt='Fotografía de '+(item.project||'proyecto municipal')}
    caption.hidden=false;
    caption.innerHTML='<small>Fotografía registrada en Control Contractual</small><b>'+H(item.project)+'</b><span>'+H([item.code,item.location].filter(Boolean).join(' · ')||item.caption||'Evidencia fotográfica')+'</span>';
    QA('.cc-industrial-thumb-v1',film).forEach((b,i)=>b.classList.toggle('active',Number(b.dataset.photoIndex)===current));
    if(remember)try{localStorage.setItem(LAST_KEY,String(current))}catch{}
  }

  arrows.hidden=items.length<2;
  const buttons=QA('button',arrows);
  if(buttons[0])buttons[0].onclick=()=>apply(current-1,true);
  if(buttons[1])buttons[1].onclick=()=>apply(current+1,true);

  film.innerHTML='';
  const thumbIndices=[];
  for(let k=0;k<Math.min(4,items.length);k++)thumbIndices.push((current+k)%items.length);
  thumbIndices.forEach(index=>{
    const item=items[index],b=document.createElement('button');b.type='button';b.className='cc-industrial-thumb-v1';b.dataset.photoIndex=String(index);b.title=item.project||'Fotografía';
    const img=document.createElement('img');img.src=item.src;img.alt='';img.loading='lazy';b.appendChild(img);b.onclick=()=>apply(index,true);film.appendChild(b);
  });
  apply(current);
}
function enhance(){
  if(working)return;working=true;
  try{
    if(currentRoute()!=='inicio')return;
    ensureStyle();
    const hero=Q('#content .cc-home-hero-v7');if(!hero)return;
    build(hero);refresh(hero);
  }finally{working=false}
}
function queue(){
  if(queued)return;queued=true;
  const run=()=>{queued=false;enhance()};
  (window.requestAnimationFrame||setTimeout)(run);
}
if(NativeObserver)new NativeObserver(queue).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:data-changed',()=>setTimeout(enhance,60));
window.addEventListener('pageshow',()=>setTimeout(enhance,60));
setTimeout(enhance,0);setTimeout(enhance,450);setTimeout(enhance,1300);
})();
