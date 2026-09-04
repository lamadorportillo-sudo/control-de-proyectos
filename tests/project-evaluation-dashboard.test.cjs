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
    contracts:[{id:'c1',projectId:'p1',number:'C-001',contractor:'Constructora Ejemplo',currentAmount:1000000,originalAmount:1000000,signature:'2025-12-20',start:'2026-01-01',end:'2026-04-10',executionDays:100,advanceStatus:'Pagado',advancePaid:150000,recoveryTarget:80,controls:{performanceGuaranteePct:15,advanceGuaranteePct:100}}],
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
let result=api.evaluateProject('p1','2026-03-01');
assert.equal(result.project.id,'p1');
assert.equal(result.physicalProgress,35,'prioriza el avance de la última visita');
assert.equal(result.financialProgress,30,'calcula el avance financiero desde estimaciones');
assert.equal(result.processes.length,11,'evalúa todos los procesos previstos');
assert.ok(result.alerts.some(item=>/garantía de cumplimiento vencida/i.test(item.title)),'detecta garantía vencida');
assert.ok(result.alerts.some(item=>/observaciones pendientes/i.test(item.title)),'detecta observaciones pendientes');
assert.ok(result.processes.find(item=>item.id==='schedule').score<65,'detecta atraso físico frente al tiempo');

context.db.projects.push({id:'p2',code:'COT-002',name:'Proyecto sin cláusulas implícitas',location:'Santa María',budget:1000000,status:'En ejecución',start:'2026-01-01',end:'2026-04-10',executionDays:100});
context.db.contracts.push({id:'c2',projectId:'p2',number:'C-002',contractor:'Contratista QA',currentAmount:1000000,originalAmount:1000000,signature:'2025-12-20',start:'2026-01-01',end:'2026-04-10',executionDays:100,advanceStatus:'Pagado',advancePaid:150000,recoveryTarget:null,controls:{}});
context.db.estimates.push({id:'e2',contractId:'c2',number:1,gross:300000,net:250000,advanceApplied:50000,status:'Pagada'});
context.db.changes.push({id:'ch2',projectId:'p2',contractId:'c2',status:'Aprobado',amountDelta:120000,justification:'Cambio QA'});
result=api.evaluateProject('p2','2026-03-01');
assert.equal(result.rules.recoveryTarget,null,'no inventa meta de recuperación al 80%');
assert.equal(result.rules.changeLimit,null,'no inventa límite de orden de cambio al 10%');
assert.equal(result.rules.accumulatedLimit,null,'no inventa límite acumulado al 25%');
assert.ok(result.alerts.some(item=>/Meta de amortización no definida/i.test(item.title)),'pide definir la meta de anticipo según contrato');
assert.ok(result.alerts.some(item=>/Definir límites contractuales de modificación/i.test(item.title)),'pide definir límites cuando existen cambios');
assert.ok(!result.alerts.some(item=>/falta garantía de anticipo/i.test(item.title)),'no exige garantía por un porcentaje que no fue configurado');
assert.ok(!result.alerts.some(item=>/10\.0|25\.0/.test(item.detail||'')),'no muestra límites universales cuando faltan en el contrato');

context.db.contracts.find(c=>c.id==='c2').controls={changeOrderLimitPct:8,contractorResolutionThresholdPct:18,accumulatedChangeLimitPct:22,advanceGuaranteePct:100};
context.db.contracts.find(c=>c.id==='c2').recoveryTarget=70;
result=api.evaluateProject('p2','2026-03-01');
assert.equal(result.rules.recoveryTarget,70,'respeta la meta contractual explícita');
assert.equal(result.rules.changeLimit,8,'respeta el límite de orden de cambio explícito');
assert.ok(result.alerts.some(item=>/Verificar adenda contractual/i.test(item.title)&&/8\.00%/.test(item.detail)),'usa el límite configurado de 8%');
assert.ok(result.alerts.some(item=>/Falta garantía de anticipo/i.test(item.title)),'solo exige garantía cuando el contrato la configuró');

const dashboardSource=fs.readFileSync('project-evaluation-dashboard-v1.js','utf8');
assert.ok(!dashboardSource.includes('recoveryTarget||80'),'el código no debe reintroducir meta 80 por defecto');
assert.ok(!dashboardSource.includes('changePct>25'),'el código no debe reintroducir límite 25 por defecto');
assert.ok(!dashboardSource.includes('changePct>10'),'el código no debe reintroducir límite 10 por defecto');
assert.match(dashboardSource,/function contractRules\(/,'centraliza las reglas contractuales explícitas');

const source=[
  fs.readFileSync('index.html','utf8'),
  fs.readFileSync('project-tabs-complete-v1.js','utf8'),
].join('\n');
assert.match(source,/project-evaluation-dashboard-v1\.js\?v=/,'el dashboard está cargado por la página o su cargador global');
console.log('project-evaluation-dashboard: cálculo integral y reglas contractuales explícitas verificados');
