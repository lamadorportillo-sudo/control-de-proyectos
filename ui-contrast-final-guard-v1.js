/* ===== CONTROL CONTRACTUAL · GUARDIA FINAL DE CONTRASTE V12 · BITÁCORA NOCTURNA ===== */
(()=>{
'use strict';
if(window.__CC_CONTRAST_FINAL_GUARD_V12__)return;
window.__CC_CONTRAST_FINAL_GUARD_V12__=true;
window.__CC_CONTRAST_FINAL_GUARD_V11__=true;
window.__CC_CONTRAST_FINAL_GUARD_V10__=true;
window.__CC_CONTRAST_FINAL_GUARD_V9__=true;
window.__CC_CONTRAST_FINAL_GUARD_V8__=true;
window.__CC_CONTRAST_FINAL_GUARD_V7__=true;
window.__CC_CONTRAST_FINAL_GUARD_V6__=true;
window.__CC_CONTRAST_FINAL_GUARD_V5__=true;
window.__CC_CONTRAST_FINAL_GUARD_V4__=true;
window.__CC_CONTRAST_FINAL_GUARD_V3__=true;
window.__CC_CONTRAST_FINAL_GUARD_V2__=true;
window.__CC_CONTRAST_FINAL_GUARD_V1__=true;

const STYLE_ID='cc-contrast-final-guard-v1-style';
function install(){
  let s=document.getElementById(STYLE_ID);
  if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
  s.textContent=`
  /* Inicio · visual circular: el disco interior debe existir también como
     background-color real (no solo ::after) para lectores y auditores WCAG.
     El visual 3D histórico puede dejar opacity inline en medio de una animación;
     se neutraliza para que la legibilidad no dependa del instante del render. */
  html body.cc-portal-v2:not(.print-report) #content .exec-overview .portfolio-ring{
    opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .exec-overview .portfolio-ring-content{
    background-color:#07111f!important;
    color:#f8fbff!important;
    border-radius:999px!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .exec-overview .portfolio-ring-content b{
    color:#f8fbff!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .exec-overview .portfolio-ring-content small{
    color:#d3deea!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .exec-overview .exec-bar-label b,
  html body.cc-portal-v2:not(.print-report) #content .exec-overview .exec-finance b{
    color:#f8fbff!important;opacity:1!important;
  }

  /* Tarjetas de proyecto · algunas reglas históricas del tema claro conservan
     #213027 en el título aunque la tarjeta final sea oscura. El título del
     expediente debe pertenecer siempre a la misma superficie visual. */
  html body.cc-portal-v2:not(.print-report) #content .project-card-premium h3,
  html body.cc-portal-v2:not(.print-report) #content .project-v3 h3{
    color:#f8fbff!important;opacity:1!important;text-shadow:none!important;
  }

  /* Evaluación del proyecto · la cabecera usa un gradiente oscuro. Se fija un
     background-color real además del gradiente para que la legibilidad siga
     siendo correcta cuando el navegador, accesibilidad o impresión no compone
     la imagen de fondo. El centro circular ya era blanco mediante ::after;
     ahora el contenedor real del puntaje declara esa misma superficie para que
     el contraste no dependa de un pseudo-elemento. */
  html body.cc-portal-v2:not(.print-report) #content .ped-head{
    background-color:#10243f!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .ped-head .ped-eyebrow{
    color:#d9e9f7!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .ped-head h3{
    color:#f8fbff!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .ped-head p:last-child{
    color:#d9e7f4!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .ped-health>span{
    background-color:#fff!important;color:#10243f!important;border-radius:999px!important;
    padding:7px 9px!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .ped-health>span b,
  html body.cc-portal-v2:not(.print-report) #content .ped-health>span small{
    color:#10243f!important;opacity:1!important;
  }

  /* Transparencia · las tarjetas son claras, pero la cabecera principal vive
     directamente sobre el lienzo azul oscuro. Se corrigen ambas superficies
     por separado para no resolver una a costa de romper la otra. */
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-source h3,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-section-head h3,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-kpi strong,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-row b,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-empty b,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-const b{
    color:#26372b!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-kpi small,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-kpi span,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-section-head p,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-row small,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-empty span,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-const small,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-form label span,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-template-note{
    color:#536158!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-head h2{
    color:#f4f8fc!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-head p,
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-period label span{
    color:#d3deea!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .tr-page .tr-head .eyebrow{
    color:#9fc5ff!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .tr-source .eyebrow{
    color:#315a7c!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .tr-source .muted{
    color:#536158!important;opacity:1!important;
  }

  /* Expediente · el bloque de normativa vigente usa una superficie verde muy
     clara. La capa oscura general no puede recolorear sus etiquetas pequeñas. */
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-current-law small,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-current-law .law-note{
    color:#4f675b!important;opacity:1!important;
  }

  /* Disponibilidad presupuestaria · todos los importes principales viven sobre
     tarjetas oscuras. Una regla histórica del tema claro heredaba #203027 en
     los KPI normales, dejando los valores en 1.35:1. Se fija el color junto con
     la superficie para superar WCAG sin depender del orden de carga. */
  html body.cc-portal-v2:not(.print-report) #content .cp-budget-kpi,
  html body.cc-portal-v2:not(.print-report) #content .cp-exec-metric,
  html body.cc-portal-v2:not(.print-report) #content .cp-exec-ring-card{
    background-color:#0a131d!important;color:#f8fbff!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .cp-budget-kpi strong,
  html body.cc-portal-v2:not(.print-report) #content .cp-exec-metric strong,
  html body.cc-portal-v2:not(.print-report) #content .cp-exec-ring-card strong,
  html body.cc-portal-v2:not(.print-report) #content .cp-exec-ring-card b{
    color:#f8fbff!important;opacity:1!important;text-shadow:none!important;
  }

  /* Tabla de presupuesto · el pulido operacional heredaba texto verde oscuro
     sobre las filas finales azul oscuro. Se fijan los dos valores detectados
     por la auditoría para conservar una lectura clara en PC y celular. */
  html body.cc-portal-v2:not(.print-report) #content .cp-budget-table .cp-budget-name{
    color:#f3f8ff!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .cp-budget-table td.available{
    color:#86efac!important;opacity:1!important;
  }

  /* Lectura operativa actual: todo el bloque es una superficie oscura. Las
     reglas antiguas de lectura clara no deben volver a poner texto verde oscuro. */
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly{
    background:#0a131d!important;background-image:none!important;color:#f8fbff!important;
    border-color:#315249!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-head h1,
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-head h2,
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-head h3,
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly b,
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly strong{
    color:#f8fbff!important;opacity:1!important;text-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly p,
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly small,
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly span{
    color:#d3deea!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-badge{
    background:#12345a!important;background-image:none!important;color:#f8fbff!important;
    border-color:#4f78ad!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-ring-card,
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-metric{
    background:#0d1825!important;background-image:none!important;color:#f8fbff!important;
    border-color:#31445f!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-ring{
    background-color:#07111f!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-ring-info{
    background-color:#0d1825!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #cpExecutionOnly .cp-exec-open{
    background:#174a9c!important;background-image:none!important;color:#fff!important;
    border-color:#5b91df!important;
  }

  /* Informes estándar · el documento se representa deliberadamente como papel
     blanco dentro de una aplicación oscura. Las capas globales de tema no pueden
     recolorear sus descendientes con texto claro. Se limita la corrección a los
     informes estándar para no alterar el formato municipal de adjudicación. */
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report){
    background:#fff!important;background-image:none!important;color:#172033!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) h1,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) h2,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) h3,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) h4{
    color:#172033!important;opacity:1!important;text-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) p,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) li,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) td{
    color:#26384d!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) small,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .generated,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-section-title .sub,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-kpi .subvalue{
    color:#52657a!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-brand-copy strong,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-docbox b,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .project-line,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-fact strong,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-kpi .value,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-money span{
    color:#172033!important;opacity:1!important;text-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-mark,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-section-title .num{
    color:#fff!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-status.attention{
    background:#fff8e9!important;color:#754500!important;border-color:#c89235!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-status.danger{
    background:#fff2f2!important;color:#7f1d1d!important;border-color:#d98b8b!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .report-paper:not(.municipal-award-report) .report-status.good{
    background:#f1faf4!important;color:#175334!important;border-color:#86ba99!important;opacity:1!important;
  }

  /* Ciclo de vida: la banda es oscura. Los conteos sin datos siguen siendo
     secundarios, pero conservan contraste AA sin parecer una alerta activa. */
  html body.cc-portal-v2:not(.print-report) #content .cc-life-step:not(.has-data) > b{
    color:#d3deea!important;opacity:1!important;
  }

  /* Rediseño maestro · bitácora de obra nocturna. La composición cambia de
     forma visible sin tocar datos, formularios ni rutas del sistema. */
  html body.cc-portal-v2:not(.print-report){
    --cc-bronze:#b98a43;--cc-bronze-light:#e1bd78;--cc-ink:#090b0a;--cc-paper:#111512;
    background:
      linear-gradient(rgba(185,138,67,.035) 1px,transparent 1px),
      linear-gradient(90deg,rgba(185,138,67,.028) 1px,transparent 1px),
      radial-gradient(circle at 78% 8%,rgba(185,138,67,.12),transparent 30%),
      linear-gradient(145deg,#070908 0%,#0b100e 54%,#060706 100%)!important;
    background-size:48px 48px,48px 48px,auto,auto!important;
  }
  html body.cc-portal-v2:not(.print-report)::after{
    width:460px!important;height:460px!important;right:-190px!important;top:12vh!important;
    background:radial-gradient(circle,rgba(185,138,67,.16),rgba(185,138,67,.04) 46%,transparent 72%)!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-shell{
    width:100%!important;max-width:none!important;margin:0!important;padding:0!important;
    gap:0!important;background:#080b09!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-sidebar{
    width:264px!important;flex:0 0 264px!important;padding:26px 18px!important;
    background:linear-gradient(180deg,#0b0d0c 0%,#10140f 58%,#090a09 100%)!important;
    border:0!important;border-right:1px solid rgba(185,138,67,.48)!important;
    box-shadow:14px 0 40px rgba(0,0,0,.32)!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-sidebar-brand{
    padding:0 4px 22px!important;border-bottom:1px solid rgba(185,138,67,.28)!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-sidebar-mark{
    border-radius:2px!important;background:#171b16!important;color:var(--cc-bronze-light)!important;
    border:1px solid var(--cc-bronze)!important;box-shadow:inset 0 0 0 3px #0b0d0c,0 8px 24px rgba(0,0,0,.3)!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-sidebar-brand strong{
    color:#f3ead9!important;text-transform:uppercase!important;letter-spacing:.045em!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-sidebar-brand small{color:#9a9588!important}
  html body.cc-portal-v2:not(.print-report) .cc-sidebar-motto{
    border-radius:0!important;border:1px solid rgba(185,138,67,.35)!important;border-left:3px solid var(--cc-bronze)!important;
    background:#121610!important;color:#c9bdab!important;box-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-nav-label{color:#8f7041!important;letter-spacing:.2em!important}
  html body.cc-portal-v2:not(.print-report) .cc-side-btn{
    border-radius:2px!important;border:1px solid transparent!important;color:#c9c4b9!important;background:transparent!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-side-btn:hover{
    background:#171a15!important;border-color:rgba(185,138,67,.28)!important;color:#fff4df!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-side-btn.active{
    background:linear-gradient(90deg,rgba(185,138,67,.23),rgba(185,138,67,.04))!important;
    border-color:rgba(185,138,67,.44)!important;border-left:3px solid var(--cc-bronze)!important;color:#ffe7b5!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-side-icon{
    border-radius:1px!important;background:#161b17!important;color:var(--cc-bronze-light)!important;border:1px solid rgba(185,138,67,.24)!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-app-column{padding:18px 22px 26px!important;background:transparent!important}
  html body.cc-portal-v2:not(.print-report) .cc-app-column:has(> #ccCommandbar) > .topbar .top-actions{display:none!important}
  html body.cc-portal-v2:not(.print-report) .topbar{
    min-height:92px!important;margin:0 0 12px!important;padding:18px 22px!important;border-radius:0!important;
    background:linear-gradient(100deg,#111612,#0d100e)!important;border:1px solid rgba(185,138,67,.28)!important;
    border-top:3px solid var(--cc-bronze)!important;box-shadow:0 14px 34px rgba(0,0,0,.24)!important;
  }
  html body.cc-portal-v2:not(.print-report) .topbar .brand .logo{display:none!important}
  html body.cc-portal-v2:not(.print-report) .topbar .eyebrow{color:var(--cc-bronze)!important;letter-spacing:.18em!important}
  html body.cc-portal-v2:not(.print-report) .topbar h1{font-family:Georgia,'Times New Roman',serif!important;font-size:28px!important;color:#f4ecdd!important;letter-spacing:.01em!important}
  html body.cc-portal-v2:not(.print-report) .cc-commandbar{
    grid-template-columns:minmax(260px,1fr) auto!important;margin:0 0 16px!important;padding:10px!important;border-radius:0!important;
    background:#0e120f!important;border:1px solid rgba(185,138,67,.34)!important;box-shadow:0 10px 28px rgba(0,0,0,.24)!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-commandbar::before{
    content:'CONTROL DE OBRA  /  EXPEDIENTE 360';position:absolute;right:14px;top:-9px;padding:1px 8px;
    background:#0e120f;color:#8f7041;font-size:8px;font-weight:900;letter-spacing:.16em;
  }
  html body.cc-portal-v2:not(.print-report) .cc-global-search input{
    border-radius:1px!important;background:#080b09!important;border-color:rgba(185,138,67,.34)!important;color:#f5eddf!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-command-btn,
  html body.cc-portal-v2:not(.print-report) .btn{
    border-radius:2px!important;background:#171b17!important;border-color:rgba(185,138,67,.3)!important;color:#e8dfcf!important;box-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-command-btn.primary,
  html body.cc-portal-v2:not(.print-report) .btn.primary{
    background:linear-gradient(135deg,#b98a43,#765128)!important;border-color:#d4aa65!important;color:#100d08!important;font-weight:900!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-command-btn.gold{background:#211a10!important;color:#f0c774!important;border-color:#8a682f!important}
  html body.cc-portal-v2:not(.print-report) #content > .panel,
  html body.cc-portal-v2:not(.print-report) #content .exec-intro,
  html body.cc-portal-v2:not(.print-report) #content .exec-visual,
  html body.cc-portal-v2:not(.print-report) #content .card{
    border-radius:2px!important;background:
      linear-gradient(135deg,rgba(185,138,67,.045),transparent 32%),#101411!important;
    border-color:rgba(185,138,67,.30)!important;box-shadow:0 16px 38px rgba(0,0,0,.28)!important;
  }
  html body.cc-portal-v2:not(.print-report) #content .exec-overview{gap:12px!important}
  html body.cc-portal-v2:not(.print-report) #content .exec-intro{border-left:3px solid var(--cc-bronze)!important}
  html body.cc-portal-v2:not(.print-report) #content .exec-overview h2,
  html body.cc-portal-v2:not(.print-report) #content .exec-overview h3{font-family:Georgia,'Times New Roman',serif!important;color:#f3ead9!important}
  html body.cc-portal-v2:not(.print-report) #content .exec-chip,
  html body.cc-portal-v2:not(.print-report) #content .stat-chip{
    border-radius:1px!important;background:#151914!important;border-color:rgba(185,138,67,.26)!important;
  }
  html body.cc-portal-v2:not(.print-report) .panel,
  html body.cc-portal-v2:not(.print-report) .table-wrap{border-radius:2px!important}
  html body.cc-portal-v2:not(.print-report) .footer-note{letter-spacing:.12em!important;color:#847968!important}
  @media(max-width:900px){
    html body.cc-portal-v2:not(.print-report) .cc-sidebar{width:min(286px,88vw)!important;flex-basis:auto!important}
    html body.cc-portal-v2:not(.print-report) .cc-app-column{padding:10px!important}
    html body.cc-portal-v2:not(.print-report) .topbar{min-height:72px!important;padding:14px!important}
    html body.cc-portal-v2:not(.print-report) .topbar h1{font-size:22px!important}
    html body.cc-portal-v2:not(.print-report) .cc-commandbar{grid-template-columns:auto minmax(0,1fr)!important}
    html body.cc-portal-v2:not(.print-report) .cc-command-actions{grid-column:1/-1!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}
  }
  @media(max-width:520px){
    html body.cc-portal-v2:not(.print-report) .cc-command-actions{grid-template-columns:1fr 1fr!important}
    html body.cc-portal-v2:not(.print-report) .cc-command-btn{font-size:10px!important;padding:7px!important}
  }
  `;
}

install();
setTimeout(install,250);
setTimeout(install,900);
window.ccInstallContrastFinalGuard=install;
})();
