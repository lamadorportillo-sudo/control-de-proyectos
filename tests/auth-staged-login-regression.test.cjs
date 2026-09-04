const assert=require('node:assert/strict');
const fs=require('node:fs');

const patch=fs.readFileSync('patch-session-security.cjs','utf8');
const stabilizer=fs.readFileSync('stabilize-core-v1.cjs','utf8');
const privateAccess=fs.readFileSync('private-access-v1.js','utf8');

assert.match(privateAccess,/localStorage\.setItem\(SESSION,JSON\.stringify\(session\)\)/,'el acceso privado debe persistir la sesión autenticada');
assert.match(stabilizer,/data-cc-auth-loader data-cc-auth-plan/,'el sistema debe conservar el cargador autenticado por etapas');
assert.match(patch,/cc-staged-login-reload-bridge/,'debe existir un puente explícito entre el login y el cargador autenticado');
assert.match(patch,/form\.addEventListener\('submit'/,'el puente debe activarse solamente al enviar el formulario de acceso');
assert.match(patch,/current&&current!==before/,'la recarga solo debe ocurrir cuando aparezca una sesión nueva');
assert.match(patch,/Date\.now\(\)-started>15000/,'el observador de login debe autolimitarse y no quedar ejecutándose indefinidamente');
assert.match(patch,/location\.reload\(\)/,'una autenticación nueva debe reiniciar el documento para activar los módulos autenticados');
assert.match(patch,/private-access-v1\\\.js/,'el puente debe insertarse junto al módulo real de acceso privado');

console.log('auth-staged-login-regression: transición login -> arranque autenticado protegida');
