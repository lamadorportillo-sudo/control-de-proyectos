const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('Paso 4: Proyectos es una vista distinta, de búsqueda primero',()=>{
  const src=fs.readFileSync('projects-industrial-v1.js','utf8');
  const html=fs.readFileSync('index.html','utf8');
  assert.match(src,/PORTAFOLIO INDUSTRIAL DE PROYECTOS V1/);
  assert.match(src,/Localiza un proyecto\. Abre su expediente\. Trabaja\./);
  assert.match(src,/no carga todo el portafolio al entrar/i);
  assert.match(src,/Busca antes de mostrar/);
  assert.match(src,/data-pi-q="En ejecución"/);
  assert.match(src,/data-pi-new/);
  assert.match(src,/data-cc-main-route="proyectos"/);
  assert.match(html,/projects-industrial-v1\.js\?v=20260914-step4/);
});
