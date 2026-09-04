const assert=require('node:assert/strict');
const fs=require('node:fs');
const {retiredModules}=require('../authenticated-module-manifest-v1.cjs');

const nav=fs.readFileSync('ui-navigation-single-source-v1.js','utf8');
const uiStability=fs.readFileSync('ui-stability-v1.js','utf8');
const perf=fs.readFileSync('performance-runtime-v1.js','utf8');
const storage=fs.readFileSync('storage-quota-fix-v1.js','utf8');
const coreHardening=fs.readFileSync('core-hardening-v1.js','utf8');
const stabilizer=fs.readFileSync('stabilize-core-v1.cjs','utf8');
const inject=fs.readFileSync('inject-portfolio.cjs','utf8');
const tabs=fs.readFileSync('project-tabs-complete-v1.js','utf8');
const official=fs.readFileSync('contract-official-format-v1.js','utf8');
const documents=fs.readFileSync('contract-payment-documents-v1.js','utf8');
const privateAccess=fs.readFileSync('private-access-v1.js','utf8');

// Navegación: la barra lateral debe gobernar directamente la vista.
assert.match(nav,/view\.screen='projects'/,'Inicio/Proyectos debe manejar el estado real de la vista');
assert.doesNotMatch(nav,/querySelector\(`\[data-ccx=/,'no debe localizar botones ocultos del motor ejecutivo');
assert.doesNotMatch(nav,/btn\.click\(\)/,'no debe accionar navegación heredada con clics sintéticos');
assert.match(nav,/cc_main_route_v2/,'debe conservar una sola intención de ruta principal');

// Estabilidad visual: nunca debe volver a convertirse en un segundo router.
assert.match(uiStability,/ESTABILIDAD VISUAL V2/,'la capa de estabilidad debe declararse solo visual');
assert.doesNotMatch(uiStability,/function\s+hiddenExecutive/,'la estabilidad visual no debe buscar navegación ejecutiva oculta');
assert.doesNotMatch(uiStability,/function\s+fallbackRoute/,'la estabilidad visual no debe decidir rutas de respaldo');
assert.doesNotMatch(uiStability,/stopImmediatePropagation\(/,'la estabilidad visual no debe competir por los clics del sidebar');
assert.doesNotMatch(uiStability,/\.click\(\)/,'la estabilidad visual no debe disparar navegación sintética');

// Pestañas: son presentación, no un segundo gestor de dependencias.
assert.match(tabs,/NAVEGACION COMPLETA DEL EXPEDIENTE V2 · ESTABLE/,'debe estar activa la versión estable de pestañas');
assert.match(tabs,/METADATOS DE COMPATIBILIDAD DE PRUEBAS/,'las referencias históricas deben ser solo metadatos');
assert.doesNotMatch(tabs,/function\s+loadPortfolioModules/,'las pestañas no deben volver a cargar el portafolio completo');
assert.doesNotMatch(tabs,/document\.createElement\(['"]script['"]\)/,'las pestañas no deben inyectar módulos ejecutables');
for(const file of retiredModules){
  assert(!tabs.includes(file),`las pestañas no pueden reactivar la capa retirada ${file}`);
}

// Rendimiento: nunca volver a secuestrar MutationObserver global.
assert.match(perf,/__ccNativeMutationObserver/,'debe conservar referencia al observador nativo');
assert.doesNotMatch(perf,/window\.MutationObserver\s*=/,'no debe reemplazar MutationObserver global');
assert.doesNotMatch(perf,/MAX_PASSES/,'no debe descartar actualizaciones después de un número fijo de pasadas');

// Arranque de nube: 12 s es presupuesto total, no 12 s por cada petición.
assert.match(coreHardening,/let startupDeadline=0/,'debe existir un límite temporal compartido del arranque');
assert.match(coreHardening,/function beginStartupBudget\(\)/,'debe iniciar un presupuesto global de arranque');
assert.match(coreHardening,/const remaining=Math\.max\(1,deadline-Date\.now\(\)\)/,'cada petición debe usar solo el tiempo restante del presupuesto global');
assert.match(coreHardening,/const deadline=beginStartupBudget\(\);[\s\S]*workspace_members[\s\S]*profiles[\s\S]*readCloudRow\(deadline\)/,'membresía, perfil y estado deben compartir el mismo deadline');
assert.match(coreHardening,/finally\{\s*clearStartupBudget\(\);\s*\}/,'el presupuesto debe liberarse cuando termine el arranque');
assert.match(coreHardening,/deadline\?await startupSbFetch\(path,undefined,deadline\):await sbFetch\(path\)/,'las lecturas posteriores al arranque no deben heredar un deadline vencido');

// Fotografías: una reducción de caché local no equivale a carga confirmada en nube.
assert.match(storage,/photoLocalCacheOmitted=true/,'debe distinguir foto omitida de la copia local');
assert.doesNotMatch(storage,/photoStoredInCloud=true/,'no puede afirmar que una foto está en nube sin confirmación del uploader');
assert.match(storage,/cc:data-changed/,'un guardado debe avisar al resto de módulos para refrescar la interfaz');

// Documentos: JSZip puede cargarse al generar Word, nunca durante el arranque.
assert.doesNotMatch(official,/const\s+JSZIP_URL/,'la corrección institucional no debe declarar una descarga CDN propia');
assert.doesNotMatch(official,/document\.createElement\(['"]script['"]\).*JSZIP_URL/s,'la corrección institucional no debe iniciar una descarga CDN');
assert.doesNotMatch(official,/ensureJSZip\(\)/,'no debe existir un cargador JSZip ejecutado al iniciar');
assert.match(official,/watchForLazyJSZip\(\)/,'la corrección debe esperar la carga solicitada por el generador');
assert.match(documents,/async function zipLib\(\).*loadScript\(JSZIP_URL/s,'JSZip se conserva como dependencia diferida del generador Word');
assert.match(documents,/async function generate\(/,'la carga documental ocurre dentro de una acción explícita de generación');
assert(stabilizer.includes('jsdelivr')&&stabilizer.includes('jszip'),'el estabilizador debe eliminar cualquier script JSZip que vuelva a colarse en el arranque');

// Acceso: sin sesión solo quedan el núcleo, login seguro y recuperación.
assert.match(stabilizer,/SESSION_KEY='control_contractual_session_v3'/,'debe usar la misma sesión real del portal');
assert.match(stabilizer,/data-cc-auth-script/,'los scripts funcionales deben convertirse en un plan inerte hasta autenticar');
assert.match(stabilizer,/data-cc-auth-loader data-cc-auth-plan/,'debe existir un único cargador autenticado');
assert.match(stabilizer,/PRE_AUTH_MODULES=new Set\(\['private-access-v1\.js','password-recovery-v1\.js'\]\)/,'login seguro y recuperación deben permanecer disponibles sin sesión');
assert.match(stabilizer,/PRE_AUTH_MODULES\.has\(bare\)/,'el aislamiento debe respetar la lista mínima de módulos de acceso');
assert.match(privateAccess,/localStorage\.setItem\(SESSION,JSON\.stringify\(session\)\);cloudLoaded=false;location\.reload\(\);return;/,'el login seguro real debe reiniciar una sola vez el contexto para activar el plan autenticado');
assert.doesNotMatch(privateAccess,/cloudLoaded=false;await render\(\)/,'el login seguro no debe quedarse en un render parcial sin reactivar el cargador autenticado');
assert.match(stabilizer,/location\.reload\(\);return/,'el estabilizador debe conservar compatibilidad con el login histórico embebido');
assert.match(stabilizer,/script\.async=false/,'los módulos autenticados deben mantener el orden de ejecución');
assert.doesNotMatch(stabilizer,/document\.write\s*\(/,'no debe volver a usarse document.write para activar módulos');
assert.match(stabilizer,/bootEnd='render\(\);\\n<\/script>'/,'el aislamiento debe empezar después del núcleo de acceso');
assert.match(stabilizer,/El login seguro quedó bloqueado antes de autenticar/,'la construcción debe fallar si se bloquea private-access');
assert.match(stabilizer,/La recuperación de contraseña quedó bloqueada antes de autenticar/,'la construcción debe fallar si se bloquea password-recovery');

// Arranque autenticado por fases: la primera pintura no debe esperar decenas de módulos.
assert.match(stabilizer,/__CC_STAGED_AUTH_BOOT__/,'debe declarar el modo de arranque autenticado escalonado');
assert.match(stabilizer,/FASE A · PRIMERA PINTURA AUTENTICADA/,'debe existir una fase crítica de primera pintura');
assert.match(stabilizer,/portal-web-v2\.js\?v=20260903-web3/,'el portal debe cargarse en la fase crítica');
assert.match(stabilizer,/nodeByBare\('project-tabs-complete-v1\.js'\)/,'las pestañas deben adelantarse al primer lote');
assert.match(stabilizer,/nodeByBare\('ui-navigation-single-source-v1\.js'\)/,'la navegación debe adelantarse al primer lote');
assert.match(stabilizer,/__CC_AUTH_CRITICAL_READY__/,'debe marcar cuándo la interfaz crítica ya está disponible');
assert.match(stabilizer,/FASE B · CENTROS WEB PRINCIPALES/,'los centros web deben cargarse después de la primera pintura');
assert.match(stabilizer,/__CC_AUTH_WEB_READY__/,'debe marcar cuándo los centros web ya están disponibles');
assert.match(stabilizer,/FASE C · RESTO DEL SISTEMA HISTÓRICO/,'el resto del sistema debe quedar en una tercera fase');
assert.match(stabilizer,/const performance=nodeByBare\('performance-runtime-v1\.js'\)/,'el coordinador de rendimiento debe identificarse para cargarse al final');
assert.match(stabilizer,/if\(performance\)await safeRun\('performance-runtime-v1\.js'/,'performance-runtime no debe iniciar una carrera doble durante la primera pintura');
assert.match(stabilizer,/if\(\+\+count%3===0\)await nextTurn\(\)/,'la carga secundaria debe ceder periódicamente el hilo principal');

// Núcleo generado: altas directas y reglas contractuales no inventadas.
assert.match(stabilizer,/view\.projectId=np\.id;view\.screen='project';view\.tab='summary'/,'un proyecto nuevo debe abrir su expediente');
assert.match(stabilizer,/recoveryTarget:null/,'un contrato nuevo no debe inventar una meta de amortización');
assert.match(stabilizer,/contract\.recoveryTarget\|\|0/,'sin meta contractual no debe aplicarse recuperación automática');

// Las capas visuales retiradas deben seguir centralizadas y bloqueadas.
for(const file of retiredModules){
  assert(inject.includes('legacyVisualModules'),`inject-portfolio debe conservar defensa contra capas retiradas`);
  assert(stabilizer.includes('retiredModules'),`stabilize-core debe usar el manifiesto central de capas retiradas`);
  assert(retiredModules.includes(file),`el manifiesto debe conservar ${file} como retirado`);
}

console.log('core-stability-regressions: navegación única, estabilidad visual aislada, login seguro, presupuesto global de nube, runtime, fotos, documentos y arranque autenticado por fases blindados');
