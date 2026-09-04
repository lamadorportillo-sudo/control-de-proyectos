const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const permissions=fs.readFileSync('technical-control-permissions-v1.js','utf8');
const scope=fs.readFileSync('technical-control-scope-v2.js','utf8');
const security=fs.readFileSync('security-runtime-v1.js','utf8');
const manifest=require('../authenticated-module-manifest-v1.cjs');

test('permisos y alcance técnico no recorren todo el DOM durante el arranque autenticado',()=>{
  assert.match(permissions,/__CC_TECH_CONTROL_PERMISSIONS_V4__/);
  assert.match(permissions,/armObserverAfterBoot/);
  assert.match(permissions,/cc:authenticated-modules-ready/);
  assert.match(permissions,/mutations\.some\(relevantMutation\)/);
  assert.doesNotMatch(permissions,/Date\.now\(\)-started>5000/,'no debe existir un temporizador que active el observador antes de acabar el boot');
  assert.doesNotMatch(permissions,/new MutationObserver\(\(\)=>\{apply\(\)/,'no debe reaparecer el observador global síncrono');

  assert.match(scope,/__CC_TECH_CONTROL_SCOPE_V4__/);
  assert.match(scope,/armAfterBoot/);
  assert.match(scope,/cc:authenticated-modules-ready/);
  assert.match(scope,/ms\.some\(relevant\)/);
  assert.doesNotMatch(scope,/Date\.now\(\)-started>5000/,'el alcance no debe activarse a mitad del boot por timeout');
  assert.doesNotMatch(scope,/new MutationObserver\(\(\)=>\{guard\(\);prune\(\)\}/,'no debe reaparecer el observador global síncrono');
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
  assert.equal(names.at(-1),'technical-control-v1.js');
  const versions=new Map(manifest.supplementalModules);
  assert.equal(versions.get('security-runtime-v1.js'),'20260904-security4');
  assert.equal(versions.get('technical-control-permissions-v1.js'),'20260904-controltecnicoperm4');
  assert.equal(versions.get('technical-control-scope-v2.js'),'20260904-controlscope4');
});
