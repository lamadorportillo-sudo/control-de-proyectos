const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const project={id:'p1',budget:1000};
const contract={id:'c1',projectId:'p1',originalAmount:1000,currentAmount:1000,start:'2026-01-01',end:'2026-04-10',advancePaid:0,controls:{}};
const context={
  console,window:null,db:{projects:[project],contracts:[contract],changes:[],payments:[],visits:[],guarantees:[],estimates:[]},
  document:{addEventListener(){},documentElement:{},querySelectorAll(){return[]}},MutationObserver:class{observe(){}},queueMicrotask(){},setTimeout(){},navigator:{onLine:false},
  cents:v=>Math.round(Number(v||0)*100),fromCents:v=>Math.round(v)/100,round2:v=>Math.round(Number(v||0)*100)/100,
  // Simula el núcleo histórico que todavía puede devolver plantillas. La capa
  // de integridad debe mirar los controles realmente guardados en el contrato.
  contractControlDefaults:x=>Object.assign({performanceGuaranteePct:15,performanceExtraMonths:3,qualityGuaranteePct:5,qualityGuaranteeDays:365},x),
  daysBetween:(a,b)=>Math.round((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000)+1,
  addExecutionDays:(a,d)=>{const x=new Date(`${a}T12:00:00`);x.setDate(x.getDate()+Number(d)-1);return x.toISOString().slice(0,10)},
  projectProcurement:p=>p.procurement,audit(){},saveDB(){},toast(){},iso:()=>new Date().toISOString(),session:null,cloudLoaded:false,view:{projectId:'p1'}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('contract-integrity-fix-v1.js','utf8'),context,{filename:'contract-integrity-fix-v1.js'});
const api=context.__ccContractIntegrity;

const common={number:'G-1',issuer:'Emisor',document:'DOC',applied:1,start:'2026-01-01',end:'2026-12-31'};
const performance=api.guaranteeIssues({...common,type:'Cumplimiento'},contract);
assert(performance.some(x=>x.includes('Definir el porcentaje de la Garantía de Cumplimiento según contrato')),'sin dato contractual debe solicitar porcentaje');
assert(!performance.some(x=>/15%/.test(x)),'no debe asumir 15%');

const quality=api.guaranteeIssues({...common,type:'Calidad'},contract);
assert(quality.some(x=>x.includes('Definir el porcentaje de la Garantía de Calidad según contrato')),'sin dato contractual debe solicitar porcentaje');
assert(!quality.some(x=>/5%/.test(x)),'no debe asumir 5%');
assert(!quality.some(x=>/365 días/.test(x)),'no debe asumir 365 días');

contract.controls={performanceGuaranteePct:12,performanceExtraMonths:2,qualityGuaranteePct:4,qualityGuaranteeDays:180};
const performanceConfigured=api.guaranteeIssues({...common,type:'Cumplimiento',applied:100},contract);
assert(performanceConfigured.some(x=>x.includes('12% configurado')),'debe respetar 12% cuando el contrato lo define');
const qualityConfigured=api.guaranteeIssues({...common,type:'Calidad',applied:30,start:'2026-01-01',end:'2026-03-01'},contract);
assert(qualityConfigured.some(x=>x.includes('4% configurado')),'debe respetar 4% cuando el contrato lo define');
assert(qualityConfigured.some(x=>x.includes('180 días')),'debe respetar la vigencia configurada');

const source=fs.readFileSync('contract-integrity-fix-v1.js','utf8');
assert.doesNotMatch(source,/performanceGuaranteePct\|\|15/,'no debe quedar fallback universal de cumplimiento');
assert.doesNotMatch(source,/qualityGuaranteePct\|\|5/,'no debe quedar fallback universal de calidad');

console.log('contract-guarantee-no-default: garantías validadas solo contra condiciones explícitas del contrato');
