const assert=require('node:assert/strict');
const fs=require('node:fs');

const builder=fs.readFileSync('build-pages.cjs','utf8');

assert(builder.includes("cache:'no-store'"),'El generador debe impedir que las respuestas autenticadas queden en caché.');
assert(builder.includes('securitySessionId:priorSession.securitySessionId'),'El generador debe conservar el identificador de la sesión de seguridad al renovar tokens.');
assert(builder.includes("['private-access-v1.js','20260823-private5']"),'El generador debe publicar la versión vigente del control de acceso privado.');
assert(builder.includes("['admin-users-v1.js','20260823-admin-users4']"),'El generador debe publicar la versión vigente de administración de usuarios.');
assert(builder.includes("['project-tabs-complete-v1.js','20260823-tabscomplete24']"),'El generador debe publicar la versión vigente de las pestañas funcionales.');

assert(builder.includes("['security-runtime-v1.js','20260823-security1']"),'El generador debe publicar el control de sesiones.');
assert(builder.includes("['security-center-v1.js','20260823-security-center1']"),'El generador debe publicar el Centro de Seguridad.');
assert(builder.includes("['mfa-security-v1.js','20260823-mfa1']"),'El generador debe publicar la configuracion 2FA.');

console.log('OK build pipeline security');
