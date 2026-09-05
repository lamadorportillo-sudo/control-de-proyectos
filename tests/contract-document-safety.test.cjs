const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const messages=[];
const context={
  console,window:null,setTimeout:fn=>{fn();return 1},clearTimeout(){},
  document:{addEventListener(){},documentElement:{}},
  MutationObserver:class{observe(){}},
  toast:m=>messages.push(String(m)),
  alert:m=>messages.push(String(m)),
  audit(){},db:{projects:[],contracts:[]},view:{projectId:null},
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('contract-document-safety-v1.js','utf8'),context,{filename:'contract-document-safety-v1.js'});

const api=context.__ccContractDocumentSafety;
assert.ok(api,'expone la API de seguridad documental');
const project={id:'p1',code:'COT-QA',name:'Proyecto QA',budget:1000000};
const blank={id:'c1',projectId:'p1',number:'C-001',contractor:'Constructora QA',originalAmount:1000000,currentAmount:1000000,signature:'2026-01-05',executionDays:90,advanceStatus:'Pagado',advanceApproved:150000,controls:{},documentProfile:{}};
let issues=api.validate('contract',project,blank);
assert.ok(issues.length>=10,'un contrato sin condiciones expresas debe quedar bloqueado');
assert.ok(issues.some(x=>/Revisar datos/i.test(x)),'exige identidad contractual explícita');
assert.ok(issues.some(x=>/80%/.test(x)),'no supone la meta de amortización');
assert.ok(issues.some(x=>/Garantía de Anticipo.*100%/i.test(x)),'no supone la garantía de anticipo');

const profile={
  mayorName:'Alcalde QA',mayorDni:'0000-0000-00000',contractorGender:'Masculino',contractorDni:'1111-1111-11111',
  contractorProfession:'Ingeniero Civil',contractorCivilStatus:'casado',contractorNationality:'hondureña',contractorAddress:'Santa María, La Paz',
  treasuryRecipient:'Tesorero QA',treasuryDepartment:'Tesorería Municipal',supervisorName:'Supervisor QA',supervisorUnit:'Unidad de Proyectos',noteDate:'2026-01-10',
  projectDepartment:'La Paz',projectMunicipality:'Santa María',projectVillage:'Barrio El Centro',officialStartDate:'2026-01-16'
};
const controls={
  financingSource:'Fondos Municipales',penaltyDailyPct:0.18,performanceGuaranteePct:15,performanceExtraMonths:3,
  advanceGuaranteePct:100,qualityGuaranteePct:5,qualityGuaranteeDays:365,changeOrderLimitPct:10,accumulatedChangeLimitPct:25,
  rescissionCureDays:10,successionClauseEnabled:true,successionSuspensionDays:30,emergencyClauseEnabled:true,emergencyNoticeDays:5,emergencyReviewDays:10,
  priceType:'Fijo',priceAdjustmentAllowed:false,taxApplies:true,taxRatePct:15,taxBase:'Retención del 15% sobre la utilidad conforme cláusula contractual.',
  orderStartMode:'Después del pago/entrega del anticipo',orderStartAfterAdvanceDays:15,
  governingLaw:'Ley de Contratación del Estado y su Reglamento, según corresponda.',
  disputeJurisdiction:'Juzgado de Letras de lo Contencioso Administrativo de Tegucigalpa, Francisco Morazán.'
};
const compatible={...blank,advanceRequestedPct:15,recoveryTarget:80,documentProfile:profile,controls};
issues=api.validate('contract',project,compatible);
assert.deepEqual(Array.from(issues),[],'el contrato compatible con la plantilla puede generarse');
assert.deepEqual(Array.from(api.validate('advanceRemittance',project,compatible)),[],'la nota compatible puede generarse');
assert.deepEqual(Array.from(api.validate('startOrder',project,compatible)),[],'la orden compatible puede generarse');

