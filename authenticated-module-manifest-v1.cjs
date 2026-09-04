/* Fuente única de módulos para el arranque autenticado.
   Mantener nombres y versiones aquí evita que pestañas, build, estabilizador y
   workflows creen catálogos incompatibles. */

const retiredModules=[
  'system-ui-refinement-v2.js',
  'dashboard-executive-v1.js',
  'home-executive-fix-v2.js',
  'industrial-home-v1.js',
  'portfolio-redesign-v1.js',
  'project-portfolio-detail-v1.js',
  'portfolio-screen-fix-v1.js',
];

/* Únicos módulos que pueden ejecutarse sin sesión. */
const preAuthModules=[
  ['private-access-v1.js','20260904-private6'],
  ['password-recovery-v1.js','20260822-password1'],
];

const supplementalModules=[
  ['security-runtime-v1.js','20260904-security4'],
  ['mfa-security-v1.js','20260824-mfa4'],
  ['security-center-v1.js','20260823-securitycenter4'],
  ['mobile-popup-fallback-v1.js','20260821-mobilepopup1'],
  ['progress-separation-fix-v1.js','20260821-progresssep1'],
  ['programacion-control-v1.js','20260823-programacion4'],
  ['change-order-fix-v1.js','20260821-changefix1'],
  ['contract-penalty-card-v1.js','20260831-penalty2'],
  ['contract-explicit-rules-v1.js','20260904-explicit1'],
  ['report-professional-v1.js','20260823-reportpro4'],
  ['report-export-css-fix-v1.js','20260821-reportcss1'],
  ['document-qr-v1.js','20260831-docqr1'],
  ['transparency-exec-bridge-v1.js','20260821-trbridge1'],
  ['transparency-portal-v1.js','20260822-transparency1'],
  ['transparency-storage-v1.js','20260821-trstorage1'],
  ['budget-search-fix-v1.js','20260821-budgetsearch1'],
  ['project-evaluation-dashboard-v1.js','20260904-projectevaluation2'],
  ['project-functional-actions-v1.js','20260821-actions2'],
  ['visit-independent-reports-v1.js','20260821-visitsind1'],
  ['portfolio-gallery-v1.js','20260828-gallery3'],
  ['project-photo-story-v1.js','20260821-photostory1'],
  ['photo-gallery-polish-v2.js','20260822-photopolish2'],
  ['project-card-engineering-fix-v1.js','20260821-cardengfix1'],
  ['ui-theme-unifier-v1.js','20260824-theme3d2'],
  ['engineering-visibility-fix-v1.js','20260822-visibility1'],
  ['ui-operational-polish-v1.js','20260822-operational2'],
  ['engineering-manual-reference-v1.js','20260823-manual2'],
  ['technical-control-permissions-v1.js','20260904-controltecnicoperm4'],
  ['technical-control-scope-v2.js','20260904-controlscope4'],
  ['immersive-engineering-experience-v1.js','20260828-immersive2'],
  ['ui-visibility-audit-v1.js','20260831-visibility4'],
  ['ui-contrast-hardening-v1.js','20260831-contrast5'],
  ['contract-official-format-v1.js','20260831-phone3'],
  ['contract-document-safety-v1.js','20260904-docsafety3'],
  ['contract-payment-documents-v1.js','20260904-advance-docs4'],
  ['contract-preview-v1.js','20260904-preview2'],
  /* Se carga al final porque su montaje observa y amplía las pestañas del
     expediente. Así no compite con la inserción secuencial del resto del plan. */
  ['technical-control-v1.js','20260830-controltecnico1'],
];

module.exports={retiredModules,preAuthModules,supplementalModules};
