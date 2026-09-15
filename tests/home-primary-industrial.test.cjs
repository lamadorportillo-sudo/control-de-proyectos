const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('Inicio industrial se renderiza desde el módulo primario',()=>{
  const dash=fs.readFileSync('dashboard-simplified-v4.js','utf8');
  const stab=fs.readFileSync('stabilize-core-v1.cjs','utf8');
  const manifest=fs.readFileSync('authenticated-module-manifest-v1.cjs','utf8');
  assert.match(dash,/cc-primary-industrial/);
  assert.match(dash,/Control técnico y contractual de proyectos/);
  assert.match(dash,/project_evidence/);
  assert.match(dash,/telegram-evidence/);
  assert.match(dash,/Fotografía registrada en Control Contractual/);
  assert.match(dash,/cc_home_photo_index_v2/);
  assert.match(stab,/dashboard-simplified-v4\.js\?v=20260915-homeprimary1/);
  assert.doesNotMatch(stab,/home-industrial-hero-v1\.js/);
  assert.doesNotMatch(manifest,/home-industrial-hero-v1\.js/);
});
