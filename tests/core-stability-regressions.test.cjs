const assert=require('node:assert/strict');
const fs=require('node:fs');

const nav=fs.readFileSync('ui-navigation-single-source-v1.js','utf8');
const perf=fs.readFileSync('performance-runtime-v1.js','utf8');
const storage=fs.readFileSync('storage-quota-fix-v1.js','utf8');
const stabilizer=fs.readFileSync('stabilize-core-v1.cjs','utf8');
const inject=fs.readFileSync('inject-portfolio.cjs','utf8');
const official=fs.readFileSync('contract-official-format-v1.js','utf8');
const documents=fs.readFileSync('contract-payment-documents-v1.js','utf8');

// Navegación: la barra lateral debe gobernar directamente la vista.
assert.match(nav,/view\.screen='projects'/,'Inicio/Proyectos debe manejar el estado real de la vista');
assert.doesNotMatch(nav,/querySelector\(`\[data-ccx=/,'no debe localizar botones ocultos del motor ejecutivo');
assert.doesNotMatch(nav,/btn\.click\(\)/,'no debe accionar navegación heredada con clics sintéticos');
assert.match(nav,/cc_main_route_v2/,'debe conservar una sola intención de ruta principal');

// Rendimiento: nunca volver a secuestrar MutationObserver global.
assert.match(perf,/__ccNativeMutationObserver/,'debe conservar referencia al observador nativo');
assert.doesNotMatch(perf,/window\.MutationObserver\s*=/,'no debe reemplazar MutationObserver global');
assert.doesNotMatch(perf,/MAX_PASSES/,'no debe descartar actualizaciones después de un número fijo de pasadas');

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
assert.match(stabilizer,/cdn\.jsdelivr\.net\/npm\/jszip/,'el estabilizador debe eliminar cualquier script JSZip que vuelva a colarse en el arranque');

// Núcleo generado: altas directas y reglas contractuales no inventadas.
assert.match(stabilizer,/view\.projectId=np\.id;view\.screen='project';view\.tab='summary'/,'un proyecto nuevo debe abrir su expediente');
assert.match(stabilizer,/recoveryTarget:null/,'un contrato nuevo no debe inventar una meta de amortización');
assert.match(stabilizer,/contract\.recoveryTarget\|\|0/,'sin meta contractual no debe aplicarse recuperación automática');

// Las capas visuales retiradas deben seguir explícitamente bloqueadas.
for(const file of ['dashboard-executive-v1.js','home-executive-fix-v2.js','industrial-home-v1.js','portfolio-redesign-v1.js','project-portfolio-detail-v1.js','portfolio-screen-fix-v1.js']){
  assert(inject.includes(`'${file}'`),`inject-portfolio debe retirar ${file}`);
  assert(stabilizer.includes(`'${file}'`),`stabilize-core debe retirar ${file}`);
}

console.log('core-stability-regressions: navegación, Inicio único, runtime, fotos, documentos y núcleo blindados');
