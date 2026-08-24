const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const dataSource=fs.readFileSync('fhis-cost-data-v1.js','utf8');
const context={window:null};context.window=context;vm.createContext(context);vm.runInContext(dataSource,context);
const data=context.__ccFhisCostData;
assert(data,'la base FHIS/TSC debe exponer datos');
assert.equal(data.stats.sheets,780,'debe conservar las 780 hojas del libro');
assert(data.stats.fichas>=770,'debe importar la colección completa de fichas');
assert(data.stats.resources>=3600,'debe importar los recursos de análisis unitario');
assert(data.fichas.some(f=>f.code==='F102009'),'debe incluir instalación de tubería PVC de 6 pulgadas');
assert(data.fichas.some(f=>f.resources.some(r=>r.type==='Mano de obra')),'debe conservar mano de obra');
assert(data.fichas.some(f=>f.resources.some(r=>r.type==='Material')),'debe conservar materiales');
assert(data.fichas.some(f=>f.resources.some(r=>r.type==='Equipo')),'debe conservar equipo');

const app=fs.readFileSync('cost-program-v1.js','utf8');
for(const feature of ['Fichas de costo','Presupuesto','Formatos','Institución','Duplicar y editar','Generar adaptado'])assert(app.includes(feature),`falta ${feature}`);
assert(app.includes('saveDB()'),'los cambios deben persistir en el expediente compartido');
assert.equal((fs.readdirSync('assets/formats/via-administracion').filter(x=>!x.startsWith('~$'))).length,18,'deben publicarse los 18 formatos administrativos');
console.log('cost-program: base FHIS/TSC, editor, presupuesto, institución y 18 formatos verificados');
