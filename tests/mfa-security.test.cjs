const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=f=>fs.readFileSync(f,'utf8');

const access=read('private-access-v1.js');
const mfaUi=read('mfa-security-v1.js');
const loader=read('project-tabs-complete-v1.js');
const login=read('supabase/functions/secure-login/index.ts');
const mfa=read('supabase/functions/secure-mfa/index.ts');
const users=read('supabase/functions/manage-users/index.ts');
const halu=read('supabase/functions/halu-chat/index.ts');
const enforcement=read('supabase/migrations/20260823145300_security_mfa_opt_in_enforcement.sql');
const serviceGuard=read('supabase/migrations/20260823150100_security_mfa_service_guard.sql');

assert.match(access,/functions\/v1\/secure-mfa/,'el acceso debe disponer del servicio 2FA');
assert.match(access,/mfa_required/,'el ingreso debe detenerse cuando se requiere segundo factor');
assert.match(access,/verify_login/,'el formulario debe completar el desafío 2FA');
assert.match(access,/secondFactorPrompt/,'debe existir pantalla de segundo factor antes de abrir la aplicación');

for(const action of ['status','enroll','verify_enrollment','verify_login','cancel_enrollment','unenroll']){
  assert.match(mfa,new RegExp(`action === "${action}"`),`secure-mfa debe implementar ${action}`);
}
assert.match(mfa,/auth\.mfa\.challenge/,'2FA debe crear un desafío real de Supabase Auth');
assert.match(mfa,/auth\.mfa\.verify/,'2FA debe verificar el código mediante Supabase Auth');
assert.match(mfa,/mfa_failure/,'los códigos incorrectos deben quedar auditados');
assert.match(mfa,/recentFails[\s\S]*>= 8/,'2FA debe limitar códigos incorrectos repetidos');
assert.match(mfa,/Cache-Control[^\n]*no-store/,'las respuestas 2FA no deben almacenarse en caché');

assert.match(login,/mfa_challenge_required/,'el login debe auditar cuando se requiere 2FA');
assert.match(login,/security_force_reauth: true/,'el login debe bloquear acceso hasta completar 2FA');
assert.match(login,/mfa_required: true/,'el login debe devolver un estado explícito de segundo factor');
assert.match(login,/getAuthenticatorAssuranceLevel/,'el login debe comprobar el nivel AAL');

assert.match(enforcement,/auth\.mfa_factors/,'RLS debe conocer si la cuenta tiene un factor verificado');
assert.match(enforcement,/status = 'verified'/,'solo factores verificados deben activar la exigencia');
assert.match(enforcement,/auth\.jwt\(\)->>'aal'/,'RLS debe comprobar el nivel AAL del JWT');
assert.match(enforcement,/= 'aal2'/,'un usuario con MFA debe usar una sesión AAL2');

assert.match(serviceGuard,/service_user_has_verified_mfa/,'debe existir guardia MFA para servicios privilegiados');
assert.match(serviceGuard,/revoke all[\s\S]*public, anon, authenticated/,'usuarios normales no deben invocar la guardia privilegiada');
assert.match(serviceGuard,/grant execute[\s\S]*service_role/,'solo service_role debe ejecutar la guardia');

assert.match(users,/service_user_has_verified_mfa/,'la administración de usuarios debe respetar MFA');
assert.match(users,/claims\?\.aal === "aal2"/,'operaciones privilegiadas deben exigir AAL2 cuando corresponde');
assert.match(users,/security_valid_after/,'operaciones privilegiadas deben respetar el corte de tokens');

assert.match(halu,/service_user_has_verified_mfa/,'Halu debe respetar factores MFA verificados');
assert.match(halu,/claims\?\.aal!=="aal2"/,'Halu debe negar sesiones AAL1 cuando MFA está activo');
assert.match(halu,/security_valid_after/,'Halu debe rechazar tokens anteriores a una revocación');

for(const token of ['Activar 2FA','verify_enrollment','cancel_enrollment','Desactivar','cc-mfa-qr'])assert.match(mfaUi,new RegExp(token),`la interfaz 2FA debe incluir ${token}`);
assert.match(mfaUi,/function safeQr/,'la interfaz debe validar el origen del QR');
assert.match(mfaUi,/data:image\\\/svg\\\+xml/,'el QR debe restringirse a una imagen SVG embebida');
assert.match(loader,/mfa-security-v1\.js\?v=20260823-mfa1/,'el cargador debe publicar la interfaz 2FA');

console.log('mfa-security: segundo factor, RLS, servicios privilegiados, Halu e interfaz verificados');
