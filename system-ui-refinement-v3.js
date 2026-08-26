/* ===== CONTROL CONTRACTUAL · REFINAMIENTO GENERAL DE INTERFAZ V3 ===== */
(()=>{
'use strict';
if(window.__CC_SYSTEM_UI_REFINEMENT_V3__)return;
window.__CC_SYSTEM_UI_REFINEMENT_V3__=true;

const STYLE_ID='cc-system-ui-refinement-v3-style';
function install(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* ===== BASE Y JERARQUIA VISUAL ===== */
html body:not(.print-report){font-size:13px!important;line-height:1.42!important;background:#f3f6f2!important;color:#1d2a20!important}
html body:not(.print-report) .shell{width:min(100%,1540px)!important;max-width:1540px!important;padding:14px 18px 28px!important}
html body:not(.print-report) .panel{padding:12px 13px!important;margin-bottom:10px!important;border-radius:14px!important;box-shadow:0 6px 20px rgba(32,52,36,.055)!important}
html body:not(.print-report) .panel-head{gap:8px!important;margin-bottom:8px!important}
html body:not(.print-report) h1{font-size:22px!important;line-height:1.12!important}
html body:not(.print-report) h2{font-size:18px!important;line-height:1.18!important}
html body:not(.print-report) h3{font-size:13px!important;line-height:1.26!important}
html body:not(.print-report) .muted,html body:not(.print-report) .notice{color:#6e7b72!important}

/* HERO: texto más legible sin hacerlo gigantesco */
html body:not(.print-report) .hero-control-contractual{min-height:260px!important;padding:30px 34px!important;border-radius:18px!important;margin:14px 0 13px!important}
html body:not(.print-report) .hero-control-contractual .hero-copy{max-width:900px!important}
html body:not(.print-report) .hero-control-contractual .hero-copy small{font-size:13px!important;letter-spacing:.16em!important}
html body:not(.print-report) .hero-control-contractual .hero-copy h2{font-size:clamp(34px,3.9vw,54px)!important;line-height:1.02!important;letter-spacing:-.03em!important;margin:10px 0 13px!important;max-width:900px!important}
html body:not(.print-report) .hero-control-contractual .hero-copy p{font-size:18px!important;line-height:1.48!important;max-width:820px!important;margin-bottom:20px!important}
html body:not(.print-report) .hero-links{gap:8px!important}
html body:not(.print-report) .hero-links button{min-height:40px!important;padding:9px 14px!important;font-size:12px!important;border-radius:10px!important}

/* ACCESOS DEL INICIO: FILA ORDENADA Y HOMOGENEA */
html body:not(.print-report) .service-strip{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px!important;align-items:stretch!important;margin:0 0 14px!important}
html body:not(.print-report) .service-tile{min-height:104px!important;height:104px!important;padding:11px 9px!important;border-radius:13px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;box-shadow:0 5px 16px rgba(32,52,36,.05)!important}
html body:not(.print-report) .service-icon{width:40px!important;height:40px!important;min-width:40px!important;margin:0 auto 5px!important;font-size:17px!important}
html body:not(.print-report) .service-icon svg{width:18px!important;height:18px!important}
html body:not(.print-report) .service-tile b{font-size:12.5px!important;margin:2px 0!important;line-height:1.2!important}
html body:not(.print-report) .service-tile span{font-size:10.5px!important;line-height:1.25!important}

/* CONTROLES GENERALES */
html body:not(.print-report) .toolbar,html body:not(.print-report) .actions{gap:6px!important}
html body:not(.print-report) .btn{min-height:34px!important;padding:7px 10px!important;font-size:11px!important;border-radius:9px!important}
html body:not(.print-report) .icon-btn{width:34px!important;height:34px!important;min-width:34px!important;border-radius:9px!important}
html body:not(.print-report) input:not([type=checkbox]):not([type=radio]),html body:not(.print-report) select{min-height:36px!important;padding:7px 9px!important;font-size:12px!important;border-radius:9px!important}
html body:not(.print-report) textarea{min-height:74px!important;padding:8px 9px!important;font-size:12px!important;border-radius:9px!important}
html body:not(.print-report) .tabs{gap:5px!important;margin-bottom:8px!important;padding:4px!important;border-radius:11px!important}
html body:not(.print-report) .tabs button{min-height:32px!important;padding:6px 9px!important;font-size:10.5px!important;border-radius:8px!important}

/* KPI, RESUMENES Y CASILLAS */
html body:not(.print-report) .grid-kpi,html body:not(.print-report) .exec-kpis{gap:7px!important;margin-bottom:9px!important}
html body:not(.print-report) .kpi,html body:not(.print-report) .exec-kpi{padding:8px 9px!important;min-height:62px!important;border-radius:11px!important;box-shadow:0 5px 16px rgba(32,52,36,.045)!important}
html body:not(.print-report) .kpi small,html body:not(.print-report) .exec-kpi small{font-size:8.5px!important;margin-bottom:2px!important}
html body:not(.print-report) .kpi strong,html body:not(.print-report) .exec-kpi strong{font-size:13.5px!important;line-height:1.15!important}
html body:not(.print-report) .summary-grid{gap:6px!important}
html body:not(.print-report) .info,html body:not(.print-report) .advance>div{min-height:50px!important;padding:7px 8px!important;border-radius:9px!important}
html body:not(.print-report) .info small,html body:not(.print-report) .advance small{font-size:8.5px!important;margin-bottom:2px!important}
html body:not(.print-report) .info strong,html body:not(.print-report) .advance strong{font-size:11px!important;line-height:1.25!important}

/* ===== PORTAFOLIO DE PROYECTOS ===== */
html body:not(.print-report) .project-grid-v3{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:11px!important;align-items:start!important}
html body:not(.print-report) .project-grid-v3>.project-v3{display:flex!important;flex-direction:column!important;width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;border:1px solid #dbe4d9!important;border-radius:14px!important;overflow:hidden!important;background:#fff!important;box-shadow:0 7px 20px rgba(34,55,38,.065)!important;transform:none!important}
html body:not(.print-report) .project-grid-v3>.project-v3:hover{transform:translateY(-1px)!important;box-shadow:0 10px 25px rgba(34,55,38,.095)!important}

/* Cabecera fotográfica: ya no ocupa media tarjeta */
html body:not(.print-report) .project-v3 [class*='cover'],
html body:not(.print-report) .project-v3 [class*='hero'],
html body:not(.print-report) .project-v3 [class*='photo']{height:66px!important;min-height:66px!important;max-height:66px!important;background-position:center 48%!important}
html body:not(.print-report) .project-v3 [class*='cover'] img,
html body:not(.print-report) .project-v3 [class*='hero'] img,
html body:not(.print-report) .project-v3 [class*='photo'] img{height:66px!important;width:100%!important;object-fit:cover!important}

/* Cuerpo de proyecto */
html body:not(.print-report) .project-v3-main{display:block!important;padding:9px 10px 8px!important;min-width:0!important}
html body:not(.print-report) .project-v3-code{font-size:8px!important;letter-spacing:.07em!important;margin-bottom:3px!important;font-weight:850!important}
html body:not(.print-report) .project-v3 h3{font-size:11.5px!important;line-height:1.27!important;margin:4px 0 3px!important;min-height:29px!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}
html body:not(.print-report) .project-v3-sub{display:flex!important;gap:4px 7px!important;flex-wrap:wrap!important;font-size:7.8px!important;line-height:1.25!important;margin:0 0 6px!important}
html body:not(.print-report) .project-v3 .status,html body:not(.print-report) .project-v3 .pill{font-size:7.5px!important;padding:2px 5px!important;line-height:1.15!important}

/* Contratista en línea limpia */
html body:not(.print-report) .project-v3-contractor{display:block!important;margin:6px 0!important;padding:6px 8px!important;min-height:0!important;border-radius:8px!important;background:#f7f9f6!important;border:1px solid #e1e7df!important;font-size:8.7px!important;line-height:1.25!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}

/* Monto + estimado + pagado: compactos y proporcionados */
html body:not(.print-report) .project-v3-money{display:grid!important;grid-template-columns:1.4fr .8fr .8fr!important;gap:5px!important;margin:6px 0!important}
html body:not(.print-report) .project-v3 .v3-metric{padding:6px 7px!important;min-height:48px!important;border-radius:8px!important;background:#f8faf7!important;border:1px solid #e1e7df!important;box-shadow:none!important}
html body:not(.print-report) .project-v3 .v3-metric small{font-size:7px!important;margin-bottom:2px!important;line-height:1.15!important}
html body:not(.print-report) .project-v3 .v3-metric b,html body:not(.print-report) .project-v3 .v3-metric.primary b{font-size:10.5px!important;line-height:1.12!important;margin:0!important}
html body:not(.print-report) .project-v3 .v3-words{display:none!important}

/* Avances */
html body:not(.print-report) .project-v3-progress{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important;margin:6px 0!important}
html body:not(.print-report) .project-v3-progress>*{min-width:0!important}
html body:not(.print-report) .project-v3-progress small{font-size:7.2px!important;line-height:1.2!important}
html body:not(.print-report) .project-v3-progress .bar,html body:not(.print-report) .project-v3 .bar{height:3px!important;margin-top:3px!important;border-radius:999px!important}
html body:not(.print-report) .project-v3 .cc-eng-progress{display:flex!important;gap:4px!important;flex-wrap:nowrap!important;margin:5px 0 0!important;min-height:0!important;overflow:hidden!important}
html body:not(.print-report) .project-v3 .cc-eng-progress + .cc-eng-progress{display:none!important}
html body:not(.print-report) .project-v3 .cc-eng-chip{min-height:20px!important;padding:3px 6px!important;font-size:7px!important;border-radius:999px!important;white-space:nowrap!important}
html body:not(.print-report) .project-v3 .cc-eng-chip b{font-size:7px!important}
html body:not(.print-report) .project-v3-health{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:6px!important;margin-top:6px!important;padding-top:6px!important;min-height:0!important;font-size:7.8px!important;border-top:1px solid #e5ebe3!important}

/* Acciones: una sola fila clara */
html body:not(.print-report) .project-v3-actions{display:grid!important;grid-template-columns:auto auto 1fr auto!important;align-items:center!important;gap:5px!important;padding:7px 9px!important;border-top:1px solid #e5ebe3!important;border-left:0!important;background:#fbfcfa!important}
html body:not(.print-report) .project-v3-actions .btn{width:auto!important;min-width:0!important;min-height:30px!important;padding:5px 8px!important;font-size:8.5px!important;margin:0!important;white-space:nowrap!important}
html body:not(.print-report) .project-v3-actions .btn.primary{grid-column:4!important;min-width:105px!important}
html body:not(.print-report) .project-v3-actions .cc-ui-icon{width:13px!important;height:13px!important;min-width:13px!important}

/* Expediente */
html body:not(.print-report) .project-portfolio-header{min-height:220px!important;border-radius:16px!important;margin-bottom:10px!important}
html body:not(.print-report) .project-portfolio-inner{min-height:220px!important;padding:20px 23px 16px!important;gap:14px!important}
html body:not(.print-report) .project-portfolio-copy h2{font-size:clamp(23px,2.8vw,35px)!important;line-height:1.05!important;margin:7px 0!important}
html body:not(.print-report) .project-portfolio-contract{margin-top:9px!important;gap:5px!important}
html body:not(.print-report) .project-portfolio-contract span{padding:4px 6px!important;font-size:8.5px!important}
html body:not(.print-report) .project-portfolio-bottom{gap:6px!important}
html body:not(.print-report) .project-portfolio-metric{padding:8px 9px!important;border-radius:9px!important}
html body:not(.print-report) .project-portfolio-metric b{font-size:12px!important}
html body:not(.print-report) .project-portfolio-actions{gap:5px!important;margin-bottom:9px!important}
html body:not(.print-report) .project-portfolio-actions button{padding:6px 8px!important;font-size:9px!important;min-height:30px!important}

/* Modales, formularios y tablas */
html body:not(.print-report) .modal{border-radius:14px!important;max-height:90vh!important}
html body:not(.print-report) .modal-head{padding:10px 12px!important}
html body:not(.print-report) .modal-body{padding:11px 12px!important}
html body:not(.print-report) .form-grid{gap:8px!important}
html body:not(.print-report) .field span{font-size:10px!important;margin-bottom:3px!important}
html body:not(.print-report) .field small{font-size:9px!important;margin-top:3px!important}
html body:not(.print-report) .table-wrap{border-radius:9px!important}
html body:not(.print-report) .table th,html body:not(.print-report) .table td{padding:6px 7px!important;font-size:9.5px!important;line-height:1.28!important}

/* Topbar menos voluminosa */
html body:not(.print-report) .topbar{padding:8px 10px!important;gap:8px!important;margin-bottom:10px!important;border-radius:13px!important}
html body:not(.print-report) .brand{gap:8px!important}
html body:not(.print-report) .brand .logo{width:34px!important;height:34px!important;min-width:34px!important;border-radius:9px!important}
html body:not(.print-report) .top-actions{gap:5px!important}

/* RESPONSIVE */
@media(max-width:1320px){
 html body:not(.print-report) .project-grid-v3{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}
@media(max-width:980px){
 html body:not(.print-report) .service-strip{grid-template-columns:repeat(3,minmax(0,1fr))!important}
 html body:not(.print-report) .project-grid-v3{grid-template-columns:1fr!important}
 html body:not(.print-report) .project-v3 [class*='cover'],html body:not(.print-report) .project-v3 [class*='hero'],html body:not(.print-report) .project-v3 [class*='photo'],html body:not(.print-report) .project-v3 [class*='cover'] img,html body:not(.print-report) .project-v3 [class*='hero'] img,html body:not(.print-report) .project-v3 [class*='photo'] img{height:76px!important;min-height:76px!important;max-height:76px!important}
}
@media(max-width:720px){
 html body:not(.print-report) .shell{padding:10px 10px 22px!important}
 html body:not(.print-report) .hero-control-contractual{padding:24px 20px!important;min-height:285px!important}
 html body:not(.print-report) .hero-control-contractual .hero-copy h2{font-size:31px!important}
 html body:not(.print-report) .hero-control-contractual .hero-copy p{font-size:15px!important}
 html body:not(.print-report) .service-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 html body:not(.print-report) .service-tile{height:98px!important;min-height:98px!important;padding:9px 7px!important}
 html body:not(.print-report) .project-v3-money{grid-template-columns:1fr 1fr!important}
 html body:not(.print-report) .project-v3-money .v3-metric:first-child{grid-column:1/-1!important}
 html body:not(.print-report) .project-v3-actions{grid-template-columns:1fr 1fr!important}
 html body:not(.print-report) .project-v3-actions .btn{width:100%!important;min-height:34px!important}
 html body:not(.print-report) .project-v3-actions .btn.primary{grid-column:1/-1!important;min-width:0!important}
 html body:not(.print-report) .project-v3 .cc-eng-progress{flex-wrap:wrap!important}
 html body:not(.print-report) .project-portfolio-bottom{grid-template-columns:1fr 1fr!important}
}
@media(max-width:440px){
 html body:not(.print-report) .service-strip{grid-template-columns:1fr 1fr!important}
 html body:not(.print-report) .service-tile{height:92px!important;min-height:92px!important}
 html body:not(.print-report) .project-v3-progress{grid-template-columns:1fr!important}
 html body:not(.print-report) .project-portfolio-bottom{grid-template-columns:1fr!important}
}
`;
  document.head.appendChild(s);
}

/* Quita únicamente duplicados visuales obvios de la fila Físico/Financiero/Tiempo. */
function cleanDuplicateProjectRows(){
  document.querySelectorAll('.project-v3').forEach(card=>{
    const rows=[...card.querySelectorAll('.cc-eng-progress')];
    const seen=new Set();
    rows.forEach(row=>{
      const key=String(row.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(!key)return;
      if(seen.has(key))row.style.display='none';
      else seen.add(key);
    });
  });
}

install();
cleanDuplicateProjectRows();
new MutationObserver(()=>{install();cleanDuplicateProjectRows()}).observe(document.documentElement,{subtree:true,childList:true});
})();
