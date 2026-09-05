const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const current=fs.readFileSync('contract-current-amount-sync-v1.js','utf8');
const contrast=fs.readFileSync('contract-document-contrast-v1.js','utf8');

assert.match(current,/MONTO VIGENTE CALCULADO V1/,'debe existir la sincronización del monto vigente');
assert.match(current,/amountDelta/,'el monto vigente debe considerar modificaciones aprobadas');
assert.match(current,/\['aprobado','aprobada'\]\.includes\(norm\(x\.status\)\)/,'solo modificaciones aprobadas deben afectar el monto vigente');
assert.match(current,/current\.readOnly=true/,'el monto vigente no debe quedar editable manualmente');
assert.match(current,/aria-readonly/,'el estado calculado debe exponerse también a tecnologías de asistencia');
assert.match(current,/original\.addEventListener\(['"]input['"]/,'cambiar el monto original debe recalcular el vigente inmediatamente');
assert.match(current,/form\?\.addEventListener\(['"]submit['"],[^\n]*true\)/,'el valor calculado debe sincronizarse antes del guardado');

assert.match(contrast,/CONTRASTE DOCUMENTAL V2/,'debe existir la corrección contextual V2 del expediente documental');
assert.match(contrast,/\.cc2-archive/,'la corrección debe cubrir el repositorio documental');
assert.match(contrast,/\.cc2-state/,'los estados documentales deben tener contraste propio');
assert.match(contrast,/\.cc2-empty/,'los estados vacíos deben tener contraste propio');
assert.match(contrast,/h3\.cc2-title/,'los títulos del expediente deben declarar color sobre superficie clara');
assert.match(contrast,/\.cc-payment-docs \.cc-payment-doc small/,'los estados de generación documental deben usar texto legible sobre tarjeta clara');
assert.match(contrast,/\.cc2-payment-head small\[data-cc-readable="dark"\]/,'la cabecera de pago debe conservar contraste AA en el expediente claro');

const names=supplementalModules.map(([name])=>name);
const currentAt=names.indexOf('contract-current-amount-sync-v1.js');
const explicitAt=names.indexOf('contract-explicit-rules-v1.js');
const contrastAt=names.indexOf('contract-document-contrast-v1.js');
const finalGuardAt=names.indexOf('ui-contrast-final-guard-v1.js');
assert.ok(currentAt>explicitAt,'el cálculo vigente debe ejecutarse después de las reglas contractuales explícitas');
assert.equal(supplementalModules[currentAt][1],'20260905-contractcurrent1');
assert.ok(contrastAt>=0&&contrastAt<finalGuardAt,'el contraste documental debe ejecutarse antes de la guardia visual final');
assert.equal(supplementalModules[contrastAt][1],'20260905-contractdoccontrast2');

console.log('contract-ui-invariants: monto vigente calculado y expediente documental V2 con contraste contextual');