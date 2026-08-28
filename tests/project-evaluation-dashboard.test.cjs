const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context={
  console,
  Date,
  setTimeout:fn=>fn(),
  queueMicrotask:fn=>fn(),
  window:null,
  document:{
    documentElement:{},
    getElementById(){return null},
    querySelector(){return null},
    addEventListener(){},
  },
  MutationObserver:class{observe(){}},
  view:{screen:'projects',projectId:null},
  db:{
    projects:[{id:'p1',code:'COT-001',name:'Pavimento de prueba',location:'Santa María',budget:1000000,status:'En ejecución',start:'2026-01-01',end:'2026-04-10',executionDays:100}],
    contracts:[{id:'c1',projectId:'p1',number:'C-001',contractor:'Constructora Ejemplo',currentAmount:1000000,originalAmount:1000000,signature:'2025-12-20',start:'2026-01-01',end:'2026-04-10',executionDays:100,advanceStatus:'Pagado',advancePaid:150000,recoveryTarget:80}],
    estimates:[{id:'e1',contractId:'c1',number:1,gross:300000,net:250000,advanceApplied:56250,status:'Pagada',updatedAt:'2026-02-10'}],
    guarantees:[
      {id:'g1',projectId:'p1',contractId:'c1',type:'Cumplimiento',end:'2026-02-01'},
      {id:'g2',projectId:'p1',contractId:'c1',type:'Anticipo',end:'2026-12-31'},
    ],
    changes:[],
    payments:[],
    visits:[{id:'v1',projectId:'p1',number:1,date:'2026-02-01',physical:35,updatedAt:'2026-02-01',observations:[{id:'o1',status:'Pendiente',priority:'Crítica'}]}],
  },
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('project-evaluation-dashboard-v1.js','utf8'),context,{filename:'project-evaluation-dashboard-v1.js'});

const api=context.__ccProjectEvaluationDashboard;
assert.ok(api,'expone la API de evaluación');
const result=api.evaluateProject('p1','2026-03-01');
assert.equal(result.project.id,'p1');
assert.equal(result.physicalProgress,35,'prioriza el avance de la última visita');
assert.equal(result.financialProgress,30,'calcula el avance financiero desde estimaciones');
assert.equal(result.processes.length,11,'evalúa todos los procesos previstos');
assert.ok(result.alerts.some(item=>/garantía de cumplimiento vencida/i.test(item.title)),'detecta garantía vencida');
assert.ok(result.alerts.some(item=>/observaciones pendientes/i.test(item.title)),'detecta observaciones pendientes');
assert.ok(result.processes.find(item=>item.id==='schedule').score<65,'detecta atraso físico frente al tiempo');

const source=[
  fs.readFileSync('index.html','utf8'),
  fs.readFileSync('project-tabs-complete-v1.js','utf8'),
].join('\n');
assert.match(source,/project-evaluation-dashboard-v1\.js\?v=/,'el dashboard está cargado por la página o su cargador global');
console.log('project-evaluation-dashboard: cálculo integral, alertas e integración verificados');
