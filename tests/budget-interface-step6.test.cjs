const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('Paso 6: Presupuesto es búsqueda + movimiento, no catálogo completo',()=>{
  const src=fs.readFileSync('budget-portfolio-tab-v1.js','utf8');
  const build=fs.readFileSync('build-pages.cjs','utf8');
  assert.match(src,/PRESUPUESTO · CONTROL FINANCIERO/);
  assert.match(src,/＋ Registrar movimiento/);
  assert.match(src,/Busca un proyecto para consultar su presupuesto/);
  assert.match(src,/if\(!q\)return\[\]/);
  assert.match(src,/terms\.every\(t=>haystack\.includes\(t\)\)/);
  assert.match(src,/Presupuesto asignado/);
  assert.match(src,/Ampliaciones registradas/);
  assert.match(src,/Presupuesto vigente/);
  assert.match(src,/view\.tab='budget'/);
  assert.match(build,/budget-portfolio-tab-v1\.js\?v=20260915-step6/);
});
