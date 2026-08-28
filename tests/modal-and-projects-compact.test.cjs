const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('los modales largos conservan desplazamiento vertical',()=>{
  const immersive=read('immersive-engineering-experience-v1.js');
  assert.match(immersive,/\.modal\s*\{[\s\S]*?overflow-y:auto!important;/);
  assert.doesNotMatch(
    immersive,
    /\.modal,\s*\n\s*body:not\(\.print-report\) \.auth-card\{position:relative;overflow:hidden/
  );
  assert.match(immersive,/-webkit-overflow-scrolling:touch/);
});

test('el portafolio usa expedientes compactos sin portadas pesadas',()=>{
  const portfolio=read('portfolio-gallery-v1.js');
  assert.match(portfolio,/VISTA COMPACTA DE EXPEDIENTES/);
  assert.match(portfolio,/\.project-grid-v3,\.project-grid-v3\.compact\{grid-template-columns:1fr!important/);
  assert.match(portfolio,/\.project-v3-cover\{display:none!important\}/);
  assert.match(portfolio,/\.filter-row\{position:sticky!important/);
  assert.match(portfolio,/querySelectorAll\('\.project-v3-cover'\)\.forEach\(cover=>cover\.remove\(\)\)/);
});

test('las versiones publicadas renuevan los módulos corregidos',()=>{
  assert.match(read('index.html'),/project-tabs-complete-v1\.js\?v=20260828-tabscomplete32/);
  assert.match(read('index.html'),/portfolio-gallery-v1\.js\?v=20260828-gallery3/);
  assert.match(read('project-tabs-complete-v1.js'),/immersive-engineering-experience-v1\.js\?v=20260828-immersive2/);
  assert.match(read('service-worker-v1.js'),/cc-static-v1-20260828-modalscroll-compact1/);
});
