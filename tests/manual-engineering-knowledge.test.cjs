const assert=require('node:assert/strict');
const fs=require('node:fs');
const manual=fs.readFileSync('engineering-manual-reference-v1.js','utf8');
const loader=fs.readFileSync('project-tabs-complete-v1.js','utf8');

assert.match(manual,/REFERENCIA TECNICA DEL MANUAL DE INGENIERIA V2/,'debe estar activa la versión 2 del Manual');
assert.match(manual,/pages:150/,'debe registrar las 150 páginas del Manual');
assert.match(manual,/source:'Manual\.pdf'/,'debe identificar la fuente');
assert.match(manual,/pageIndex:\[/,'debe existir un índice técnico para Halu');
assert.match(manual,/important:\[/,'debe separar lo importante que se muestra en la página');
assert.match(manual,/manualContext/,'debe generar contexto para el chatbot');
assert.match(manual,/halu-chat/,'debe enriquecer las consultas enviadas a Halu');
assert.match(manual,/window\.__ccEngineeringManual/,'debe exponer la referencia técnica a la aplicación');
assert.match(manual,/Manual técnico · referencia de ingeniería/,'debe existir una vista visible del Manual');
assert.match(manual,/Preguntar a Halu/,'la vista debe conectar con el chatbot');
assert.match(manual,/Control de concreto en obra/,'debe mostrar control de concreto como contenido prioritario');
assert.match(manual,/Acero antes del vaciado/,'debe mostrar control de acero como contenido prioritario');
assert.match(manual,/Terracería y maquinaria/,'debe mostrar maquinaria y terracería como contenido prioritario');
assert.match(manual,/Topografía y replanteo/,'debe mostrar topografía como contenido prioritario');
assert.match(manual,/Cimentaciones/,'debe mostrar cimentaciones como contenido prioritario');
assert.match(manual,/Metrados y cantidades/,'debe mostrar metrados como contenido prioritario');
assert.match(manual,/Grietas, deflexiones y fallas/,'debe mostrar alertas estructurales como contenido prioritario');
assert.match(manual,/Pendientes, rampas y tuberías/,'debe mostrar pendientes como contenido prioritario');
assert.match(manual,/Ley N\.º 32069 de Perú/,'debe diferenciar la referencia legal peruana');
assert.match(manual,/normativa hondureña/,'debe priorizar la normativa aplicable en Honduras');
assert.match(loader,/engineering-manual-reference-v1\.js\?v=20260823-manual2/,'el cargador debe usar la versión nueva del Manual');

console.log('manual-engineering-knowledge: índice de 150 páginas, referencia Halu y resumen visible verificados');
