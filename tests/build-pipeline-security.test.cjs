const assert=require('node:assert/strict');
const fs=require('node:fs');
const {preAuthModules,supplementalModules,buildOnlyModules,buildLateModules,retiredModules}=require('../authenticated-module-manifest-v1.cjs');

const builder=fs.readFileSync('build-pages.cjs','utf8');

assert(builder.includes("cache:'no-store'"),'El generador debe impedir que las respuestas autenticadas queden en caché.');
assert(builder.includes('securitySessionId:priorSession.securitySessionId'),'El generador debe conservar el identificador de la sesión de seguridad al renovar tokens.');
assert(builder.includes('deviceLabel:priorSession.deviceLabel'),'El generador debe conservar la identificación del dispositivo al renovar tokens.');
assert.deepEqual(preAuthModules.map(([file])=>file),['private-access-v1.js','password-recovery-v1.js'],'solo login y recuperación pueden ejecutarse antes de autenticar');
assert.equal(preAuthModules.find(([file])=>file==='private-access-v1.js')?.[1],'20260904-private6','la versión del login seguro debe venir del manifiesto');
assert(builder.includes("buildLateModules}=require('./authenticated-module-manifest-v1.cjs')"),'el build debe consumir el catálogo ordenado del manifiesto');
assert(builder.includes('const activeLateModules=buildLateModules'),'el build no debe reconstruir un catálogo paralelo');
assert(!builder.includes('const lateModules=['),'el build no debe conservar otra lista de módulos/versiones');
assert(builder.includes("PERFORMANCE_VERSION='20260904-perf10'"),'el generador debe publicar el coordinador de rendimiento vigente');
assert(buildOnlyModules.some(([file,version])=>file==='admin-users-v1.js'&&version==='20260823-admin-users4'),'administración de usuarios debe tener versión canónica en el manifiesto');
assert(supplementalModules.some(([file,version])=>file==='project-tabs-complete-v1.js'&&version==='20260831-tabscomplete34'),'pestañas debe usar su versión canónica vigente');
assert(supplementalModules.some(([file,version])=>file==='security-runtime-v1.js'&&version==='20260904-security4'),'seguridad debe usar su versión canónica vigente');
assert(supplementalModules.some(([file,version])=>file==='security-center-v1.js'&&version==='20260823-securitycenter4'),'Centro de Seguridad debe usar su versión canónica vigente');
assert.equal(new Set(buildLateModules.map(([file])=>file)).size,buildLateModules.length,'el orden del build no puede repetir módulos');
for(const retired of retiredModules)assert(!buildLateModules.some(([file])=>file===retired),'ningún módulo retirado puede volver al build: '+retired);
assert(retiredModules.includes('system-ui-refinement-v2.js'),'la capa visual V2 debe estar explícitamente retirada');

console.log('OK build pipeline security y versiones canónicas');
