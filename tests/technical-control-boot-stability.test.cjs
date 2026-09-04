const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const permissions=fs.readFileSync('technical-control-permissions-v1.js','utf8');
const scope=fs.readFileSync('technical-control-scope-v2.js','utf8');
const manifest=require('../authenticated-module-manifest-v1.cjs');

test('permisos y alcance técnico no recorren todo el DOM durante el arranque autenticado',()=>{
  assert.match(permissions,/__CC_TECH_CONTROL_PERMISSIONS_V3__/);
  assert.match(permissions,/startObserverAfterBoot/);
  assert.match(permissions,/mutations\.some\(relevantMutation\)/);
  assert.doesNotMatch(permissions,/new MutationObserver\(\(\)=>\{apply\(\)/,'no debe reaparecer el observador global síncrono');

  assert.match(scope,/__CC_TECH_CONTROL_SCOPE_V3__/);
  assert.match(scope,/afterBoot\(\)/);
  assert.match(scope,/ms\.some\(relevant\)/);
  assert.doesNotMatch(scope,/new MutationObserver\(\(\)=>\{guard\(\);prune\(\)\}/,'no debe reaparecer el observador global síncrono');
});

test('el control técnico pesado queda al final del plan autenticado',()=>{
  const names=manifest.supplementalModules.map(x=>x[0]);
  assert.equal(names.at(-1),'technical-control-v1.js');
  const versions=new Map(manifest.supplementalModules);
  assert.equal(versions.get('technical-control-permissions-v1.js'),'20260904-controltecnicoperm2');
  assert.equal(versions.get('technical-control-scope-v2.js'),'20260904-controlscope3');
});
