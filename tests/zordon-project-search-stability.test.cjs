const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('zordon-project-search-v1.js','utf8');
const manifest=fs.readFileSync('authenticated-module-manifest-v1.cjs','utf8');
const integrity=fs.readFileSync('integrity-diagnostics-v1.js','utf8');

test('el buscador ZORDON V7 espera una consulta antes de mostrar proyectos',()=>{
  assert.match(source,/ZORDON · BUSCADOR PRECISO DE PROYECTOS V7 · CARGA SOLO BAJO BÚSQUEDA/);
  assert.match(source,/if\(!q\)\{\s*cards\.forEach\(hide\);hideState\(grid\);\s*grid\.dataset\.zordonAwaitingQuery='1'/,
    'una lista sin texto debe permanecer limpia hasta que el usuario busque');
  assert.match(source,/if\(count\)count\.textContent='Escribe para buscar'/,
    'el estado vacío debe indicar claramente que se espera una búsqueda');
  assert.match(source,/mostrar todos|muestra todos|ver todos/,
    'debe existir una consulta explícita para mostrar todos los proyectos');
});

test('limpiar el buscador vuelve al estado de espera y no reinyecta capas retiradas',()=>{
  assert.match(source,/data-zordon-clear[\s\S]*input\.value='';enforce\(\)/,
    'el botón Limpiar debe volver a aplicar el estado vacío');
  assert.doesNotMatch(source,/industrial-home-v1\.js/i);
  assert.doesNotMatch(source,/createElement\(['"]script['"]\)/,
    'el buscador no debe crear cargadores de scripts por su cuenta');
});

test('buscador y densidad tienen una única entrada canónica en el manifiesto',()=>{
  const searchEntries=[...manifest.matchAll(/\['zordon-project-search-v1\.js','([^']+)'\]/g)];
  const densityEntries=[...manifest.matchAll(/\['zordon-unified-density-v1\.js','([^']+)'\]/g)];
  assert.equal(searchEntries.length,1);
  assert.equal(searchEntries[0][1],'20260905-zordonsearch5');
  assert.equal(densityEntries.length,1);
  assert.equal(densityEntries[0][1],'20260905-density2');
  assert.doesNotMatch(integrity,/zordon-project-search-v1\.js|zordon-unified-density-v1\.js/,
    'el diagnóstico de integridad no debe mantener cargadores secundarios de ZORDON');
});
