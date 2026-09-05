const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const guard=fs.readFileSync('ui-contrast-final-guard-v1.js','utf8');

assert.match(guard,/GUARDIA FINAL DE CONTRASTE V8/,'debe existir la guardia final WCAG V8');
assert.match(guard,/#content \.exec-overview \.portfolio-ring\{[\s\S]*opacity:1!important/,'el anillo del Inicio no puede heredar una opacidad de animación');
assert.match(guard,/#content \.exec-overview \.portfolio-ring-content/,'el anillo del Inicio debe tener un fondo real auditable');
assert.match(guard,/#content \.exec-overview \.exec-bar-label b/,'los valores financieros del hero deben permanecer claros');
assert.match(guard,/#content \.project-card-premium h3/,'los títulos de proyecto deben conservar contraste AA sobre tarjetas oscuras');
assert.match(guard,/#content \.project-v3 h3/,'la variante compacta de proyecto debe conservar contraste AA');
assert.match(guard,/#content \.tr-page \.tr-head h2/,'la cabecera oscura de transparencia debe conservar título claro');
assert.match(guard,/#content \.tr-page \.tr-head p/,'la cabecera oscura de transparencia debe conservar texto secundario claro');
assert.match(guard,/#content \.tr-page \.tr-period label span/,'Mes y Año deben leerse sobre la cabecera oscura');
assert.match(guard,/#9fc5ff!important/,'el eyebrow de la cabecera oscura debe usar un azul claro AA');
assert.match(guard,/#content \.tr-page \.tr-section-head h3/,'los encabezados de tarjetas claras deben usar texto oscuro');
assert.match(guard,/#content \.tr-page \.tr-kpi small/,'los rótulos KPI de transparencia deben superar contraste AA');
assert.match(guard,/#content \.tr-page \.tr-empty span/,'los estados vacíos de transparencia deben superar contraste AA');
assert.match(guard,/#26372b!important/,'los encabezados de superficies claras deben usar el tono oscuro validado');
assert.match(guard,/#content \.tr-source \.eyebrow/,'el rótulo pequeño de documentos fuente debe usar contraste propio de superficie clara');
assert.match(guard,/#content \.tr-source \.muted/,'los textos secundarios de documentos fuente deben usar contraste propio de superficie clara');
assert.match(guard,/#315a7c!important/,'el rótulo de documentos fuente debe conservar un azul AA sobre blanco');
assert.match(guard,/#536158!important/,'los textos secundarios de superficies claras deben conservar un tono AA');
assert.match(guard,/#content #tabBody \.cc-current-law small/,'las etiquetas de normativa del expediente deben quedar protegidas de la capa oscura global');
assert.match(guard,/#content #tabBody \.cc-current-law \.law-note/,'la nota normativa debe mantener contraste AA sobre su tarjeta clara');
assert.match(guard,/#4f675b!important/,'la normativa clara debe usar el verde validado con contraste AA');
assert.match(guard,/#content \.cp-budget-kpi strong/,'los importes KPI del presupuesto no deben heredar texto oscuro sobre la superficie consolidada');
assert.match(guard,/#content \.cp-exec-metric strong/,'los montos de ejecución presupuestaria deben conservar texto claro');
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
assert.equal(supplementalModules[guardAt][1],'20260905-contrast-final8','la versión V8 de la guardia final debe quedar fijada en el manifiesto');

console.log('ui-contrast-final-guard: superficies claras, oscuras, proyectos y presupuesto protegidos por contexto antes del cierre técnico');