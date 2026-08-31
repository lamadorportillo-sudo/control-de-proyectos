const assert=require('node:assert/strict');
const fs=require('node:fs');

const hard=fs.readFileSync('ui-contrast-hardening-v1.js','utf8');
const loader=fs.readFileSync('project-tabs-complete-v1.js','utf8');

assert.match(hard,/ENDURECIMIENTO DE CONTRASTE V1/,'debe existir la guardia final de contraste');
assert.match(hard,/#content \.ccx-kpi small/,'debe reforzar etiquetas KPI del centro ejecutivo');
assert.match(hard,/#content \.ccx-access small/,'debe reforzar textos secundarios de accesos');
assert.match(hard,/#174a9c/,'las acciones primarias deben usar un azul oscuro con contraste suficiente');
assert.match(hard,/\.cp-budget-page \[data-cc-readable\]/,'presupuesto debe neutralizar una inversión errónea del reparador automático');
assert.doesNotMatch(hard,/attributeFilter:\['class','style','data-cc-readable'\]/,'la guardia no debe crear una oscilación de atributos con el auditor global');

const modules=loader.match(/const modules=\[(.*?)\];const current/s)?.[1]||'';
const auditAt=modules.lastIndexOf('ui-visibility-audit-v1.js');
const hardAt=modules.lastIndexOf('ui-contrast-hardening-v1.js');
assert.ok(auditAt>=0&&hardAt>auditAt,'la guardia final debe cargarse después del auditor global');
assert.match(modules,/ui-contrast-hardening-v1\.js\?v=20260831-contrast1/,'debe forzarse la versión publicada del endurecimiento');

console.log('ui-contrast-hardening: KPI, accesos, acciones primarias, presupuesto y orden de carga verificados');
