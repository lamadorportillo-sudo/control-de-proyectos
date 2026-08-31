const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const moduleText=fs.readFileSync('technical-control-v1.js','utf8');
const tabsText=fs.readFileSync('project-tabs-complete-v1.js','utf8');

test('control técnico integral contiene los ocho módulos en español',()=>{
  const required=[
    'Calidad y ensayos',
    'Actas de obra',
    'Bitácora diaria',
    'Seguridad y salud',
    'Ambiental y social',
    'Consultas técnicas',
    'Riesgos y reclamos',
    'Recepción y liquidación'
  ];
  for(const label of required)assert.match(moduleText,new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('el expediente carga el módulo técnico',()=>{
  assert.match(tabsText,/technical-control-v1\.js\?v=20260830-controltecnico1/);
  assert.match(moduleText,/data-cc-technical-control/);
});

test('el control técnico usa Supabase con trazabilidad y sin marcos legales extranjeros visibles',()=>{
  for(const table of ['quality_tests','project_admin_acts','site_daily_logs','safety_records','environmental_social_records','technical_queries','risk_claims','project_receptions']){
    assert.match(moduleText,new RegExp(table));
  }
  assert.doesNotMatch(moduleText,/Saudi Building Code|Arabia Saudita|BESOP|BITSA/i);
});
