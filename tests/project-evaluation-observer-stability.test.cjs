const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

test('la guardia del dashboard evaluativo se carga inmediatamente antes del dashboard',()=>{
  const names=supplementalModules.map(([name])=>name);
  const guard=names.indexOf('project-evaluation-observer-guard-v1.js');
  const dashboard=names.indexOf('project-evaluation-dashboard-v1.js');
  assert.ok(guard>=0,'Falta la guardia del observador evaluativo');
  assert.equal(dashboard,guard+1,'La guardia debe cargarse inmediatamente antes del dashboard evaluativo');
});

test('la guardia rompe cadenas de microtareas y conserva MutationObserver nativo',()=>{
  const src=fs.readFileSync('project-evaluation-observer-guard-v1.js','utf8');
  assert.match(src,/GUARDIA DE OBSERVADOR DEL DASHBOARD EVALUATIVO V1/);
  assert.match(src,/__ccNativeMutationObserver/);
  assert.match(src,/requestAnimationFrame/);
  assert.match(src,/onlyOwnDashboardMutations/);
  assert.doesNotMatch(src,/queueMicrotask\s*\(/,'La guardia no debe volver a introducir una microtarea recursiva');
});
