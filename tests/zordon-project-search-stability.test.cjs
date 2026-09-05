const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('zordon-project-search-v1.js','utf8');
const manifest=fs.readFileSync('authenticated-module-manifest-v1.cjs','utf8');
const integrity=fs.readFileSync('integrity-diagnostics-v1.js','utf8');

test('el buscador ZORDON V5 mantiene visibles los proyectos cuando no hay consulta',()=>{
  assert.match(source,/BUSCADOR INTELIGENTE DE PROYECTOS V5 · LISTA ESTABLE/);
  assert.match(source,/if\(!q\)\{\s*cards\.forEach\(show\);\s*hideState\(grid\)/,
    'una lista autenticada sin texto de búsqueda debe seguir mostrando sus tarjetas');
  assert.doesNotMatch(source,/if\(!q\)[\s\S]{0,260}cards\.forEach\(hide\)/,
    'no puede reaparecer el comportamiento que ocultaba todas las tarjetas al dejar el buscador vacío');
});

test('limpiar el buscador restaura la lista y no reinyecta capas retiradas',()=>{
  assert.match(source,/data-zordon-clear[\s\S]*input\.value='';enforce\(\)/,
    'el botón Limpiar debe volver a aplicar el estado vacío estable');
  assert.doesNotMatch(source,/industrial-home-v1\.js/i);
  assert.doesNotMatch(source,/createElement\(['"]script['"]\)/,
    'el buscador no debe crear cargadores de scripts por su cuenta');
});

test('buscador y densidad tienen una única versión canónica en el manifiesto',()=>{
  const searchEntries=[...manifest.matchAll(/\['zordon-project-search-v1\.js','([^']+)'\]/g)];
  const densityEntries=[...manifest.matchAll(/\['zordon-unified-density-v1\.js','([^']+)'\]/g)];
  assert.equal(searchEntries.length,1);
  assert.equal(searchEntries[0][1],'20260905-zordonsearch5');
  assert.equal(densityEntries.length,1);
  assert.equal(densityEntries[0][1],'20260905-density2');
  assert.doesNotMatch(integrity,/zordon-project-search-v1\.js|zordon-unified-density-v1\.js/,
    'el diagnóstico de integridad no debe mantener cargadores secundarios de ZORDON');
});
