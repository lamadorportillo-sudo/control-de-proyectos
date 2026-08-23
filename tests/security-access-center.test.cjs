const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=f=>fs.readFileSync(f,'utf8');
const access=read('private-access-v1.js');
const runtime=read('security-runtime-v1.js');
const center=read('security-center-v1.js');
const loader=read('project-tabs-complete-v1.js');
const patchSession=read('patch-session-security.cjs');
const login=read('supabase/functions/secure-login/index.ts');
const users=read('supabase/functions/manage-users/index.ts');
const migration=read('supabase/migrations/20260823022530_security_sessions_and_access_audit.sql');
const hardening=read('supabase/migrations/20260823033156_security_audit_immutability_and_emergency_lockdown.sql');
const lockdownWrapper=read('supabase/migrations/20260823033351_move_lockdown_definer_to_private_schema.sql');
const tokenCutoff=read('supabase/migrations/20260823034205_security_token_cutoff_revocation.sql');
const networkRate=read('supabase/migrations/20260823034450_security_privacy_preserving_network_rate_limit.sql');

assert.match(access,/functions\/v1\/secure-login/,'el acceso debe pasar por secure-login');
assert.match(access,/securitySessionId/,'la sesión local debe conservar el identificador de seguridad');
assert.doesNotMatch(access,/token\?grant_type=password/,'el formulario no debe autenticar directamente contra el endpoint de token');

