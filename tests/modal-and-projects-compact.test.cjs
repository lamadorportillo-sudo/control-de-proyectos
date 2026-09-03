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
  const index=read('index.html');
  const serviceWorker=read('service-worker-v1.js');
  const runtime=read('performance-runtime-v1.js');
  const portal=read('portal-web-v2.js');
  const dashboard=read('dashboard-simplified-v4.js');
  const routes=read('portal-route-bridge-v1.js');
  assert.match(index,/project-tabs-complete-v1\.js\?v=20260831-tabscomplete34/);
  assert.match(index,/portfolio-gallery-v1\.js\?v=20260828-gallery3/);
  assert.match(read('project-tabs-complete-v1.js'),/immersive-engineering-experience-v1\.js\?v=20260828-immersive2/);
  assert.match(serviceWorker,/const CACHE='cc-static-v1-20260903-recovery-v2'/);
  assert.match(serviceWorker,/Network-first/i);
  assert.match(serviceWorker,/fetch\(request,\{cache:'no-store'\}\)/);
  assert.match(runtime,/portal-web-v2\.js\?v=20260903-web3/);
  assert.match(runtime,/dashboard-simplified-v4\.js\?v=20260903-dash6/);
  assert.match(runtime,/service-worker-v1\.js\?v=20260903-sw2/);
  assert.match(portal,/PORTAL WEB V3 · ESTABLE/);
  assert.match(portal,/if\(el\.textContent!==next\)el\.textContent=next/);
  assert.match(dashboard,/DASHBOARD SIMPLIFICADO V6 · ESTABLE/);
  assert.match(dashboard,/setText\(badge,/);
  for(const file of ['payments-center-v1.js','guarantees-center-v1.js','visits-center-v1.js','reports-center-v1.js','alerts-center-v1.js','audit-center-v1.js'])assert.match(runtime,new RegExp(file.replace(/\./g,'\\.')));
  for(const route of ['contratos','pagos','garantias','visitas','reportes','alertas','auditoria'])assert.match(routes,new RegExp(`route==='${route}'`));
});
