/*
 * DOCUMENTOS CONTRACTUALES V1
 * Genera contrato, nota de remisión de anticipo y orden de inicio desde el expediente.
 */
(()=>{
'use strict';
if(window.__CC_CONTRACT_PAYMENT_DOCUMENTS_V1__)return;
window.__CC_CONTRACT_PAYMENT_DOCUMENTS_V1__=true;

const TEMPLATE_CONTRACT='templates/contrato-infraestructura-base.docx';
const TEMPLATE_REMITTANCE='templates/nota-remision-anticipo-base.docx';
const TEMPLATE_START_ORDER='templates/orden-inicio-base.docx';
const JSZIP_URL='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
const DOC_CONTRACT='contract';
const DOC_REMITTANCE='advanceRemittance';
const DOC_START_ORDER='startOrder';
const REQUIRED_PROFILE=['mayorName','mayorDni','contractorGender','contractorDni','contractorProfession','contractorCivilStatus','contractorNationality','contractorAddress','treasuryRecipient','treasuryDepartment','supervisorName','supervisorUnit'];

const N=v=>Number.isFinite(Number(v))?Number(v):0;
const H=v=>typeof window.esc==='function'?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const X=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
const T=()=>typeof window.today==='function'?window.today():new Date().toISOString().slice(0,10);
const ISO=()=>new Date().toISOString();
const SAY=m=>typeof window.toast==='function'?window.toast(m):alert(m);
const FILE=v=>String(v||'documento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,90)||'documento';

function controls(c){
  const raw=c?.controls&&typeof c.controls==='object'?c.controls:{};
  try{return typeof window.contractControlDefaults==='function'?window.contractControlDefaults(raw):Object.assign({},raw)}catch{return Object.assign({},raw)}
}

function profile(c,p=null){
  const saved=c?.documentProfile&&typeof c.documentProfile==='object'?c.documentProfile:{};
  return Object.assign({
    mayorName:'',mayorDni:'',contractorGender:'',contractorDni:'',contractorProfession:'',contractorCivilStatus:'',contractorNationality:'',contractorAddress:'',
    contractorRegistry:'',contractorRegistryVolume:'',treasuryRecipient:'',treasuryDepartment:'',supervisorName:'',supervisorUnit:'',noteDate:T(),
    projectDepartment:'La Paz',projectMunicipality:'Santa María',projectVillage:String(p?.location||'').split(',')[0].trim(),executorLegalRepresentative:'',officialStartDate:c?.start||''
  },saved);
}

function cents(v){return Math.round((N(v)+Number.EPSILON)*100)}
function wordsAmount(v){
  const value=cents(v),whole=Math.floor(Math.abs(value)/100),decimal=Math.abs(value)%100;
  let words=typeof window.numberWords==='function'?window.numberWords(whole):String(whole);
  words=String(words).toUpperCase().replace(/VEINTIUNO$/,'VEINTIÚN').replace(/ Y UNO$/,' Y UN').replace(/ UNO$/,' UN');
  const numeric=(Math.abs(value)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  return `${words} ${String(decimal).padStart(2,'0')}/100 LEMPIRAS (L. ${numeric})`;
}
function wordsDays(v){const days=Math.max(1,Math.trunc(N(v)||1)),words=typeof window.numberWords==='function'?window.numberWords(days):String(days);return `${String(words).toUpperCase()} DÍAS (${days})`}
function longDate(value){const d=new Date(`${value||T()}T12:00:00`);if(Number.isNaN(d.getTime()))return value||'';const text=new Intl.DateTimeFormat('es-HN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);return `Santa María, La Paz, ${text}`}
function officialDate(value){const d=new Date(`${value||T()}T12:00:00`);if(Number.isNaN(d.getTime()))return value||'';return new Intl.DateTimeFormat('es-HN',{day:'2-digit',month:'long',year:'numeric'}).format(d)}
function signatureName(value){const text=String(value||'').trim();if(!text||text!==text.toLocaleUpperCase('es'))return text;return text.toLocaleLowerCase('es').replace(/(^|[\s-])([\p{L}])/gu,(_,space,letter)=>space+letter.toLocaleUpperCase('es'))}
function engineerSignature(value){const name=signatureName(value);return /^(ing\.|ingenier[oa]\b)/i.test(name)?name:`Ing. ${name}`}
function contractSignatureText(value){
  const d=new Date(`${value||T()}T12:00:00`);
  if(Number.isNaN(d.getTime()))return 'En fe de lo cual, de común acuerdo, firmamos el presente Contrato en el Municipio de Santa María, Departamento de La Paz.';
  const day=d.getDate(),month=new Intl.DateTimeFormat('es-HN',{month:'long'}).format(d).toUpperCase(),year=d.getFullYear(),dayWords=typeof window.numberWords==='function'?window.numberWords(day):String(day);
  return `En fe de lo cual, de común acuerdo, firmamos el presente Contrato en el Municipio de Santa María, Departamento de La Paz, a los ${String(dayWords).toUpperCase()} (${String(day).padStart(2,'0')}) días del mes de ${month} del ${year}.`;
}
function projectText(p){const name=String(p?.name||'PROYECTO').toUpperCase(),location=String(p?.location||'').toUpperCase(),code=String(p?.code||'').toUpperCase(),parts=[name];if(location&&!name.includes(location))parts.push(location);if(code&&!name.includes(code))parts.push(code);return parts.join(', ').replace(/,\s*,/g,',').trim()}
function advanceAmount(c){const pct=N(c?.advanceRequestedPct),approved=N(c?.advanceApproved);return approved>0?approved:N(c?.originalAmount)*pct/100}
function advancePercent(c){const raw=c?.advanceRequestedPct;if(raw!==''&&raw!==null&&raw!==undefined&&Number.isFinite(Number(raw)))return Number(raw);const amount=N(c?.originalAmount||c?.currentAmount),approved=N(c?.advanceApproved);return amount>0&&approved>0?approved/amount*100:null}

function fingerprint(p,c){
  const data=JSON.stringify({p:[p?.code,p?.name,p?.location],c:[c?.number,c?.contractor,c?.originalAmount,c?.currentAmount,c?.signature,c?.start,c?.end,c?.executionDays,c?.advanceRequestedPct,c?.advanceApproved,c?.advancePaymentDate,c?.recoveryTarget],controls:controls(c),profile:profile(c,p)});
  let hash=2166136261;for(let i=0;i<data.length;i++){hash^=data.charCodeAt(i);hash=Math.imul(hash,16777619)}return(hash>>>0).toString(16).padStart(8,'0');
}
function documentState(p,c){const fp=fingerprint(p,c),docs=c?.paymentDocuments||{},contract=docs[DOC_CONTRACT]?.fingerprint===fp,remittance=docs[DOC_REMITTANCE]?.fingerprint===fp,startOrder=docs[DOC_START_ORDER]?.fingerprint===fp;return{fingerprint:fp,contract,remittance,startOrder,ready:contract&&remittance,docs}}
function documentLabel(ok,has){return ok?'Generado y actualizado':has?'Debe generarse nuevamente':'Pendiente de generar'}

function addCss(){
  if(document.getElementById('ccContractPaymentDocsCss'))return;
  const s=document.createElement('style');s.id='ccContractPaymentDocsCss';s.textContent=`
  .cc-payment-docs{margin:16px 0;padding:18px;border:1px solid #cbd8e3;border-radius:16px;background:linear-gradient(145deg,#f8fbfd,#eef5f8);box-shadow:0 10px 28px rgba(25,57,76,.08)}
  .cc-payment-docs-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.cc-payment-docs-head h3{margin:2px 0 4px;font-size:1.05rem}.cc-payment-docs-head p{margin:0;color:#617485;font-size:.88rem}.cc-payment-docs-kicker{font-size:.7rem;font-weight:800;letter-spacing:.1em;color:#0b6f89}.cc-payment-docs-badge{white-space:nowrap;border-radius:999px;padding:6px 10px;font-size:.74rem;font-weight:800;background:#fff3cd;color:#7a5a00}.cc-payment-docs-badge.ready{background:#dff4e8;color:#17643a}.cc-payment-docs-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.cc-payment-doc{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #d8e2ea;border-radius:12px;background:#fff}.cc-payment-doc i{width:11px;height:11px;border-radius:50%;background:#d39a25;box-shadow:0 0 0 4px #fff3d6}.cc-payment-doc.ready i{background:#26945a;box-shadow:0 0 0 4px #e1f6e9}.cc-payment-doc.stale i{background:#c84a4a;box-shadow:0 0 0 4px #fde5e5}.cc-payment-doc b,.cc-payment-doc small{display:block}.cc-payment-doc small{margin-top:2px;color:#6b7d8d}.cc-payment-doc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}.cc-payment-doc-note{margin-top:10px;padding:9px 11px;border-radius:10px;background:#fff;color:#506474;font-size:.82rem}.cc-payment-doc-note.blocked{background:#fff0f0;color:#8d3131}.cc-doc-profile-note{grid-column:1/-1;margin:0;padding:10px 12px;border-radius:10px;background:#edf6fb;color:#285d73;font-size:.84rem}
  @media(max-width:720px){.cc-payment-docs-head{display:block}.cc-payment-docs-badge{display:inline-block;margin-top:9px}.cc-payment-docs-grid{grid-template-columns:1fr}.cc-payment-doc-actions .btn{flex:1 1 100%}}
  `;document.head.appendChild(s);
}

function statusCard(p,c,compact=false){
  const s=documentState(p,c),hasContract=!!s.docs[DOC_CONTRACT],hasNote=!!s.docs[DOC_REMITTANCE],hasStartOrder=!!s.docs[DOC_START_ORDER],advanceOn=!['No solicitado','Rechazado'].includes(c?.advanceStatus||'No solicitado'),paid=(c?.advanceStatus||'')==='Pagado';
  return `<section class="cc-payment-docs" data-cc-payment-docs>
    <div class="cc-payment-docs-head"><div><span class="cc-payment-docs-kicker">EXPEDIENTE CONTRACTUAL</span><h3>Contrato, anticipo y orden de inicio</h3><p>Los tres formatos Word se completan con los datos registrados en este proyecto.</p></div><span class="cc-payment-docs-badge ${s.ready?'ready':''}">${s.ready?'LISTO PARA PAGO':'DOCUMENTACIÓN PENDIENTE'}</span></div>
    <div class="cc-payment-docs-grid">
      <div class="cc-payment-doc ${s.contract?'ready':hasContract?'stale':''}"><i></i><div><b>Contrato de obra</b><small>${documentLabel(s.contract,hasContract)}</small></div></div>
      <div class="cc-payment-doc ${s.remittance?'ready':hasNote?'stale':''}"><i></i><div><b>Nota de remisión de anticipo</b><small>${documentLabel(s.remittance,hasNote)}</small></div></div>
      <div class="cc-payment-doc ${s.startOrder?'ready':hasStartOrder?'stale':''}"><i></i><div><b>Orden de inicio</b><small>${documentLabel(s.startOrder,hasStartOrder)}</small></div></div>
    </div>
    ${compact?'':`<div class="cc-payment-doc-actions"><button class="btn" data-cc-doc-profile>Revisar datos</button><button class="btn" data-cc-doc-contract>Generar contrato Word</button><button class="btn" data-cc-doc-note>Generar nota Word</button><button class="btn" data-cc-doc-start>Generar orden de inicio Word</button><button class="btn primary" data-cc-doc-all>Generar expediente</button>${advanceOn&&!paid?`<button class="btn good" data-cc-doc-pay ${s.ready?'':'disabled'}>Registrar pago de anticipo</button>`:''}</div>`}
    <div class="cc-payment-doc-note ${advanceOn&&!s.ready?'blocked':''}">${paid&&!s.ready?'El anticipo figura pagado, pero el contrato y la nota de remisión deben actualizarse.':!advanceOn?'El contrato no registra una solicitud de anticipo. La orden de inicio se puede generar por separado.':s.ready?`El contrato y la nota están actualizados; ya se puede registrar el pago.${s.startOrder?' La orden de inicio también está generada.':' La orden de inicio puede generarse cuando se confirme su fecha oficial.'}`:'Primero genera el contrato y la nota de remisión; después se habilitará el registro del pago. La orden de inicio no bloquea este paso.'}</div>
    ${compact&&advanceOn&&!paid?`<div class="cc-payment-doc-actions"><button class="btn primary" data-cc-doc-open>${s.ready?'Registrar pago de anticipo':'Preparar documentos'}</button></div>`:''}
  </section>`;
}

function bindCard(root,p,c){
  root.querySelector('[data-cc-doc-profile]')?.addEventListener('click',()=>openProfile(p,c));
  root.querySelector('[data-cc-doc-contract]')?.addEventListener('click',()=>generate(p,c,DOC_CONTRACT));
  root.querySelector('[data-cc-doc-note]')?.addEventListener('click',()=>generate(p,c,DOC_REMITTANCE));
  root.querySelector('[data-cc-doc-start]')?.addEventListener('click',()=>generate(p,c,DOC_START_ORDER));
  root.querySelector('[data-cc-doc-all]')?.addEventListener('click',()=>generate(p,c,'all'));
  root.querySelector('[data-cc-doc-pay]')?.addEventListener('click',()=>openAdvancePayment(p,c));
  root.querySelector('[data-cc-doc-open]')?.addEventListener('click',()=>documentState(p,c).ready?openAdvancePayment(p,c):openProfile(p,c));
}
function decorateContract(p,c){if(!c)return;addCss();const body=document.getElementById('tabBody');if(!body||body.querySelector('[data-cc-payment-docs]'))return;const wrap=document.createElement('div');wrap.innerHTML=statusCard(p,c,false);const card=wrap.firstElementChild,summary=body.querySelector('.summary-grid');summary?summary.insertAdjacentElement('afterend',card):body.appendChild(card);bindCard(card,p,c)}
function decorateEstimates(p,c){if(!c)return;addCss();const body=document.getElementById('tabBody');if(!body||body.querySelector('[data-cc-payment-docs]'))return;const wrap=document.createElement('div');wrap.innerHTML=statusCard(p,c,true);const card=wrap.firstElementChild,head=body.querySelector('.panel-head');head?head.insertAdjacentElement('afterend',card):body.prepend(card);bindCard(card,p,c)}

function openProfile(p,c,afterSave=null){
  if(!c)return SAY('Primero guarda el contrato del proyecto.');
  const x=profile(c,p),ctl=controls(c),female=x.contractorGender!=='Masculino';
  const m=window.openModal('Datos para documentos contractuales',`${typeof window.projectContext==='function'?window.projectContext(p,c):''}<form id="ccDocProfileForm" class="form-grid">
    <p class="cc-doc-profile-note"><b>Estos datos se guardan con el contrato.</b> El nombre del proyecto, código, monto, porcentaje del anticipo y plazo se toman automáticamente del expediente. Revisa también los datos de la orden de inicio.</p>
    <label class="field"><span>Contratista</span><input id="ccdpContractor" required value="${H(c.contractor||'')}"></label>
    <label class="field"><span>Sexo gramatical</span><select id="ccdpGender" required><option value="">Seleccione</option><option>Femenino</option><option>Masculino</option></select></label>
    <label class="field"><span>DNI del contratista</span><input id="ccdpDni" required value="${H(x.contractorDni)}" placeholder="0000-0000-00000"></label>
    <label class="field"><span>Profesión u oficio</span><input id="ccdpProfession" required value="${H(x.contractorProfession)}"></label>
    <label class="field"><span>Estado civil</span><input id="ccdpCivil" required value="${H(x.contractorCivilStatus)}"></label>
    <label class="field"><span>Nacionalidad</span><input id="ccdpNationality" required value="${H(x.contractorNationality)}"></label>
    <label class="field wide"><span>Domicilio y residencia</span><input id="ccdpAddress" required value="${H(x.contractorAddress)}"></label>
    <label class="field"><span>Inscripción mercantil</span><input id="ccdpRegistry" value="${H(x.contractorRegistry)}" placeholder="Ej. 96"></label>
    <label class="field"><span>Tomo mercantil</span><input id="ccdpVolume" value="${H(x.contractorRegistryVolume)}" placeholder="Ej. 21"></label>
    <label class="field"><span>Fuente de financiamiento</span><input id="ccdpFinancing" required value="${H(ctl.financingSource||'')}"></label>
    <label class="field"><span>Fecha de la nota</span><input id="ccdpNoteDate" type="date" required value="${H(x.noteDate||T())}"></label>
    <label class="field"><span>Departamento del proyecto</span><input id="ccdpProjectDepartment" required value="${H(x.projectDepartment)}"></label>
    <label class="field"><span>Municipio del proyecto</span><input id="ccdpProjectMunicipality" required value="${H(x.projectMunicipality)}"></label>
    <label class="field"><span>Aldea / comunidad</span><input id="ccdpProjectVillage" required value="${H(x.projectVillage)}"></label>
    <label class="field"><span>Fecha oficial de inicio</span><input id="ccdpOfficialStart" type="date" required value="${H(x.officialStartDate||c.start||T())}"></label>
    <label class="field wide"><span>Representante legal del ejecutor (opcional)</span><input id="ccdpLegalRepresentative" value="${H(x.executorLegalRepresentative)}" placeholder="Nombre que aparecerá después de Representante Legal"></label>
    <label class="field"><span>Destinatario de Tesorería</span><input id="ccdpRecipient" required value="${H(x.treasuryRecipient)}"></label>
    <label class="field"><span>Cargo / departamento</span><input id="ccdpDepartment" required value="${H(x.treasuryDepartment)}"></label>
    <label class="field"><span>Nombre del alcalde</span><input id="ccdpMayor" required value="${H(x.mayorName)}"></label>
    <label class="field"><span>DNI del alcalde</span><input id="ccdpMayorDni" required value="${H(x.mayorDni)}"></label>
    <label class="field"><span>Supervisor firmante</span><input id="ccdpSupervisor" required value="${H(x.supervisorName)}"></label>
    <label class="field"><span>Unidad del supervisor</span><input id="ccdpUnit" required value="${H(x.supervisorUnit)}"></label>
    <div class="modal-actions"><button type="button" class="btn cancel">Cancelar</button><button class="btn primary">Guardar datos</button></div>
  </form>`);
  m.querySelector('#ccdpGender').value=female?'Femenino':'Masculino';
  m.querySelector('.cancel').onclick=()=>m.remove();
  m.querySelector('#ccDocProfileForm').onsubmit=e=>{
    e.preventDefault();
    c.contractor=m.querySelector('#ccdpContractor').value.trim();
    c.documentProfile={
      mayorName:m.querySelector('#ccdpMayor').value.trim(),mayorDni:m.querySelector('#ccdpMayorDni').value.trim(),contractorGender:m.querySelector('#ccdpGender').value,
      contractorDni:m.querySelector('#ccdpDni').value.trim(),contractorProfession:m.querySelector('#ccdpProfession').value.trim(),contractorCivilStatus:m.querySelector('#ccdpCivil').value.trim(),
      contractorNationality:m.querySelector('#ccdpNationality').value.trim(),contractorAddress:m.querySelector('#ccdpAddress').value.trim(),contractorRegistry:m.querySelector('#ccdpRegistry').value.trim(),
      contractorRegistryVolume:m.querySelector('#ccdpVolume').value.trim(),treasuryRecipient:m.querySelector('#ccdpRecipient').value.trim(),treasuryDepartment:m.querySelector('#ccdpDepartment').value.trim(),
      supervisorName:m.querySelector('#ccdpSupervisor').value.trim(),supervisorUnit:m.querySelector('#ccdpUnit').value.trim(),noteDate:m.querySelector('#ccdpNoteDate').value,
      projectDepartment:m.querySelector('#ccdpProjectDepartment').value.trim(),projectMunicipality:m.querySelector('#ccdpProjectMunicipality').value.trim(),projectVillage:m.querySelector('#ccdpProjectVillage').value.trim(),
      executorLegalRepresentative:m.querySelector('#ccdpLegalRepresentative').value.trim(),officialStartDate:m.querySelector('#ccdpOfficialStart').value
    };
    c.controls=Object.assign({},c.controls||{},{financingSource:m.querySelector('#ccdpFinancing').value.trim()});c.updatedAt=ISO();
    try{window.audit?.('CONFIGURAR','Documentos contractuales',c.id,{projectId:p.id,contractId:c.id});window.saveDB?.()}catch{}
    m.remove();try{window.renderProject?.()}catch{}SAY('Datos guardados para generar los documentos.');if(typeof afterSave==='function')setTimeout(afterSave,30);
  };
}

function missingProfile(c){const p=profile(c);return REQUIRED_PROFILE.filter(k=>!String(p[k]||'').trim())}
function missingStartOrderProfile(p,c){const x=profile(c,p);return['projectDepartment','projectMunicipality','projectVillage','officialStartDate'].filter(k=>!String(x[k]||'').trim())}
function openAdvancePayment(p,c){if(!documentState(p,c).ready)return SAY('Primero genera el contrato y la nota de remisión actualizados.');if(typeof window.contractModal!=='function')return;window.contractModal(p,c);setTimeout(()=>{const s=document.getElementById('cAdvanceStatus');if(!s)return;s.value='Pagado';s.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('cAdvPaid')?.focus();document.getElementById('cAdvPaid')?.scrollIntoView({behavior:'smooth',block:'center'})},20)}
function guardContractForm(p,c){const form=document.getElementById('contractForm');if(!form||form.dataset.ccDocGuard)return;form.dataset.ccDocGuard='1';form.addEventListener('submit',e=>{const status=document.getElementById('cAdvanceStatus')?.value;if(status!=='Pagado')return;if(!c){e.preventDefault();e.stopImmediatePropagation();return SAY('Guarda primero el contrato, genera el contrato y la nota de remisión y después registra el pago del anticipo.')}if(!documentState(p,c).ready){e.preventDefault();e.stopImmediatePropagation();SAY('No se puede registrar el pago: faltan el contrato y la nota de remisión actualizados.')}},true)}

function loadScript(url,test){return new Promise((resolve,reject)=>{if(test())return resolve();const found=[...document.scripts].find(s=>s.src===url);if(found){found.addEventListener('load',()=>test()?resolve():reject(new Error('No se cargó el generador.')),{once:true});found.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.src=url;s.async=true;s.onload=()=>test()?resolve():reject(new Error('No se cargó el generador.'));s.onerror=()=>reject(new Error('No se pudo cargar el generador Word.'));document.head.appendChild(s)})}
async function zipLib(){await loadScript(JSZIP_URL,()=>!!window.JSZip);return window.JSZip}
async function templateZip(path){const JSZip=await zipLib(),res=await fetch(new URL(path,document.baseURI));if(!res.ok)throw new Error(`No se encontró el formato base (${res.status}).`);return JSZip.loadAsync(await res.arrayBuffer())}
function replaceAllLiteral(text,from,to){return text.split(from).join(to)}
function replaceSequence(text,from,values){let out=text;for(const value of values){const pos=out.indexOf(from);if(pos<0)break;out=out.slice(0,pos)+value+out.slice(pos+from.length)}return out}

function contractReplacements(xml,p,c){
  const pf=profile(c,p),ctl=controls(c),amount=N(c.originalAmount||c.currentAmount||p.budget),adv=advanceAmount(c),advPct=advancePercent(c),performancePct=Number(ctl.performanceGuaranteePct),performance=amount*performancePct/100,penaltyPct=Number(ctl.penaltyDailyPct),penalty=amount*penaltyPct/100;
  const treatment=pf.contractorGender==='Masculino'?'el señor':'la señora';
  const registry=pf.contractorRegistry?`debidamente inscrito${pf.contractorGender==='Femenino'?'a':''} bajo el número de inscripción ${pf.contractorRegistry}${pf.contractorRegistryVolume?`, tomo ${pf.contractorRegistryVolume}`:''}, registro mercantil de La Paz`:'debidamente registrado conforme a la documentación que integra el expediente contractual';
  let out=xml;
  out=replaceAllLiteral(out,'EDWIN ALBERTO NICOLAS MORALES',X(String(pf.mayorName).toUpperCase()));
  out=replaceAllLiteral(out,'No. 1217-1979-00268,',`No. ${X(pf.mayorDni)},`);
  out=replaceAllLiteral(out,'por una parte, y por la otra, la señora ',`por una parte, y por la otra, ${X(treatment)} `);
  out=replaceAllLiteral(out,'Ing. Norma Luhatany Medina Ramos',X(c.contractor||''));
  out=replaceAllLiteral(out,'ING. NORMA LUHATANY MEDINA RAMOS',X(String(c.contractor||'').toUpperCase()));
  out=replaceAllLiteral(out,'debidamente inscrita bajo el número inscripción 96, tomo 21, registro mercantil de La Paz',X(registry));
  out=replaceAllLiteral(out,'mayor de edad, de profesión Ingeniero Civil, hondureño, soltera, con tarjeta de identidad ',`mayor de edad, de profesión ${X(pf.contractorProfession)}, ${X(pf.contractorNationality)}, ${X(pf.contractorCivilStatus)}, con tarjeta de identidad `);
  out=replaceAllLiteral(out,'No. 1218-1988-00059',`No. ${X(pf.contractorDni)}`);
  out=replaceAllLiteral(out,'con domicilio en Residencial La Orquidea, La Paz',`con domicilio y residencia en ${X(pf.contractorAddress)}`);
  out=replaceAllLiteral(out,'CONSTRUCCIÓN DE PAVIMENTO CALLE DEL COLEGIO HACIA CALLE PRINCIPAL, BO. EL CENTRO SANTA MARIA, COT121706-2026, ',`${X(projectText(p))}, `);
  out=replaceAllLiteral(out,'DOS MILLONES TRESCIENTOS SIETE MIL SEISCIENTOS TREINTA Y NUEVE 52/100 LEMPIRAS (L. 2,307,639.52) ',`${X(wordsAmount(amount))} `);
  out=replaceAllLiteral(out,'procedentes de la fuente Fondos Municipales',`procedentes de la fuente ${X(ctl.financingSource||'')}`);
  const oldAdvance='TRESCIENTOS CUARENTA Y SEIS MIL CIENTO CUARENTA Y CINCO 93/100 LEMPIRAS (L. 346,145.93) ';
  out=replaceSequence(out,oldAdvance,[`${X(wordsAmount(adv))} `,`${X(wordsAmount(adv))} `,`${X(wordsAmount(performance))} `]);
  out=replaceAllLiteral(out,'equivalente al 15',`equivalente al ${X(String(advPct))}`);
  out=replaceAllLiteral(out,'NOVENTA DÍAS (90) ',`${X(wordsDays(c.executionDays))} `);
  out=replaceAllLiteral(out,' CUATRO MIL CIENTO CINCUENTA Y TRES LEMPIRAS CON 75/100 LEMPIRAS (L. 4,153.75)',` ${X(wordsAmount(penalty))}`);
  out=replaceAllLiteral(out,'0.18%',`${X(String(penaltyPct))}%`);
  out=replaceAllLiteral(out,'equivalente al 15%',`equivalente al ${X(String(performancePct))}%`);
  out=replaceAllLiteral(out,'En fe de lo cual, de común acuerdo, firmamos el presente Contrato en el Municipio de Santa María, Departamento de La Paz, a los CINCO (05) Días Del Mes De AGOSTO Del 2026.',X(contractSignatureText(c.signature||T())));
  return out;
}

function noteReplacements(xml,p,c){
  const pf=profile(c),amount=N(c.originalAmount||c.currentAmount||p.budget),adv=advanceAmount(c);let out=xml;
  out=replaceAllLiteral(out,'Santa María la Paz, miércoles 12 de agosto de 2026',X(longDate(pf.noteDate||T())));
  out=replaceAllLiteral(out,'ALDO ANTONIO VASQUEZ NICOLAS ',`${X(String(pf.treasuryRecipient).toUpperCase())} `);
  out=replaceAllLiteral(out,'DEPARTAMENTO DE TESORERÍA',X(String(pf.treasuryDepartment).toUpperCase()));
  out=replaceAllLiteral(out,'CONSTRUCCIÓN DE PAVIMENTO CALLE DEL COLEGIO HACIA CALLE PRINCIPAL, BO. EL CENTRO SANTA MARIA, COT121706-2026, ',`${X(projectText(p))}, `);
  out=replaceAllLiteral(out,'de lo que se da fe que la documentación esta verificada. Actuando como supervisor Municipal de proyectos de la ',X('de lo que se da fe que la documentación está verificada. Actuando como supervisor municipal de proyectos de la '));
  out=replaceAllLiteral(out,' DOS MILLONES TRESCIENTOS SIETE MIL SEISCIENTOS TREINTA Y NUEVE 52/100 LEMPIRAS (L. 2,307,639.52). ',` ${X(wordsAmount(amount))}. `);
  out=replaceAllLiteral(out,' TRESCIENTOS CUARENTA Y SEIS MIL CIENTO CUARENTA Y CINCO 93/100 LEMPIRAS (L. 346,145.93).',` ${X(wordsAmount(adv))}.`);
  out=replaceAllLiteral(out,'ING. NORMA LUHATANY MEDINA RAMOS',X(String(c.contractor||'').toUpperCase()));
  out=replaceAllLiteral(out,'ING. LUIS FERNANDO AMADOR PORTILLO',X(String(pf.supervisorName).toUpperCase()));
  out=replaceAllLiteral(out,'UNIDAD DE PROYECTOS',X(String(pf.supervisorUnit).toUpperCase()));
  return out;
}

function replaceLogicalText(xml,from,to,limit=Infinity){
  if(String(from)===String(to??''))return xml;
  const parser=new DOMParser(),serializer=new XMLSerializer(),doc=parser.parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror'))throw new Error('El formato de la orden de inicio no se pudo interpretar.');
  let nodes=[...doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','t')],joined=nodes.map(n=>n.textContent||'').join(''),searchFrom=0,pos=joined.indexOf(from,searchFrom),count=0;
  while(pos>=0&&count<limit){
    const end=pos+from.length;let cursor=0,startNode=null,endNode=null,startOffset=0,endOffset=0;
    for(const node of nodes){const length=(node.textContent||'').length,next=cursor+length;if(startNode===null&&pos>=cursor&&pos<next){startNode=node;startOffset=pos-cursor}if(end>cursor&&end<=next){endNode=node;endOffset=end-cursor;break}cursor=next}
    if(!startNode||!endNode)break;
    if(startNode===endNode)startNode.textContent=(startNode.textContent||'').slice(0,startOffset)+String(to??'')+(startNode.textContent||'').slice(endOffset);
    else{let clearing=false;for(const node of nodes){if(node===startNode){node.textContent=(node.textContent||'').slice(0,startOffset)+String(to??'');clearing=true;continue}if(!clearing)continue;if(node===endNode){node.textContent=(node.textContent||'').slice(endOffset);break}node.textContent=''}}
    nodes=[...doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','t')];joined=nodes.map(n=>n.textContent||'').join('');searchFrom=pos+String(to??'').length;pos=joined.indexOf(from,searchFrom);count++;
  }
  return serializer.serializeToString(doc);
}

function startOrderReplacements(xml,p,c){
  const pf=profile(c,p),ctl=controls(c),executor=String(c.contractor||'').toUpperCase(),representative=String(pf.executorLegalRepresentative||'').trim(),executorLine=representative?`${executor} Con Representante Legal, ${String(representative).toUpperCase()}`:executor;
  const values=[
    ['AMPLIACIÓN PROYECTO DE ELECTRIFICACIÓN, ARENALES, SECTOR LOS GUZMÁN COT121705-2026',projectText(p)],
    ['COT121705-2026',String(p.code||'').toUpperCase()],
    ['LA PAZ',String(pf.projectDepartment||'').toUpperCase()],
    ['SANTA MARÍA',String(pf.projectMunicipality||'').toUpperCase()],
    ['ARENALES',String(pf.projectVillage||'').toUpperCase()],
    ['INGEDEM CONSTRUCTORES SOCIEDAD DE RESPONSABILIDAD LIMITADA Con Represéntate Legal, ING. JORGE MOISÉS GONZÁLEZ ESCOBAR',executorLine],
    ['FONDOS MUNICIPALES',String(ctl.financingSource||'').toUpperCase()],
    ['Ing. Edwin Alberto Nicolas Morales',engineerSignature(pf.mayorName)],
    ['Ing. Luis Fernando Amador P.',engineerSignature(pf.supervisorName)],
    ['INGEDEM CONSTRUCTORES SOCIEDAD DE RESPONSABILIDAD LIMITADA',executor]
  ];
  let out=xml;for(const[from,to]of values)out=replaceLogicalText(out,from,to);
  out=replaceLogicalText(out,'_____________________________',officialDate(pf.officialStartDate||c.start||T()),1);
  const parser=new DOMParser(),serializer=new XMLSerializer(),doc=parser.parseFromString(out,'application/xml'),body=doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','body')[0];
  if(body){
    const signatureTable=[...body.children].find(n=>n.localName==='tbl'&&String(n.textContent||'').includes('ALCALDE MUNICIPAL'));let removed=0,previous=signatureTable?.previousElementSibling;
    while(previous?.localName==='p'&&!String(previous.textContent||'').trim()&&removed<4){const current=previous;previous=current.previousElementSibling;body.removeChild(current);removed++}
  }
  return serializer.serializeToString(doc);
}

async function buildDocument(p,c,kind){
  const path=kind===DOC_CONTRACT?TEMPLATE_CONTRACT:kind===DOC_REMITTANCE?TEMPLATE_REMITTANCE:TEMPLATE_START_ORDER,zip=await templateZip(path),entry=zip.file('word/document.xml');
  if(!entry)throw new Error('El formato base no contiene el documento principal.');
  const xml=await entry.async('text'),next=kind===DOC_CONTRACT?contractReplacements(xml,p,c):kind===DOC_REMITTANCE?noteReplacements(xml,p,c):startOrderReplacements(xml,p,c);zip.file('word/document.xml',next);
  const core=zip.file('docProps/core.xml');if(core){let meta=await core.async('text'),title=kind===DOC_CONTRACT?'Contrato de obra':kind===DOC_REMITTANCE?'Nota de remisión de anticipo':'Orden de inicio';meta=meta.replace(/<dc:title>[\s\S]*?<\/dc:title>/,`<dc:title>${X(title)}</dc:title>`);zip.file('docProps/core.xml',meta)}
  return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE'});
}

function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1800)}
function markGenerated(p,c,kind,filename){c.paymentDocuments=c.paymentDocuments||{};c.paymentDocuments[kind]={generatedAt:ISO(),fingerprint:fingerprint(p,c),filename};try{const label=kind===DOC_CONTRACT?'Contrato':kind===DOC_REMITTANCE?'Nota de remisión':'Orden de inicio';window.audit?.('GENERAR DOCUMENTO',label,c.id,{projectId:p.id,contractId:c.id,document:filename});window.saveDB?.()}catch{}}

async function generate(p,c,kind){
  if(!c)return SAY('Primero registra el contrato.');
  const safetyIssues=window.__ccContractDocumentSafety?.validate?.(kind,p,c)||[];if(safetyIssues.length)return SAY('Documento bloqueado por control contractual: '+safetyIssues[0]+(safetyIssues.length>1?' ('+safetyIssues.length+' revisiones pendientes)':''));
  if(missingProfile(c).length)return openProfile(p,c,()=>generate(p,c,kind));
  if((kind===DOC_START_ORDER||kind==='all')&&missingStartOrderProfile(p,c).length)return openProfile(p,c,()=>generate(p,c,kind));
  if(advanceAmount(c)<=0&&(kind===DOC_REMITTANCE||kind==='all'))return SAY('El contrato no tiene un anticipo solicitado o aprobado para generar la remisión.');
  const button=document.activeElement instanceof HTMLButtonElement?document.activeElement:null,old=button?.textContent;if(button){button.disabled=true;button.textContent='Generando…'}
  try{
    const code=FILE(p.code||'proyecto');
    if(kind==='all'){
      const JSZip=await zipLib(),bundle=new JSZip(),contractName=`Contrato-${code}.docx`,noteName=`Nota-remision-anticipo-${code}.docx`,startName=`Orden-inicio-${code}.docx`;
      const[contractBlob,noteBlob,startBlob]=await Promise.all([buildDocument(p,c,DOC_CONTRACT),buildDocument(p,c,DOC_REMITTANCE),buildDocument(p,c,DOC_START_ORDER)]);
      bundle.file(contractName,contractBlob);bundle.file(noteName,noteBlob);bundle.file(startName,startBlob);download(await bundle.generateAsync({type:'blob',compression:'DEFLATE'}),`Expediente-contractual-${code}.zip`);
      markGenerated(p,c,DOC_CONTRACT,contractName);markGenerated(p,c,DOC_REMITTANCE,noteName);markGenerated(p,c,DOC_START_ORDER,startName);SAY('Contrato, nota de remisión y orden de inicio generados. El anticipo ya puede pasar a registro de pago.');
    }else{
      const filename=kind===DOC_CONTRACT?`Contrato-${code}.docx`:kind===DOC_REMITTANCE?`Nota-remision-anticipo-${code}.docx`:`Orden-inicio-${code}.docx`;
      download(await buildDocument(p,c,kind),filename);markGenerated(p,c,kind,filename);SAY(kind===DOC_CONTRACT?'Contrato Word generado.':kind===DOC_REMITTANCE?'Nota de remisión Word generada.':'Orden de inicio Word generada.');
    }
    try{window.renderProject?.()}catch{}
  }catch(err){console.error('contract-payment-documents',err);SAY(`No se pudo generar el documento: ${err?.message||err}`)}finally{if(button){button.disabled=false;button.textContent=old}}
}

function install(){
  addCss();
  if(typeof window.renderContract==='function'&&!window.renderContract.__ccPaymentDocs){const original=window.renderContract;window.renderContract=function(p,c,...rest){const out=original.call(this,p,c,...rest);setTimeout(()=>decorateContract(p,c),0);return out};window.renderContract.__ccPaymentDocs=true}
  if(typeof window.renderEstimates==='function'&&!window.renderEstimates.__ccPaymentDocs){const original=window.renderEstimates;window.renderEstimates=function(p,c,...rest){const out=original.call(this,p,c,...rest);setTimeout(()=>decorateEstimates(p,c),0);return out};window.renderEstimates.__ccPaymentDocs=true}
  if(typeof window.contractModal==='function'&&!window.contractModal.__ccPaymentDocs){const original=window.contractModal;window.contractModal=function(p,c,...rest){const out=original.call(this,p,c,...rest);setTimeout(()=>guardContractForm(p,c),0);return out};window.contractModal.__ccPaymentDocs=true}
}

install();
window.ccContractPaymentDocuments={openProfile,generate,documentState,decorateContract,decorateEstimates};
})();
