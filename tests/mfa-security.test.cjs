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
const optionalAdmin=read('supabase/migrations/20260831032500_security_admin_mfa_optional_v1.sql');

assert.match(access,/functions\/v1\/secure-mfa/,'el acceso debe conservar el servicio 2FA opcional');
assert.match(access,/mfa_required/,'el ingreso debe completar segundo factor cuando la cuenta lo activó');
assert.match(access,/verify_login/,'el formulario debe completar el desafío 2FA cuando corresponda');
assert.match(access,/secondFactorPrompt/,'debe existir pantalla de segundo factor para cuentas con MFA activo');

for(const action of ['status','enroll','verify_enrollment','verify_login','cancel_enrollment','unenroll']){
  assert.match(mfa,new RegExp(`action\\s*===\\s*"${action}"`),`secure-mfa debe implementar ${action}`);
}
assert.match(mfa,/auth\.mfa\.challenge/,'2FA debe crear un desafío real de Supabase Auth');
assert.match(mfa,/auth\.mfa\.verify/,'2FA debe verificar el código mediante Supabase Auth');
assert.match(mfa,/mfa_failure/,'los códigos incorrectos deben quedar auditados');
assert.match(mfa,/recentFails[\s\S]*>=8|recentFails[\s\S]*>= 8/,'2FA debe limitar códigos incorrectos repetidos');
assert.match(mfa,/Cache-Control[^\n]*no-store/,'las respuestas 2FA no deben almacenarse en caché');

assert.match(login,/mfa_challenge_required/,'el login debe auditar 2FA cuando el usuario lo tiene activo');
assert.match(login,/security_force_reauth:\s*true/,'una cuenta con MFA activo debe completar AAL2');
assert.match(login,/mfa_required:\s*true/,'el login debe devolver un estado explícito para MFA activo');
assert.match(login,/getAuthenticatorAssuranceLevel/,'el login debe comprobar el nivel AAL');

assert.match(enforcement,/auth\.mfa_factors/,'RLS debe conocer si la cuenta activó un factor verificado');
assert.match(enforcement,/status = 'verified'/,'solo factores verificados deben activar la exigencia');
assert.match(enforcement,/auth\.jwt\(\)->>'aal'/,'RLS debe comprobar el nivel AAL del JWT cuando existe MFA');
assert.match(enforcement,/= 'aal2'/,'un usuario que activó MFA debe usar una sesión AAL2');

assert.match(optionalAdmin,/drop trigger if exists workspace_members_admin_mfa_deadline_trg/,'debe eliminarse la obligación administrativa por fecha');
assert.match(optionalAdmin,/set mfa_required_after = null/,'los plazos administrativos anteriores deben limpiarse');
assert.match(optionalAdmin,/new\.mfa_required_after := null/,'nuevos plazos obligatorios deben neutralizarse');
assert.match(optionalAdmin,/private\.account_access_allowed/,'la autorización debe quedar reconstruida');
assert.match(optionalAdmin,/Si el propio usuario activó MFA/,'MFA debe conservarse como protección voluntaria');

assert.match(serviceGuard,/service_user_has_verified_mfa/,'debe existir guardia MFA para cuentas que optaron por 2FA');
assert.match(serviceGuard,/revoke all[\s\S]*public, anon, authenticated/,'usuarios normales no deben invocar la guardia privilegiada');
assert.match(serviceGuard,/grant execute[\s\S]*service_role/,'solo service_role debe ejecutar la guardia');

assert.match(users,/service_user_has_verified_mfa/,'la administración de usuarios debe respetar MFA si está activo');
assert.match(users,/claims\?\.aal\s*===\s*"aal2"/,'operaciones privilegiadas deben exigir AAL2 a quien activó MFA');
assert.match(users,/security_valid_after/,'operaciones privilegiadas deben respetar el corte de tokens');
assert.match(users,/action\s*===\s*"reset_mfa"/,'debe conservarse recuperación de 2FA para cuentas que lo usan');
assert.match(users,/auth\.admin\.mfa\.deleteFactor/,'la recuperación debe usar la API administrativa oficial de MFA');

assert.match(halu,/service_user_has_verified_mfa/,'ZORDON debe respetar factores MFA verificados');
assert.match(halu,/claims\?\.aal!=="aal2"/,'ZORDON debe negar AAL1 cuando el usuario activó MFA');
assert.match(halu,/security_valid_after/,'ZORDON debe rechazar tokens anteriores a una revocación');

for(const token of ['Activar 2FA','verify_enrollment','cancel_enrollment','cc-mfa-qr','Recuperación'])assert.match(mfaUi,new RegExp(token),`la interfaz 2FA opcional debe incluir ${token}`);
assert.match(mfaUi,/function safeQr/,'la interfaz debe validar el origen del QR');
assert.match(mfaUi,/data:image\\\/svg\\\+xml/,'el QR debe restringirse a una imagen SVG embebida');
assert.match(mfaUi,/noticeCheckedAt<30000|now-noticeCheckedAt<30000/,'el estado 2FA debe limitar consultas repetidas');
assert.match(loader,/mfa-security-v1\.js\?v=20260824-mfa4/,'el cargador debe conservar la configuración 2FA opcional');

console.log('mfa-security: segundo factor opcional, recuperación, RLS, ZORDON e interfaz verificados');
