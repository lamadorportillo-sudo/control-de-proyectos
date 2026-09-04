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
const restoreAdmin=read('supabase/migrations/20260904054000_security_admin_mfa_mandatory_restore_v1.sql');

assert.match(access,/functions\/v1\/secure-mfa/,'el acceso debe conservar el servicio 2FA');
assert.match(access,/mfa_required/,'el ingreso debe completar segundo factor cuando la cuenta lo activó');
assert.match(access,/mfa_enrollment_required/,'el ingreso debe exigir enrolamiento cuando vence el plazo administrativo');
assert.match(access,/mandatoryEnrollmentPrompt/,'debe existir pantalla obligatoria de enrolamiento para administradores vencidos');
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
assert.match(mfa,/membership\.role==="admin"&&!!profile\?\.mfa_required_after/,'secure-mfa debe reconocer la obligación administrativa');
assert.match(mfa,/required&&verified\.length<=1/,'un administrador obligado no debe eliminar su último factor');

assert.match(login,/mfa_challenge_required/,'el login debe auditar 2FA cuando el usuario lo tiene activo');
assert.match(login,/mfa_enrollment_required/,'el login debe auditar y exigir el enrolamiento administrativo vencido');
assert.match(login,/security_force_reauth:\s*true/,'una cuenta con MFA activo o pendiente debe completar protección reforzada');
assert.match(login,/mfa_required:\s*true/,'el login debe devolver un estado explícito para MFA activo');
assert.match(login,/getAuthenticatorAssuranceLevel/,'el login debe comprobar el nivel AAL');
assert.match(login,/adminMfaPastDue/,'el login debe impedir una sesión normal del administrador sin MFA después del plazo');

assert.match(enforcement,/auth\.mfa_factors/,'RLS debe conocer si la cuenta activó un factor verificado');
assert.match(enforcement,/status = 'verified'/,'solo factores verificados deben activar la exigencia AAL2');
assert.match(enforcement,/auth\.jwt\(\)->>'aal'/,'RLS debe comprobar el nivel AAL del JWT cuando existe MFA');
assert.match(enforcement,/= 'aal2'/,'un usuario que activó MFA debe usar una sesión AAL2');

assert.match(optionalAdmin,/2FA queda como protección opcional/i,'se conserva la migración histórica que originó la regresión para trazabilidad');
assert.match(restoreAdmin,/drop trigger if exists profiles_mfa_optional_insert_trg/,'la restauración debe retirar los triggers que neutralizaban la fecha MFA');
assert.match(restoreAdmin,/drop function if exists private\.keep_mfa_optional\(\)/,'la restauración debe retirar la función que anulaba la obligación');
assert.match(restoreAdmin,/interval '72 hours'/,'los administradores deben disponer del plazo controlado de preparación');
assert.match(restoreAdmin,/create trigger workspace_members_admin_mfa_deadline_trg/,'los nuevos administradores deben recibir vencimiento automáticamente');
assert.match(restoreAdmin,/wm\.role = 'admin'/,'la regla obligatoria debe limitarse a administradores activos');
assert.match(restoreAdmin,/now\(\) < p\.mfa_required_after/,'RLS debe bloquear al superar la fecha cuando todavía falta MFA');
assert.match(restoreAdmin,/auth\.mfa_factors f2/,'RLS debe permitir continuar al administrador que ya verificó un factor');

assert.match(serviceGuard,/service_user_has_verified_mfa/,'debe existir guardia MFA para comprobar factores verificados');
assert.match(serviceGuard,/revoke all[\s\S]*public, anon, authenticated/,'usuarios normales no deben invocar la guardia privilegiada');
assert.match(serviceGuard,/grant execute[\s\S]*service_role/,'solo service_role debe ejecutar la guardia');

assert.match(users,/service_user_has_verified_mfa/,'la administración de usuarios debe comprobar MFA');
assert.match(users,/adminMfaPastDueMissing/,'la administración debe bloquear administradores con MFA vencido y ausente');
assert.match(users,/claims\?\.aal\s*===\s*"aal2"/,'operaciones privilegiadas deben exigir AAL2 cuando existe factor verificado');
assert.match(users,/security_valid_after/,'operaciones privilegiadas deben respetar el corte de tokens');
assert.match(users,/action\s*===\s*"reset_mfa"/,'debe conservarse recuperación de 2FA para cuentas que lo usan');
assert.match(users,/auth\.admin\.mfa\.deleteFactor/,'la recuperación debe usar la API administrativa oficial de MFA');

assert.match(halu,/service_user_has_verified_mfa/,'ZORDON debe comprobar factores MFA verificados');
assert.match(halu,/adminMfaPastDueMissing/,'ZORDON debe bloquear al administrador cuyo plazo MFA venció');
assert.match(halu,/claims\?\.aal!=="aal2"/,'ZORDON debe negar AAL1 cuando el usuario activó MFA');
assert.match(halu,/security_valid_after/,'ZORDON debe rechazar tokens anteriores a una revocación');

for(const token of ['Activar 2FA','verify_enrollment','cancel_enrollment','cc-mfa-qr','Recuperación','Regla administrativa','past_due'])assert.match(mfaUi,new RegExp(token),`la interfaz 2FA debe incluir ${token}`);
assert.match(mfaUi,/function safeQr/,'la interfaz debe validar el origen del QR');
assert.match(mfaUi,/data:image\\\/svg\\\+xml/,'el QR debe restringirse a una imagen SVG embebida');
assert.match(mfaUi,/d\.required&&factors\.length<=1/,'la interfaz no debe ofrecer desactivar el último factor obligatorio');
assert.match(mfaUi,/noticeCheckedAt<30000|now-noticeCheckedAt<30000/,'el estado 2FA debe limitar consultas repetidas');
assert.match(loader,/mfa-security-v1\.js\?v=20260824-mfa4/,'el cargador debe conservar el módulo 2FA');

console.log('mfa-security: 2FA voluntario para usuarios, obligatorio para administradores vencidos, recuperación, RLS, ZORDON e interfaz verificados');
