const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const src=fs.readFileSync('authenticated-ui-sync-v1.js','utf8');

assert.match(src,/SINCRONIZACIÓN DE INTERFAZ AUTENTICADA V1/,'debe existir el coordinador autenticado V1');
assert.match(src,/if\(event\.key!==['"]Enter['"]\)return/,'solo Enter debe asumir la navegación de la búsqueda global');
assert.match(src,/event\.stopImmediatePropagation\(\)/,'Enter debe impedir que el portal histórico aplique un filtro literal paralelo');
assert.match(src,/view\.search=['"]['"]/,'el filtro literal del núcleo debe quedar vacío antes de renderizar Proyectos');
assert.match(src,/view\.screen=['"]projects['"]/,'la búsqueda superior debe abrir la vista canónica de Proyectos');
assert.match(src,/__ccProjectSearchBridge\?\.syncGlobalProjectSearch/,'la consulta debe delegarse al puente normalizado de ZORDON');
assert.match(src,/cc:data-changed/,'la carga tardía debe solicitar un refresco no destructivo del dashboard');
assert.match(src,/NativeObserver/,'debe conservar el MutationObserver nativo gobernado');
assert.match(src,/childList:true,subtree:true/,'solo debe observar cambios estructurales para reenlazar la barra');
assert.doesNotMatch(src,/attributeFilter:\s*\[[^\]]*style/,'no debe observar style');
assert.match(src,/pagehide/,'el observador debe desconectarse al abandonar la página');

const idx=supplementalModules.findIndex(([name])=>name==='authenticated-ui-sync-v1.js');
const zordon=supplementalModules.findIndex(([name])=>name==='zordon-project-search-v1.js');
assert.ok(idx>zordon,'la sincronización debe cargarse después del buscador ZORDON');
assert.equal(supplementalModules[idx][1],'20260905-authuisync1','la versión canónica debe invalidar cualquier ausencia previa del módulo');

console.log('authenticated-ui-sync: Enter usa ZORDON sin filtro literal paralelo y refresca decoraciones tardías sin bucles');