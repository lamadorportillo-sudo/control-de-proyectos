const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const db={
  projects:[{id:'p1',code:'P-001',status:'En ejecución'}],
  contracts:[{id:'c1',projectId:'p1',originalAmount:1000,currentAmount:1150,start:'2026-05-08',end:'2026-06-29',executionDays:90,status:'Activo'}],
  changes:[{id:'ch1',contractId:'c1',status:'Aprobado',amountDelta:100,daysDelta:0}],
  guarantees:[{id:'g1',contractId:'c1',type:'Cumplimiento',number:'',issuer:'Banco',document:'',start:'2026-05-01',end:'2026-12-01'}]
};
const context={
  console,window:null,db,
  document:{getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]}},
  MutationObserver:class{observe(){}},setTimeout(){},setInterval(){return 1},clearInterval(){},requestAnimationFrame(fn){fn()},
  fmtC:v=>`L ${Number(v).toFixed(2)}`,
  __ccContractIntegrity:{guaranteeIssues:g=>[...(!g.number?['Falta el número de garantía.']:[]),...(!g.document?['Falta la referencia documental.']:[])]}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('integrity-diagnostics-v1.js','utf8'),context,{filename:'integrity-diagnostics-v1.js'});

const api=context.__ccIntegrityDiagnostics;
const before=JSON.stringify(db);
const issues=api.scanProject('p1');
assert.equal(api.derivedAmount(db.contracts[0]),1100);
assert.equal(api.storedAmount(db.contracts[0]),1150);
assert.equal(api.calendarDays('2026-05-08','2026-06-29'),53);
assert(issues.some(x=>x.kind==='contract_amount'),'debe detectar diferencia entre monto almacenado y monto respaldado por cambios');
assert(issues.some(x=>x.kind==='contract_dates'),'debe detectar plazo incompatible con las fechas registradas');
assert.equal(issues.filter(x=>x.kind==='guarantee').length,2,'debe informar documentación faltante de garantía');
assert.equal(JSON.stringify(db),before,'el diagnóstico no debe alterar datos contractuales');

console.log('integrity-diagnostics: 7 verificaciones no destructivas superadas');
