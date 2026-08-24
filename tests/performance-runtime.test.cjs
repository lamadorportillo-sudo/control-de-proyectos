const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const src=fs.readFileSync('performance-runtime-v1.js','utf8');
const builder=fs.readFileSync('build-pages.cjs','utf8');
const performanceIndex=html.indexOf('performance-runtime-v1.js');
const firstFeatureIndex=html.indexOf('budget-portfolio-tab-v1.js');

assert.ok(performanceIndex>=0,'falta el coordinador de rendimiento');
assert.ok(performanceIndex<firstFeatureIndex,'el coordinador debe cargarse antes de los modulos funcionales');
assert.match(src,/const NativeObserver=window\.MutationObserver/,'conserva el observador nativo');
assert.match(src,/this\.records\.push\(\.\.\.records\)/,'agrupa las mutaciones pendientes');
assert.match(src,/requestIdleCallback/,'ejecuta decoraciones cuando el navegador queda libre');
assert.match(src,/if\(this\.queued\)return/,'evita programar revisiones duplicadas');
assert.match(src,/const pending=new Set/,'comparte una sola cola entre todos los observadores');
assert.match(src,/for\(const item of batch\)item\.flush\(\)/,'procesa cada observador una sola vez por lote');
assert.match(src,/const MAX_PASSES=4/,'limita las cascadas de decoracion por interaccion');
assert.match(src,/passes>=MAX_PASSES/,'corta ciclos de mutacion que no se estabilizan');
assert.match(src,/\['click','input','change','submit'\]/,'reinicia el presupuesto con cada accion real del usuario');
assert.match(src,/content-visibility:auto/,'pospone el dibujo de tarjetas fuera de pantalla');
assert.match(src,/contain-intrinsic-size/,'reserva espacio sin calcular el contenido completo');
assert.match(src,/takeRecords\(\)/,'mantiene la API esperada de MutationObserver');
assert.match(src,/window\.MutationObserver=BatchedMutationObserver/,'activa la optimizacion para los modulos posteriores');
assert.match(builder,/performanceModule='performance-runtime-v1\.js'/,'el generador debe conservar el coordinador de rendimiento');
assert.match(src,/serviceWorker\.register/,'debe registrar caché estática para visitas posteriores');
assert(fs.existsSync('service-worker-v1.js'),'debe publicar el trabajador de caché estática');
const worker=fs.readFileSync('service-worker-v1.js','utf8');
assert.match(worker,/request\.method!==['"]GET['"]/,'la caché no debe interceptar escrituras');
assert.match(worker,/url\.origin!==self\.location\.origin/,'la caché debe limitarse al mismo origen');
assert.match(builder,/html\.replace\(firstFeature/,'el generador debe cargarlo antes del primer modulo funcional');

console.log('performance-runtime: 17 verificaciones superadas');
