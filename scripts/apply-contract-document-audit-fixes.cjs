const fs=require('node:fs');
const {execFileSync}=require('node:child_process');

function read(file){return fs.readFileSync(file,'utf8')}
function write(file,text){fs.writeFileSync(file,text,'utf8')}
function exact(file,from,to,label){
  let s=read(file);if(!s.includes(from))throw new Error(`${file}: no se encontró ${label}`);s=s.replace(from,to);write(file,s);
}
function regex(file,re,to,label){
  let s=read(file);if(!re.test(s))throw new Error(`${file}: no se encontró ${label}`);s=s.replace(re,to);write(file,s);
}

const docs='contract-payment-documents-v1.js';
exact(docs,
"const REQUIRED_PROFILE=['contractorDni','contractorProfession','contractorCivilStatus','contractorNationality','contractorAddress'];",
"const REQUIRED_PROFILE=['mayorName','mayorDni','contractorGender','contractorDni','contractorProfession','contractorCivilStatus','contractorNationality','contractorAddress','treasuryRecipient','treasuryDepartment','supervisorName','supervisorUnit'];",
'perfil mínimo contractual');

regex(docs,/function controls\(c\)\{\n  const base=\{financingSource:'Fondos Municipales',penaltyDailyPct:\.18,advanceGuaranteePct:100,performanceGuaranteePct:15,performanceExtraMonths:3,qualityGuaranteePct:5,qualityGuaranteeDays:365,changeOrderLimitPct:10,accumulatedChangeLimitPct:25\};\n  try\{return typeof window\.contractControlDefaults==='function'\?window\.contractControlDefaults\(c\?\.controls\):Object\.assign\(base,c\?\.controls\|\|\{\}\)\}catch\{return Object\.assign\(base,c\?\.controls\|\|\{\}\)\}\n\}/,
`function controls(c){
  const raw=c?.controls&&typeof c.controls==='object'?c.controls:{};
  try{return typeof window.contractControlDefaults==='function'?window.contractControlDefaults(raw):Object.assign({},raw)}catch{return Object.assign({},raw)}
}`,'defaults contractuales del generador');

regex(docs,/function profile\(c,p=null\)\{\n  const saved=c\?\.documentProfile&&typeof c\.documentProfile==='object'\?c\.documentProfile:\{\};\n  return Object\.assign\(\{[\s\S]*?\n  \},saved\);\n\}/,
`function profile(c,p=null){
  const saved=c?.documentProfile&&typeof c.documentProfile==='object'?c.documentProfile:{};
  return Object.assign({
    mayorName:'',mayorDni:'',contractorGender:'',contractorDni:'',contractorProfession:'',contractorCivilStatus:'',contractorNationality:'',contractorAddress:'',
    contractorRegistry:'',contractorRegistryVolume:'',treasuryRecipient:'',treasuryDepartment:'',supervisorName:'',supervisorUnit:'',noteDate:T(),
    projectDepartment:'La Paz',projectMunicipality:'Santa María',projectVillage:String(p?.location||'').split(',')[0].trim(),executorLegalRepresentative:'',officialStartDate:c?.start||''
  },saved);
}`,'datos personales precargados');

exact(docs,
`<label class="field"><span>Sexo gramatical</span><select id="ccdpGender"><option>Femenino</option><option>Masculino</option></select></label>`,
`<label class="field"><span>Sexo gramatical</span><select id="ccdpGender" required><option value="">Seleccione</option><option>Femenino</option><option>Masculino</option></select></label>`,
'selector de sexo explícito');
exact(docs,
`<label class="field"><span>Fuente de financiamiento</span><input id="ccdpFinancing" value="${H(ctl.financingSource||'Fondos Municipales')}"></label>`,
`<label class="field"><span>Fuente de financiamiento</span><input id="ccdpFinancing" required value="${H(ctl.financingSource||'')}"></label>`,
'fuente de financiamiento sin fallback');
exact(docs,
`c.controls=Object.assign({},c.controls||{},{financingSource:m.querySelector('#ccdpFinancing').value.trim()||'Fondos Municipales'});c.updatedAt=ISO();`,
`c.controls=Object.assign({},c.controls||{},{financingSource:m.querySelector('#ccdpFinancing').value.trim()});c.updatedAt=ISO();`,
'guardado de financiamiento sin fallback');

