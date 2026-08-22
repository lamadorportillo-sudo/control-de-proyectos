const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'password-recovery-v1.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('expone la opcion de recuperar contraseña en el inicio',()=>{
  assert.match(source,/¿Olvidaste tu contraseña\?/);
  assert.match(html,/password-recovery-v1\.js/);
});

test('solicita un correo de recuperacion con retorno al sitio',()=>{
  assert.match(source,/\/auth\/v1\/recover\?redirect_to=/);
  assert.match(source,/location\.origin\+location\.pathname/);
});

test('actualiza la contraseña con el token de recuperacion',()=>{
  assert.match(source,/hash\.get\('type'\)===\s*'recovery'/);
  assert.match(source,/\/auth\/v1\/user/);
  assert.match(source,/Authorization.*Bearer/);
});

test('mantiene una respuesta que no revela si el usuario existe',()=>{
  assert.match(source,/Si existe una cuenta con ese correo/);
});

test('reinstala la opcion si el rediseño sustituye el formulario',()=>{
  assert.match(source,/new MutationObserver/);
  assert.match(source,/!\$\('#forgotPasswordBtn'\)/);
});
