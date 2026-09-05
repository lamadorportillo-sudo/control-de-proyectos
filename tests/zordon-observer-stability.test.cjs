const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const source=fs.readFileSync('zordon-continuous-runtime-v1.js','utf8');
const chatSource=fs.readFileSync('zordon-chat-ui-v1.js','utf8');

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

test('el chat ZORDON solo intercepta eventos originados en su botón real',()=>{
  assert.match(chatSource,/ZORDON · CHAT NATURAL Y CONTINUO V5 · EVENTOS AISLADOS/);
  assert.match(chatSource,/function isSendEvent\(event\)/);
  assert.match(chatSource,/target===btn\|\|!!target\?\.closest\?\./,'el envío debe depender del target DOM, no de coordenadas globales');
  assert.doesNotMatch(chatSource,/function pointInside\(/,'no debe existir detección de clic global por coordenadas');
  assert.doesNotMatch(chatSource,/event\.clientX|event\.clientY/,'un clic fuera del chat no puede convertirse en envío por posición');
  assert.match(chatSource,/new NativeObserver\(mutations=>/,'el observador del chat debe usar el observador nativo y filtrar altas relevantes');
  assert.match(chatSource,/window\.addEventListener\('pagehide',\(\)=>observer\?\.disconnect\?\.\(\)/,'el observador del chat debe desconectarse al abandonar la página');
});

test('el manifiesto publica las versiones estables de ZORDON una sola vez',()=>{
  const core=supplementalModules.filter(([file])=>file==='zordon-continuous-runtime-v1.js');
  const chat=supplementalModules.filter(([file])=>file==='zordon-chat-ui-v1.js');
  assert.equal(core.length,1,'el núcleo ZORDON no puede tener dos entradas de carga autenticada');
  assert.equal(chat.length,1,'el chat ZORDON no puede tener dos entradas de carga autenticada');
  assert.equal(core[0][1],'20260905-zordon5');
  assert.equal(chat[0][1],'20260905-cleanchat5');
});
