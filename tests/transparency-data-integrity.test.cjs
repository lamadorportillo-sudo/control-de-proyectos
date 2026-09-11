const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const src=fs.readFileSync('transparency-portal-v1.js','utf8');
const storage=fs.readFileSync('transparency-storage-v1.js','utf8');

test('Transparencia no inventa datos oficiales ausentes',()=>{
  for(const invented of ['Sector Obras Sociales','No Hay Impacto','Municipalidad De Santa María'])assert.ok(!src.includes(invented),'No debe autocompletar: '+invented);
  assert.doesNotMatch(src,/orderChange:'No Hay'/);
  assert.doesNotMatch(src,/timeExtension:'No Hay'/);
  assert.match(src,/Pendiente de verificar/);
});

test('los registros mensuales se delimitan por periodo y relaciones reales',()=>{
  assert.match(src,/function trProjectInPeriod\(/);
  assert.match(src,/trInPeriod\(trContractDate\(x\),r\.period\)/);
  assert.match(src,/trContractForProject\(p\.id\)/);
  assert.match(src,/responsible:c\?\.contractor\|\|p\.contractor\|\|''/);
  assert.match(src,/e\.net\?\?e\.gross\?\?0/);
  assert.doesNotMatch(src,/e\.net\|\|e\.gross\|\|0/);
});

test('la clasificación contractual prioriza datos explícitos antes de heurística',()=>{
  const fn=src.slice(src.indexOf('function trContractKind'),src.indexOf('function trContractForProject'));
  assert.ok(fn.indexOf('contractType')<fn.indexOf('projectType'));
  assert.ok(fn.indexOf('projectType')<fn.indexOf('procurement'));
  assert.ok(fn.indexOf('procurement')<fn.indexOf('fallback'));
  assert.match(fn,/return null/,'si no existe certeza debe quedar sin clasificar');
});

test('el Excel crea únicamente hojas de categorías seleccionadas',()=>{
  assert.match(src,/const chosen=new Set\(\[\.\.\.state\.selected\]\.filter\(id=>id!==\'excel\'\)\)/);
  for(const key of ['monthlyReport','projects','projectTable','infrastructureContracts','consultingContracts','agreements','bids','quotations','purchases','payments','noMovement','sources'])assert.ok(src.includes("chosen.has('"+key+"')"),'Falta control de selección para '+key);
  assert.match(src,/Selecciona al menos una categoría de información antes de generar el Excel/);
});

test('nuevo mes no preselecciona todo y publicar no simula una URL pública',()=>{
  assert.match(src,/state\.selected=new Set\(\);/);
  assert.doesNotMatch(src,/state\.selected=new Set\(categories\.map/);
  assert.match(src,/Marcar listo para publicar/);
  assert.match(src,/No se creó una URL pública/);
  assert.doesNotMatch(src,/TOAST\('Portal de Transparencia actualizado en Supabase\.'/);
});

test('solo existe un renderPortal activo y los archivos fuente siguen en Supabase Storage',()=>{
  assert.equal((src.match(/function renderPortal\(/g)||[]).length,1);
  assert.match(storage,/storagePath/);
  assert.match(storage,/storage\/v1\/object/);
  assert.match(storage,/cloud:true/);
});
