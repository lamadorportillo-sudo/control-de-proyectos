const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const file='contract-payment-documents-v1.js';
const read=()=>fs.readFileSync(file,'utf8');
const write=s=>fs.writeFileSync(file,s,'utf8');
function exact(from,to,label){const s=read();if(!s.includes(from))throw new Error(`${file}: no se encontró ${label}`);write(s.replace(from,to));}

exact(
"const REQUIRED_PROFILE=['mayorName','mayorDni','contractorGender','contractorDni','contractorProfession','contractorCivilStatus','contractorNationality','contractorAddress','treasuryRecipient','treasuryDepartment','supervisorName','supervisorUnit'];",
"const PROFILE_REQUIRED_BY_KIND={contract:['mayorName','mayorDni','contractorGender','contractorDni','contractorProfession','contractorCivilStatus','contractorNationality','contractorAddress'],advanceRemittance:['treasuryRecipient','treasuryDepartment','supervisorName','supervisorUnit','noteDate'],startOrder:['mayorName','supervisorName','projectDepartment','projectMunicipality','projectVillage','officialStartDate']};",
'requisitos por tipo');

exact(
"    contractorRegistry:'',contractorRegistryVolume:'',treasuryRecipient:'',treasuryDepartment:'',supervisorName:'',supervisorUnit:'',noteDate:T(),\n    projectDepartment:'La Paz',projectMunicipality:'Santa María',projectVillage:String(p?.location||'').split(',')[0].trim(),executorLegalRepresentative:'',officialStartDate:c?.start||''",
"    contractorRegistry:'',contractorRegistryVolume:'',treasuryRecipient:'',treasuryDepartment:'',supervisorName:'',supervisorUnit:'',noteDate:'',\n    projectDepartment:'',projectMunicipality:'',projectVillage:'',executorLegalRepresentative:'',officialStartDate:''",
'perfil sin datos implícitos');

exact("  const x=profile(c,p),ctl=controls(c),female=x.contractorGender!=='Masculino';","  const x=profile(c,p),ctl=controls(c);",'sexo sin inferencia');
exact(
"    <p class=\"cc-doc-profile-note\"><b>Estos datos se guardan con el contrato.</b> El nombre del proyecto, código, monto, porcentaje del anticipo y plazo se toman automáticamente del expediente. Revisa también los datos de la orden de inicio.</p>",
"    <p class=\"cc-doc-profile-note\"><b>Estos datos se guardan con el contrato.</b> Completa los campos que correspondan al documento que vas a generar. El sistema bloqueará únicamente lo que falte para ese formato.</p>",
'mensaje de ayuda');

for(const from of [
  '<label class="field"><span>Sexo gramatical</span><select id="ccdpGender" required>',
  '<label class="field"><span>DNI del contratista</span><input id="ccdpDni" required ',
  '<label class="field"><span>Profesión u oficio</span><input id="ccdpProfession" required ',
  '<label class="field"><span>Estado civil</span><input id="ccdpCivil" required ',
  '<label class="field"><span>Nacionalidad</span><input id="ccdpNationality" required ',
  '<label class="field wide"><span>Domicilio y residencia</span><input id="ccdpAddress" required ',
  '<label class="field"><span>Fecha de la nota</span><input id="ccdpNoteDate" type="date" required ',
  '<label class="field"><span>Departamento del proyecto</span><input id="ccdpProjectDepartment" required ',
  '<label class="field"><span>Municipio del proyecto</span><input id="ccdpProjectMunicipality" required ',
  '<label class="field"><span>Aldea / comunidad</span><input id="ccdpProjectVillage" required ',
  '<label class="field"><span>Fecha oficial de inicio</span><input id="ccdpOfficialStart" type="date" required ',
  '<label class="field"><span>Destinatario de Tesorería</span><input id="ccdpRecipient" required ',
  '<label class="field"><span>Cargo / departamento</span><input id="ccdpDepartment" required ',
  '<label class="field"><span>Nombre del alcalde</span><input id="ccdpMayor" required ',
  '<label class="field"><span>DNI del alcalde</span><input id="ccdpMayorDni" required ',
  '<label class="field"><span>Supervisor firmante</span><input id="ccdpSupervisor" required ',
  '<label class="field"><span>Unidad del supervisor</span><input id="ccdpUnit" required '
])exact(from,from.replace(' required',''),`campo opcional ${from}`);

