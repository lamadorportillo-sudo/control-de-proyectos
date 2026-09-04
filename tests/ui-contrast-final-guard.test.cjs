const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const guard=fs.readFileSync('ui-contrast-final-guard-v1.js','utf8');

assert.match(guard,/GUARDIA FINAL DE CONTRASTE V3/,'debe existir la guardia final WCAG V3');
assert.match(guard,/#content \.exec-overview \.portfolio-ring\{[\s\S]*opacity:1!important/,'el anillo del Inicio no puede heredar una opacidad de animación');
assert.match(guard,/#content \.exec-overview \.portfolio-ring-content/,'el anillo del Inicio debe tener un fondo real auditable');
assert.match(guard,/#content \.exec-overview \.exec-bar-label b/,'los valores financieros del hero deben permanecer claros');
assert.match(guard,/#content \.tr-source \.eyebrow/,'el rótulo pequeño de documentos fuente debe usar contraste propio de superficie clara');
assert.match(guard,/#content \.tr-source \.muted/,'los textos secundarios de documentos fuente deben usar contraste propio de superficie clara');
assert.match(guard,/#315a7c!important/,'el rótulo de documentos fuente debe conservar un azul AA sobre blanco');
assert.match(guard,/#536158!important/,'el texto secundario de documentos fuente debe conservar un tono AA sobre blanco');
assert.match(guard,/#content #cpExecutionOnly/,'la lectura operativa debe quedar anclada a su superficie real');
assert.match(guard,/#cpExecutionOnly \.cp-exec-badge/,'la insignia de proyectos en ejecución debe fijar fondo y texto conjuntamente');
assert.match(guard,/#cpExecutionOnly b/,'los valores de lectura operativa deben quedar protegidos');
assert.match(guard,/#cpExecutionOnly strong/,'los montos de lectura operativa deben quedar protegidos');
assert.match(guard,/\.cc-life-step:not\(\.has-data\) > b/,'los conteos vacíos del ciclo de vida deben superar contraste mínimo');
assert.match(guard,/#d3deea!important/,'los textos secundarios sobre superficies oscuras deben usar el tono claro validado');

const names=supplementalModules.map(([name])=>name);
const guardAt=names.indexOf('ui-contrast-final-guard-v1.js');
const observerAt=names.indexOf('technical-control-observer-guard-v1.js');
const technicalAt=names.indexOf('technical-control-v1.js');
assert.ok(guardAt>=0&&guardAt<observerAt&&observerAt+1===technicalAt,'la corrección visual debe ejecutarse justo antes del par técnico final, sin desplazarlo');
assert.equal(supplementalModules[guardAt][1],'20260904-contrast-final3','la versión de la guardia final debe quedar fijada en el manifiesto');

console.log('ui-contrast-final-guard: Inicio, transparencia, lectura operativa y ciclo de vida protegidos antes del cierre técnico');
