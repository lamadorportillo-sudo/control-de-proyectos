/* ===== ACCESIBILIDAD · CONTRASTE WCAG AA V1 ===== */
(()=>{
'use strict';
if(window.__CC_ACCESSIBILITY_CONTRAST_FIX_V1__)return;
window.__CC_ACCESSIBILITY_CONTRAST_FIX_V1__=true;

const STYLE_ID='cc-accessibility-contrast-fix-v1-style';
if(document.getElementById(STYLE_ID))return;
const style=document.createElement('style');
style.id=STYLE_ID;
style.textContent=`
/* Texto auxiliar sobre superficies claras: contraste >= WCAG AA. */
html body:not(.print-report) .service-tile > span{
  color:#59685e!important;
}

/* Estado de sincronización sobre blanco. */
html body:not(.print-report) #ccxSync{
  color:#536477!important;
}
html body:not(.print-report) #ccxSync > b{
  color:#0d7048!important;
}

/* Etiqueta PORTAFOLIO y equivalentes sobre fondo claro. */
html body:not(.print-report) .ccx-head .eyebrow[data-cc-contrast="dark"]{
  color:#315f9e!important;
}

/* Encabezado del portafolio en modo invitado sobre superficies claras. */
html body.cc-guest-mode:not(.print-report) .ccx-head h2{
  color:#17324d!important;
}
html body.cc-guest-mode:not(.print-report) .ccx-head p:not(.eyebrow){
  color:#4b5f73!important;
}

/* Aviso inferior del modo invitado: texto pequeño requiere contraste reforzado. */
html body.cc-guest-mode:not(.print-report) .footer-note{
  color:#44566a!important;
}
`;
document.head.appendChild(style);
})();
