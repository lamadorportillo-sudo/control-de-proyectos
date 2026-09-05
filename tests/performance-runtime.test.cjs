const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const src=fs.readFileSync('performance-runtime-v1.js','utf8');
const builder=fs.readFileSync('build-pages.cjs','utf8');
const performanceIndex=html.indexOf('performance-runtime-v1.js');
const firstFeatureIndex=html.indexOf('budget-portfolio-tab-v1.js');

assert.ok(performanceIndex>=0,'falta el coordinador de rendimiento');
assert.ok(performanceIndex<firstFeatureIndex,'el coordinador debe declararse antes de los módulos funcionales');
assert.match(src,/COORDINADOR DE RENDIMIENTO DEL DOM V7 · SIN CARGA FUNCIONAL/,'debe mantenerse la versión sin segundo cargador');
assert.match(src,/window\.__ccNativeMutationObserver=window\.MutationObserver/,'conserva una referencia al observador nativo');
assert.doesNotMatch(src,/window\.MutationObserver\s*=/,'no debe reemplazar globalmente MutationObserver');
assert.doesNotMatch(src,/MAX_PASSES/,'no debe imponer límites artificiales a mutaciones legítimas');
assert.match(src,/content-visibility:auto/,'pospone el dibujo de tarjetas fuera de pantalla');
assert.match(src,/contain-intrinsic-size/,'reserva espacio sin calcular el contenido completo');
assert.doesNotMatch(src,/function\s+scriptOnce\b/,'rendimiento no puede actuar como segundo cargador de módulos');
assert.doesNotMatch(src,/document\.createElement\(['"]script['"]\)/,'rendimiento no puede crear scripts funcionales');
for(const forbidden of [
  'portal-web-v2.js','project-detail-v2.js','dashboard-simplified-v4.js','payments-center-v1.js',
  'guarantees-center-v1.js','visits-center-v1.js','reports-center-v1.js','alerts-center-v1.js',
  'audit-center-v1.js','portal-route-bridge-v1.js','ui-stability-v1.js'
]){
  assert.ok(!src.includes(forbidden),`performance-runtime no debe cargar ${forbidden}`);
}
assert.match(builder,/performanceModule='performance-runtime-v1\.js'/,'el generador debe conservar el coordinador de rendimiento');
assert.match(src,/serviceWorker\.register/,'debe registrar caché estática para visitas posteriores');
assert(fs.existsSync('service-worker-v1.js'),'debe publicar el trabajador de caché estática');
const worker=fs.readFileSync('service-worker-v1.js','utf8');
assert.match(worker,/request\.method!==['"]GET['"]/,'la caché no debe interceptar escrituras');
assert.match(worker,/url\.origin!==self\.location\.origin/,'la caché debe limitarse al mismo origen');
assert.match(src,/updateViaCache:'none'/,'la actualización del service worker no puede depender de caché');
assert.match(builder,/html\.replace\(firstFeature/,'el generador debe posicionar el coordinador antes del primer módulo funcional');

console.log('performance-runtime aislado: rendimiento y caché sin segundo cargador funcional');
