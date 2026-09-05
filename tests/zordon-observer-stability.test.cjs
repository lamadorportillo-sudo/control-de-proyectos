const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const source=fs.readFileSync('zordon-continuous-runtime-v1.js','utf8');

test('ZORDON conserva un núcleo idempotente sin bucle global de reescritura',()=>{
  assert.match(source,/ZORDON · NÚCLEO DE APRENDIZAJE CONTINUO V4 · IDÉMPOTENTE/);
  assert.match(source,/function setText\(el,value\)/,'las escrituras de texto deben comparar antes de modificar el DOM');
  assert.match(source,/if\(el\.textContent===next\)return false/,'setText debe evitar mutaciones redundantes');
  assert.match(source,/function setAttr\(el,name,value\)/,'los atributos deben ser idempotentes');
  assert.match(source,/function mutationRelevant\(mutations\)/,'el observador debe filtrar mutaciones relevantes');
  assert.match(source,/function scheduleRefresh\(\)/,'las actualizaciones deben agruparse antes de tocar el DOM');
  assert.match(source,/new NativeObserver\(mutations=>\{if\(mutationRelevant\(mutations\)\)scheduleRefresh\(\)\}\)/,'solo mutaciones relevantes deben despertar a ZORDON');
  assert.match(source,/observer\?\.observe\(document\.documentElement,\{subtree:true,childList:true\}\)/,'el observador no debe escuchar cambios de texto producidos por su propia marca');
  assert.doesNotMatch(source,/characterData\s*:\s*true/,'no debe observar cada escritura de texto');
  assert.doesNotMatch(source,/setInterval\s*\(/,'no debe existir un barrido periódico permanente');
  assert.match(source,/if\(!busy&&send\.disabled\)send\.disabled=false/,'el refresco visual no debe reactivar Enviar durante una consulta');
  assert.match(source,/window\.addEventListener\('pagehide',\(\)=>observer\?\.disconnect\?\.\(\)/,'el observador debe liberarse al abandonar la página');
});

test('el manifiesto publica la versión estable de ZORDON una sola vez',()=>{
  const matches=supplementalModules.filter(([file])=>file==='zordon-continuous-runtime-v1.js');
  assert.equal(matches.length,1,'ZORDON no puede tener dos entradas de carga autenticada');
  assert.equal(matches[0][1],'20260905-zordon5');
});
