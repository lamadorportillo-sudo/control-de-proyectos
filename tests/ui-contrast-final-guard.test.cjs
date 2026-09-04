const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const guard=fs.readFileSync('ui-contrast-final-guard-v1.js','utf8');

assert.match(guard,/GUARDIA FINAL DE CONTRASTE V1/,'debe existir una guardia final WCAG explícita');
assert.match(guard,/#content \.exec-overview \.portfolio-ring-content/,'el anillo del Inicio debe tener un fondo real auditable');
assert.match(guard,/#content \.exec-overview \.exec-bar-label b/,'los valores financieros del hero deben permanecer claros');
assert.match(guard,/#content #cpExecutionOnly/,'la lectura operativa debe quedar anclada a su superficie real');
assert.match(guard,/#cpExecutionOnly \.cp-exec-badge/,'la insignia de proyectos en ejecución debe fijar fondo y texto conjuntamente');
assert.match(guard,/#cpExecutionOnly b/,'los valores de lectura operativa deben quedar protegidos');
assert.match(guard,/#cpExecutionOnly strong/,'los montos de lectura operativa deben quedar protegidos');
assert.match(guard,/\.cc-life-step:not\(\.has-data\) > b/,'los conteos vacíos del ciclo de vida deben superar contraste mínimo');
assert.match(guard,/#536476!important/,'los conteos neutros deben usar el gris validado para superficie clara');

const names=supplementalModules.map(([name])=>name);
const guardAt=names.indexOf('ui-contrast-final-guard-v1.js');
const observerAt=names.indexOf('technical-control-observer-guard-v1.js');
const technicalAt=names.indexOf('technical-control-v1.js');
assert.ok(guardAt>=0&&guardAt<observerAt&&observerAt+1===technicalAt,'la corrección visual debe ejecutarse justo antes del par técnico final, sin desplazarlo');
assert.equal(supplementalModules[guardAt][1],'20260904-contrast-final1','la versión de la guardia final debe quedar fijada en el manifiesto');

console.log('ui-contrast-final-guard: Inicio, lectura operativa y ciclo de vida protegidos antes del cierre técnico');
