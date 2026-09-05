/* Fuente única de módulos para el arranque autenticado.
   Mantener nombres y versiones aquí evita que pestañas, build, estabilizador y
   workflows creen catálogos incompatibles. Arquitectura, recorrido real,
   responsive y publicación validan estas mismas versiones antes de liberar. */

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
  /* Antes de instalar módulos que observan documentElement completo, se
     gobiernan sus callbacks a una entrega por frame y se neutralizan escrituras
     idénticas de DOM que alimentaban observadores creados por el núcleo. */
  ['mutation-observer-governor-v1.js','20260905-observergovernor2'],
  /* Estos dos módulos son críticos para la primera navegación autenticada.
     Sus versiones viven aquí para que arquitectura y publicación prueben
     exactamente el mismo artefacto. */
  ['project-tabs-complete-v1.js','20260831-tabscomplete34'],
  ['ui-navigation-single-source-v1.js','20260905-singlenav6'],
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
  /* El dashboard evaluativo histórico observa documentElement completo. La
     guardia limita su callback a un máximo de una ejecución por frame para que
     un cambio de pestaña no pueda encadenar microtareas sin devolver el hilo. */
  ['project-evaluation-observer-guard-v1.js','20260905-projectevalobserver1'],
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
  /* Refinamiento visual general: ahora forma parte del plan canónico para
     invalidar la caché de la versión que observaba y reescribía style. */
  ['system-ui-refinement-v3.js','20260905-system6'],
  /* El Manual histórico reescribe el texto de su propio botón desde un
     MutationObserver global. La guardia impide que esa escritura se alimente
     a sí misma y conserva la detección de contenedores nuevos. */
  ['engineering-manual-observer-guard-v1.js','20260904-manualobserver1'],
  ['engineering-manual-reference-v1.js','20260823-manual2'],
  ['technical-control-permissions-v1.js','20260905-controltecnicoperm6'],
  ['technical-control-scope-v2.js','20260904-controlscope5'],
  ['immersive-engineering-experience-v1.js','20260828-immersive2'],
  ['ui-visibility-audit-v1.js','20260904-visibility5'],
  ['ui-contrast-hardening-v1.js','20260831-contrast5'],
  ['contract-official-format-v1.js','20260831-phone3'],
  ['contract-document-safety-v1.js','20260904-docsafety3'],
  ['contract-payment-documents-v1.js','20260904-advance-docs4'],
  ['contract-preview-v1.js','20260904-preview2'],
  /* ZORDON antes del cierre técnico: buscador y densidad se cargan únicamente
     desde este plan para impedir versiones históricas o cargadores secundarios. */
  ['zordon-continuous-runtime-v1.js','20260905-zordon5'],
  ['zordon-project-search-v1.js','20260905-zordonsearch5'],
  /* Coordina Enter en la búsqueda superior con el motor normalizado de ZORDON
     y emite un refresco no destructivo para decoraciones cargadas por fases. */
  ['authenticated-ui-sync-v1.js','20260905-authuisync1'],
  ['zordon-unified-density-v1.js','20260905-density2'],
  ['zordon-chat-ui-v1.js','20260905-cleanchat5'],
  /* Última corrección visual general, antes del par técnico que debe seguir
     siendo el cierre funcional del plan autenticado. */
  ['ui-contrast-final-guard-v1.js','20260905-contrast-final9'],
  /* El guard se ejecuta inmediatamente antes del módulo técnico histórico y
     filtra su MutationObserver global sin afectar los observadores del resto. */
  ['technical-control-observer-guard-v1.js','20260904-controlobserver1'],
  ['technical-control-v1.js','20260830-controltecnico1'],
];

module.exports={retiredModules,preAuthModules,supplementalModules};