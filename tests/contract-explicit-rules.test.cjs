const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const contract={id:'c1',projectId:'p1',controls:{}};
const context={
  console,window:null,db:{contracts:[contract]},view:{projectId:'p1'},
  contractControlDefaults:x=>Object.assign({
    orderStartAfterAdvanceDays:0,penaltyDailyPct:0.18,qualityRetentionPct:5,advanceGuaranteePct:100,
    performanceGuaranteePct:15,performanceExtraMonths:3,qualityGuaranteePct:5,qualityGuaranteeDays:365,
    changeOrderLimitPct:10,contractorResolutionThresholdPct:20,accumulatedChangeLimitPct:25,
    rescissionCureDays:10,emergencyNoticeDays:5,emergencyReviewDays:10,successionSuspensionDays:30
  },x||{}),
  pct:v=>`${Number(v).toFixed(2)}%`
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('contract-explicit-rules-v1.js','utf8'),context,{filename:'contract-explicit-rules-v1.js'});

const blank=context.contractControlDefaults({});
for(const key of context.__ccContractExplicitRules.fields){
  assert.equal(blank[key],null,`${key} debe permanecer sin definir cuando el contrato no lo contiene`);
}
const explicit=context.contractControlDefaults({penaltyDailyPct:0.18,performanceGuaranteePct:12,qualityGuaranteeDays:180,changeOrderLimitPct:8});
assert.equal(explicit.penaltyDailyPct,0.18,'conserva la multa expresamente configurada');
assert.equal(explicit.performanceGuaranteePct,12,'conserva el porcentaje de cumplimiento expresamente configurado');
assert.equal(explicit.qualityGuaranteeDays,180,'conserva la vigencia de calidad expresamente configurada');
assert.equal(explicit.changeOrderLimitPct,8,'conserva el límite de cambio expresamente configurado');

let result=context.changeClass(1000,110);
assert.equal(result.suggested,'Definir según contrato','sin límites no debe decidir Orden de Cambio o Adenda');
assert.match(result.alert,/Definir límites de modificación según contrato/,'sin límites debe pedir configuración contractual');
assert.equal(result.limits.orderLimit,null);
assert.equal(result.limits.resolutionLimit,null);
assert.equal(result.limits.accumulatedLimit,null);

contract.controls={changeOrderLimitPct:10,contractorResolutionThresholdPct:20,accumulatedChangeLimitPct:25};
result=context.changeClass(1000,110);
assert.equal(result.suggested,'Adenda','respeta el límite contractual de Orden de Cambio');
assert.match(result.alert,/10\.00% configurado/,'explica el límite contractual que fue superado');
result=context.changeClass(1000,260);
assert.match(result.alert,/25\.00% configurado como límite acumulado/,'respeta el límite acumulado configurado');

assert.ok(supplementalModules.some(([file,version])=>file==='contract-explicit-rules-v1.js'&&version==='20260904-explicit1'),'el módulo debe quedar en el plan autenticado canónico');
const source=fs.readFileSync('contract-explicit-rules-v1.js','utf8');
assert.doesNotMatch(source,/p<=10\?|supera 25\.00%|performanceGuaranteePct:15|qualityGuaranteePct:5/,'la nueva autoridad no debe reintroducir plantillas universales');
console.log('contract-explicit-rules: porcentajes y plazos solo nacen de condiciones contractuales explícitas');
