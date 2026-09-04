const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('project-search-clean-v1.js','utf8');

assert.match(source,/BUSCADOR LIMPIO DE PROYECTOS V3/,'debe quedar instalada la versión V3 del buscador limpio');
assert.match(source,/ccGlobalSearch/,'la búsqueda superior debe estar conectada con el buscador de proyectos');
assert.match(source,/addEventListener\('keydown'[\s\S]*e\.key!==['"]Enter['"]/,'Enter en la búsqueda global debe activar el puente');
assert.match(source,/board\?\.querySelector\('#projectSearch'\)/,'el puente debe escribir sobre la búsqueda local de Zordon');
assert.match(source,/__ccZordonProjectSearch\?\.apply/,'debe reutilizar el motor de ranking y visibilidad de Zordon');
assert.match(source,/dispatchEvent\(new Event\('input'/,'debe conservar un fallback por evento input si Zordon aún no está disponible');
assert.match(source,/tries\+\+<12/,'debe reintentar mientras la vista de Proyectos termina de renderizar');
assert.match(source,/setTimeout\(sync,90\)/,'debe repetir la sincronización después del cambio de ruta');
assert.match(source,/window\.__ccProjectSearchBridge=\{syncGlobalProjectSearch\}/,'debe exponer un punto de integración verificable');
assert.doesNotMatch(source,/querySelectorAll\(['"]\.project-v3['"]\)\.forEach\([^)]*style\.display=['"]['"]/,'el puente no debe saltarse Zordon mostrando todas las tarjetas a la fuerza');

console.log('project-search-global-bridge: búsqueda superior sincronizada con Zordon sin saltarse su motor');
