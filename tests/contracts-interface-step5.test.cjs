const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('Paso 5: Contratos es búsqueda + alta, no otro dashboard',()=>{
  const src=fs.readFileSync('contracts-center-v1.js','utf8');
  assert.match(src,/GESTIÓN CONTRACTUAL/);
  assert.match(src,/＋ Nuevo contrato/);
  assert.match(src,/Buscar contrato/);
  assert.match(src,/Busca un contrato para comenzar/);
  assert.match(src,/projectWithoutContractRows/);
  assert.match(src,/contractModal\(p,null\)/);
  assert.match(src,/Abrir contrato →/);
  assert.doesNotMatch(src,/ccc-kpis.*render/i);
});
