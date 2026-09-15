const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('Paso 2: portada industrial usa fotos reales y rota al abrir',()=>{
  const src=fs.readFileSync('home-industrial-hero-v1.js','utf8');
  const html=fs.readFileSync('index.html','utf8');
  assert.match(src,/CONTROL CONTRACTUAL · HERO INDUSTRIAL CON FOTOGRAFÍAS REALES V1/);
  assert.match(src,/db\.visits|arr\(d\.visits\)/);
  assert.match(src,/rawData\|\|v\.raw_data/);
  assert.match(src,/cc_home_hero_last_v1/);
  assert.match(src,/getRandomValues/);
  assert.match(src,/Fotografía registrada en Control Contractual/);
  assert.match(src,/INFRAESTRUCTURA Y OBRA PÚBLICA/);
  assert.doesNotMatch(src,/Municipalidad de Santa María|Gobierno Autónomo Municipal/);
  assert.match(html,/home-industrial-hero-v1\.js\?v=20260914-step2/);
});
