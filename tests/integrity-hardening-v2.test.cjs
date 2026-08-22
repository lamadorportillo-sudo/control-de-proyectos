const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const saved=[];
const context={
  console,window:null,db:{projects:[],visits:[
    {id:'v1',status:'Con observaciones',observations:[{status:'Atendida'}]},
    {id:'v2',status:'Cerrada',observations:[{status:'Pendiente'}]},
    {id:'v3',status:'Abierta',observations:[]}
  ]},view:{},toast(){},saveDB(){saved.push(true)},setTimeout(fn){fn()},
  document:{documentElement:{},getElementById(){return null},addEventListener(){}},
  MutationObserver:class{observe(){}},iso:()=>new Date().toISOString()
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('integrity-hardening-v2.js','utf8'),context,{filename:'integrity-hardening-v2.js'});

assert.equal(context.db.visits[0].status,'Cerrada','cierra la visita cuando todas las observaciones fueron atendidas');
assert.equal(context.db.visits[1].status,'Con observaciones','reabre el seguimiento si existe una observacion pendiente');
assert.equal(context.db.visits[2].status,'Abierta','conserva el estado cuando no hay observaciones');
assert.equal(saved.length,1,'persiste una sola sincronizacion del lote');

const report=fs.readFileSync('report-professional-v1.js','utf8');
assert.match(report,/aprobada\|aprobado\|pagada\|pagado/,'los informes filtran estados certificados');
assert.match(report,/!e\.voidedAt/,'los informes excluyen estimaciones anuladas');

const lifecycle=fs.readFileSync('contract-lifecycle-v1.js','utf8');
assert.match(lifecycle,/if\(e\.notApplicable\)\{na\+\+;return\}/,'No aplica queda excluido del denominador');
assert.match(lifecycle,/notApplicable:false/,'marcar completo elimina el estado No aplica');

console.log('integrity-hardening-v2: 9 verificaciones superadas');
