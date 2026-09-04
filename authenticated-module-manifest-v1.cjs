/* Fuente única de módulos suplementarios para el arranque autenticado.
   Estos recursos antes se cargaban desde project-tabs-complete-v1.js.
   Mantenerlos aquí evita que una capa visual vuelva a convertirse en un
   segundo gestor de dependencias y permite verificar versiones y orden. */

const retiredModules=[
  'system-ui-refinement-v2.js',
  'dashboard-executive-v1.js',
  'home-executive-fix-v2.js',
  'industrial-home-v1.js',
  'portfolio-redesign-v1.js',
  'project-portfolio-detail-v1.js',
  'portfolio-screen-fix-v1.js',
];

const supplementalModules=[
  ['security-runtime-v1.js','20260823-security3'],
  ['mfa-security-v1.js','20260824-mfa4'],
  ['security-center-v1.js','20260823-securitycenter4'],
  ['mobile-popup-fallback-v1.js','20260821-mobilepopup1'],
  ['progress-separation-fix-v1.js','20260821-progresssep1'],
  ['programacion-control-v1.js','20260823-programacion4'],
  ['change-order-fix-v1.js','20260821-changefix1'],
  ['contract-penalty-card-v1.js','20260831-penalty2'],
  ['report-professional-v1.js','20260823-reportpro4'],
  ['report-export-css-fix-v1.js','20260821-reportcss1'],
  ['document-qr-v1.js','20260831-docqr1'],
  ['transparency-exec-bridge-v1.js','20260821-trbridge1'],
  ['transparency-portal-v1.js','20260822-transparency1'],
  ['transparency-storage-v1.js','20260821-trstorage1'],
  ['budget-search-fix-v1.js','20260821-budgetsearch1'],
  ['project-evaluation-dashboard-v1.js','20260828-projectevaluation1'],
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
  ['technical-control-v1.js','20260830-controltecnico1'],
  ['technical-control-permissions-v1.js','20260830-controltecnicoperm1'],
  ['technical-control-scope-v2.js','20260831-controlscope2'],
  ['immersive-engineering-experience-v1.js','20260828-immersive2'],
  ['ui-visibility-audit-v1.js','20260831-visibility4'],
  ['ui-contrast-hardening-v1.js','20260831-contrast5'],
  ['contract-official-format-v1.js','20260831-phone3'],
  ['contract-payment-documents-v1.js','20260831-advance-docs3'],
  ['contract-preview-v1.js','20260831-preview1'],
];

module.exports={retiredModules,supplementalModules};
