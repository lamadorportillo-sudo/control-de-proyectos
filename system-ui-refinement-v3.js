/* ===== CONTROL CONTRACTUAL · REFINAMIENTO GENERAL DE INTERFAZ V5 · OBSERVADOR ESTABLE ===== */
(()=>{
'use strict';
if(window.__CC_SYSTEM_UI_REFINEMENT_V5__)return;
window.__CC_SYSTEM_UI_REFINEMENT_V5__=true;
window.__CC_SYSTEM_UI_REFINEMENT_V4__=true;

const STYLE_ID='cc-system-ui-refinement-v4-style';
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
function install(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* =========================================================
   TEMA PROFESIONAL OSCURO · ALTO CONTRASTE
   Mantiene reportes/impresiones fuera de estos cambios.
   ========================================================= */
html body:not(.print-report){
  color-scheme:dark!important;
  font-size:13px!important;line-height:1.42!important;
  background:
    radial-gradient(circle at 84% 5%,rgba(52,111,220,.16),transparent 30%),
    linear-gradient(160deg,#07101b 0%,#0a1522 48%,#08111c 100%)!important;
  color:#edf4fb!important;
}
html body:not(.print-report) .shell{width:min(100%,1580px)!important;max-width:1580px!important;padding:14px 18px 28px!important}
html body:not(.print-report) h1,
html body:not(.print-report) h2,
html body:not(.print-report) h3{color:#f4f8fc!important;text-shadow:none!important}
html body:not(.print-report) .eyebrow{color:#79a9ff!important;opacity:1!important}
html body:not(.print-report) .muted,
html body:not(.print-report) .notice,
html body:not(.print-report) .footer-note{color:#91a5ba!important;opacity:1!important}

/* CABECERA */
html body:not(.print-report) .topbar{
  padding:8px 10px!important;gap:8px!important;margin-bottom:10px!important;border-radius:13px!important;
  background:linear-gradient(135deg,#101d2d,#0b1522)!important;
  color:#edf4fb!important;border:1px solid #26384d!important;
  box-shadow:0 10px 28px rgba(0,0,0,.24)!important;
}
html body:not(.print-report) .brand{gap:8px!important}
html body:not(.print-report) .brand .logo{width:34px!important;height:34px!important;min-width:34px!important;border-radius:9px!important}
html body:not(.print-report) .topbar .brand h1{color:#f6f9fc!important;opacity:1!important}
html body:not(.print-report) .topbar .cloud-pill{background:#10271d!important;color:#b9f4d0!important;border-color:#24563a!important}
html body:not(.print-report) .topbar .cloud-pill small{color:#7fc89a!important}
html body:not(.print-report) .topbar .cloud-pill b{color:#c9f7da!important}
html body:not(.print-report) .topbar .userbox{background:#141f2c!important;color:#eef5fc!important;border-color:#314257!important}
html body:not(.print-report) .topbar .userbox b{color:#fff!important}
html body:not(.print-report) .topbar .userbox small{color:#a9bacb!important}

/* SUPERFICIES PRINCIPALES */
html body:not(.print-report) .panel,
html body:not(.print-report) .card,
html body:not(.print-report) .kpi,
html body:not(.print-report) .info,
html body:not(.print-report) .advance>div,
html body:not(.print-report) .project-context,
html body:not(.print-report) .exec-intro,
html body:not(.print-report) .exec-visual,
html body:not(.print-report) .exec-kpi,
html body:not(.print-report) .projects-board,
html body:not(.print-report) .rail-card,
html body:not(.print-report) .service-tile,
html body:not(.print-report) .service-picker,
html body:not(.print-report) .service-project,
html body:not(.print-report) .cc-home-exec-three>div,
html body:not(.print-report) .cc-home-access-extra button,
html body:not(.print-report) .cc-home-top-issue,
html body:not(.print-report) .cp-budget-kpi,
html body:not(.print-report) .cp-budget-panel,
html body:not(.print-report) .cp-exec-only,
html body:not(.print-report) .cp-exec-ring-card,
html body:not(.print-report) .cp-exec-metric{
  background:linear-gradient(155deg,#101c2a,#0b141f)!important;
  color:#eaf2fa!important;
  border-color:#26384a!important;
  box-shadow:0 8px 24px rgba(0,0,0,.18)!important;
}
html body:not(.print-report) .panel{padding:12px 13px!important;margin-bottom:10px!important;border-radius:14px!important}
html body:not(.print-report) .panel-head{gap:8px!important;margin-bottom:8px!important}

/* Todo texto relevante dentro de superficies oscuras debe ser visible */
html body:not(.print-report) .panel strong,
html body:not(.print-report) .card strong,
html body:not(.print-report) .kpi strong,
html body:not(.print-report) .info strong,
html body:not(.print-report) .advance strong,
html body:not(.print-report) .service-tile b,
html body:not(.print-report) .service-project-name,
html body:not(.print-report) .cc-home-exec-three strong,
html body:not(.print-report) .cc-home-access-extra b{color:#f1f6fb!important;opacity:1!important}
html body:not(.print-report) .panel small,
html body:not(.print-report) .card small,
html body:not(.print-report) .kpi small,
html body:not(.print-report) .info small,
html body:not(.print-report) .advance small,
html body:not(.print-report) .service-tile span,
html body:not(.print-report) .service-project-meta,
html body:not(.print-report) .cc-home-exec-three small,
html body:not(.print-report) .cc-home-exec-three span,
html body:not(.print-report) .cc-home-access-extra small{color:#96a9bd!important;opacity:1!important}

/* BOTONES Y FORMULARIOS */
html body:not(.print-report) .btn,
html body:not(.print-report) .icon-btn,
html body:not(.print-report) .tabs button,
html body:not(.print-report) .service-picker-close{
  background:#101c2a!important;color:#dce8f4!important;border-color:#31445a!important;
  box-shadow:none!important;opacity:1!important;
}
html body:not(.print-report) .btn:hover,
html body:not(.print-report) .icon-btn:hover,
html body:not(.print-report) .tabs button:hover{background:#16263a!important;border-color:#4b6b91!important;color:#fff!important}
html body:not(.print-report) .btn.primary,
html body:not(.print-report) .tabs button.active{background:linear-gradient(135deg,#3578ee,#245dc7)!important;color:#fff!important;border-color:#4d89f3!important}
html body:not(.print-report) .btn.danger{background:#35151d!important;color:#ffd7dc!important;border-color:#6a2b3a!important}
html body:not(.print-report) .btn.good{background:#112b1d!important;color:#c5f5d8!important;border-color:#285e3e!important}
html body:not(.print-report) input:not([type=checkbox]):not([type=radio]),
html body:not(.print-report) select,
html body:not(.print-report) textarea,
html body:not(.print-report) .input,
html body:not(.print-report) .search{
  background:#08111b!important;color:#eef5fc!important;border-color:#2b3e54!important;
}
html body:not(.print-report) input::placeholder,
html body:not(.print-report) textarea::placeholder{color:#6f849a!important}
html body:not(.print-report) .field span{color:#c9d6e4!important;opacity:1!important}
html body:not(.print-report) .field small{color:#8297ad!important;opacity:1!important}

/* TABLAS */
html body:not(.print-report) .table-wrap{border-color:#27394c!important;background:#0a131e!important}
html body:not(.print-report) .table th,
html body:not(.print-report) .cp-budget-table th{background:#132031!important;color:#a9bdd2!important;border-color:#25384b!important;opacity:1!important}
html body:not(.print-report) .table td,
html body:not(.print-report) .cp-budget-table td{background:#0b1520!important;color:#e8f1fa!important;border-color:#1f3042!important;opacity:1!important}

/* =========================================================
   PORTAFOLIO DE PROYECTOS · COMPACTO, LEGIBLE Y PROFESIONAL
   ========================================================= */
html body:not(.print-report) .project-grid-v3{
  display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:10px!important;align-items:start!important;
}
html body:not(.print-report) .project-grid-v3>.project-v3{
  display:flex!important;flex-direction:column!important;width:100%!important;min-width:0!important;height:auto!important;
  border:1px solid #2b3d52!important;border-radius:14px!important;overflow:hidden!important;
  background:linear-gradient(150deg,#111e2d,#0b1520)!important;color:#edf4fb!important;
  box-shadow:0 8px 22px rgba(0,0,0,.20)!important;transform:none!important;
}
html body:not(.print-report) .project-grid-v3>.project-v3:hover{border-color:#46698f!important;box-shadow:0 11px 28px rgba(0,0,0,.28)!important}
html body:not(.print-report) .project-v3-main{
  display:grid!important;grid-template-columns:minmax(0,1.55fr) minmax(230px,.85fr)!important;
  gap:10px!important;align-items:center!important;padding:11px 12px 9px!important;min-width:0!important;
}
html body:not(.print-report) .project-v3-top{grid-column:1/-1!important}
html body:not(.print-report) .project-v3-code{color:#75a8ff!important;font-size:9px!important;font-weight:900!important;letter-spacing:.055em!important;opacity:1!important}
html body:not(.print-report) .project-v3 h3{color:#f2f7fb!important;font-size:12.5px!important;line-height:1.28!important;margin:5px 0 4px!important;min-height:32px!important;opacity:1!important}
html body:not(.print-report) .project-v3-sub{color:#91a5b9!important;font-size:9px!important;gap:5px 8px!important;opacity:1!important}
html body:not(.print-report) .project-v3-sub b{color:#c4d3e1!important}
html body:not(.print-report) .project-v3-contractor{
  display:block!important;margin:7px 0 0!important;padding:7px 8px!important;border-radius:9px!important;
  background:#0b1621!important;border:1px solid #26394d!important;color:#8fa5ba!important;
  font-size:9px!important;line-height:1.3!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
}
html body:not(.print-report) .project-v3-contractor b{color:#dce7f1!important;font-size:9.5px!important}
html body:not(.print-report) .project-v3-money{display:grid!important;grid-template-columns:1.35fr .8fr .8fr!important;gap:5px!important;margin:0!important}
html body:not(.print-report) .project-v3 .v3-metric{
  min-height:55px!important;padding:7px 8px!important;border-radius:9px!important;background:#0a1520!important;border:1px solid #27394c!important;box-shadow:none!important;
}
html body:not(.print-report) .project-v3 .v3-metric small{display:block!important;color:#8fa3b8!important;font-size:7.8px!important;line-height:1.15!important;opacity:1!important}
html body:not(.print-report) .project-v3 .v3-metric b,
html body:not(.print-report) .project-v3 .v3-metric.primary b{display:block!important;color:#f0f6fc!important;font-size:11px!important;line-height:1.15!important;margin-top:3px!important;opacity:1!important}
html body:not(.print-report) .project-v3 .v3-words{display:none!important}
html body:not(.print-report) .project-v3-progress{grid-column:1/-1!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin:7px 0 0!important}
html body:not(.print-report) .mini-progress-label{color:#8fa4b9!important;font-size:8.5px!important;opacity:1!important}
html body:not(.print-report) .mini-progress-label b{color:#dce7f2!important}
html body:not(.print-report) .mini-progress-track{height:5px!important;background:#07101a!important;border-color:#26384b!important}
html body:not(.print-report) .project-v3-health{grid-column:1/-1!important;color:#8ca1b6!important;border-color:#25374a!important;font-size:8.5px!important;opacity:1!important}
html body:not(.print-report) .project-v3-actions{
  display:flex!important;align-items:center!important;gap:6px!important;padding:8px 10px!important;
  background:#09131e!important;border-top:1px solid #26384b!important;border-left:0!important;
}
html body:not(.print-report) .project-v3-actions .btn{min-height:31px!important;padding:6px 9px!important;font-size:9px!important;width:auto!important;margin:0!important}
html body:not(.print-report) .project-v3-actions .btn.primary{margin-left:auto!important;min-width:112px!important}

/* FOTOS EN TARJETAS: SOLO MINIATURA, NUNCA DOMINAN LA VISTA */
html body:not(.print-report) .project-v3 [class*='cover'],
html body:not(.print-report) .project-v3 [class*='hero'],
html body:not(.print-report) .project-v3 [class*='photo']{height:58px!important;min-height:58px!important;max-height:58px!important;overflow:hidden!important;background-position:center!important}
html body:not(.print-report) .project-v3 [class*='cover'] img,
html body:not(.print-report) .project-v3 [class*='hero'] img,
html body:not(.print-report) .project-v3 [class*='photo'] img{width:100%!important;height:58px!important;object-fit:cover!important}

/* INICIO / SELECTORES DE PROYECTO */
html body:not(.print-report) .service-tile{min-height:96px!important;height:96px!important;padding:10px 9px!important;border-radius:12px!important}
html body:not(.print-report) .service-icon{background:#14263a!important;color:#8db8ff!important;border:1px solid #29435f!important}
html body:not(.print-report) .service-project-code{color:#78a9fa!important}
html body:not(.print-report) .service-project{background:#0c1722!important;border-color:#283a4d!important}
html body:not(.print-report) .service-project:hover{background:#101e2c!important;border-color:#456887!important}
html body:not(.print-report) .service-picker-head,
html body:not(.print-report) .service-picker-tools{border-color:#283a4d!important}

/* MODALES */
html body:not(.print-report) .modal,
html body:not(.print-report) .modal-head,
html body:not(.print-report) .auth-card{
  background:#0d1723!important;color:#edf4fb!important;border-color:#2c4055!important;
}
html body:not(.print-report) .modal{border-radius:14px!important;max-height:90vh!important}
html body:not(.print-report) .modal-head{padding:10px 12px!important}
html body:not(.print-report) .modal-body{padding:11px 12px!important}

/* =========================================================
   ASISTENTE: PRESENCIA DISCRETA, NO TAPA DATOS
   ========================================================= */
html body:not(.print-report) #ccEngineerChatLaunch.cc-eng-chat-launch{
  width:72px!important;height:146px!important;right:10px!important;bottom:10px!important;
  filter:drop-shadow(0 7px 7px rgba(0,0,0,.28))!important;
}
html body:not(.print-report) #ccEngineerChatLaunch.cc-eng-chat-launch .dot{
  right:7px!important;bottom:4px!important;width:10px!important;height:10px!important;border-width:2px!important;
}
html body:not(.print-report) #ccEngineerChatLaunch.cc-halu-seated{height:146px!important}
html body:not(.print-report) #ccEngineerChat{right:94px!important;bottom:12px!important}

/* RESPONSIVE */
@media(max-width:1120px){
  html body:not(.print-report) .project-grid-v3{grid-template-columns:1fr!important}
  html body:not(.print-report) .project-v3-main{grid-template-columns:minmax(0,1.4fr) minmax(220px,.8fr)!important}
}
@media(max-width:720px){
  html body:not(.print-report) .shell{padding:10px 10px 22px!important}
  html body:not(.print-report) .project-v3-main{display:block!important;padding:10px!important}
  html body:not(.print-report) .project-v3-money{margin-top:7px!important}
  html body:not(.print-report) .project-v3-progress{grid-template-columns:1fr!important}
  html body:not(.print-report) .project-v3-actions{flex-wrap:wrap!important}
  html body:not(.print-report) .project-v3-actions .btn{flex:1 1 auto!important}
  html body:not(.print-report) .project-v3-actions .btn.primary{flex-basis:100%!important;margin-left:0!important}
  html body:not(.print-report) #ccEngineerChatLaunch.cc-eng-chat-launch{width:56px!important;height:112px!important;right:5px!important;bottom:7px!important}
  html body:not(.print-report) #ccEngineerChatLaunch.cc-halu-seated{height:112px!important}
  html body:not(.print-report) #ccEngineerChat{right:8px!important;bottom:8px!important;width:min(390px,calc(100vw - 16px))!important}
}
`;
  document.head.appendChild(s);
}

function clearVisibilityOverrides(el){
  if(el.style.opacity)el.style.removeProperty('opacity');
  if(el.style.visibility)el.style.removeProperty('visibility');
}
function repairVisibility(){
  install();
  document.querySelectorAll('.project-v3,.panel,.card,.kpi,.info,.service-tile,.service-project').forEach(clearVisibilityOverrides);
  document.querySelectorAll('.project-v3').forEach(card=>{
    const rows=[...card.querySelectorAll('.cc-eng-progress')];
    const seen=new Set();
    rows.forEach(row=>{
      const key=String(row.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(!key)return;
      if(seen.has(key)){
        if(row.dataset.ccUiDuplicate!=='1')row.dataset.ccUiDuplicate='1';
        if(row.style.display!=='none')row.style.display='none';
      }else{
        seen.add(key);
        if(row.dataset.ccUiDuplicate==='1'){
          delete row.dataset.ccUiDuplicate;
          if(row.style.display==='none')row.style.removeProperty('display');
        }
      }
    });
  });
}

install();
repairVisibility();
let queued=false;
const schedule=()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;repairVisibility()});
};
const observer=NativeObserver?new NativeObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'||m.type==='attributes'))schedule();
}):null;
observer?.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
const onResize=()=>{clearTimeout(window.__ccUiRefineTimer);window.__ccUiRefineTimer=setTimeout(repairVisibility,100)};
window.addEventListener('resize',onResize);
window.addEventListener('pagehide',()=>{
  observer?.disconnect();
  window.removeEventListener('resize',onResize);
  clearTimeout(window.__ccUiRefineTimer);
},{once:true});
})();
