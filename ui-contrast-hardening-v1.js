/* ===== CONTROL CONTRACTUAL · ENDURECIMIENTO DE CONTRASTE V4 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRAST_HARDENING_V4__)return;
window.__CC_CONTRAST_HARDENING_V4__=true;
window.__CC_CONTRAST_HARDENING_V3__=true;

const STYLE_ID='cc-contrast-hardening-v1-style';
function install(){
  let s=document.getElementById(STYLE_ID);
  if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
  s.textContent=`
  /* Fondo sólido de respaldo. Los gradientes siguen visibles, pero el color
     calculable evita fondos transparentes ambiguos en navegadores, auditorías
     de accesibilidad y modos de renderizado reducido. */
  html body:not(.print-report){background-color:#07101b!important}
  body:not(.print-report) #content .exec-overview,
  body:not(.print-report) #content .exec-intro,
  body:not(.print-report) #content .exec-visual,
  body:not(.print-report) #content .projects-board,
  body:not(.print-report) #content .rail-card,
  body:not(.print-report) #content .aside-card,
  body:not(.print-report) #content .panel,
  body:not(.print-report) #content .card,
  body:not(.print-report) #content .kpi,
  body:not(.print-report) #content .info,
  body:not(.print-report) #content .cc-dashboard-welcome-v4{
    background-color:#0d1520!important;
  }

  /* Inicio ejecutivo: textos y controles pequeños con contraste verificable. */
  body:not(.print-report) #content .exec-overview small,
  body:not(.print-report) #content .exec-overview p,
  body:not(.print-report) #content .rail-card p,
  body:not(.print-report) #content .rail-card small,
  body:not(.print-report) #content .rail-card .rail-state-row span,
  body:not(.print-report) #content .rail-card .rail-quick button span,
  body:not(.print-report) #content .aside-card .muted,
  body:not(.print-report) #content .aside-card small,
  body:not(.print-report) #content .aside-card span{
    color:#c3d1df!important;opacity:1!important;visibility:visible!important;
  }
  body:not(.print-report) #content .exec-overview h1,
  body:not(.print-report) #content .exec-overview h2,
  body:not(.print-report) #content .exec-overview h3,
  body:not(.print-report) #content .rail-card h1,
  body:not(.print-report) #content .rail-card h2,
  body:not(.print-report) #content .rail-card h3,
  body:not(.print-report) #content .aside-card h1,
  body:not(.print-report) #content .aside-card h2,
  body:not(.print-report) #content .aside-card h3{
    color:#f8fbff!important;opacity:1!important;
  }
  body:not(.print-report) #content .rail-card .eyebrow,
  body:not(.print-report) #content .aside-card .eyebrow{color:#9fc1ff!important;opacity:1!important}
  body:not(.print-report) #content .rail-attention-count{
    background:#174a9c!important;background-image:none!important;color:#fff!important;border:1px solid #6fa3e8!important;
  }
  body:not(.print-report) #content .rail-alert{
    background:#0a1724!important;background-image:none!important;color:#f8fbff!important;border-color:#31445f!important;
  }
  body:not(.print-report) #content .rail-alert-icon{
    background:#173a66!important;background-image:none!important;color:#fff!important;border-color:#5b91df!important;
  }
  body:not(.print-report) #content .rail-quick button{
    background:#0d2136!important;background-image:none!important;color:#f8fbff!important;border-color:#31445f!important;
  }
  body:not(.print-report) #content .rail-quick button.primary{
    background:#174a9c!important;background-image:none!important;color:#fff!important;border-color:#5b91df!important;
  }

  /* Navegación principal e invitado: superficies deterministas de alto contraste. */
  body:not(.print-report) #ccxNav button[data-ccx],
  body:not(.print-report) #ccgNavBtn,
  body:not(.print-report) button[data-tr-nav],
  body:not(.print-report) button[data-tr-exec]{
    background:#0d1520!important;background-image:none!important;color:#f8fbff!important;
    border:1px solid #405675!important;opacity:1!important;text-shadow:none!important;
  }
  body:not(.print-report) #ccxNav button[data-ccx] *,
  body:not(.print-report) #ccgNavBtn *,
  body:not(.print-report) button[data-tr-nav] *,
  body:not(.print-report) button[data-tr-exec] *{color:#f8fbff!important;opacity:1!important}
  body:not(.print-report) #ccxNav button[data-ccx].active,
  body:not(.print-report) #ccxNav button[data-ccx][aria-current='page'],
  body:not(.print-report) button[data-tr-nav].active,
  body:not(.print-report) button[data-tr-exec].active{
    background:#174a9c!important;background-image:none!important;color:#fff!important;border-color:#6fa3e8!important;
  }
  body:not(.print-report) #ccxNav button[data-ccx]:hover,
  body:not(.print-report) #ccgNavBtn:hover,
  body:not(.print-report) button[data-tr-nav]:hover,
  body:not(.print-report) button[data-tr-exec]:hover{background:#102039!important;border-color:#6fa3e8!important;color:#fff!important}

  /* Superficies ejecutivas deterministas: evitar fondos transparentes o gradientes ambiguos para contraste. */
  body:not(.print-report) #content .ccx-kpi,
  body:not(.print-report) #content .ccx-access button{
    background:#0d1520!important;background-image:none!important;color:#f8fbff!important;
    border-color:#31445f!important;
  }
  body:not(.print-report) #content .ccx-kpi.good{background:#0d1d17!important;background-image:none!important;border-color:#347d51!important}
  body:not(.print-report) #content .ccx-kpi.warn{background:#211b0d!important;background-image:none!important;border-color:#8a6d1f!important}
  body:not(.print-report) #content .ccx-access button:hover{background:#102039!important;background-image:none!important;border-color:#5b91df!important}

  /* Tarjetas de reportes: fondo y textos se fijan juntos para evitar contraste ambiguo tras mutaciones de tema. */
  body:not(.print-report) #content .ccx-report{
    background:#0d1520!important;background-image:none!important;color:#f8fbff!important;
    border-color:#31445f!important;opacity:1!important;
  }
  body:not(.print-report) #content .ccx-report h1,
  body:not(.print-report) #content .ccx-report h2,
  body:not(.print-report) #content .ccx-report h3,
  body:not(.print-report) #content .ccx-report h4,
  body:not(.print-report) #content .ccx-report b,
  body:not(.print-report) #content .ccx-report strong{
    color:#f8fbff!important;opacity:1!important;text-shadow:none!important;
  }

  /* Centro ejecutivo: los textos secundarios deben superar 4.5:1. */
  body:not(.print-report) #content .ccx-kpi small,
  body:not(.print-report) #content .ccx-access small,
  body:not(.print-report) #content .ccx-exec small,
  body:not(.print-report) #content .ccx-row small,
  body:not(.print-report) #content .ccx-alert small,
  body:not(.print-report) #content .ccx-audit small,
  body:not(.print-report) #content .ccx-report p,
  body:not(.print-report) #content .ccx-head p{
    color:#c3d1df!important;opacity:1!important;visibility:visible!important;
  }
  body:not(.print-report) #content .ccx-kpi.good small,
  body:not(.print-report) #content .ccx-kpi.warn small{color:#d3deea!important}

  /* Estados de auditoría: la etiqueta de integridad debe conservar contraste verificable. */
  body:not(.print-report) #content .ccx-page .status.good,
  body:not(.print-report) #content .ccx-integrity .status.good{
    background:#0d1d17!important;background-image:none!important;color:#f8fbff!important;
    border-color:#347d51!important;opacity:1!important;text-shadow:none!important;
  }
  body:not(.print-report) #content .ccx-page .status.danger,
  body:not(.print-report) #content .ccx-integrity .status.danger{
    background:#2a1013!important;background-image:none!important;color:#fff1f2!important;
    border-color:#8a3942!important;opacity:1!important;text-shadow:none!important;
  }

  /* Acciones primarias: azul suficientemente oscuro para texto blanco normal. */
  body:not(.print-report) #content .btn.primary,
  body:not(.print-report) #content button.primary{
    background:#174a9c!important;background-image:none!important;color:#fff!important;border-color:#5b91df!important;
    opacity:1!important;text-shadow:none!important;
  }
  body:not(.print-report) #content .btn.primary:hover,
  body:not(.print-report) #content button.primary:hover{background:#123f87!important;background-image:none!important;color:#fff!important}

  /* Presupuesto: eliminar transparencias/gradientes en contenedores de texto pequeño. */
  body:not(.print-report) #content .cp-budget-page,
  body:not(.print-report) #content .cp-budget-panel,
  body:not(.print-report) #content .cp-budget-kpi,
  body:not(.print-report) #content .cp-project-search-note,
  body:not(.print-report) #content .cp-exec-only,
  body:not(.print-report) #content .cp-exec-ring-card,
  body:not(.print-report) #content .cp-exec-metric{
    background:#0a131d!important;background-image:none!important;color:#f8fbff!important;
  }
  body:not(.print-report) #content .cp-budget-kpi{border-color:#315249!important}
  body:not(.print-report) #content .cp-budget-kpi.good{background:#0d1d17!important;background-image:none!important;border-color:#347d51!important}
  body:not(.print-report) #content .cp-exec-only{border-color:#315249!important}
  body:not(.print-report) #content .cp-exec-ring-card,
  body:not(.print-report) #content .cp-exec-metric{border-color:#31445f!important}
  body:not(.print-report) #content .cp-budget-table tr{background:#0a131d!important;background-image:none!important}

  body:not(.print-report) #content .cp-budget-page small,
  body:not(.print-report) #content .cp-budget-page .cp-budget-sub,
  body:not(.print-report) #content .cp-budget-page .cp-budget-pager small,
  body:not(.print-report) #content .cp-budget-page .cp-exec-ring-info small,
  body:not(.print-report) #content .cp-budget-page .cp-exec-metric small,
  body:not(.print-report) #content .cp-budget-page .cp-exec-metric span,
  body:not(.print-report) #content .cp-budget-page .cp-exec-footer span,
  body:not(.print-report) #content .cp-budget-page .cp-budget-title p,
  body:not(.print-report) #content .cp-budget-page td:before,
  body:not(.print-report) #content .cp-exec-only small,
  body:not(.print-report) #content .cp-exec-only span,
  body:not(.print-report) #content .cp-exec-only p,
  body:not(.print-report) #content .cp-exec-only .eyebrow{
    color:#d3deea!important;opacity:1!important;visibility:visible!important;
  }

  /* Valores positivos de presupuesto: texto claro sobre la superficie oscura consolidada. */
  body:not(.print-report) #content .cp-budget-page .good > strong,
  body:not(.print-report) #content .cp-budget-page .cp-budget-kpi.good > strong,
  body:not(.print-report) #content .cp-budget-page .cp-exec-metric.good > strong{
    color:#f8fbff!important;opacity:1!important;text-shadow:none!important;
  }

  /* Inicio: neutralizar restos del antiguo tema claro dentro del centro de seguimiento. */
  body:not(.print-report) #content .followup-panel,
  body:not(.print-report) #content .quick-panel{
    background:#0d1520!important;background-image:none!important;color:#f8fbff!important;
    border-color:#31445f!important;
  }
  body:not(.print-report) #content .followup-panel .eyebrow,
  body:not(.print-report) #content .quick-panel .eyebrow{
    color:#b8d1ff!important;opacity:1!important;
  }
  body:not(.print-report) #content .followup-panel .muted,
  body:not(.print-report) #content .quick-panel .muted{
    color:#c3d1df!important;opacity:1!important;
  }
  body:not(.print-report) #content .followup-count{
    background:#102b52!important;background-image:none!important;color:#fff!important;
    border-color:#4f78ad!important;opacity:1!important;
  }
  body:not(.print-report) #content .followup-mini{
    background:#09131d!important;background-image:none!important;color:#f8fbff!important;
    border-color:#2c4055!important;
  }
  body:not(.print-report) #content .followup-mini small{color:#c3d1df!important;opacity:1!important}
  body:not(.print-report) #content .followup-mini b{color:#f8fbff!important;opacity:1!important}
  body:not(.print-report) #content .followup-mini.danger b{color:#fecaca!important}
  body:not(.print-report) #content .followup-mini.warn b{color:#fef08a!important}
  body:not(.print-report) #content .followup-mini.good b{color:#bbf7d0!important}

  /* Alertas compactas del Inicio: fondo y texto deben pertenecer al mismo tema. */
  body:not(.print-report) #content .cp-alerts-compact{
    background:#09131d!important;background-image:none!important;color:#f8fbff!important;
    border-color:#31445f!important;
  }
  body:not(.print-report) #content .cp-alerts-head b,
  body:not(.print-report) #content .cp-alert-chip strong{color:#f8fbff!important;opacity:1!important}
  body:not(.print-report) #content .cp-alerts-head small{color:#c3d1df!important;opacity:1!important}
  body:not(.print-report) #content .cp-alert-chip{
    background:#0d1825!important;background-image:none!important;color:#d6e2ef!important;
    border-color:#33485e!important;opacity:1!important;
  }
  body:not(.print-report) #content .cp-alerts-open{
    background:#102039!important;background-image:none!important;color:#f8fbff!important;
    border-color:#405675!important;
  }

  /* La nota de proyectos es oscura por la guardia; sus descendientes también deben ser claros. */
  body:not(.print-report) #content .cp-project-search-note b{
    color:#f8fbff!important;opacity:1!important;
  }

  /* Dashboard evaluativo del expediente: textos pequeños con margen suficiente sobre superficies claras. */
  body:not(.print-report) #content .ped-shell .ped-kpi span,
  body:not(.print-report) #content .ped-shell .ped-panel-head p,
  body:not(.print-report) #content .ped-shell .ped-process p,
  body:not(.print-report) #content .ped-shell .ped-alert small,
  body:not(.print-report) #content .ped-shell .ped-foot{
    color:#536476!important;opacity:1!important;visibility:visible!important;
  }
  body:not(.print-report) #content .ped-shell .ped-badge.na{
    background:#edf1f5!important;background-image:none!important;color:#4f6173!important;
  }
  body:not(.print-report) #content .ped-shell .ped-empty{
    background:#e2f3e9!important;background-image:none!important;color:#1f5f42!important;
  }

  /* En superficies oscuras conocidas, un atributo calculado con un fondo heredado no puede invertir el texto. */
  body:not(.print-report) #content .ccx-page [data-cc-readable],
  body:not(.print-report) #content .cp-budget-page [data-cc-readable],
  body:not(.print-report) #content .cp-exec-only [data-cc-readable],
  body:not(.print-report) #content .rail-card [data-cc-readable],
  body:not(.print-report) #content .exec-overview [data-cc-readable],
  body:not(.print-report) #ccxNav [data-cc-readable],
  body:not(.print-report) #ccgNavBtn[data-cc-readable],
  body:not(.print-report) button[data-tr-nav][data-cc-readable],
  body:not(.print-report) button[data-tr-exec][data-cc-readable]{
    color:#f8fbff!important;opacity:1!important;visibility:visible!important;
  }
  `;
}

install();
setTimeout(install,350);
setTimeout(install,1200);
window.ccRunContrastHardening=install;
})();