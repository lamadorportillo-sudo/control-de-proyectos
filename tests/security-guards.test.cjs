const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=f=>fs.readFileSync(f,'utf8');

const runtime=read('security-runtime-v1.js');
assert.match(runtime,/IDLE_LIMIT=30\*60\*1000/,'falta cierre por inactividad');
assert.match(runtime,/ABSOLUTE_LIMIT=12\*60\*60\*1000/,'falta límite absoluto de sesión');
assert.match(runtime,/cc-content-shield/,'falta protección visual al ocultar la aplicación');
assert.match(runtime,/data-ccx-backup/,'falta restricción del respaldo masivo');
assert.match(runtime,/role\(\)==='admin'/,'el respaldo masivo no está limitado a administrador');
assert.match(runtime,/pagehide.*cleanConsultaCache/s,'falta limpieza de caché local para solo consulta');

const loader=read('project-tabs-complete-v1.js');
assert.match(loader,/security-runtime-v1\.js\?v=/,'el módulo de seguridad no se carga con la aplicación');
assert.match(loader,/mfa-security-v1\.js\?v=/,'el módulo 2FA opcional no se carga con la aplicación');

const users=read('admin-users-v1.js');
assert.match(users,/minlength=\"12\"/,'las contraseñas temporales no exigen 12 caracteres');
assert.match(users,/call\('change_password'/,'el cambio obligatorio no usa el flujo protegido');
assert.doesNotMatch(users,/\/auth\/v1\/user/,'el cliente no debe marcar directamente el cambio de contraseña');
assert.match(users,/data-user-active/,'falta activar o desactivar usuarios desde administración');
assert.match(users,/reset_password/,'falta restablecimiento seguro de contraseña temporal');
assert.match(users,/Recuperar 2FA/,'falta recuperación administrativa visible para cuentas que usan 2FA');

const access=read('private-access-v1.js');
assert.match(access,/strongPassword/,'el alta por código no valida contraseña fuerte');
assert.match(access,/p\.length>=12/,'el alta por código no exige mínimo 12 caracteres');
assert.match(access,/verify_login/,'el acceso no completa el segundo factor cuando la cuenta lo activó');

const migration=read('supabase/migrations/202608220002_security_hardening_users_and_content_v1.sql');
assert.match(migration,/private\.account_access_allowed/,'falta bloqueo server-side de cuentas inactivas o vencidas');
assert.match(migration,/security invoker/ig,'los RPC administrativos deben respetar RLS');
assert.match(migration,/grant update \(full_name, updated_at\)/i,'el perfil no limita columnas modificables por el usuario');
assert.match(migration,/project_files_read/,'faltan políticas privadas de archivos');
assert.match(migration,/public=false/,'el bucket de documentos debe permanecer privado');

const optionalMfa=read('supabase/migrations/20260831032500_security_admin_mfa_optional_v1.sql');
assert.match(optionalMfa,/drop trigger if exists workspace_members_admin_mfa_deadline_trg/,'la obligación administrativa 2FA debe estar desactivada');
assert.match(optionalMfa,/set mfa_required_after = null/,'deben limpiarse los vencimientos 2FA administrativos');
assert.match(optionalMfa,/new\.mfa_required_after := null/,'no deben reaparecer vencimientos obligatorios');

const manage=read('supabase/functions/manage-users/index.ts');
assert.match(manage,/action\s*===\s*\"set_active\"/,'falta control de desactivación de cuentas');
assert.match(manage,/action\s*===\s*\"reset_password\"/,'falta rotación administrativa de clave temporal');
assert.match(manage,/action\s*===\s*\"change_password\"/,'falta cambio protegido de clave propia');
assert.match(manage,/(?:groups|g)\s*<\s*3/,'la función de usuarios no valida complejidad de contraseña');
assert.match(manage,/Cache-Control.*no-store/s,'faltan cabeceras anti-cache en gestión de usuarios');
assert.match(manage,/service_user_has_verified_mfa/,'la gestión privilegiada debe respetar 2FA cuando la cuenta lo activó');
assert.match(manage,/security_valid_after/,'la gestión privilegiada debe rechazar tokens revocados');
assert.match(manage,/action\s*===\s*\"reset_mfa\"/,'falta recuperación asistida de segundo factor');
assert.match(manage,/auth\.admin\.mfa\.deleteFactor/,'la recuperación 2FA debe usar la API oficial de administración');

const halu=read('supabase/functions/halu-chat/index.ts');
assert.match(halu,/workspace_members/,'ZORDON no valida pertenencia al espacio de trabajo');
assert.match(halu,/profiles/,'ZORDON no valida estado de la cuenta');
assert.match(halu,/redactSecrets/,'ZORDON no filtra credenciales antes de enviar contexto');
assert.match(halu,/store:\s*false/,'las consultas IA no deben solicitar almacenamiento');
assert.match(halu,/Origen no autorizado/,'ZORDON no rechaza orígenes externos');
assert.match(halu,/service_user_has_verified_mfa/,'ZORDON debe respetar 2FA cuando el usuario lo activó');
assert.match(halu,/security_valid_after/,'ZORDON debe respetar la revocación de tokens');

console.log('security-guards: controles de usuarios, sesiones, 2FA opcional, recuperación, archivos y ZORDON verificados');
