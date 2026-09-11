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
  ['mutation-observer-governor-v1.js','20260907-observergovernor3'],
  /* Estos dos módulos son críticos para la primera navegación autenticada.
     Sus versiones viven aquí para que arquitectura y publicación prueben
     exactamente el mismo artefacto. */
  ['project-tabs-complete-v1.js','20260831-tabscomplete34'],
  ['ui-navigation-single-source-v1.js','20260911-alertaudit10'],
  ['security-runtime-v1.js','20260904-security4'],
  ['mfa-security-v1.js','20260824-mfa4'],
  ['security-center-v1.js','20260823-securitycenter4'],
  ['mobile-popup-fallback-v1.js','20260821-mobilepopup1'],
  ['progress-separation-fix-v1.js','20260821-progresssep1'],
  ['programacion-control-v1.js','20260823-programacion4'],
  ['change-order-fix-v1.js','20260905-changefix2'],
  ['contract-penalty-card-v1.js','20260831-penalty2'],
  ['contract-explicit-rules-v1.js','20260904-explicit1'],
  /* El monto vigente no es un dato libre: se deriva del monto original más
     modificaciones aprobadas y se sincroniza antes de guardar. */
  ['contract-current-amount-sync-v1.js','20260905-contractcurrent1'],
  ['report-professional-v1.js','20260823-reportpro4'],
  ['report-export-css-fix-v1.js','20260821-reportcss1'],
  ['document-qr-v1.js','20260831-docqr1'],
  ['transparency-exec-bridge-v1.js','20260821-trbridge1'],
  ['transparency-portal-v1.js','20260911-transparency4'],
  ['transparency-storage-v1.js','20260821-trstorage1'],
  ['budget-search-fix-v1.js','20260821-budgetsearch1'],
  /* El dashboard evaluativo histórico observa documentElement completo. La
     guardia limita su callback a un máximo de una ejecución por frame para que
     un cambio de pestaña no pueda encadenar microtareas sin devolver el hilo. */
  ['project-evaluation-observer-guard-v1.js','20260905-projectevalobserver1'],
  ['project-evaluation-dashboard-v1.js','20260904-projectevaluation2'],
  ['project-functional-actions-v1.js','20260821-actions2'],
  ['visit-independent-reports-v1.js','20260905-visitsind2'],
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
  /* Permite adjuntar el contrato real y completar/corregir la ficha sin rehacer el expediente. */
  ['contract-file-repository-v2.js','20260910-intake1'],
  ['contract-intake-v1.js','20260911-intake2'],
  ['contract-preview-v1.js','20260904-preview2'],
  /* ZORDON antes del cierre técnico: buscador y densidad se cargan únicamente
     desde este plan para impedir versiones históricas o cargadores secundarios.
     Los identificadores 20260908 fuerzan al navegador a abandonar las copias
     antiguas que producían respuestas locales y tono incorrecto. */
  ['zordon-continuous-runtime-v1.js','20260908-zordon5'],
  ['zordon-project-search-v1.js','20260908-zordonsearch7'],
  /* Coordina Enter en la búsqueda superior con el motor normalizado de ZORDON,
     preserva la consulta visible tras el rerender y refresca decoraciones. */
  ['authenticated-ui-sync-v1.js','20260905-authuisync2'],
  ['zordon-unified-density-v1.js','20260905-density2'],
  ['zordon-chat-ui-v1.js','20260908-cleanchat6'],
  /* El expediente documental usa superficies claras y necesita una corrección
     contextual antes de la guardia visual final. */
  ['contract-document-contrast-v1.js','20260905-contractdoccontrast3'],
  /* Última corrección visual general, antes del par técnico que debe seguir
     siendo el cierre funcional del plan autenticado. */
  ['ui-contrast-final-guard-v1.js','20260905-contrast-final10'],
  /* El guard se ejecuta inmediatamente antes del módulo técnico histórico y
     filtra su MutationObserver global sin afectar los observadores del resto. */
  ['technical-control-observer-guard-v1.js','20260904-controlobserver1'],
  ['technical-control-v1.js','20260830-controltecnico1'],
];

/* Módulos que el constructor histórico necesita añadir al artefacto y que no
   forman parte del plan suplementario. Sus versiones también viven aquí para
   que build, estabilización y pruebas no mantengan catálogos divergentes. */
