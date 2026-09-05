const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const permissions=fs.readFileSync('technical-control-permissions-v1.js','utf8');
const scope=fs.readFileSync('technical-control-scope-v2.js','utf8');
const observerGuard=fs.readFileSync('technical-control-observer-guard-v1.js','utf8');
const security=fs.readFileSync('security-runtime-v1.js','utf8');
const manifest=require('../authenticated-module-manifest-v1.cjs');

test('permisos y alcance técnico no recorren todo el DOM durante el arranque autenticado',()=>{
  assert.match(permissions,/__CC_TECH_CONTROL_PERMISSIONS_V6__/);
  assert.match(permissions,/armAfterBoot/);
  assert.match(permissions,/cc:authenticated-modules-ready/);
  assert.match(permissions,/runtimeRole/,'los permisos deben usar inmediatamente el rol ya resuelto por el login');
  assert.match(permissions,/scheduleResolve/,'si el workspace aún no está disponible debe reintentar sin degradar permanentemente a consulta');
  assert.doesNotMatch(permissions,/new MutationObserver|new NativeObserver/,'permisos técnicos no deben mantener un observador DOM global');
  assert.doesNotMatch(permissions,/observer\.observe\((?:document\.body|document\.documentElement)/,'permisos no deben observar body/documentElement');
  assert.doesNotMatch(permissions,/Date\.now\(\)-started>5000/,'no debe existir un temporizador que active un observador antes de acabar el boot');

  assert.match(scope,/__CC_TECH_CONTROL_SCOPE_V5__/);
  assert.match(scope,/armAfterBoot/);
  assert.match(scope,/cc:authenticated-modules-ready/);
  assert.match(scope,/bindShellObserver/);
  assert.match(scope,/observer\.observe\(shell,\{childList:true,subtree:true\}\)/);
  assert.doesNotMatch(scope,/observer\.observe\((?:document\.body|document\.documentElement)/,'el alcance no debe observar globalmente body/documentElement');
  assert.doesNotMatch(scope,/Date\.now\(\)-started>5000/,'el alcance no debe activarse a mitad del boot por timeout');
});

test('la guardia del control técnico filtra el observador histórico antes de instalarlo',()=>{
  assert.match(observerGuard,/__CC_TECH_CONTROL_OBSERVER_GUARD_V1__/);
  assert.match(observerGuard,/target===document\.documentElement/);
  assert.match(observerGuard,/relevant\(mutations\)/);
  assert.match(observerGuard,/window\.MutationObserver=TechnicalControlMutationObserver/);
  assert.match(observerGuard,/window\.MutationObserver=Original/);
});

test('seguridad de sesión difiere el observador DOM hasta terminar el arranque autenticado',()=>{
  assert.match(security,/__CC_SECURITY_RUNTIME_V4__/);
  assert.match(security,/armDomObserverAfterBoot/);
  assert.match(security,/cc:authenticated-modules-ready/);
  assert.match(security,/cc:authenticated-modules-partial/);
  assert.match(security,/domObserver\?\.disconnect\(\)/);
  assert.match(security,/requestAnimationFrame/);
  assert.doesNotMatch(security,/new MutationObserver\(\(\)=>\{stampReports\(\);restrictBulkExport\(\);wrapSignOut\(\)\}\)\.observe/,'el observador global de seguridad no puede activarse mientras se insertan módulos');
  assert.doesNotMatch(security,/setInterval\(\(\)=>\{stampReports\(\);restrictBulkExport\(\);wrapSignOut\(\)\},2500\)/,'el barrido periódico pesado no debe arrancar antes del final del boot');
});

test('el control técnico pesado queda al final del plan autenticado',()=>{
  const names=manifest.supplementalModules.map(x=>x[0]);
  assert.equal(names.at(-2),'technical-control-observer-guard-v1.js');
  assert.equal(names.at(-1),'technical-control-v1.js');
  const versions=new Map(manifest.supplementalModules);
  assert.equal(versions.get('security-runtime-v1.js'),'20260904-security4');
  assert.equal(versions.get('technical-control-permissions-v1.js'),'20260905-controltecnicoperm6');
  assert.equal(versions.get('technical-control-scope-v2.js'),'20260904-controlscope5');
  assert.equal(versions.get('technical-control-observer-guard-v1.js'),'20260904-controlobserver1');
});
