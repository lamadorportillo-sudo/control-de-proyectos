const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const src=fs.readFileSync('performance-runtime-v1.js','utf8');
const builder=fs.readFileSync('build-pages.cjs','utf8');
const performanceIndex=html.indexOf('performance-runtime-v1.js');
const firstFeatureIndex=html.indexOf('budget-portfolio-tab-v1.js');

assert.ok(performanceIndex>=0,'falta el coordinador de rendimiento');
assert.ok(performanceIndex<firstFeatureIndex,'el coordinador debe cargarse antes de los módulos funcionales');
assert.match(src,/window\.__ccNativeMutationObserver=window\.MutationObserver/,'conserva una referencia al observador nativo');
assert.doesNotMatch(src,/window\.MutationObserver\s*=\s*BatchedMutationObserver/,'no debe reemplazar globalmente MutationObserver');
assert.doesNotMatch(src,/MAX_PASSES\s*=\s*4/,'no debe descartar actualizaciones del DOM por un límite artificial de pasadas');
assert.doesNotMatch(src,/passes\s*>=\s*MAX_PASSES/,'no debe cortar mutaciones legítimas de Supabase o navegación');
assert.match(src,/content-visibility:auto/,'pospone el dibujo de tarjetas fuera de pantalla');
assert.match(src,/contain-intrinsic-size/,'reserva espacio sin calcular el contenido completo');
assert.match(src,/script\.async=false/,'los módulos críticos mantienen orden de ejecución explícito');
assert.match(src,/scriptOnce\('portal-web-v2\.js/,'carga el portal web una sola vez');
assert.match(src,/scriptOnce\('dashboard-simplified-v4\.js/,'carga un único dashboard vigente');
assert.match(builder,/performanceModule='performance-runtime-v1\.js'/,'el generador debe conservar el coordinador de rendimiento');
assert.match(src,/serviceWorker\.register/,'debe registrar caché estática para visitas posteriores');
assert(fs.existsSync('service-worker-v1.js'),'debe publicar el trabajador de caché estática');
const worker=fs.readFileSync('service-worker-v1.js','utf8');
assert.match(worker,/request\.method!==['"]GET['"]/,'la caché no debe interceptar escrituras');
assert.match(worker,/url\.origin!==self\.location\.origin/,'la caché debe limitarse al mismo origen');
assert.match(builder,/html\.replace\(firstFeature/,'el generador debe cargarlo antes del primer módulo funcional');

console.log('performance-runtime estable: 17 verificaciones superadas');
