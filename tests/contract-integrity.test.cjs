const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const project={id:'p1',code:'COT121706-2026',name:'CONSTRUCCIÓN DE PAVIMENTO CALLE DEL COLEGIO',budget:1000,physicalProgress:12};
const contract={id:'c1',projectId:'p1',number:'COT121706-2026',contractor:project.name,originalAmount:1000,currentAmount:1000,start:'2026-01-01',end:'2026-04-10',executionDays:100,advancePaid:150,controls:{performanceGuaranteePct:15,performanceExtraMonths:3,qualityGuaranteePct:5,qualityGuaranteeDays:365}};
const context={
  console,window:null,db:{projects:[project],contracts:[contract],changes:[],payments:[],visits:[],guarantees:[],estimates:[
    {id:'e1',projectId:'p1',contractId:'c1',status:'Borrador',gross:500,net:450,qualityApplied:25,advanceApplied:50},
    {id:'e2',projectId:'p1',contractId:'c1',status:'Aprobada',gross:300,net:260,qualityApplied:15,advanceApplied:30},
    {id:'e3',projectId:'p1',contractId:'c1',status:'Pagada',gross:200,net:170,qualityApplied:10,advanceApplied:20}
  ]},
  document:{addEventListener(){},documentElement:{},querySelectorAll(){return[]}},MutationObserver:class{observe(){}},queueMicrotask(){},setTimeout(){},navigator:{onLine:false},
  cents:v=>Math.round(Number(v||0)*100),fromCents:v=>Math.round(v)/100,round2:v=>Math.round(Number(v||0)*100)/100,
  contractControlDefaults:x=>Object.assign({performanceGuaranteePct:15,performanceExtraMonths:3,qualityGuaranteePct:5,qualityGuaranteeDays:365},x),
  daysBetween:(a,b)=>Math.round((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000)+1,
  addExecutionDays:(a,d)=>{const x=new Date(`${a}T12:00:00`);x.setDate(x.getDate()+Number(d)-1);return x.toISOString().slice(0,10)},
  projectProcurement:p=>p.procurement,audit(){},saveDB(){},toast(){},iso:()=>new Date().toISOString(),session:null,cloudLoaded:false,view:{projectId:'p1'}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('contract-integrity-fix-v1.js','utf8'),context,{filename:'contract-integrity-fix-v1.js'});

const api=context.__ccContractIntegrity;
const fin=api.financialModel(project,contract);
assert.equal(fin.grossC,50000,'solo las estimaciones aprobadas/pagadas alimentan el acumulado');
assert.equal(fin.proposedC,100000,'las propuestas se conservan por separado');
assert.equal(fin.paidEstimatesC,17000,'solo el neto pagado alimenta los pagos');
assert.equal(fin.saldoEstimarC,50000);
assert.equal(api.estimateLimit(contract,null).availableC,50000);

const p2={procurement:{offers:[
  {id:'pending',correctedAmount:80,eligible:true,technicalStatus:'Pendiente'},
  {id:'bad',correctedAmount:70,eligible:true,technicalStatus:'No cumple'},
  {id:'ok2',correctedAmount:120,eligible:true,technicalStatus:'Admisible'},
  {id:'ok1',correctedAmount:100,eligible:true,technicalStatus:'Cumple'}
]}};
assert.equal(context.procurementSuggestion(p2).id,'ok1','la sugerencia exige calificación técnica y menor precio corregido');

context.db.changes=[{id:'ch1',contractId:'c1',status:'Aprobado',amountDelta:100,daysDelta:10}];
contract.currentAmount=1100;contract.executionDays=110;
assert.equal(api.deriveOriginalDays(contract,context.db.changes),100,'recupera el plazo base sin sumar dos veces la ampliación');

const issues=api.guaranteeIssues({type:'Cumplimiento',number:'',issuer:'',document:'',applied:100,start:'2026-01-01',end:'2026-04-10'},contract);
assert(issues.some(x=>x.includes('número')));
assert(issues.some(x=>x.includes('institución')));
assert(issues.some(x=>x.includes('referencia')));
assert(issues.some(x=>x.includes('menor al 15%')));
assert(issues.some(x=>x.includes('vigencia')));

const source=fs.readFileSync('contract-integrity-fix-v1.js','utf8');
assert.equal(typeof api.repairKnownContract,'undefined','el runtime no debe exponer reparaciones de contratos específicos');
assert(!/setTimeout\(repairKnownContract|repairKnownContract\s*\(/.test(source),'no debe existir autocorrección contractual por temporizador');
assert(!/ING\. NORMA LUHATANY MEDINA RAMOS/.test(source),'los datos de un contratista concreto no deben estar incrustados en el motor general');

console.log('contract-integrity: 16 verificaciones superadas y autocorrección específica eliminada');