const buildOnlyModules=[
  ['workspace-access-v1.js','20260820-master4'],
  ['admin-users-v1.js','20260823-admin-users4'],
  ['alerts-compact-v1.js','20260820-master4'],
  ['engineering-ux-v1.js','20260820-master4'],
  ['procurement-thresholds-v1.js','20260820-gacetas4'],
  ['contracts-center-v1.js','20260820-contracts2'],
  ['corporate-ui-v1.js','20260820-corporate3'],
  ['corporate-polish-v1.js','20260820-polish6'],
  ['procurement-award-fix-v1.js','20260820-award3'],
  ['visit-photos-v1.js','20260820-visits1'],
  ['award-notices-v1.js','20260820-notes1'],
  ['visit-photo-persistence-v2.js','20260820-photopersist2'],
  ['visit-print-v3.js','20260820-visitprint3'],
  ['procurement-invitations-v2.js','20260820-invitations2'],
  ['procurement-offers-invitees-v1.js','20260822-offersinvitees2'],
  ['summary-budget-law-v1.js','20260820-summarybudgetlaw1'],
  ['project-search-clean-v1.js','20260911-searchclean4'],
  ['storage-quota-fix-v1.js','20260820-storagequota2'],
  ['feature-lazy-loader-v1.js','20260824-lazy3'],
  ['procurement-process-save-v4.js','20260820-procsave4'],
  ['contract-integrity-fix-v1.js','20260822-integrity1'],
  ['integrity-hardening-v2.js','20260822-integrity2'],
  ['cross-module-sync-v1.js','20260822-relations1'],
  ['web-knowledge-v2.js','20260822-short1'],
  ['adaptive-chat-learning-v1.js','20260822-global1'],
  ['halu-page-controller-v1.js','20260824-control1'],
  ['engineer-chatbot-v3.js','20260824-ai5'],
  ['halu-avatar-motion-v1.js','20260822-place13'],
];

/* Orden exacto de inyección del constructor. Los módulos retirados no aparecen
   aquí; cambiar una versión se hace únicamente en preAuth/supplemental/buildOnly. */
const buildLateOrder=[
  'workspace-access-v1.js',
  'private-access-v1.js',
  'password-recovery-v1.js',
  'admin-users-v1.js',
  'security-runtime-v1.js',
  'security-center-v1.js',
  'mfa-security-v1.js',
  'alerts-compact-v1.js',
  'engineering-ux-v1.js',
  'procurement-thresholds-v1.js',
  'contracts-center-v1.js',
  'corporate-ui-v1.js',
  'corporate-polish-v1.js',
  'procurement-award-fix-v1.js',
  'visit-photos-v1.js',
  'award-notices-v1.js',
  'visit-photo-persistence-v2.js',
  'visit-print-v3.js',
  'procurement-invitations-v2.js',
  'procurement-offers-invitees-v1.js',
  'summary-budget-law-v1.js',
  'project-search-clean-v1.js',
  'storage-quota-fix-v1.js',
  'project-tabs-complete-v1.js',
  'feature-lazy-loader-v1.js',
  'procurement-process-save-v4.js',
  'contract-integrity-fix-v1.js',
  'integrity-hardening-v2.js',
  'cross-module-sync-v1.js',
  'programacion-control-v1.js',
  'web-knowledge-v2.js',
  'engineering-manual-reference-v1.js',
  'adaptive-chat-learning-v1.js',
  'halu-page-controller-v1.js',
  'engineer-chatbot-v3.js',
  'halu-avatar-motion-v1.js',
  'transparency-portal-v1.js',
  'photo-gallery-polish-v2.js',
  'ui-theme-unifier-v1.js',
  'engineering-visibility-fix-v1.js',
  'ui-operational-polish-v1.js',
  'ui-visibility-audit-v1.js',
  'portfolio-gallery-v1.js',
  'project-photo-story-v1.js',
];

const canonicalModuleVersions=new Map([...preAuthModules,...supplementalModules,...buildOnlyModules]);
const buildLateModules=buildLateOrder.map(moduleFile=>{
  const version=canonicalModuleVersions.get(moduleFile);
  if(!version)throw new Error(`Falta versión canónica para ${moduleFile}`);
  return[moduleFile,version];
});

module.exports={retiredModules,preAuthModules,supplementalModules,buildOnlyModules,buildLateModules};
