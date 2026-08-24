const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('engineering-manual-reference-v1.js','utf8');
const context={
  window:null,
  session:null,
  document:{getElementById(){return null},querySelector(){return null},createElement(){return{style:{},appendChild(){}}},head:{appendChild(){}},documentElement:{},querySelectorAll(){return[]}},
  MutationObserver:class{observe(){}},requestAnimationFrame(fn){fn()},setTimeout(fn){fn()},setInterval(){return 1},clearInterval(){},addEventListener(){},fetch(){return Promise.resolve()},console
};
context.window=context;
vm.createContext(context);
vm.runInContext(source,context,{filename:'engineering-manual-reference-v1.js'});

const manual=context.__ccEngineeringManual;
assert(manual,'el manual debe exponer una API para Halu');
assert.equal(manual.pages,150,'conserva las 150 páginas como referencia');
assert.match(manual.context('control de concreto y curado'),/Concreto/i,'relaciona consultas de concreto');
assert.match(manual.context('cimentación y suelo'),/capacidad portante/i,'relaciona cimentaciones');
assert.match(manual.context('levantamiento topográfico y replanteo'),/Topograf/i,'relaciona topografía');
assert.match(manual.jurisdictionNote,/Perú/i,'identifica correctamente la normativa peruana');
assert.match(manual.jurisdictionNote,/Honduras/i,'da prioridad a la normativa aplicable en Honduras');

const builder=fs.readFileSync('build-pages.cjs','utf8');
assert(builder.includes("['programacion-control-v1.js','20260823-programacion4']"),'el generador activa Programación y Control');
assert(builder.includes('window.ccCurrentProjectId'),'el generador expone de forma controlada el expediente activo');
assert(builder.includes("['engineering-manual-reference-v1.js','20260823-manual1']"),'el generador activa el manual técnico');
const programacion=fs.readFileSync('programacion-control-v1.js','utf8');
assert.match(programacion,/button\[data-tab\].*closest\('nav'\)/,'Programación y Control reconoce la navegación actual del expediente');
assert.match(programacion,/codes\.includes\(String\(p\.code/,'Programación y Control identifica el expediente por su código visible');

console.log('engineering-manual-activation: 11 verificaciones superadas');
