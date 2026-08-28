/* ===== PERSISTENCIA ROBUSTA DE FOTOGRAFIAS DE VISITAS V2 ===== */
(()=>{
'use strict';
if(window.__CC_VISIT_PHOTO_PERSIST_V2__)return;
window.__CC_VISIT_PHOTO_PERSIST_V2__=true;
const A=v=>Array.isArray(v)?v:[];
const BASE=new URL('.',document.currentScript?.src||location.href).href;
let pending=null;
function srcOf(p){if(typeof p==='string')return p;return String(p?.src||p?.url||p?.dataUrl||p?.data_url||p?.image||'')}
function normalize(p,i=0){if(typeof p==='string')return{id:`legacy_${i}`,name:`Fotografía ${i+1}`,src:p};if(!p||typeof p!=='object')return null;return{...p,id:p.id||`legacy_${i}`,name:p.name||p.filename||`Fotografía ${i+1}`,src:srcOf(p)}}
function photosOf(v){const raw=A(v?.photos).length?A(v.photos):A(v?.images).length?A(v.images):A(v?.evidencePhotos);return raw.map(normalize).filter(Boolean)}
window.__ccVisitPhotoList=photosOf;
function applyPending(){
 if(!pending)return false;
 try{
  let v=pending.visitId?A(db?.visits).find(x=>x.id===pending.visitId):null;
  if(!v)v=A(db?.visits).find(x=>x.projectId===pending.projectId&&Number(x.number)===Number(pending.number));
  if(!v)return false;
  v.photos=A(pending.photos).map(normalize).filter(Boolean);
  v.photoCount=v.photos.filter(x=>srcOf(x)).length;
  v.updatedAt=typeof iso==='function'?iso():new Date().toISOString();
  pending=null;
  return true;
 }catch(e){console.error('Error guardando fotografías de la visita',e);return false}
}
function hookSave(){
 if(typeof saveDB!=='function'||saveDB.__ccPhotoPersistV2)return;
 const base=saveDB;
 const wrapped=function(){applyPending();return base.apply(this,arguments)};
 wrapped.__ccPhotoPersistV2=true;
 saveDB=wrapped;
}
function loadIndependentVisitReports(){
 if(window.__CC_VISIT_INDEPENDENT_REPORTS_V1__||document.querySelector('script[data-cc-visit-independent-reports]'))return;
 const s=document.createElement('script');
 s.src=BASE+'visit-independent-reports-v1.js?v=20260827-community1';
 s.async=false;
 s.dataset.ccVisitIndependentReports='1';
 s.onerror=()=>console.warn('No se pudo cargar el módulo de informes independientes de visitas.');
 (document.body||document.documentElement).appendChild(s);
}
document.addEventListener('submit',e=>{
 const form=e.target;if(!form||form.id!=='visitForm')return;
 const pid=typeof view!=='undefined'?view.projectId:'';
 const number=Number(form.querySelector('#vNumber')?.value||0);
 const existing=A(db?.visits).find(x=>x.projectId===pid&&Number(x.number)===number);
 const formPhotos=A(form.__ccVisitPhotos);
 pending={projectId:pid,visitId:existing?.id||'',number,photos:(formPhotos.length?formPhotos:photosOf(existing)).map((x,i)=>normalize(x,i)).filter(Boolean)};
 hookSave();
},true);
const mo=new MutationObserver(()=>hookSave());mo.observe(document.documentElement,{subtree:true,childList:true});
hookSave();
setTimeout(loadIndependentVisitReports,0);
})();