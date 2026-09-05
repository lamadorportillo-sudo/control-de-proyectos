/* ===== CONTROL CONTRACTUAL · GUARDIA FINAL DE CONTRASTE V8 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRAST_FINAL_GUARD_V8__)return;
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

  /* Ciclo de vida: la banda es oscura. Los conteos sin datos siguen siendo
     secundarios, pero conservan contraste AA sin parecer una alerta activa. */
  html body.cc-portal-v2:not(.print-report) #content .cc-life-step:not(.has-data) > b{
    color:#d3deea!important;opacity:1!important;
  }
  `;
}

install();
setTimeout(install,250);
setTimeout(install,900);
window.ccInstallContrastFinalGuard=install;
})();