/* CONTROL CONTRACTUAL · PORTAFOLIO INDUSTRIAL DE PROYECTOS V1
   Paso 4/30: Proyectos deja de parecer el dashboard. Vista de búsqueda primero,
   sin cargar todos los expedientes al entrar y reutilizando la lógica existente. */
(()=>{
'use strict';
if(window.__CC_PROJECTS_INDUSTRIAL_V1__)return;
window.__CC_PROJECTS_INDUSTRIAL_V1__=true;

const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let busy=false,queued=false;

function safeDB(){try{return typeof db!=='undefined'&&db?db:{projects:[]}}catch{return{projects:[]}}}
function route(){
  try{return String(document.body?.dataset?.ccMainRoute||window.__ccMainRoute||localStorage.getItem('cc_main_route_v2')||'').toLowerCase()}
  catch{return''}
}
function activeProjects(){return (safeDB().projects||[]).filter(p=>!p.deletedAt&&!p.archivedAt&&!p.archived_at)}
function count(re){return activeProjects().filter(p=>re.test(String(p.status||''))).length}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function css(){
 if(Q('#cc-projects-industrial-v1-style'))return;
 const s=document.createElement('style');s.id='cc-projects-industrial-v1-style';s.textContent=`
body.cc-portal-v2[data-cc-main-route="proyectos"] #content{display:grid;gap:14px}
body.cc-portal-v2[data-cc-main-route="proyectos"] #content>.cc-dashboard-welcome-v4,
body.cc-portal-v2[data-cc-main-route="proyectos"] #content>.cc-home-hero-v7,
body.cc-portal-v2[data-cc-main-route="proyectos"] #content>.exec-overview,
body.cc-portal-v2[data-cc-main-route="proyectos"] #content>.cc-lifecycle-v4{display:none!important}
.cc-projects-industrial-head-v1{
 position:relative;overflow:hidden;border:1px solid rgba(72,155,214,.24);border-radius:16px;
 min-height:190px;padding:27px 30px;background:
 linear-gradient(90deg,rgba(3,22,38,.97),rgba(7,42,67,.90) 58%,rgba(8,50,78,.72)),
 repeating-linear-gradient(90deg,rgba(255,255,255,.022) 0 1px,transparent 1px 52px);
 box-shadow:0 20px 50px rgba(0,0,0,.18)
}
.cc-projects-industrial-head-v1:before{content:'';position:absolute;right:-70px;top:-100px;width:360px;height:360px;border:1px solid rgba(63,181,255,.16);border-radius:50%}
.cc-projects-industrial-head-v1:after{content:'';position:absolute;right:70px;bottom:-110px;width:260px;height:260px;border:1px dashed rgba(63,181,255,.12);border-radius:50%}
.cc-projects-industrial-head-v1 .cc-pi-copy{position:relative;z-index:2;max-width:760px}
.cc-projects-industrial-head-v1 .cc-pi-kicker{font-size:9px;letter-spacing:.20em;color:#6ec7ff;font-weight:900;text-transform:uppercase}
.cc-projects-industrial-head-v1 h2{font-size:clamp(27px,3vw,42px)!important;line-height:1.04!important;margin:8px 0 8px!important;color:#fff!important;letter-spacing:-.03em}
.cc-projects-industrial-head-v1 p{max-width:700px;margin:0;color:#b9cddd;font-size:12px;line-height:1.55}
.cc-projects-industrial-head-v1 .cc-pi-stats{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}
.cc-projects-industrial-head-v1 .cc-pi-stat{min-width:120px;border-left:2px solid #2aaef3;padding:5px 10px;background:rgba(255,255,255,.025)}
.cc-projects-industrial-head-v1 .cc-pi-stat small{display:block;color:#7f9db5;font-size:8px;text-transform:uppercase;letter-spacing:.08em}
.cc-projects-industrial-head-v1 .cc-pi-stat b{display:block;color:#fff;font-size:17px;margin-top:2px}
.cc-projects-industrial-head-v1 .cc-pi-quick{position:absolute;z-index:3;right:24px;top:24px;display:grid;gap:8px;width:190px}
.cc-projects-industrial-head-v1 .cc-pi-quick button{border:1px solid rgba(114,190,239,.25);background:rgba(7,30,48,.66);color:#dceefe;padding:10px 12px;border-radius:8px;text-align:left;font-weight:800;font-size:9px;backdrop-filter:blur(8px)}
.cc-projects-industrial-head-v1 .cc-pi-quick button.primary{background:#1678bd;border-color:#2faef3;color:#fff}
body.cc-portal-v2[data-cc-main-route="proyectos"] .projects-board{
 border-radius:16px!important;background:linear-gradient(180deg,#0a2034,#071827)!important;border-color:rgba(93,152,194,.20)!important;
 padding:0!important;overflow:hidden!important
}
body.cc-portal-v2[data-cc-main-route="proyectos"] .projects-board .board-head{padding:16px 18px 10px!important;border-bottom:1px solid rgba(126,164,194,.10)}
body.cc-portal-v2[data-cc-main-route="proyectos"] .projects-board .board-head h2{font-size:17px!important}
body.cc-portal-v2[data-cc-main-route="proyectos"] .projects-board .board-controls{padding:0 18px 14px!important}
body.cc-portal-v2[data-cc-main-route="proyectos"] .zordon-project-search{
 margin:0!important;border:0!important;border-radius:0!important;padding:18px!important;background:
 linear-gradient(90deg,rgba(14,57,88,.48),rgba(6,28,45,.14))!important;box-shadow:none!important
}
body.cc-portal-v2[data-cc-main-route="proyectos"] .zordon-project-search:before{
 content:'BUSCADOR PRINCIPAL DE EXPEDIENTES';display:block;color:#68bff2;font-size:8px;font-weight:900;letter-spacing:.16em;margin-bottom:7px
}
body.cc-portal-v2[data-cc-main-route="proyectos"] .zordon-project-search input,
body.cc-portal-v2[data-cc-main-route="proyectos"] #projectSearch{
 min-height:50px!important;border-radius:8px!important;font-size:14px!important;background:#061827!important;border:1px solid #285071!important;padding-left:15px!important
}
.cc-projects-search-hint-v1{padding:18px;border-top:1px solid rgba(132,170,199,.10);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;background:#081a2a}
.cc-projects-search-hint-v1 h3{margin:0 0 4px!important;color:#eef7ff!important;font-size:14px!important}
.cc-projects-search-hint-v1 p{margin:0;color:#8198ac;font-size:9px;line-height:1.45}
.cc-projects-search-hint-v1 .cc-pi-filter-row{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.cc-projects-search-hint-v1 button{border:1px solid #29455d;background:#0a2032;color:#b7c9d8;border-radius:999px;padding:7px 10px;font-size:8px;font-weight:850}
.cc-projects-search-hint-v1 button:hover{border-color:#3995d1;color:#fff}
body.cc-portal-v2[data-cc-main-route="proyectos"] .project-grid-v3{padding:14px 18px 18px!important;grid-template-columns:1fr!important;gap:8px!important}
body.cc-portal-v2[data-cc-main-route="proyectos"] .project-v3{
 border-radius:10px!important;background:linear-gradient(90deg,#0d263c,#0a1d30)!important;border:1px solid rgba(107,151,185,.16)!important;
 box-shadow:none!important;min-height:86px!important
}
body.cc-portal-v2[data-cc-main-route="proyectos"] .project-v3:hover{transform:translateX(2px)!important;border-color:rgba(70,170,229,.34)!important}
body.cc-portal-v2[data-cc-main-route="proyectos"] .project-v3 h3{font-size:13px!important}
body.cc-portal-v2[data-cc-main-route="proyectos"] .cc-portfolio-table-v4{padding:0!important}
body.cc-portal-v2[data-cc-main-route="proyectos"] .cc-pt-head{background:#0d2a43!important}
body.cc-portal-v2[data-cc-main-route="proyectos"] .cc-pt-row{background:#081b2c!important;border-bottom-color:rgba(125,166,198,.10)!important}
body.cc-portal-v2[data-cc-main-route="proyectos"] .cc-pt-row:hover{background:#0b2439!important}
@media(max-width:900px){.cc-projects-industrial-head-v1 .cc-pi-quick{position:relative;right:auto;top:auto;width:auto;margin-top:16px;grid-template-columns:1fr 1fr}.cc-projects-industrial-head-v1{padding:22px}.cc-projects-search-hint-v1{grid-template-columns:1fr}.cc-projects-search-hint-v1 .cc-pi-filter-row{justify-content:flex-start}}
@media(max-width:560px){.cc-projects-industrial-head-v1 .cc-pi-quick{grid-template-columns:1fr}.cc-projects-industrial-head-v1 .cc-pi-stats{display:grid;grid-template-columns:1fr 1fr}.cc-projects-search-hint-v1{padding:13px}}
`;
 document.head.appendChild(s);
}

function applyQuery(query){
 const value=String(query||'').trim();
 const search=Q('#zordonProjectSearch,[data-zordon-input],#projectSearch');
 if(search){search.value=value;search.dispatchEvent(new Event('input',{bubbles:true}));search.focus()}
 try{if(typeof view!=='undefined')view.search=value}catch{}
}
function header(content){
 if(Q('.cc-projects-industrial-head-v1',content))return;
 const h=document.createElement('section');h.className='cc-projects-industrial-head-v1';
 h.innerHTML=`<div class="cc-pi-copy"><span class="cc-pi-kicker">PORTAFOLIO TÉCNICO</span><h2>Localiza un proyecto. Abre su expediente. Trabaja.</h2><p>La vista de Proyectos no carga todo el portafolio al entrar. Busca por nombre, código, comunidad, ubicación o estado y abre únicamente el expediente que necesitas.</p><div class="cc-pi-stats"><div class="cc-pi-stat"><small>Registrados</small><b>${activeProjects().length}</b></div><div class="cc-pi-stat"><small>En ejecución</small><b>${count(/ejecuci/i)}</b></div><div class="cc-pi-stat"><small>Contratación</small><b>${count(/contrat|adjudic/i)}</b></div><div class="cc-pi-stat"><small>Finalizados</small><b>${count(/finaliz|cerrad/i)}</b></div></div></div><div class="cc-pi-quick"><button class="primary" type="button" data-pi-new>＋ Nuevo proyecto</button><button type="button" data-pi-focus>⌕ Buscar expediente</button></div>`;
 content.prepend(h);
 Q('[data-pi-new]',h)?.addEventListener('click',()=>{try{if(typeof projectModal==='function')projectModal()}catch{}});
 Q('[data-pi-focus]',h)?.addEventListener('click',()=>{Q('#zordonProjectSearch,[data-zordon-input],#projectSearch')?.focus()});
}
function hint(board){
 if(Q('.cc-projects-search-hint-v1',board))return;
 const search=Q('.zordon-project-search',board)||Q('#projectSearch',board)?.closest('.toolbar,.panel,.board-controls');
 if(!search)return;
 const box=document.createElement('div');box.className='cc-projects-search-hint-v1';
 box.innerHTML=`<div><h3>Busca antes de mostrar</h3><p>Evita cargar decenas de proyectos innecesariamente. Puedes escribir parte del nombre, código o lugar.</p></div><div class="cc-pi-filter-row"><button type="button" data-pi-q="En ejecución">En ejecución</button><button type="button" data-pi-q="Contratación">Contratación</button><button type="button" data-pi-q="Finalizado">Finalizados</button><button type="button" data-pi-q="">Limpiar</button></div>`;
 search.insertAdjacentElement('afterend',box);
 QA('[data-pi-q]',box).forEach(b=>b.onclick=()=>applyQuery(b.dataset.piQ||''));
}
function enhance(){
 if(busy||route()!=='proyectos')return;busy=true;
 try{
  css();
  const content=Q('#content'),board=Q('.projects-board',content);if(!content||!board)return;
  header(content);hint(board);
 }finally{busy=false}
}
function queue(){if(queued)return;queued=true;(window.requestAnimationFrame||setTimeout)(()=>{queued=false;enhance()})}
if(NativeObserver)new NativeObserver(queue).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:data-changed',()=>setTimeout(enhance,40));
setTimeout(enhance,0);setTimeout(enhance,350);setTimeout(enhance,1000);
})();
