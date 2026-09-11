const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const intake=fs.readFileSync('contract-intake-v1.js','utf8');
const archive=fs.readFileSync('contract-file-repository-v2.js','utf8');

test('el ingreso contractual ofrece registro manual y carga del contrato real',()=>{
  assert.match(intake,/Ingresar datos del contrato/);
  assert.match(intake,/Adjuntar contrato firmado/);
  assert.match(intake,/Editar \/ completar datos/);
  assert.match(intake,/originalAmount:null,currentAmount:null/,'no debe inventar el monto contractual usando el presupuesto');
  assert.match(intake,/executionDays:null/,'el plazo debe permanecer vacío hasta ser confirmado');
  assert.match(intake,/advanceRequestedPct:null/,'el anticipo no debe aparecer como dato confirmado si no fue ingresado');
  assert.match(intake,/contractModal\(p,c\|\|null\)/,'debe reutilizar el editor contractual existente');
});

test('la carga documental se integra al expediente sin duplicar proyecto',()=>{
  assert.match(archive,/async function uploadFiles\(/);
  assert.match(archive,/uploadFiles};/);
  assert.match(archive,/meta\.category==='signed_contract'/);
  assert.match(archive,/Number\(a\.amount\)>0/,'puede recuperar el monto legible del contrato cuando el dato está vacío');
  assert.match(intake,/projectId:p\.id/);
  assert.doesNotMatch(intake,/db\.projects\.push/,'el flujo no debe crear ni duplicar proyectos');
});

test('los módulos se cargan en orden después de documentos contractuales',()=>{
  const names=supplementalModules.map(([name])=>name);
  const payment=names.indexOf('contract-payment-documents-v1.js');
  const archiveIndex=names.indexOf('contract-file-repository-v2.js');
  const intakeIndex=names.indexOf('contract-intake-v1.js');
  assert(payment>=0&&archiveIndex>payment&&intakeIndex>archiveIndex);
  assert.ok(supplementalModules.some(([name,version])=>name==='contract-file-repository-v2.js'&&version==='20260910-intake1'));
  assert.ok(supplementalModules.some(([name,version])=>name==='contract-intake-v1.js'&&version==='20260911-intake2'));
});

test('los módulos nuevos tienen sintaxis JavaScript válida',()=>{
  assert.doesNotThrow(()=>new Function(archive));
  assert.doesNotThrow(()=>new Function(intake));
});