exact(docs,
`function advanceAmount(c){const pct=N(c?.advanceRequestedPct),approved=N(c?.advanceApproved);return approved>0?approved:N(c?.originalAmount)*pct/100}`,
`function advanceAmount(c){const pct=N(c?.advanceRequestedPct),approved=N(c?.advanceApproved);return approved>0?approved:N(c?.originalAmount)*pct/100}\nfunction advancePercent(c){const raw=c?.advanceRequestedPct;if(raw!==''&&raw!==null&&raw!==undefined&&Number.isFinite(Number(raw)))return Number(raw);const amount=N(c?.originalAmount||c?.currentAmount),approved=N(c?.advanceApproved);return amount>0&&approved>0?approved/amount*100:null}`,
'porcentaje explícito de anticipo');

exact(docs,
`const pf=profile(c),ctl=controls(c),amount=N(c.originalAmount||c.currentAmount||p.budget),adv=advanceAmount(c),advPct=N(c.advanceRequestedPct)||15,performancePct=N(ctl.performanceGuaranteePct)||15,performance=amount*performancePct/100,penaltyPct=N(ctl.penaltyDailyPct)||.18,penalty=amount*penaltyPct/100;`,
`const pf=profile(c,p),ctl=controls(c),amount=N(c.originalAmount||c.currentAmount||p.budget),adv=advanceAmount(c),advPct=advancePercent(c),performancePct=Number(ctl.performanceGuaranteePct),performance=amount*performancePct/100,penaltyPct=Number(ctl.penaltyDailyPct),penalty=amount*penaltyPct/100;`,
'valores contractuales en reemplazos');
exact(docs,`procedentes de la fuente ${X(ctl.financingSource||'Fondos Municipales')}`,`procedentes de la fuente ${X(ctl.financingSource||'')}`,'financiamiento en contrato');
exact(docs,`${X(wordsDays(c.executionDays||90))}`,`${X(wordsDays(c.executionDays))}`,'plazo sin 90 días por defecto');
exact(docs,`['FONDOS MUNICIPALES',String(ctl.financingSource||'Fondos Municipales').toUpperCase()]`,`['FONDOS MUNICIPALES',String(ctl.financingSource||'').toUpperCase()]`,'financiamiento en orden de inicio');
exact(docs,
`async function generate(p,c,kind){\n  if(!c)return SAY('Primero registra el contrato.');`,
`async function generate(p,c,kind){\n  if(!c)return SAY('Primero registra el contrato.');\n  const safetyIssues=window.__ccContractDocumentSafety?.validate?.(kind,p,c)||[];if(safetyIssues.length)return SAY(\`Documento bloqueado por control contractual: ${safetyIssues[0]}${safetyIssues.length>1?\` (${safetyIssues.length} revisiones pendientes)\`:''}\`);`,
'validación defensiva antes de generar');

