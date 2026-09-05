const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const source=fs.readFileSync('change-order-fix-v1.js','utf8');
assert.match(source,/ÓRDENES DE CAMBIO \/ ADENDAS V2 · GUARDADO ÚNICO/,'la corrección debe publicar la revisión de guardado único');

const recalc=source.match(/window\.recalcContract=function\(c\)\{([\s\S]*?)\n\};/);
assert.ok(recalc,'debe existir recalcContract');
assert.doesNotMatch(recalc[1],/saveDB\s*\(/,'recalcContract no debe iniciar una segunda sincronización por sí mismo');

assert.match(source,/db\.changes=A\(db\.changes\)\.filter[\s\S]*window\.recalcContract\(c\);[\s\S]*saveDB\(\)/,'eliminar debe recalcular antes de guardar una sola vez');
assert.match(source,/data-cc-change-summary/,'el resumen acumulado de modificaciones debe conservarse');

const item=supplementalModules.find(([name])=>name==='change-order-fix-v1.js');
assert.deepEqual(item,['change-order-fix-v1.js','20260905-changefix2'],'la caché autenticada debe cargar la revisión de guardado único');

console.log('change-order-save-order: crear/editar/eliminar recalculan antes de una única persistencia');