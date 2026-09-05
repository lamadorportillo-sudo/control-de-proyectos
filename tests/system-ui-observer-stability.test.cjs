const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const source=fs.readFileSync('system-ui-refinement-v3.js','utf8');

assert.match(source,/REFINAMIENTO GENERAL DE INTERFAZ V5 · OBSERVADOR ESTABLE/,'debe mantenerse la versión V5 estable del refinamiento visual');
assert.match(source,/window\.__CC_SYSTEM_UI_REFINEMENT_V5__=true/,'la capa visual debe tener guardia de carga única V5');
assert.match(source,/const NativeObserver=window\.__ccNativeMutationObserver\|\|window\.MutationObserver/,'debe conservar una referencia nativa estable del observador');
assert.match(source,/attributeFilter:\['class'\]/,'el observador global solo debe escuchar cambios de clase');
assert.doesNotMatch(source,/attributeFilter:\[[^\]]*'style'/,'no puede volver a observar style mientras repairVisibility modifica estilos');
assert.match(source,/if\(el\.style\.opacity\)el\.style\.removeProperty\('opacity'\)/,'la limpieza de opacidad solo debe escribir cuando existe un override');
assert.match(source,/if\(row\.style\.display!=='none'\)row\.style\.display='none'/,'ocultar duplicados debe ser idempotente');
assert.match(source,/if\(row\.style\.display==='none'\)row\.style\.removeProperty\('display'\)/,'una fila deja de estar oculta cuando deja de ser duplicada');
assert.match(source,/observer\?\.disconnect\(\)/,'el observador debe desconectarse al abandonar la página');

const entry=supplementalModules.find(([name])=>name==='system-ui-refinement-v3.js');
assert.deepEqual(entry,['system-ui-refinement-v3.js','20260905-system6'],'el plan autenticado debe invalidar la caché del observador visual corregido');

console.log('system-ui-observer-stability: refinamiento visual idempotente, cacheado por versión y sin bucle sobre style');
