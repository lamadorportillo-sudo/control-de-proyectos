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
const adminMandatory=read('supabase/migrations/20260824023400_security_admin_mfa_grace_enforcement_v1.sql');

assert.match(access,/functions\/v1\/secure-mfa/,'el acceso debe disponer del servicio 2FA');
assert.match(access,/mfa_required/,'el ingreso debe detenerse cuando se requiere segundo factor');
assert.match(access,/verify_login/,'el formulario debe completar el desafío 2FA');
assert.match(access,/secondFactorPrompt/,'debe existir pantalla de segundo factor antes de abrir la aplicación');
assert.match(access,/mfa_enrollment_required/,'el ingreso administrativo debe poder exigir enrolamiento 2FA');
assert.match(access,/mandatoryEnrollmentPrompt/,'debe existir pantalla de enrolamiento obligatorio');
assert.match(access,/complete_login:true/,'el enrolamiento obligatorio debe terminar abriendo una sesión protegida');

for(const action of ['status','enroll','verify_enrollment','verify_login','cancel_enrollment','unenroll']){
  assert.match(mfa,new RegExp(`action\\s*===\\s*"${action}"`),`secure-mfa debe implementar ${action}`);
}
assert.match(mfa,/auth\.mfa\.challenge/,'2FA debe crear un desafío real de Supabase Auth');
assert.match(mfa,/auth\.mfa\.verify/,'2FA debe verificar el código mediante Supabase Auth');
assert.match(mfa,/mfa_failure/,'los códigos incorrectos deben quedar auditados');
assert.match(mfa,/recentFails[\s\S]*>=8|recentFails[\s\S]*>= 8/,'2FA debe limitar códigos incorrectos repetidos');
assert.match(mfa,/Cache-Control[^\n]*no-store/,'las respuestas 2FA no deben almacenarse en caché');
assert.match(mfa,/required&&verified\.length<=1/,'un administrador no debe poder retirar su último factor obligatorio');
assert.match(mfa,/complete_login/,'el enrolamiento obligatorio debe poder completar el login');

assert.match(login,/mfa_challenge_required/,'el login debe auditar cuando se requiere 2FA');
assert.match(login,/security_force_reauth:\s*true/,'el login debe bloquear acceso hasta completar 2FA');
assert.match(login,/mfa_required:\s*true/,'el login debe devolver un estado explícito de segundo factor');
assert.match(login,/getAuthenticatorAssuranceLevel/,'el login debe comprobar el nivel AAL');
assert.match(login,/mfa_admin_enrollment_required/,'el login debe detectar administradores cuyo plazo venció');
assert.match(login,/mfa_setup_recommended/,'durante la preparación debe recomendar configurar 2FA');

assert.match(enforcement,/auth\.mfa_factors/,'RLS debe conocer si la cuenta tiene un factor verificado');
assert.match(enforcement,/status = 'verified'/,'solo factores verificados deben activar la exigencia');
assert.match(enforcement,/auth\.jwt\(\)->>'aal'/,'RLS debe comprobar el nivel AAL del JWT');
assert.match(enforcement,/= 'aal2'/,'un usuario con MFA debe usar una sesión AAL2');

assert.match(adminMandatory,/mfa_required_after/,'debe existir fecha de obligatoriedad administrativa');
assert.match(adminMandatory,/interval '7 days'/,'los administradores existentes deben tener periodo de preparación');
assert.match(adminMandatory,/interval '72 hours'/,'los nuevos administradores deben recibir periodo inicial');
assert.match(adminMandatory,/workspace_members_admin_mfa_deadline_trg/,'el cambio de rol debe mantener el plazo automáticamente');
assert.match(adminMandatory,/auth\.mfa_factors/,'la autorización debe comprobar factores reales de Supabase');
assert.match(adminMandatory,/auth\.jwt\(\)->>'aal'/,'la autorización administrativa debe exigir AAL2 cuando corresponde');

assert.match(serviceGuard,/service_user_has_verified_mfa/,'debe existir guardia MFA para servicios privilegiados');
assert.match(serviceGuard,/revoke all[\s\S]*public, anon, authenticated/,'usuarios normales no deben invocar la guardia privilegiada');
assert.match(serviceGuard,/grant execute[\s\S]*service_role/,'solo service_role debe ejecutar la guardia');

assert.match(users,/service_user_has_verified_mfa/,'la administración de usuarios debe respetar MFA');
assert.match(users,/claims\?\.aal\s*===\s*"aal2"/,'operaciones privilegiadas deben exigir AAL2 cuando corresponde');
assert.match(users,/security_valid_after/,'operaciones privilegiadas deben respetar el corte de tokens');
assert.match(users,/adminMfaPastDueMissing/,'operaciones administrativas deben respetar el vencimiento 2FA');
assert.match(users,/action\s*===\s*"reset_mfa"/,'otro administrador debe poder iniciar recuperación 2FA');
assert.match(users,/auth\.admin\.mfa\.deleteFactor/,'la recuperación debe usar la API administrativa oficial de MFA');
assert.match(users,/24\*3600000/,'la recuperación administrativa debe dar solo 24 horas de gracia');

assert.match(halu,/service_user_has_verified_mfa/,'Halu debe respetar factores MFA verificados');
assert.match(halu,/claims\?\.aal!=="aal2"/,'Halu debe negar sesiones AAL1 cuando MFA está activo');
assert.match(halu,/security_valid_after/,'Halu debe rechazar tokens anteriores a una revocación');
assert.match(halu,/adminMfaPastDueMissing/,'Halu debe respetar la obligación 2FA administrativa');

for(const token of ['Activar 2FA','verify_enrollment','cancel_enrollment','cc-mfa-qr','2FA será obligatoria para administradores','Recuperación'])assert.match(mfaUi,new RegExp(token),`la interfaz 2FA debe incluir ${token}`);
assert.match(mfaUi,/function safeQr/,'la interfaz debe validar el origen del QR');
assert.match(mfaUi,/data:image\\\/svg\\\+xml/,'el QR debe restringirse a una imagen SVG embebida');
assert.match(loader,/mfa-security-v1\.js\?v=20260823-mfa2/,'el cargador debe publicar la interfaz 2FA obligatoria');

console.log('mfa-security: segundo factor, periodo de preparación, obligatoriedad administrativa, recuperación, RLS, Halu e interfaz verificados');
