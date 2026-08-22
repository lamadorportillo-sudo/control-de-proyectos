const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const read=f=>fs.readFileSync(f,'utf8');
const html=read('index.html');
const scripts=[...html.matchAll(/<script\s+[^>]*src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
for(const src of scripts){
  if(/^https?:/i.test(src))continue;
  assert.ok(fs.existsSync(src),`recurso declarado inexistente: ${src}`);
}

const loader=read('project-tabs-complete-v1.js');
const lazy=[...loader.matchAll(/'([^']+\.js)\?v=/g)].map(m=>m[1]);
for(const src of lazy)assert.ok(fs.existsSync(src),`módulo de pestaña inexistente: ${src}`);

const projectTabs=['summary','procurement','contract','controls','estimates','visits','guarantees','changes','reports'];
for(const tab of projectTabs)assert.match(html,new RegExp(`\\['${tab}'\\s*,`),`falta la pestaña ${tab}`);

const renderers=['renderSummary','renderProcurement','renderContract','renderContractControls','renderEstimates','renderVisits','renderGuarantees','renderChanges','renderReports'];
const allSource=[html,...fs.readdirSync('.').filter(f=>f.endsWith('.js')).map(read)].join('\n');
for(const fn of renderers){
  assert.match(allSource,new RegExp(`(?:function\\s+${fn}\\s*\\(|(?:window\\.)?${fn}\\s*=)`),`falta el renderizador ${fn}`);
}

const executive=read('dashboard-executive-v1.js');
for(const section of ['home','projects','budget','alerts','audit','reports']){
  assert.match(executive,new RegExp(`\\['${section}'\\s*,`),`falta navegación ejecutiva ${section}`);
}
for(const fn of ['home','projectsOnly','alerts','audit','reports'])assert.match(executive,new RegExp(`function\\s+${fn}\\s*\\(`),`falta vista ejecutiva ${fn}`);
assert.match(executive,/closest\?\.\('\[data-ccx\]'\)/,'falta el controlador de navegación ejecutiva');
assert.match(executive,/data-ccx-report/,'falta acceso funcional a informes por expediente');
assert.match(executive,/data-ccx-backup/,'falta acceso funcional al respaldo');

const lifecycle=read('contract-lifecycle-v1.js');
assert.match(lifecycle,/data-tab=['"]lifecycle['"]/,'falta el botón del proceso contractual');
assert.match(lifecycle,/view\.tab==='lifecycle'/,'falta el renderizado del proceso contractual');

const transparency=read('transparency-portal-v1.js');
assert.match(transparency,/addEventListener\(['"]click['"]|\.onclick\s*=/,'Transparencia no registra acciones de interfaz');

console.log(`ui-tabs-functional: ${scripts.length} recursos directos, ${lazy.length} módulos y ${projectTabs.length+6} pestañas verificadas`);
