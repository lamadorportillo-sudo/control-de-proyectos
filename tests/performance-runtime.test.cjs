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
assert.match(src,/requestAnimationFrame/,'coordina el trabajo con el ciclo de pintura');
assert.match(src,/if\(this\.queued\)return/,'evita programar revisiones duplicadas');
assert.match(src,/takeRecords\(\)/,'mantiene la API esperada de MutationObserver');
assert.match(src,/window\.MutationObserver=BatchedMutationObserver/,'activa la optimizacion para los modulos posteriores');
assert.match(builder,/performanceModule='performance-runtime-v1\.js'/,'el generador debe conservar el coordinador de rendimiento');
assert.match(builder,/html\.replace\(firstFeature/,'el generador debe cargarlo antes del primer modulo funcional');

console.log('performance-runtime: 10 verificaciones superadas');