const preview='contract-preview-v1.js';
regex(preview,/function controls\(c\)\{try\{return typeof window\.contractControlDefaults==='function'\?window\.contractControlDefaults\(c\?\.controls\):Object\.assign\(\{penaltyDailyPct:\.18,performanceGuaranteePct:15,qualityGuaranteePct:5,changeOrderLimitPct:10,accumulatedChangeLimitPct:25\},c\?\.controls\|\|\{\}\)\}catch\{return Object\.assign\(\{penaltyDailyPct:\.18,performanceGuaranteePct:15,qualityGuaranteePct:5,changeOrderLimitPct:10,accumulatedChangeLimitPct:25\},c\?\.controls\|\|\{\}\)\}\}/,
`function controls(c){const raw=c?.controls&&typeof c.controls==='object'?c.controls:{};try{return typeof window.contractControlDefaults==='function'?window.contractControlDefaults(raw):Object.assign({},raw)}catch{return Object.assign({},raw)}}`,'defaults de vista previa');
regex(preview,/function profile\(p,c\)\{\n  const saved=c\?\.documentProfile\|\|\{\},code=String\(p\?\.code\|\|''\)\.toUpperCase\(\),school=code\.includes\('COT121706-2026'\);\n  return Object\.assign\(\{[\s\S]*?\n  \},saved\);\n\}/,
`function profile(p,c){
  const saved=c?.documentProfile&&typeof c.documentProfile==='object'?c.documentProfile:{};
  return Object.assign({mayorName:'',mayorDni:'',contractorDni:'',contractorProfession:'',contractorCivilStatus:'',contractorNationality:'',contractorAddress:'',contractorRegistry:'',contractorRegistryVolume:''},saved);
}`,'datos específicos del proyecto en vista previa');
exact(preview,
`function advance(c,amount){const pct=N(c?.advanceRequestedPct)||15,approved=N(c?.advanceApproved);return {pct,value:approved>0?approved:amount*pct/100}}`,
`function advance(c,amount){const raw=c?.advanceRequestedPct,pct=raw!==''&&raw!==null&&raw!==undefined&&Number.isFinite(Number(raw))?Number(raw):(N(c?.advanceApproved)>0&&amount>0?N(c.advanceApproved)/amount*100:null),approved=N(c?.advanceApproved);return {pct,value:approved>0?approved:(pct===null?0:amount*pct/100)}}`,
'anticipo sin 15% implícito en vista previa');
exact(preview,
`const pf=profile(p,c),ctl=controls(c),amount=N(c?.originalAmount||c?.currentAmount||p?.budget),adv=advance(c,amount),penaltyPct=N(ctl.penaltyDailyPct)||.18,penalty=amount*penaltyPct/100,days=Math.max(1,Math.trunc(N(c?.executionDays)||90));`,
`const pf=profile(p,c),ctl=controls(c),amount=N(c?.originalAmount||c?.currentAmount||p?.budget),adv=advance(c,amount),penaltyPct=ctl.penaltyDailyPct!==''&&ctl.penaltyDailyPct!==null&&ctl.penaltyDailyPct!==undefined&&Number.isFinite(Number(ctl.penaltyDailyPct))?Number(ctl.penaltyDailyPct):null,penalty=penaltyPct===null?0:amount*penaltyPct/100,days=Math.max(0,Math.trunc(N(c?.executionDays)));`,
'multa y plazo sin defaults en vista previa');
exact(preview,
`<tr><td>Anticipo</td><td>${MONEY(adv.value)} · ${adv.pct}%</td></tr>`,
`<tr><td>Anticipo</td><td>${MONEY(adv.value)} · ${adv.pct===null?'No definido':adv.pct+'%'}</td></tr>`,
'anticipo no definido en vista previa');
exact(preview,
`<tr><td>Multa diaria</td><td>${penaltyPct}% del monto contractual · ${MONEY(penalty)} por día de atraso</td></tr>`,
`<tr><td>Multa diaria</td><td>${penaltyPct===null?'No definida':penaltyPct+'% del monto contractual · '+MONEY(penalty)+' por día de atraso'}</td></tr>`,
'multa no definida en vista previa');
exact(preview,
`<p><b>GARANTÍAS Y CONTROL.</b> Cumplimiento ${E(ctl.performanceGuaranteePct||15)}%; calidad ${E(ctl.qualityGuaranteePct||5)}%; variaciones por orden hasta ${E(ctl.changeOrderLimitPct||10)}% y acumuladas hasta ${E(ctl.accumulatedChangeLimitPct||25)}%, conforme a la configuración contractual.</p>`,
`<p><b>GARANTÍAS Y CONTROL.</b> Cumplimiento ${E(ctl.performanceGuaranteePct??'No definido')}%; calidad ${E(ctl.qualityGuaranteePct??'No definido')}%; variaciones por orden hasta ${E(ctl.changeOrderLimitPct??'No definido')}% y acumuladas hasta ${E(ctl.accumulatedChangeLimitPct??'No definido')}%, conforme a la configuración contractual.</p>`,
'garantías y cambios sin defaults en vista previa');

const evalFile='project-evaluation-dashboard-v1.js';
exact(evalFile,`'"':'&quot'`,`'"':'&quot;'`,'escape de comillas HTML');

const tabs='project-tabs-complete-v1.js';
exact(tabs,`'contract-penalty-card-v1.js?v=20260831-penalty2',\n'report-professional-v1.js`,
`'contract-penalty-card-v1.js?v=20260831-penalty2',\n'contract-explicit-rules-v1.js?v=20260904-explicit1',\n'report-professional-v1.js`,'metadata de reglas explícitas');
exact(tabs,`'project-evaluation-dashboard-v1.js?v=20260828-projectevaluation1'`,`'project-evaluation-dashboard-v1.js?v=20260904-projectevaluation2'`,'versión dashboard evaluativo');
exact(tabs,`'contract-preview-v1.js?v=20260831-preview1'\n];`,
`'contract-preview-v1.js?v=20260831-preview1',\n'contract-document-safety-v1.js?v=20260904-docsafety1'\n];`,'metadata de blindaje documental');

for(const file of [docs,preview,evalFile,tabs])execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log('Correcciones contractuales documentales aplicadas y sintaxis validada.');
