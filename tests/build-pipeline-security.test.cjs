const assert=require('node:assert/strict');
const fs=require('node:fs');
const {preAuthModules,retiredModules}=require('../authenticated-module-manifest-v1.cjs');

const builder=fs.readFileSync('build-pages.cjs','utf8');

assert(builder.includes("cache:'no-store'"),'El generador debe impedir que las respuestas autenticadas queden en caché.');
assert(builder.includes('securitySessionId:priorSession.securitySessionId'),'El generador debe conservar el identificador de la sesión de seguridad al renovar tokens.');
assert(builder.includes('deviceLabel:priorSession.deviceLabel'),'El generador debe conservar la identificación del dispositivo al renovar tokens.');
assert.deepEqual(preAuthModules.map(([file])=>file),['private-access-v1.js','password-recovery-v1.js'],'solo login y recuperación pueden ejecutarse antes de autenticar');
assert.equal(preAuthModules.find(([file])=>file==='private-access-v1.js')?.[1],'20260904-private6','la versión del login seguro debe venir del manifiesto');
assert(builder.includes('preAuthVersions.get(module)||version'),'el generador debe aplicar las versiones previas desde el manifiesto y no desde un literal duplicado');
assert(builder.includes("PERFORMANCE_VERSION='20260904-perf10'"),'el generador debe publicar el coordinador de rendimiento vigente');
assert(builder.includes("['admin-users-v1.js','20260823-admin-users4']"),'el generador debe publicar la versión vigente de administración de usuarios.');
assert(builder.includes("['project-tabs-complete-v1.js','20260828-tabscomplete32']"),'la base histórica puede conservar la referencia de pestañas, que el pipeline crítico actualiza y valida después');
assert(builder.includes("['security-runtime-v1.js','20260823-security1']"),'el generador debe publicar el control de sesiones.');
assert(builder.includes("['security-center-v1.js','20260823-security-center1']"),'el generador debe publicar el Centro de Seguridad.');
assert(builder.includes("['mfa-security-v1.js','20260824-mfa4']"),'el generador debe publicar la configuración 2FA.');
assert(builder.includes('retiredModules.includes(module)'),'el generador debe impedir que módulos retirados vuelvan a ejecutarse');
assert(retiredModules.includes('system-ui-refinement-v2.js'),'la capa visual V2 debe estar explícitamente retirada');

console.log('OK build pipeline security y versiones canónicas');
