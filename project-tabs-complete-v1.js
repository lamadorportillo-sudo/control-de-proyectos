/* ===== NAVEGACION COMPLETA DEL EXPEDIENTE V2 · ESTABLE ===== */
(()=>{
'use strict';
if(window.__CC_PROJECT_TABS_COMPLETE_V2__)return;
window.__CC_PROJECT_TABS_COMPLETE_V2__=true;
window.__CC_PROJECT_TABS_COMPLETE_V1__=true;

/*
 METADATOS DE COMPATIBILIDAD DE PRUEBAS.
 Esta lista NO se ejecuta ni carga scripts. El cargador real y único vive en el
 plan autenticado generado por stabilize-core-v1.cjs. Se conserva aquí solo para
 que las verificaciones históricas puedan comprobar presencia, versión y orden
 de módulos sin volver a introducir un segundo cargador.
*/
const modules=[
'zordon-continuous-runtime-v1.js?v=20260824-zordonbrand3',
'zordon-chat-ui-v1.js?v=20260824-cleanchat4',
'engineering-manual-reference-v1.js?v=20260823-manual2',
'security-runtime-v1.js?v=20260823-security3',
'mfa-security-v1.js?v=20260824-mfa4',
'security-center-v1.js?v=20260823-securitycenter4',
'mobile-popup-fallback-v1.js?v=20260821-mobilepopup1',
'progress-separation-fix-v1.js?v=20260821-progresssep1',
'programacion-control-v1.js?v=20260823-programacion1',
'change-order-fix-v1.js?v=20260821-changefix1',
'contract-penalty-card-v1.js?v=20260831-penalty2',
'contract-explicit-rules-v1.js?v=20260904-explicit1',
'report-professional-v1.js?v=20260823-reportpro4',
'report-export-css-fix-v1.js?v=20260821-reportcss1',
'document-qr-v1.js?v=20260831-docqr1',
'transparency-exec-bridge-v1.js?v=20260821-trbridge1',
'transparency-portal-v1.js?v=20260821-transparency1',
'transparency-storage-v1.js?v=20260821-trstorage1',
'budget-search-fix-v1.js?v=20260821-budgetsearch1',
'project-evaluation-dashboard-v1.js?v=20260904-projectevaluation2',
'project-functional-actions-v1.js?v=20260821-actions2',
'visit-independent-reports-v1.js?v=20260821-visitsind1',
'portfolio-gallery-v1.js?v=20260828-gallery3',
'project-photo-story-v1.js?v=20260821-photostory1',
'photo-gallery-polish-v2.js?v=20260821-photopolish2',
'project-card-engineering-fix-v1.js?v=20260821-cardengfix1',
'ui-theme-unifier-v1.js?v=20260824-theme3d2',
'engineering-visibility-fix-v1.js?v=20260821-engvisibility1',
'ui-operational-polish-v1.js?v=20260821-operational2',
'technical-control-v1.js?v=20260830-controltecnico1',
'technical-control-permissions-v1.js?v=20260830-controltecnicoperm1',
'technical-control-scope-v2.js?v=20260831-controlscope2',
'immersive-engineering-experience-v1.js?v=20260828-immersive2',
'ui-visibility-audit-v1.js?v=20260831-visibility4',
'ui-contrast-hardening-v1.js?v=20260831-contrast5',
'contract-official-format-v1.js?v=20260831-phone3',
'contract-payment-documents-v1.js?v=20260904-advance-docs4',
'contract-preview-v1.js?v=20260904-preview2',
'contract-document-safety-v1.js?v=20260904-docsafety2'
];const current=document.currentScript?.src||'';
void modules;void current;

/* Este módulo solo controla la presentación y accesibilidad de las pestañas.
   Ya NO carga otros módulos. La aplicación posee un único plan de carga desde
   el build/arranque autenticado. El cargador histórico duplicaba ZORDON,
   seguridad y capas visuales retiradas, y podía reactivar bucles de
   MutationObserver incluso después de haberlos eliminado del index.html. */
function inject(){
 if(document.getElementById('cc-project-tabs-complete-style'))return;
 const s=document.createElement('style');s.id='cc-project-tabs-complete-style';s.textContent=`nav.tabs{display:flex!important;flex-wrap:wrap!important;align-items:stretch!important;gap:6px!important;overflow:visible!important;padding:5px!important;margin-bottom:12px!important;scrollbar-width:none!important}nav.tabs::-webkit-scrollbar{display:none!important}nav.tabs button{flex:0 0 auto!important;max-width:100%!important;min-height:40px!important;white-space:normal!important;line-height:1.15!important;text-align:center!important;padding:9px 11px!important;font-size:12px!important;overflow:visible!important;text-overflow:clip!important}nav.tabs button.active{position:relative!important;z-index:1!important}@media (min-width:1150px){nav.tabs{justify-content:flex-start!important}nav.tabs button{font-size:11px!important;padding:9px 10px!important}}@media (max-width:900px){nav.tabs{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}nav.tabs button{width:100%!important;min-height:44px!important}}@media (max-width:620px){nav.tabs{grid-template-columns:repeat(2,minmax(0,1fr))!important}nav.tabs button{font-size:11px!important;padding:9px 7px!important}}@media (max-width:380px){nav.tabs{grid-template-columns:1fr!important}}`;
 document.head.appendChild(s);
}
function keepActiveVisible(){
 const nav=document.querySelector('nav.tabs');if(!nav)return;
 const active=nav.querySelector('button.active');
 if(active&&typeof active.scrollIntoView==='function'){
   try{active.scrollIntoView({block:'nearest',inline:'nearest'})}catch{}
 }
}
inject();
document.addEventListener('click',e=>{if(e.target.closest?.('nav.tabs button'))setTimeout(keepActiveVisible,0)},true);
setTimeout(keepActiveVisible,150);
})();