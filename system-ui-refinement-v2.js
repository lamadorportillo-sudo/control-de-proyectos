/* ===== CONTROL CONTRACTUAL · REFINAMIENTO GENERAL DE INTERFAZ V2 ===== */
(()=>{
'use strict';
if(window.__CC_SYSTEM_UI_REFINEMENT_V2__)return;
window.__CC_SYSTEM_UI_REFINEMENT_V2__=true;

const STYLE_ID='cc-system-ui-refinement-v2-style';

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
/* Base general: más aire útil y menos volumen visual */
html body:not(.print-report){font-size:13px!important;line-height:1.4!important;background:#f2f5f1!important}
html body:not(.print-report) .shell{width:min(100%,1460px)!important;max-width:1460px!important;padding:14px 18px 26px!important}
html body:not(.print-report) #content{min-width:0!important}
html body:not(.print-report) .panel{padding:12px 14px!important;margin-bottom:11px!important;border-radius:14px!important;box-shadow:0 8px 24px rgba(34,55,38,.065)!important}
html body:not(.print-report) .panel-head{margin-bottom:9px!important;gap:9px!important}
html body:not(.print-report) .card{border-radius:14px!important;box-shadow:0 7px 22px rgba(34,55,38,.06)!important}
html body:not(.print-report) .card:hover{transform:translateY(-1px)!important;box-shadow:0 11px 28px rgba(34,55,38,.09)!important}
html body:not(.print-report) .toolbar{gap:7px!important;margin-bottom:10px!important;align-items:center!important}
html body:not(.print-report) .toolbar>*{max-width:100%!important}
html body:not(.print-report) .search{max-width:520px!important}

/* Tipografía: compacta en controles, más clara en títulos importantes */
html body:not(.print-report) h1{font-size:21px!important;line-height:1.12!important}
html body:not(.print-report) h2{font-size:17px!important;line-height:1.18!important}
html body:not(.print-report) h3{font-size:13.5px!important;line-height:1.25!important}
html body:not(.print-report) .hero-control-contractual .hero-copy small{font-size:12px!important;letter-spacing:.15em!important}
html body:not(.print-report) .hero-control-contractual .hero-copy h2{font-size:clamp(31px,3.7vw,48px)!important;line-height:1.03!important;letter-spacing:-.025em!important;margin:9px 0 12px!important}
html body:not(.print-report) .hero-control-contractual .hero-copy p{font-size:17px!important;line-height:1.48!important;max-width:760px!important;margin-bottom:20px!important}
html body:not(.print-report) .hero-control-contractual{min-height:270px!important;padding:30px 34px!important;border-radius:18px!important}
html body:not(.print-report) .hero-links button{min-height:40px!important;padding:9px 14px!important;font-size:12px!important;border-radius:10px!important}

/* Accesos del inicio: todos del mismo tamaño y perfectamente alineados */
html body:not(.print-report) .service-strip{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px!important;margin:0 0 14px!important;align-items:stretch!important}
html body:not(.print-report) .service-tile{min-height:116px!important;height:100%!important;padding:13px 10px!important;border-radius:14px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:0!important;box-shadow:0 6px 18px rgba(34,55,38,.055)!important}
html body:not(.print-report) .service-icon{width:42px!important;height:42px!important;min-width:42px!important;margin:0 auto 6px!important;font-size:18px!important}
html body:not(.print-report) .service-icon svg{width:19px!important;height:19px!important}
html body:not(.print-report) .service-tile b{font-size:12.5px!important;margin:3px 0 2px!important;line-height:1.2!important}
html body:not(.print-report) .service-tile span{font-size:10.5px!important;line-height:1.3!important}

/* KPIs y casillas informativas */
html body:not(.print-report) .grid-kpi,html body:not(.print-report) .exec-kpis{gap:8px!important;margin-bottom:10px!important}
html body:not(.print-report) .kpi,html body:not(.print-report) .exec-kpi{padding:9px 10px!important;min-height:67px!important;border-radius:12px!important;box-shadow:0 6px 18px rgba(34,55,38,.05)!important}
html body:not(.print-report) .kpi small,html body:not(.print-report) .exec-kpi small{font-size:8.7px!important;margin-bottom:3px!important}
html body:not(.print-report) .kpi strong,html body:not(.print-report) .exec-kpi strong{font-size:14px!important;line-height:1.15!important}
html body:not(.print-report) .summary-grid{gap:7px!important}
html body:not(.print-report) .info{padding:8px 9px!important;border-radius:10px!important;min-height:54px!important}
html body:not(.print-report) .info small{font-size:9px!important;margin-bottom:3px!important}
html body:not(.print-report) .info strong{font-size:11.5px!important;line-height:1.28!important}

/* Botones, pestañas e inputs proporcionados */
html body:not(.print-report) .btn,html body:not(.print-report) button{border-radius:9px!important}
html body:not(.print-report) .btn{min-height:34px!important;padding:7px 10px!important;font-size:11px!important}
html body:not(.print-report) .tabs{gap:5px!important;margin-bottom:9px!important;padding:5px!important;border-radius:11px!important}
html body:not(.print-report) .tabs button{min-height:32px!important;padding:6px 9px!important;font-size:10.5px!important}
html body:not(.print-report) input:not([type=checkbox]):not([type=radio]),html body:not(.print-report) select{min-height:36px!important;padding:7px 9px!important;font-size:12px!important}
html body:not(.print-report) textarea{min-height:76px!important;padding:8px 9px!important;font-size:12px!important}

/* ===== TARJETAS DE PROYECTOS ===== */
html body:not(.print-report) .project-grid-v3{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;align-items:start!important}
html body:not(.print-report) .project-grid-v3>.project-v3{display:flex!important;flex-direction:column!important;min-width:0!important;width:100%!important;height:auto!important;min-height:0!important;border:1px solid #dbe3d8!important;border-radius:16px!important;overflow:hidden!important;background:#fff!important;box-shadow:0 9px 24px rgba(34,55,38,.07)!important;transform:none!important}
html body:not(.print-report) .project-v3:hover{transform:translateY(-1px)!important;box-shadow:0 13px 30px rgba(34,55,38,.105)!important}

/* Cabecera visual de cada proyecto mucho más baja */
html body:not(.print-report) .project-v3 [class*='cover'],
html body:not(.print-report) .project-v3 [class*='hero'],
html body:not(.print-report) .project-v3 [class*='photo']{max-height:94px!important;min-height:76px!important;height:88px!important;background-position:center 48%!important}
html body:not(.print-report) .project-v3 [class*='cover'] img,
html body:not(.print-report) .project-v3 [class*='hero'] img,
html body:not(.print-report) .project-v3 [class*='photo'] img{width:100%!important;height:88px!important;object-fit:cover!important}

html body:not(.print-report) .project-v3-main{display:block!important;padding:11px 12px 9px!important;min-width:0!important}
html body:not(.print-report) .project-v3-code{font-size:8.5px!important;letter-spacing:.07em!important;margin-bottom:4px!important}
html body:not(.print-report) .project-v3 h3{font-size:12.5px!important;line-height:1.28!important;margin:5px 0 4px!important;min-height:0!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}
html body:not(.print-report) .project-v3-sub{display:flex!important;gap:5px 8px!important;flex-wrap:wrap!important;font-size:8.5px!important;line-height:1.3!important;margin:0 0 8px!important}
html body:not(.print-report) .project-v3 .status,html body:not(.print-report) .project-v3 .pill{font-size:8px!important;padding:3px 6px!important}

/* Contratista como una sola fila, sin caja enorme */
html body:not(.print-report) .project-v3-contractor{display:block!important;margin:7px 0!important;padding:7px 9px!important;min-height:0!important;border-radius:9px!important;background:#f7f9f5!important;border:1px solid #e0e6dd!important;font-size:9.5px!important;line-height:1.3!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}

/* Tres métricas principales compactas */
html body:not(.print-report) .project-v3-money{display:grid!important;grid-template-columns:1.35fr .75fr .75fr!important;gap:6px!important;margin:7px 0!important}
html body:not(.print-report) .project-v3 .v3-metric{padding:7px 8px!important;min-height:54px!important;border-radius:9px!important;background:#f8faf7!important;border:1px solid #e0e6dd!important;box-shadow:none!important}
html body:not(.print-report) .project-v3 .v3-metric small{font-size:7.5px!important;margin-bottom:3px!important;line-height:1.2!important}
html body:not(.print-report) .project-v3 .v3-metric b,html body:not(.print-report) .project-v3 .v3-metric.primary b{font-size:11.5px!important;line-height:1.15!important;margin-top:0!important}
html body:not(.print-report) .project-v3 .v3-words{display:none!important}

/* Barras de avance en dos columnas; chips solo una fila */
html body:not(.print-report) .project-v3-progress{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;margin:7px 0!important}
html body:not(.print-report) .project-v3-progress>*{min-width:0!important}
html body:not(.print-report) .project-v3-progress small{font-size:7.8px!important;line-height:1.25!important}
html body:not(.print-report) .project-v3-progress .bar,html body:not(.print-report) .project-v3 .bar{height:4px!important;margin-top:4px!important}
html body:not(.print-report) .project-v3 .cc-eng-progress{display:flex!important;gap:5px!important;flex-wrap:wrap!important;margin:6px 0 0!important;min-height:0!important}
html body:not(.print-report) .project-v3 .cc-eng-chip{min-height:22px!important;padding:4px 7px!important;font-size:7.5px!important;border-radius:999px!important}
html body:not(.print-report) .project-v3 .cc-eng-chip b{font-size:7.5px!important}
html body:not(.print-report) .project-v3-health{margin-top:7px!important;padding-top:7px!important;min-height:0!important;font-size:8.5px!important}

/* Pie de tarjeta: editar/archivar a la izquierda, expediente a la derecha */
html body:not(.print-report) .project-v3-actions{display:grid!important;grid-template-columns:auto auto 1fr auto!important;align-items:center!important;gap:6px!important;min-width:0!important;padding:8px 11px!important;border-left:0!important;border-top:1px solid #e4e9e1!important;background:#fbfcfa!important}
html body:not(.print-report) .project-v3-actions .btn{width:auto!important;min-width:0!important;min-height:31px!important;padding:6px 9px!important;font-size:9px!important;margin:0!important;white-space:nowrap!important}
html body:not(.print-report) .project-v3-actions .btn.primary{grid-column:4!important;min-width:118px!important}

/* Expediente de proyecto: cabecera y resumen menos gigantes */
html body:not(.print-report) .project-portfolio-header{min-height:245px!important;border-radius:17px!important;margin-bottom:11px!important}
html body:not(.print-report) .project-portfolio-inner{min-height:245px!important;padding:24px 27px 18px!important;gap:17px!important}
html body:not(.print-report) .project-portfolio-copy h2{font-size:clamp(24px,3.2vw,38px)!important;line-height:1.05!important;margin:8px 0 8px!important}
html body:not(.print-report) .project-portfolio-contract{margin-top:11px!important;gap:6px!important}
html body:not(.print-report) .project-portfolio-contract span{padding:5px 7px!important;font-size:9px!important}
html body:not(.print-report) .project-portfolio-bottom{gap:7px!important}
html body:not(.print-report) .project-portfolio-metric{padding:9px 10px!important;border-radius:10px!important}
html body:not(.print-report) .project-portfolio-metric b{font-size:13px!important}
html body:not(.print-report) .project-portfolio-actions{gap:6px!important;margin-bottom:10px!important}
html body:not(.print-report) .project-portfolio-actions button{padding:7px 9px!important;font-size:9.5px!important;min-height:31px!important}

/* Modales y tablas */
html body:not(.print-report) .modal{border-radius:15px!important;max-height:90vh!important}
html body:not(.print-report) .modal-head{padding:11px 13px!important}
html body:not(.print-report) .modal-body{padding:12px 13px!important}
html body:not(.print-report) .form-grid{gap:9px!important}
html body:not(.print-report) .table th,html body:not(.print-report) .table td{padding:7px 8px!important;font-size:10px!important}

@media(max-width:1180px){
 html body:not(.print-report) .project-grid-v3{grid-template-columns:1fr!important}
 html body:not(.print-report) .service-strip{grid-template-columns:repeat(3,minmax(0,1fr))!important}
}
@media(max-width:820px){
 html body:not(.print-report) .shell{padding:10px 11px 22px!important}
 html body:not(.print-report) .hero-control-contractual{padding:24px 20px!important;min-height:280px!important}
 html body:not(.print-report) .hero-control-contractual .hero-copy h2{font-size:30px!important}
 html body:not(.print-report) .hero-control-contractual .hero-copy p{font-size:15px!important}
 html body:not(.print-report) .service-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 html body:not(.print-report) .service-tile{min-height:104px!important;padding:11px 8px!important}
 html body:not(.print-report) .project-v3-money{grid-template-columns:1fr 1fr!important}
 html body:not(.print-report) .project-v3-money .v3-metric:first-child{grid-column:1/-1!important}
 html body:not(.print-report) .project-v3-actions{grid-template-columns:1fr 1fr!important}
 html body:not(.print-report) .project-v3-actions .btn{width:100%!important}
 html body:not(.print-report) .project-v3-actions .btn.primary{grid-column:1/-1!important;min-width:0!important;order:-1!important}
 html body:not(.print-report) .project-portfolio-bottom{grid-template-columns:1fr 1fr!important}
}
@media(max-width:480px){
 html body:not(.print-report) .service-strip{grid-template-columns:1fr 1fr!important}
 html body:not(.print-report) .project-v3-progress{grid-template-columns:1fr!important}
 html body:not(.print-report) .project-v3-money{grid-template-columns:1fr!important}
 html body:not(.print-report) .project-v3-money .v3-metric:first-child{grid-column:auto!important}
 html body:not(.print-report) .project-portfolio-bottom{grid-template-columns:1fr!important}
}
`;
  document.head.appendChild(style);
}

function cleanDuplicateProgress(){
  document.querySelectorAll('.project-v3').forEach(card=>{
    const groups=[...card.querySelectorAll('.cc-eng-progress')];
    if(groups.length>1)groups.slice(1).forEach(el=>el.remove());
  });
}

function makeCardsConsistent(){
  document.querySelectorAll('.project-v3').forEach(card=>{
    card.dataset.ccRefined='1';
    const actions=card.querySelector('.project-v3-actions');
    if(actions){
      const primary=actions.querySelector('.btn.primary,[data-open]');
      if(primary)primary.dataset.ccMainAction='1';
    }
  });
  cleanDuplicateProgress();
}

let queued=false;
function run(){
  installStyle();
  makeCardsConsistent();
}
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;run()});
}

installStyle();
run();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('resize',schedule,{passive:true});
})();
