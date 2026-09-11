const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function runtime(){
  const window={addEventListener(){},dispatchEvent(){}};
  const context={window,navigator:{onLine:true},console,setTimeout,clearTimeout,structuredClone};
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('offline-core-v1.js','utf8'),context,{filename:'offline-core-v1.js'});
  return context.window.ccOffline;
}

test('cambios en campos distintos del mismo contrato se combinan sin conflicto',()=>{
  const merge=runtime().mergePreview;
  const base={contracts:[{id:'c1',contractor:'A',end:'2026-09-01',amount:100}]};
  const local={contracts:[{id:'c1',contractor:'B',end:'2026-09-01',amount:100}]};
  const server={contracts:[{id:'c1',contractor:'A',end:'2026-10-01',amount:100}]};
  const out=merge(base,local,server);
  assert.deepEqual(out.conflicts,[]);
  assert.equal(out.data.contracts[0].contractor,'B');
  assert.equal(out.data.contracts[0].end,'2026-10-01');
});

test('el mismo campo modificado de dos formas sigue siendo conflicto',()=>{
  const merge=runtime().mergePreview;
  const base={contracts:[{id:'c1',amount:100}]};
  const local={contracts:[{id:'c1',amount:110}]};
  const server={contracts:[{id:'c1',amount:120}]};
  const out=merge(base,local,server);
  assert.ok(out.conflicts.some(x=>x==='contracts:c1:amount'));
  assert.equal(out.data.contracts[0].amount,110,'conserva local hasta revisión manual');
});

test('borrar mientras otro dispositivo modifica no se fusiona silenciosamente',()=>{
  const merge=runtime().mergePreview;
  const base={contracts:[{id:'c1',amount:100}]};
  const local={contracts:[]};
  const server={contracts:[{id:'c1',amount:120}]};
  const out=merge(base,local,server);
  assert.ok(out.conflicts.includes('contracts:c1'));
});
