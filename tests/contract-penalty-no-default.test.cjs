const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('contract-penalty-card-v1.js','utf8');

function executeCard(controls){
  const appended=[];
  const grid={
    querySelector(){return null},
    querySelectorAll(){return[]},
    append(...nodes){appended.push(...nodes)},
    insertBefore(node){appended.push(node)}
  };
  const context={
    console,
    window:null,
    document:{
      querySelector(sel){return sel==='#tabBody .summary-grid'?grid:null},
      createElement(){return {className:'',innerHTML:''}}
    },
    setTimeout(){},
    renderContract(){},
    // Simula la función histórica: si el componente volviera a usarla,
    // inyectaría 0.18 incluso cuando el contrato no lo contiene.
    contractControlDefaults:x=>Object.assign({penaltyDailyPct:0.18},x||{}),
    today:()=> '2026-01-02',
    daysBetween:()=>1,
    round2:v=>Math.round(Number(v||0)*100)/100,
    pct:v=>`${Number(v).toFixed(2)}%`,
    moneyHTML:v=>`<strong>L ${Number(v).toFixed(2)}</strong>`,
    dmy:v=>v
  };
  context.window=context;
  vm.createContext(context);
  vm.runInContext(source,context,{filename:'contract-penalty-card-v1.js'});
  context.renderContract({}, {originalAmount:1000,end:'2026-01-01',controls});
  return appended.map(x=>x.innerHTML).join('\n');
}

assert.match(source,/MULTA DIARIA Y ACUMULADA V4 · SOLO CLÁUSULA EXPLÍCITA/,'la tarjeta debe declarar el modelo contractual explícito');
assert.match(source,/const rawCtrl=c\.controls/,'debe leer los controles realmente guardados en el contrato');
assert.match(source,/hasOwnProperty\.call\(rawCtrl,'penaltyDailyPct'\)/,'debe exigir propiedad contractual explícita');
assert.doesNotMatch(source,/contractControlDefaults\(c\.controls/,'no debe decidir la tasa desde una plantilla de valores por defecto');
assert.doesNotMatch(source,/\?0\.18:rateRaw/,'no puede usar 0.18% como respaldo universal');

const missing=executeCard({});
assert.match(missing,/Definir según contrato/,'sin tasa explícita debe solicitar la cláusula contractual');
assert.doesNotMatch(missing,/0\.18%/,'una plantilla histórica no puede reintroducir 0.18%');
assert.doesNotMatch(missing,/L 1\.80/,'sin tasa contractual no debe calcular multa diaria');

const explicit=executeCard({penaltyDailyPct:0.18});
assert.match(explicit,/0\.18%/,'si el contrato sí define 0.18%, debe respetarlo');
assert.match(explicit,/L 1\.80/,'la multa explícita debe calcularse sobre el monto indicado');
assert.match(explicit,/Este dato no aplica una penalización por sí solo/,'los días posteriores al plazo no deben activar una multa sin cláusula');

console.log('contract-penalty-no-default: la multa ignora plantillas históricas y solo usa la tasa almacenada explícitamente en el contrato');