exact(
"    <label class=\"field\"><span>Fecha de la nota</span><input id=\"ccdpNoteDate\" type=\"date\" value=\"${H(x.noteDate||T())}\"></label>",
"    <label class=\"field\"><span>Fecha de la nota</span><input id=\"ccdpNoteDate\" type=\"date\" value=\"${H(x.noteDate)}\"></label>",
'fecha de nota explícita');
exact(
"    <label class=\"field\"><span>Fecha oficial de inicio</span><input id=\"ccdpOfficialStart\" type=\"date\" value=\"${H(x.officialStartDate||c.start||T())}\"></label>",
"    <label class=\"field\"><span>Fecha oficial de inicio</span><input id=\"ccdpOfficialStart\" type=\"date\" value=\"${H(x.officialStartDate)}\"></label>",
'fecha de inicio explícita');
exact("  m.querySelector('#ccdpGender').value=female?'Femenino':'Masculino';","  m.querySelector('#ccdpGender').value=['Femenino','Masculino'].includes(x.contractorGender)?x.contractorGender:'';",'selector de sexo explícito');

exact(
"function missingProfile(c){const p=profile(c);return REQUIRED_PROFILE.filter(k=>!String(p[k]||'').trim())}\nfunction missingStartOrderProfile(p,c){const x=profile(c,p);return['projectDepartment','projectMunicipality','projectVillage','officialStartDate'].filter(k=>!String(x[k]||'').trim())}",
"function missingProfile(c,kind,p=null){const x=profile(c,p),keys=kind==='all'?[...new Set(Object.values(PROFILE_REQUIRED_BY_KIND).flat())]:(PROFILE_REQUIRED_BY_KIND[kind]||[]);return keys.filter(k=>!String(x[k]||'').trim())}",
'perfil requerido por tipo');
exact(
"  if(missingProfile(c).length)return openProfile(p,c,()=>generate(p,c,kind));\n  if((kind===DOC_START_ORDER||kind==='all')&&missingStartOrderProfile(p,c).length)return openProfile(p,c,()=>generate(p,c,kind));",
"  if(missingProfile(c,kind,p).length)return openProfile(p,c,()=>generate(p,c,kind));",
'generación por tipo');

exact(
"  const pf=profile(c,p),ctl=controls(c),amount=N(c.originalAmount||c.currentAmount||p.budget),adv=advanceAmount(c),advPct=advancePercent(c),performancePct=Number(ctl.performanceGuaranteePct),performance=amount*performancePct/100,penaltyPct=Number(ctl.penaltyDailyPct),penalty=amount*penaltyPct/100;",
"  const pf=profile(c,p),ctl=controls(c),amount=N(c.originalAmount),adv=advanceAmount(c),advPct=advancePercent(c),performancePct=Number(ctl.performanceGuaranteePct),performance=amount*performancePct/100,penaltyPct=Number(ctl.penaltyDailyPct),penalty=amount*penaltyPct/100;",
'monto original contrato');
exact("  const pf=profile(c),amount=N(c.originalAmount||c.currentAmount||p.budget),adv=advanceAmount(c);let out=xml;","  const pf=profile(c),amount=N(c.originalAmount),adv=advanceAmount(c);let out=xml;",'monto original nota');
exact("function wordsDays(v){const days=Math.max(1,Math.trunc(N(v)||1)),words=typeof window.numberWords==='function'?window.numberWords(days):String(days);return `${String(words).toUpperCase()} DÍAS (${days})`}","function wordsDays(v){const days=Math.max(0,Math.trunc(N(v))),words=typeof window.numberWords==='function'?window.numberWords(days):String(days);return `${String(words).toUpperCase()} DÍAS (${days})`}",'plazo sin un día por defecto');

execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log('Generador documental ajustado por tipo de documento y sin datos implícitos.');
