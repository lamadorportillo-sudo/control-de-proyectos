/* ===== CONTROL CONTRACTUAL · ENDURECIMIENTO DE CONTRASTE V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRAST_HARDENING_V1__)return;
window.__CC_CONTRAST_HARDENING_V1__=true;

const STYLE_ID='cc-contrast-hardening-v1-style';
function install(){
  let s=document.getElementById(STYLE_ID);
  if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
  s.textContent=`
  /* Centro ejecutivo: los textos secundarios deben superar 4.5:1. */
  body:not(.print-report) #content .ccx-kpi small,
  body:not(.print-report) #content .ccx-access small,
  body:not(.print-report) #content .ccx-exec small,
  body:not(.print-report) #content .ccx-row small,
  body:not(.print-report) #content .ccx-alert small,
  body:not(.print-report) #content .ccx-audit small,
  body:not(.print-report) #content .ccx-report p,
  body:not(.print-report) #content .ccx-head p{
    color:#b8c8da!important;opacity:1!important;visibility:visible!important;
  }
  body:not(.print-report) #content .ccx-kpi.good small,
  body:not(.print-report) #content .ccx-kpi.warn small{color:#c4d3e2!important}

  /* Acciones primarias: azul suficientemente oscuro para texto blanco normal. */
  body:not(.print-report) #content .btn.primary,
  body:not(.print-report) #content button.primary{
    background:#174a9c!important;color:#fff!important;border-color:#5b91df!important;
    opacity:1!important;text-shadow:none!important;
  }
  body:not(.print-report) #content .btn.primary:hover,
  body:not(.print-report) #content button.primary:hover{background:#123f87!important;color:#fff!important}

  /* Presupuesto y control de ejecución: estabilizar textos pequeños en superficies oscuras/gradientes. */
  body:not(.print-report) #content .cp-budget-page .cp-budget-sub,
  body:not(.print-report) #content .cp-budget-page .cp-budget-pager small,
  body:not(.print-report) #content .cp-budget-page .cp-exec-ring-info small,
  body:not(.print-report) #content .cp-budget-page .cp-exec-metric small,
  body:not(.print-report) #content .cp-budget-page .cp-exec-metric span,
  body:not(.print-report) #content .cp-budget-page .cp-exec-footer span,
  body:not(.print-report) #content .cp-budget-page .cp-budget-title p,
  body:not(.print-report) #content .cp-budget-page td:before{
    color:#b7c8da!important;opacity:1!important;visibility:visible!important;
  }

  /* La reparación automática no puede convertir a oscuro texto que vive en superficies conocidas como oscuras. */
  body:not(.print-report) #content .ccx-page [data-cc-readable],
  body:not(.print-report) #content .cp-budget-page [data-cc-readable],
  body:not(.print-report) #content .cp-exec-only [data-cc-readable]{
    color:#f8fbff!important;opacity:1!important;visibility:visible!important;
  }
  `;
}

function repairKnownDarkSurfaces(){
  document.querySelectorAll('#content .ccx-page [data-cc-readable="dark"],#content .cp-budget-page [data-cc-readable="dark"],#content .cp-exec-only [data-cc-readable="dark"]').forEach(el=>{
    el.dataset.ccReadable='light';
  });
}
function run(){install();repairKnownDarkSurfaces()}
let queued=false;
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})}
run();
new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','data-cc-readable']});
setTimeout(run,250);setTimeout(run,800);setTimeout(run,1800);
window.ccRunContrastHardening=run;
})();