for(const token of ['login_success','login_failure','login_rate_limited','security_sessions','security_events'])assert.match(login,new RegExp(token),`secure-login debe incluir ${token}`);
assert.match(login,/Cache-Control[^\n]*no-store/,'secure-login debe evitar caché');
assert.match(login,/recentFails[\s\S]*>= 12/,'secure-login debe limitar intentos repetidos por cuenta');
assert.match(login,/networkFingerprint/,'secure-login debe derivar una huella de red no reversible');
assert.match(login,/networkFails[\s\S]*>= 30/,'secure-login debe limitar ataques repetidos desde una misma red');
assert.match(login,/crypto\.subtle\.digest\("SHA-256"/,'la red debe convertirse a hash antes de registrarse');
assert.match(login,/network_fingerprint/,'los eventos deben asociar únicamente la huella de red');
assert.doesNotMatch(login,/ip_address\s*:/i,'no debe persistirse una dirección IP en claro');

for(const action of ['heartbeat','end_session','security_overview','revoke_sessions','set_active','reset_password'])assert.match(users,new RegExp(`action\\s*===\\s*"${action}"`),`manage-users debe implementar ${action}`);
assert.match(users,/security_force_reauth\s*:\s*true/,'revocar/restablecer debe exigir nueva autenticación');
assert.match(users,/session_revoked/,'debe auditar el cierre administrativo de sesiones');
assert.match(users,/security_valid_after/,'las operaciones privilegiadas deben respetar la revocación de tokens antiguos');

assert.match(runtime,/SEGURIDAD DE SESIÓN Y CONTENIDO V3/,'debe estar activa la tercera capa de seguridad local');
assert.match(runtime,/HEARTBEAT_EVERY/,'debe existir verificación periódica de sesión');
assert.match(runtime,/action:'heartbeat'|securityCall\('heartbeat'/,'debe consultar el estado remoto de la sesión');
assert.match(runtime,/end_session/,'debe registrar el cierre de sesión');
assert.match(runtime,/clearLocalContractCache/,'debe limpiar datos contractuales del dispositivo al cerrar sesión');
assert.match(runtime,/localStorage\.removeItem\(STORE_KEY\)/,'debe eliminar la copia local del expediente');
assert.match(runtime,/finally\{clearLocalContractCache/,'la limpieza local debe ejecutarse incluso si el cierre remoto falla');

assert.match(patchSession,/securitySessionId:priorSession\.securitySessionId/,'la renovación del token debe conservar la sesión de seguridad');
assert.match(patchSession,/deviceLabel:priorSession\.deviceLabel/,'la renovación debe conservar el dispositivo asociado');
assert.match(patchSession,/cache:'no-store'/,'las consultas autenticadas deben evitar caché del navegador');

assert.match(center,/Seguridad y accesos/,'debe existir panel administrativo de seguridad');
assert.match(center,/Intentos fallidos/,'el panel debe mostrar intentos fallidos');
assert.match(center,/data-sec-revoke/,'el panel debe permitir cerrar sesiones de otro usuario');
assert.match(center,/data-sec-lockdown/,'el panel debe ofrecer cierre general de sesiones');
assert.match(center,/security_lockdown_other_users/,'el cierre general debe ejecutarse mediante RPC protegido');
assert.match(center,/mfa_failure/,'el centro de seguridad debe identificar fallos 2FA');
assert.match(center,/mfa_enrolled/,'el centro de seguridad debe identificar activaciones 2FA');
assert.match(loader,/security-center-v1\.js/,'el cargador principal debe cargar el panel de seguridad');
assert.match(loader,/securitycenter4/,'el cargador debe renovar caché del centro de seguridad');
assert.match(loader,/security-runtime-v1\.js\?v=20260823-security3/,'el cargador debe usar la versión que limpia el dispositivo al cerrar sesión');

for(const object of ['security_sessions','security_events','security_force_reauth','security_sessions_admin_select','security_events_admin_select'])assert.match(migration,new RegExp(object),`la migración debe incluir ${object}`);
assert.match(migration,/enable row level security/,'las tablas de seguridad deben usar RLS');

assert.match(hardening,/security_events_immutable_trg/,'la auditoría de seguridad debe ser inmutable');
assert.match(hardening,/block_security_event_mutation/,'debe bloquear modificación o borrado de eventos');
assert.match(hardening,/security_lockdown_other_users/,'debe existir cierre general protegido');
assert.match(hardening,/private\.is_control_admin\(\)/,'el cierre general debe exigir administrador');
assert.match(hardening,/security_force_reauth = true/,'el cierre general debe bloquear acceso de datos hasta reautenticar');
assert.match(hardening,/emergency_lockdown/,'el cierre general debe quedar auditado');
assert.match(hardening,/revoke insert, update, delete, truncate on public\.security_events from anon, authenticated/,'clientes normales no deben modificar la auditoría');

assert.match(lockdownWrapper,/private\.security_lockdown_other_users_impl/,'la implementación privilegiada debe vivir en esquema privado');
assert.match(lockdownWrapper,/security definer/,'la implementación privada debe ejecutar con privilegios controlados');
assert.match(lockdownWrapper,/public\.security_lockdown_other_users\(\)[\s\S]*security invoker/,'el RPC público debe ser security invoker');

assert.match(tokenCutoff,/security_valid_after/,'el perfil debe guardar el corte mínimo de emisión del token');
assert.match(tokenCutoff,/profiles_security_valid_after_trg/,'debe actualizar el corte al revocar o desactivar');
assert.match(tokenCutoff,/auth\.jwt\(\)->>'iat'/,'RLS debe comparar la fecha de emisión del JWT');
assert.match(tokenCutoff,/security_force_reauth is true/,'el corte debe activarse al forzar reautenticación');
assert.match(tokenCutoff,/date_trunc\('second', now\(\)\)/,'el corte debe registrar el instante de revocación');
assert.match(tokenCutoff,/>= p\.security_valid_after/,'un token anterior al corte debe quedar rechazado permanentemente');

assert.match(networkRate,/network_fingerprint/,'la auditoría debe soportar huella de red');
assert.match(networkRate,/security_events_network_created_idx/,'la comprobación por red debe estar indexada');
assert.match(networkRate,/No almacena la IP sin procesar/,'la migración debe documentar la minimización de datos');

console.log('security-access-center: login, sesiones, caché local, auditoría inmutable, cierre general, corte de tokens, 2FA y límite de red verificados');
