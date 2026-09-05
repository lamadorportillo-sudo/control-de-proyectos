const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules,retiredModules}=require('../authenticated-module-manifest-v1.cjs');

const source=fs.readFileSync('zordon-project-search-v1.js','utf8');

assert.match(source,/BUSCADOR INTELIGENTE DE PROYECTOS V4 · RUNTIME AISLADO/,'el buscador debe conservar la versión V4 aislada');
assert.match(source,/window\.__CC_ZORDON_PROJECT_SEARCH_V4__=true/,'debe existir la guardia de carga única V4');
assert.doesNotMatch(source,/industrial-home-v1\.js/,'el buscador no puede volver a cargar la portada industrial retirada');
assert.doesNotMatch(source,/__CC_INDUSTRIAL_HOME_LOADER__/,'el buscador no puede conservar el loader industrial histórico');
assert.doesNotMatch(source,/data-industrial-home-loader/,'el buscador no puede inyectar scripts industriales en runtime');
assert.match(source,/const NativeObserver=window\.__ccNativeMutationObserver\|\|window\.MutationObserver/,'el observador debe usar la referencia nativa estable');
assert.match(source,/attributeFilter:\['class'\]/,'el buscador solo debe observar cambios de clase además de nodos nuevos');
assert.doesNotMatch(source,/attributeFilter:\[[^\]]*'style'/,'no debe observar style mientras oculta y muestra resultados');
assert.match(source,/pagehide[\s\S]*observer\?\.disconnect\(\)/,'el observador debe desconectarse al abandonar la página');

const matches=supplementalModules.filter(([name])=>name==='zordon-project-search-v1.js');
assert.deepEqual(matches,[['zordon-project-search-v1.js','20260905-zordonsearch4']],'el buscador limpio debe estar una sola vez y con versión canónica nueva');
for(const retired of retiredModules)assert.doesNotMatch(source,new RegExp(retired.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),
  `el buscador no debe referenciar el módulo retirado ${retired}`);

console.log('zordon-project-search-runtime: búsqueda aislada, sin loaders retirados ni bucles sobre style');
