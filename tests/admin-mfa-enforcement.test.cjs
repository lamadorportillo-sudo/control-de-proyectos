const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const optionalMigration='supabase/migrations/20260831032500_security_admin_mfa_optional_v1.sql';
const restoreMigration='supabase/migrations/20260904054000_security_admin_mfa_mandatory_restore_v1.sql';
const optional=read(optionalMigration);
const restore=read(restoreMigration);
const login=read('supabase/functions/secure-login/index.ts');
const mfa=read('supabase/functions/secure-mfa/index.ts');
const privateAccess=read('private-access-v1.js');
const manageUsers=read('supabase/functions/manage-users/index.ts');

test('la migración final restaura MFA obligatorio para administradores',()=>{
  assert.ok(path.basename(restoreMigration)>path.basename(optionalMigration),'la restauración debe ejecutarse después de la migración que dejó MFA opcional');
  assert.match(optional,/2FA queda como protección opcional/i);
  assert.match(restore,/drop function if exists private\.keep_mfa_optional\(\)/);
  assert.match(restore,/interval '72 hours'/);
  assert.match(restore,/create trigger workspace_members_admin_mfa_deadline_trg/);
  assert.match(restore,/create or replace function private\.account_access_allowed\(\)/);
  assert.match(restore,/wm\.role = 'admin'/);
  assert.match(restore,/p\.mfa_required_after is null/);
  assert.match(restore,/now\(\) < p\.mfa_required_after/);
  assert.match(restore,/from auth\.mfa_factors f2/);
  assert.match(restore,/coalesce\(auth\.jwt\(\)->>'aal','aal1'\) = 'aal2'/);
});

test('ninguna migración posterior vuelve a convertir MFA administrativo en opcional',()=>{
  const dir=path.join(root,'supabase/migrations');
  const newer=fs.readdirSync(dir).filter(name=>name.endsWith('.sql')&&name>path.basename(restoreMigration));
  for(const name of newer){
    const source=fs.readFileSync(path.join(dir,name),'utf8');
    assert.doesNotMatch(source,/create or replace function private\.keep_mfa_optional\(/i,`${name} reintroduce keep_mfa_optional`);
    assert.doesNotMatch(source,/2FA queda como protección opcional/i,`${name} vuelve a declarar MFA opcional`);
  }
});

test('secure-login exige enrolamiento vencido y desafío AAL2 cuando corresponde',()=>{
  assert.match(login,/select\("active,must_change_password,temporary_password_expires_at,mfa_required_after"\)/);
  assert.match(login,/membership\.role === "admin" && !!profile\?\.mfa_required_after/);
  assert.match(login,/Date\.now\(\) >= new Date\(profile\.mfa_required_after\)\.getTime\(\)/);
  assert.match(login,/if \(adminMfaPastDue && verifiedFactors\.length === 0\)/);
  assert.match(login,/mfa_enrollment_required: true/);
  assert.match(login,/event_type: "mfa_enrollment_required"/);
  assert.match(login,/verifiedFactors\.length > 0 && currentAal !== "aal2"/);
  assert.match(login,/mfa_required: true/);
  assert.match(login,/mfa_setup_recommended: adminMfaRequired && verifiedFactors\.length === 0/);
  assert.match(login,/mfa_required_after: adminMfaRequired \? profile\.mfa_required_after : null/);
});

test('la interfaz abre el enrolamiento obligatorio antes de crear la sesión local',()=>{
  assert.match(privateAccess,/if\(d\.mfa_enrollment_required===true\)final=await mandatoryEnrollmentPrompt\(d\)/);
  assert.match(privateAccess,/else if\(d\.mfa_required===true\)/);
  assert.match(privateAccess,/mfaSetupRecommended:d\.mfa_setup_recommended===true/);
  assert.match(privateAccess,/mfaRequiredAfter:d\.mfa_required_after\|\|null/);
});

test('secure-mfa y gestión administrativa conservan el cierre del circuito',()=>{
  assert.match(mfa,/const required=membership\.role==="admin"&&!!profile\?\.mfa_required_after/);
  assert.match(mfa,/if\(required&&verified\.length<=1\)return json\(\{error:"Los administradores deben mantener al menos un factor 2FA activo\./);
  assert.match(mfa,/action==="verify_enrollment"/);
  assert.match(mfa,/complete_login===true/);
  assert.match(manageUsers,/adminMfaPastDueMissing=membership\.role==="admin"/);
  assert.match(manageUsers,/!adminMfaPastDueMissing/);
  assert.match(manageUsers,/claims\?\.aal==="aal2"/);
});
