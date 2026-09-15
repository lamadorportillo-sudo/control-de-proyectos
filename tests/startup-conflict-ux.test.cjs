const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const core=fs.readFileSync('core-hardening-v1.js','utf8');
const offline=fs.readFileSync('offline-core-v1.js','utf8');

test('el arranque autenticado usa una sola pantalla estable',()=>{
  assert.match(core,/ccStableStartup/);
  assert.match(core,/Preparando Control Contractual/);
  assert.match(core,/authenticated-modules-ready/);
  assert.match(core,/authenticated-modules-partial/);
  assert.match(core,/authenticated-boot-failed/);
  assert.doesNotMatch(core,/app\.innerHTML='<div class="auth"><div class="auth-card"/);
});

test('los conflictos no abren un modal automáticamente',()=>{
  const conflictCore=core.slice(core.indexOf('function showConflict('),core.indexOf('const numOrNull'));
  const conflictOffline=offline.slice(offline.indexOf('function conflictModal('),offline.indexOf('async function readServerRow'));
  assert.doesNotMatch(conflictCore,/openModal\(/);
  assert.doesNotMatch(conflictOffline,/openModal\(/);
  assert.match(offline,/function openConflictReview\(/);
  assert.match(offline,/ccOfflineConflictReview/);
  assert.match(offline,/reviewConflict:openConflictReview/);
  assert.match(offline,/Puedes continuar trabajando/);
});
