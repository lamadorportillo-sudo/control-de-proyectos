const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('contract-penalty-card-v1.js','utf8');

assert.match(source,/MULTA DIARIA Y ACUMULADA V3 · SEGÚN CONTRATO/,'la tarjeta debe declarar el modelo contractual explícito');
assert.match(source,/Definir según contrato/,'sin tasa debe pedir la cláusula contractual');
assert.match(source,/const hasRate=/,'debe distinguir una tasa ausente de una tasa configurada');
assert.doesNotMatch(source,/\?0\.18:rateRaw/,'no puede usar 0.18% como respaldo universal');
assert.doesNotMatch(source,/rateRaw[^\n]*0\.18/,'no puede inventar una tasa diaria cuando el contrato no la define');
assert.match(source,/Este dato no aplica una penalización por sí solo/,'los días posteriores al plazo no deben activar una multa por sí mismos');

console.log('contract-penalty-no-default: la multa solo se calcula cuando el contrato contiene una tasa explícita');
