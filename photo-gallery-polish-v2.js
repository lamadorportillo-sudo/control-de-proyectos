/* ===== GALERIA FOTOGRAFICA PROFESIONAL V2 ===== */
(()=>{
'use strict';
if(window.__CC_PHOTO_GALLERY_POLISH_V2__)return;
window.__CC_PHOTO_GALLERY_POLISH_V2__=true;

function css(){
 if(document.getElementById('cc-photo-gallery-polish-v2-style'))return;
 const s=document.createElement('style');s.id='cc-photo-gallery-polish-v2-style';s.textContent=`
 .project-photo-story{overflow:visible!important;background:#fff!important}
 .project-photo-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important;background:transparent!important;border-top:1px solid #e5ebe2!important;padding:14px 16px 16px!important}
 .project-photo-item{aspect-ratio:4/3!important;min-height:0!important;border:1px solid #dfe6dc!important;border-radius:14px!important;background:linear-gradient(135deg,#eef2ec,#e4eae1)!important;box-shadow:0 6px 18px rgba(31,50,35,.07)!important;overflow:hidden!important;isolation:isolate!important}
 .project-photo-item img{width:100%!important;height:100%!important;min-height:0!important;object-fit:cover!important;object-position:center!important;display:block!important;image-orientation:from-image!important;transform:none!important;transition:transform .22s ease!important}
 .project-photo-item:hover img{transform:scale(1.02)!important}
 .project-photo-item:after{inset:48% 0 0!important;background:linear-gradient(180deg,transparent,rgba(8,23,12,.78))!important}
 .project-photo-caption{left:12px!important;right:12px!important;bottom:10px!important;text-shadow:0 1px 2px rgba(0,0,0,.3)!important}
 .project-photo-caption small{font-size:8px!important}.project-photo-caption b{font-size:10px!important}
 .project-photo-item.photo-broken{cursor:default!important;display:grid!important;place-items:center!important}
 .project-photo-item.photo-broken:after{display:none!important}.project-photo-item.photo-broken img{display:none!important}
 .project-photo-item.photo-broken .project-photo-caption{position:static!important;color:#66746a!important;text-align:center!important;text-shadow:none!important;padding:16px!important}
 .project-photo-item.photo-broken .project-photo-caption:before{content:'▧';display:block;width:48px;height:48px;line-height:48px;margin:0 auto 8px;border-radius:50%;background:#fff;color:#7c9270;font-size:22px;border:1px solid #d8e1d5!important}
 .project-photo-item.photo-broken .project-photo-caption small,.project-photo-item.photo-broken .project-photo-caption span{color:#7a887e!important}.project-photo-item.photo-broken .project-photo-caption b{color:#4a584f!important;white-space:normal!important}
 .project-v3-cover img{image-orientation:from-image!important;object-position:center!important}.project-v3-cover.photo-broken{display:grid!important;place-items:center!important;background:linear-gradient(135deg,#eef3eb,#dfe7dc)!important}.project-v3-cover.photo-broken img{display:none!important}.project-v3-cover.photo-broken:before{content:'▧';font-size:34px;color:#718768;position:absolute;inset:auto!important;background:none!important}.project-v3-cover.photo-broken .project-v3-cover-label{color:#50604f!important;text-shadow:none!important;background:rgba(255,255,255,.85)!important;border-radius:999px!important;padding:5px 8px!important}
 .project-photo-lightbox{display:flex!important;align-items:center!important;justify-content:center!important;backdrop-filter:blur(10px)!important}.project-photo-lightbox img{max-width:min(1200px,94vw)!important;max-height:88vh!important;width:auto!important;height:auto!important;object-fit:contain!important;image-orientation:from-image!important;background:#0d1510!important;box-shadow:0 24px 80px rgba(0,0,0,.5)!important}
 @media(max-width:960px){.project-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
 @media(max-width:620px){.project-photo-grid{grid-template-columns:1fr!important;padding:10px!important;gap:10px!important}.project-photo-item{aspect-ratio:16/11!important}}
 `;document.head.appendChild(s);
}
function markBroken(img){
 const item=img.closest('.project-photo-item,.project-v3-cover');if(!item)return;
 item.classList.add('photo-broken');
 if(item.classList.contains('project-photo-item')){
   const cap=item.querySelector('.project-photo-caption');
   if(cap){const b=cap.querySelector('b');if(b)b.textContent='Imagen no disponible';}
 }
}
function wire(root=document){
 css();
 root.querySelectorAll('.project-photo-item img,.project-v3-cover img').forEach(img=>{
   if(img.dataset.ccPhotoPolishBound)return;
   img.dataset.ccPhotoPolishBound='1';
   img.decoding='async';
   img.loading='lazy';
   img.addEventListener('error',()=>markBroken(img),{once:true});
   if(img.complete&&img.naturalWidth===0)markBroken(img);
 });
}
let q=false;function schedule(){if(q)return;q=true;requestAnimationFrame(()=>{q=false;wire()})}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement)markBroken(e.target)},true);
wire();setTimeout(wire,350);setTimeout(wire,1200);
})();