const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');

const read=p=>fs.readFileSync(p,'utf8');

test('Gestión del proyecto consolida controles sin duplicar módulos',()=>{
  const src=read('project-management-v1.js');
  assert.match(src,/data-cc-project-management/,'falta la pestaña Gestión del proyecto');
  assert.match(src,/db\.projectManagement/,'falta persistencia propia para alcance y cierre');
  assert.match(src,/__ccProgramacionControl\?\.metrics/,'el cronograma debe reutilizar Programación y Control');
  assert.match(src,/__ccTechnicalControl\?\.renderModule\?\.\(mod\)/,'calidad, riesgos y cierre deben abrir Control técnico');
  assert.match(src,/nativeTab\('changes'\)/,'modificaciones debe abrir la pestaña contractual existente');
  assert.match(src,/nativeTab\('guarantees'\)/,'garantías debe abrir la pestaña existente');
  assert.match(src,/nativeTab\('estimates'\)/,'pagos debe abrir la pestaña existente');
  assert.match(src,/Los indicadores son de gestión\. No sustituyen el contrato/,'debe diferenciar indicadores de respaldo oficial');
  assert.match(src,/__ccpmContextWrapped/,'ZORDON debe recibir contexto resumido de gestión');
});

test('Gestión del proyecto forma parte del plan autenticado publicado',()=>{
  const manifest=read('authenticated-module-manifest-v1.cjs');
  const index=read('index.html');
  const tabs=read('project-tabs-complete-v1.js');
  const ref="project-management-v1.js','20260914-projectmanagement1";
  assert.ok(manifest.includes(ref),'el manifiesto no contiene la versión canónica');
  assert.match(index,/project-management-v1\.js\?v=20260914-projectmanagement1/,'index.html no activa el módulo');
  assert.match(tabs,/project-management-v1\.js\?v=20260914-projectmanagement1/,'metadatos de pestañas no registran el módulo');
});
