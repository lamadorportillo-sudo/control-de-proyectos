const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=f=>fs.readFileSync(f,'utf8');
const access=read('private-access-v1.js');
const runtime=read('security-runtime-v1.js');
const center=read('security-center-v1.js');
const loader=read('project-tabs-complete-v1.js');
const login=read('supabase/functions/secure-login/index.ts');
const users=read('supabase/functions/manage-users/index.ts');
const migration=read('supabase/migrations/20260823022530_security_sessions_and_access_audit.sql');

assert.match(access,/functions\/v1\/secure-login/,'el acceso debe pasar por secure-login');
assert.match(access,/securitySessionId/,'la sesión local debe conservar el identificador de seguridad');
assert.doesNotMatch(access,/token\?grant_type=password/,'el formulario no debe autenticar directamente contra el endpoint de token');

for(const token of ['login_success','login_failure','login_rate_limited','security_sessions','security_events'])assert.match(login,new RegExp(token),`secure-login debe incluir ${token}`);
assert.match(login,/Cache-Control[^\n]*no-store/,'secure-login debe evitar caché');
assert.match(login,/recentFails[\s\S]*>= 12/,'secure-login debe limitar intentos repetidos');

for(const action of ['heartbeat','end_session','security_overview','revoke_sessions','set_active','reset_password'])assert.match(users,new RegExp(`action===\\"${action}\\"`),`manage-users debe implementar ${action}`);
assert.match(users,/security_force_reauth:true/,'revocar/restablecer debe exigir nueva autenticación');
assert.match(users,/session_revoked/,'debe auditar el cierre administrativo de sesiones');

assert.match(runtime,/HEARTBEAT_EVERY/,'debe existir verificación periódica de sesión');
assert.match(runtime,/action:'heartbeat'|securityCall\('heartbeat'/,'debe consultar el estado remoto de la sesión');
assert.match(runtime,/end_session/,'debe registrar el cierre de sesión');

assert.match(center,/Seguridad y accesos/,'debe existir panel administrativo de seguridad');
assert.match(center,/Intentos fallidos/,'el panel debe mostrar intentos fallidos');
assert.match(center,/data-sec-revoke/,'el panel debe permitir cerrar sesiones de otro usuario');
assert.match(loader,/security-center-v1\.js/,'el cargador principal debe cargar el panel de seguridad');

for(const object of ['security_sessions','security_events','security_force_reauth','security_sessions_admin_select','security_events_admin_select'])assert.match(migration,new RegExp(object),`la migración debe incluir ${object}`);
assert.match(migration,/enable row level security/,'las tablas de seguridad deben usar RLS');

console.log('security-access-center: controles de login, sesiones, auditoría y panel verificados');
