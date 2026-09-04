const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('alerts-compact-v1.js','utf8');

// Alertas compactas es una capa visual. No puede volver a convertirse en
// gestor de dependencias ni fijar versiones históricas de módulos globales.
assert.match(source,/CONTROL CONTRACTUAL · ALERTAS COMPACTAS V1/,'debe conservar la función visual de alertas compactas');
assert.doesNotMatch(source,/__CC_STABLE_EXTENSIONS_LOADER_V1__/,'alertas compactas no debe conservar un cargador paralelo');
assert.doesNotMatch(source,/document\.createElement\(['"]script['"]\)/,'alertas compactas no debe inyectar scripts funcionales');
assert.doesNotMatch(source,/data-cc-extension/,'alertas compactas no debe administrar extensiones');

for(const stale of [
  '20260820-gacetas3',
  '20260820-contracts1',
  '20260820-corporate2',
  '20260820-polish1'
]){
  assert(!source.includes(stale),`alertas compactas no debe fijar versión histórica ${stale}`);
}

console.log('alerts-compact-no-loader: la capa de alertas quedó limitada a presentación y no carga dependencias');
