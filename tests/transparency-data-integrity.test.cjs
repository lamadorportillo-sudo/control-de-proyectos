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


test('Transparencia conserva identidad contractual y evita cruces entre proyectos',()=>{
  assert.match(src,/sourceProjectId:p\.id/,'los proyectos importados deben conservar su id de origen');
  assert.match(src,/sourceContractId:x\.id/,'los contratos importados deben conservar su id de origen');
  assert.match(src,/String\(q\.projectId\|\|''\)===String\(p\.id\)/,'la búsqueda por número debe quedar limitada al proyecto correcto');
  assert.doesNotMatch(src,/db\.contracts\.find\(q=>String\(q\.number\|\|'?'?\)===String\(x\.contractNumber\)/,'no debe buscar contratos globalmente solo por número');
});

test('sincronizar hacia la base general no borra datos contractuales confirmados',()=>{
  assert.match(src,/function trFillText\(/);
  assert.match(src,/function trFillPositive\(/);
  assert.match(src,/Sincronización completada sin sobrescribir datos confirmados/);
  assert.doesNotMatch(src,/currentAmount:N\(x\.amount\),originalAmount:N\(x\.amount\),executionDays:N\(x\.days\)/);
});

test('Compras participa en la sincronización y el estado listo no depende del orden',()=>{
  assert.match(src,/\['bids','quotations','purchases'\]/);
  assert.match(src,/function selectionKey\(/);
  assert.match(src,/selectionKey\(r\.readyCategories\)===selectionKey\(selected\)/);
  assert.match(src,/readyCategories=\[\.\.\.state\.selected\]\.sort\(\)/);
});

test('Transparencia usa la zona horaria de Honduras y corrige el correo institucional heredado',()=>{
  assert.match(src,/America\/Tegucigalpa/);
  assert.match(storage,/America\/Tegucigalpa/);
  assert.match(src,/lapazsantamaria@municipalidadhn\.info/);
  assert.match(src,/lapazsantamaria@municipalidad\.info/,'debe reconocer únicamente el valor legado para migrarlo');
  assert.doesNotMatch(src,/state=\{period:localStorage\.getItem\(STORE\)\|\|new Date\(\)\.toISOString\(\)\.slice\(0,7\)/);
});

test('la firma del Excel sale de la configuración institucional',()=>{
  assert.match(src,/institution=db\?\.transparencySettings\|\|\{\}/);
  assert.match(src,/institution\.signer/);
  assert.match(src,/institution\.unit/);
  assert.match(src,/institution\.municipality/);
});
