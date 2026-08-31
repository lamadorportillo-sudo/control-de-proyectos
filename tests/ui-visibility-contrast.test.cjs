const assert=require('node:assert/strict');
const fs=require('node:fs');

const src=fs.readFileSync('ui-visibility-audit-v1.js','utf8');
const loader=fs.readFileSync('project-tabs-complete-v1.js','utf8');

assert.match(src,/VISIBILIDAD GLOBAL Y CONTRASTE V3/,'debe cargarse el auditor de contraste V3');
assert.match(src,/function requiredRatio/,'debe calcular el umbral según tamaño y peso tipográfico');
assert.match(src,/\?3:4\.5/,'texto normal debe respetar contraste WCAG 4.5:1 y texto grande 3:1');
assert.match(src,/effectiveBackground/,'el contraste debe evaluarse contra el fondo efectivo real');
assert.match(src,/data-cc-readable/,'debe existir reparación contextual de contraste');
assert.match(src,/\.modal:not\(\.report-paper\)/,'los modales deben tener una superficie legible coherente');
assert.match(src,/\.report-paper/,'los documentos imprimibles deben quedar excluidos del tema de aplicación');
assert.match(src,/button:disabled[\s\S]*opacity:\.68/,'los controles deshabilitados deben seguir siendo legibles');
assert.match(src,/#ccxSync[\s\S]*background:#10243b!important[\s\S]*color:#f8fbff!important/,'el estado de sincronización debe tener fondo y texto de alto contraste');
assert.match(src,/#ccxSync \*[\s\S]*color:#f8fbff!important/,'los hijos del estado de sincronización no deben heredar colores de bajo contraste');
assert.match(src,/closest\('#ccxSync'\)[\s\S]*ccReadable='light'/,'el auditor dinámico debe conservar texto claro dentro del estado de sincronización');

const modulesMatch=loader.match(/const modules=\[(.*?)\];const current/s);
assert.ok(modulesMatch,'no se encontró la lista de módulos visuales');
const modules=modulesMatch[1];
const visibilityAt=modules.lastIndexOf('ui-visibility-audit-v1.js');
const themeAt=modules.lastIndexOf('ui-theme-unifier-v1.js');
const operationalAt=modules.lastIndexOf('ui-operational-polish-v1.js');
const immersiveAt=modules.lastIndexOf('immersive-engineering-experience-v1.js');
assert.ok(visibilityAt>themeAt&&visibilityAt>operationalAt&&visibilityAt>immersiveAt,'el auditor de contraste debe cargarse después de las capas visuales');
assert.match(modules,/ui-visibility-audit-v1\.js\?v=20260831-visibility3/,'el cargador debe usar la versión corregida V3 del auditor');

console.log('ui-visibility-contrast: contraste contextual, modales, sincronización, estados deshabilitados y orden de carga verificados');