const contractOnly={...compatible,documentProfile:{
  mayorName:profile.mayorName,mayorDni:profile.mayorDni,contractorGender:profile.contractorGender,contractorDni:profile.contractorDni,
  contractorProfession:profile.contractorProfession,contractorCivilStatus:profile.contractorCivilStatus,contractorNationality:profile.contractorNationality,contractorAddress:profile.contractorAddress
}};
assert.deepEqual(Array.from(api.validate('contract',project,contractOnly)),[],'el contrato no exige datos exclusivos de Tesorería u orden de inicio');

const noteOnly={...compatible,documentProfile:{treasuryRecipient:profile.treasuryRecipient,treasuryDepartment:profile.treasuryDepartment,supervisorName:profile.supervisorName,supervisorUnit:profile.supervisorUnit,noteDate:profile.noteDate}};
assert.deepEqual(Array.from(api.validate('advanceRemittance',project,noteOnly)),[],'la nota no exige identidad del alcalde ni datos exclusivos del contrato');

const startOnly={...compatible,documentProfile:{mayorName:profile.mayorName,supervisorName:profile.supervisorName,projectDepartment:profile.projectDepartment,projectMunicipality:profile.projectMunicipality,projectVillage:profile.projectVillage,officialStartDate:profile.officialStartDate}};
assert.deepEqual(Array.from(api.validate('startOrder',project,startOnly)),[],'la orden de inicio no exige datos exclusivos de Tesorería ni DNI del contratista');

const missingOriginal={...compatible,originalAmount:0,currentAmount:1000000};
assert.ok(api.validate('contract',project,missingOriginal).some(x=>/monto original/i.test(x)),'el contrato no usa el presupuesto o monto actual como sustituto silencioso del monto original');
assert.ok(api.validate('advanceRemittance',project,missingOriginal).some(x=>/monto original/i.test(x)),'la nota exige monto contractual original');
const missingSignature={...compatible,signature:''};
assert.ok(api.validate('contract',project,missingSignature).some(x=>/fecha de firma/i.test(x)),'el contrato no inventa la fecha de firma');
const missingContractor={...compatible,contractor:''};
assert.ok(api.validate('startOrder',project,missingContractor).some(x=>/contratista|ejecutor/i.test(x)),'la orden de inicio exige ejecutor explícito');

const qualityMismatch={...compatible,controls:{...controls,qualityGuaranteePct:4}};
assert.ok(api.validate('contract',project,qualityMismatch).some(x=>/Garantía de Calidad.*5%/i.test(x)),'una garantía distinta obliga a adaptar plantilla');
const lawMismatch={...compatible,controls:{...controls,governingLaw:'Otra norma contractual',disputeJurisdiction:'Otra ciudad'}};
assert.ok(api.validate('contract',project,lawMismatch).some(x=>/Ley de Contratación del Estado/i.test(x)),'la ley fija de la plantilla debe confirmarse');
assert.ok(api.validate('contract',project,lawMismatch).some(x=>/Contencioso Administrativo.*Tegucigalpa/i.test(x)),'la jurisdicción fija de la plantilla debe confirmarse');
const taxMismatch={...compatible,controls:{...controls,taxBase:'Retención general'}};
assert.ok(api.validate('contract',project,taxMismatch).some(x=>/utilidad/i.test(x)),'la base tributaria fija de la plantilla debe confirmarse');

messages.length=0;
assert.equal(api.block('contract',project,qualityMismatch),true,'bloquea un documento incompatible');
assert.ok(messages.some(x=>/Documento bloqueado por control contractual/i.test(x)),'explica el bloqueo al usuario');
assert.equal(api.block('contract',project,compatible),false,'no bloquea un documento compatible');

assert.ok(supplementalModules.some(([file])=>file==='contract-document-safety-v1.js'),'el blindaje forma parte del plan autenticado');
console.log('contract-document-safety: requisitos por documento, identidad y monto original verificados');
