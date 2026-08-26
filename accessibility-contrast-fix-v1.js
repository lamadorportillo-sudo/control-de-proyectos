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
`;
document.head.appendChild(style);
})();
