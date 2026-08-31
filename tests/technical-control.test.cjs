const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const moduleText=fs.readFileSync('technical-control-v1.js','utf8');
const scopeText=fs.readFileSync('technical-control-scope-v2.js','utf8');
const qrText=fs.readFileSync('document-qr-v1.js','utf8');
const tabsText=fs.readFileSync('project-tabs-complete-v1.js','utf8');

test('control técnico visible conserva cinco módulos operativos',()=>{
  for(const label of ['Actas de obra','Bitácora diaria','Consultas técnicas','Riesgos y reclamos','Recepción y liquidación']){
    assert.match(moduleText,new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
  assert.match(scopeText,/\['calidad','seguridad','ambiental'\]/);
  assert.match(scopeText,/5 controles integrados/);
  assert.match(scopeText,/visibleModules=\['actas','bitacora','consultas','riesgos','recepcion'\]/);
});

test('el expediente carga alcance técnico y QR documental',()=>{
  assert.match(tabsText,/technical-control-v1\.js\?v=20260830-controltecnico1/);
  assert.match(tabsText,/technical-control-scope-v2\.js\?v=20260831-controlscope2/);
  assert.match(tabsText,/document-qr-v1\.js\?v=20260831-docqr1/);
  assert.match(moduleText,/data-cc-technical-control/);
});

test('los informes publican versión digital con QR',()=>{
  assert.match(qrText,/document-publisher/);
  assert.match(qrText,/VERSIÓN DIGITAL/);
  assert.match(qrText,/qr_data_url/);
  assert.match(qrText,/public_url/);
  assert.match(qrText,/#printReport,#downloadReport/);
});

test('las tablas retiradas quedan históricas y no se destruyen',()=>{
  for(const table of ['quality_tests','safety_records','environmental_social_records'])assert.match(moduleText,new RegExp(table));
  assert.doesNotMatch(scopeText,/drop table|delete from/i);
});

test('el control técnico conserva trazabilidad y no muestra marcos legales extranjeros',()=>{
  for(const table of ['project_admin_acts','site_daily_logs','technical_queries','risk_claims','project_receptions'])assert.match(moduleText,new RegExp(table));
  assert.doesNotMatch(moduleText,/Saudi Building Code|Arabia Saudita|BESOP|BITSA/i);
});
