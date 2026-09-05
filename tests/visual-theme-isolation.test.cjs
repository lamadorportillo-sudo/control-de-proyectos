const assert=require('node:assert/strict');
const fs=require('node:fs');

const corporate=fs.readFileSync('corporate-ui-v1.js','utf8');
const polish=fs.readFileSync('corporate-polish-v1.js','utf8');

/* La capa corporativa clara es legado: jamás puede colorear el portal V2. */
assert.match(corporate,/function portalMode\(\)\{return document\.body\?\.classList\?\.contains\('cc-portal-v2'\)===true\}/,'debe detectar de forma explícita el portal moderno');
assert.match(corporate,/function injectStyle\(\)\{\s*if\(portalMode\(\)\|\|document\.getElementById/,'el CSS claro no debe inyectarse dentro del portal V2');
assert.match(corporate,/function apply\(\)\{[\s\S]*if\(portalMode\(\)\)return;/,'la aplicación del tema legado debe abortar dentro del portal V2');

/* El pulido histórico solo conserva Gacetas/navegación. Ninguna regla global
   de tema claro puede volver a modificar Inicio, alertas o paneles modernos. */
for(const forbidden of [
  '.cp-alerts-compact',
  '.rail-card',
  '.control-rail-v3',
  '.followup-panel',
  '.footer-note',
  '.cloud-pill',
  '.eyebrow{',
  '.icon-btn{'
]){
  assert.equal(polish.includes(forbidden),false,`corporate-polish no debe contener la regla global ${forbidden}`);
}

assert.match(polish,/PULIDO CORPORATIVO V2 · GACETAS AISLADAS/,'debe quedar documentado el aislamiento de la capa');
assert.match(polish,/\.ccg-page \.ccg-panel/,'los paneles de Gacetas deben quedar encapsulados por .ccg-page');
assert.match(polish,/\.ccg-page \.ccg-kpi/,'los KPI de Gacetas deben quedar encapsulados por .ccg-page');
assert.match(polish,/\.ccg-page \.ccg-year \.ccg-rule/,'las reglas normativas deben quedar encapsuladas por .ccg-page');
assert.match(polish,/function styleGacetas\(\)/,'se conserva el formateo de rangos de Gacetas');
assert.match(polish,/function ensureMainTabs\(\)/,'se conserva la inserción compatible de Gacetas y Contratos');
assert.match(polish,/function orderNav\(\)/,'se conserva el orden de navegación histórica');

console.log('visual-theme-isolation: tema claro legado aislado y Gacetas preservadas');
