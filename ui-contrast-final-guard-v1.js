/* ===== CONTROL CONTRACTUAL · GUARDIA FINAL DE CONTRASTE V2 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRAST_FINAL_GUARD_V2__)return;
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
