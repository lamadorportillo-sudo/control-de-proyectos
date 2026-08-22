const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const events=[];
const context={
  console,window:null,
  db:{projects:[{}],contracts:[{}],estimates:[{}],payments:[],guarantees:[],changes:[],visits:[]},
  saveDB(){context.saved=(context.saved||0)+1},
  setTimeout(fn){fn()},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},
  document:{visibilityState:'visible',addEventListener(){}},
  dispatchEvent(event){events.push(event)},addEventListener(){}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('cross-module-sync-v1.js','utf8'),context,{filename:'cross-module-sync-v1.js'});

context.saveDB();
assert.equal(context.saved,1,'conserva el guardado original');
assert.deepEqual(events.map(e=>e.type),['cc:data-changed','cc:cloud-synced'],'notifica cambio local y sincronización de nube');
assert.equal(events[0].detail.projects,1,'propaga el estado relacionado de proyectos');
assert.equal(events[0].detail.contracts,1,'propaga el estado relacionado de contratos');
assert.equal(events[0].detail.estimates,1,'propaga el estado relacionado de estimaciones');

const executive=fs.readFileSync('dashboard-executive-v1.js','utf8');
assert.match(executive,/S\.bundle=null;S\.audit=null;S\.at=0/,'invalida todas las cachés relacionadas');
assert.match(executive,/cc:data-changed/,'escucha cambios de cualquier módulo');
assert.match(executive,/cc:cloud-synced/,'refresca después de persistir en Supabase');

console.log('cross-module-sync: 8 verificaciones superadas');
