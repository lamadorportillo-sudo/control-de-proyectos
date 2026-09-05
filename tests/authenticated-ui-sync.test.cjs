const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const src=fs.readFileSync('authenticated-ui-sync-v1.js','utf8');

assert.match(src,/SINCRONIZACIÓN DE INTERFAZ AUTENTICADA V2/,'debe existir el coordinador autenticado V2');
assert.match(src,/if\(event\.key!==['"]Enter['"]\)return/,'solo Enter debe asumir la navegación de la búsqueda global');
assert.match(src,/event\.stopImmediatePropagation\(\)/,'Enter debe impedir que el portal histórico aplique un filtro literal paralelo');
assert.match(src,/view\.search=['"]['"]/,'el filtro literal del núcleo debe quedar vacío antes de renderizar Proyectos');
assert.match(src,/view\.screen=['"]projects['"]/,'la búsqueda superior debe abrir la vista canónica de Proyectos');
assert.match(src,/__ccProjectSearchBridge\?\.syncGlobalProjectSearch/,'la consulta debe delegarse al puente normalizado de ZORDON');
assert.match(src,/function restoreGlobalQuery\(query\)/,'la consulta visible debe restaurarse después de que renderApp reemplace la barra superior');
assert.match(src,/document\.getElementById\(['"]ccGlobalSearch['"]\)/,'la restauración debe actuar sobre la barra global recién renderizada');
assert.match(src,/restoreGlobalQuery\(query\);[\s\S]*syncProjectQuery\(query\)/,'la consulta visible y el motor ZORDON deben recibir el mismo valor');
assert.match(src,/cc:data-changed/,'la carga tardía debe solicitar un refresco no destructivo del dashboard');
assert.match(src,/NativeObserver/,'debe conservar el MutationObserver nativo gobernado');
assert.match(src,/childList:true,subtree:true/,'solo debe observar cambios estructurales para reenlazar la barra');
assert.doesNotMatch(src,/attributeFilter:\s*\[[^\]]*style/,'no debe observar style');
assert.match(src,/pagehide/,'el observador debe desconectarse al abandonar la página');

const idx=supplementalModules.findIndex(([name])=>name==='authenticated-ui-sync-v1.js');
const zordon=supplementalModules.findIndex(([name])=>name==='zordon-project-search-v1.js');
assert.ok(idx>zordon,'la sincronización debe cargarse después del buscador ZORDON');
assert.equal(supplementalModules[idx][1],'20260905-authuisync2','la versión canónica debe invalidar la barra que perdía la consulta tras el rerender');

console.log('authenticated-ui-sync: Enter usa ZORDON, conserva la consulta visible y refresca decoraciones tardías sin bucles');