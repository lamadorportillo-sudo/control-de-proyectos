/* Descarga manual directa de documentos contractuales */
(()=>{
'use strict';
if(window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V1__)return;
window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V1__=true;

const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(v)||0;
const M=v=>`L. ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const F=v=>{if(!v)return '';const d=new Date(`${String(v).slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat('es-HN',{day:'2-digit',month:'long',year:'numeric'}).format(d)};
const clean=v=>String(v||'documento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,80)||'documento';
const notice=m=>typeof window.toast==='function'?window.toast(m):alert(m);

function appDB(){try{return db||null}catch{return window.db||window.DB||null}}
function appView(){try{return view||null}catch{return window.view||null}}
function context(){
  const d=appDB()||{},v=appView()||{},projects=Array.isArray(d.projects)?d.projects:[],contracts=Array.isArray(d.contracts)?d.contracts:[];
  const projectId=v.projectId||window.currentProjectId||window.selectedProjectId||window.activeProjectId;
  const p=projects.find(x=>String(x.id)===String(projectId));
  const c=p?contracts.filter(x=>String(x.projectId)===String(p.id)&&!x.voidedAt&&!x.voided_at).slice(-1)[0]:null;
  return {p,c};
}
function profile(p,c){
  const saved=c?.documentProfile&&typeof c.documentProfile==='object'?c.documentProfile:{};
  const code=String(p?.code||'').toUpperCase();
  const school=code.includes('COT121706-2026');
  return Object.assign({
    mayorName:'EDWIN ALBERTO NICOLAS MORALES',mayorDni:'1217-1979-00268',
    contractorDni:school?'1218-1988-00059':'',contractorProfession:'Ingeniero Civil',
    contractorCivilStatus:'soltera',contractorNationality:'hondureña',
    contractorAddress:school?'Residencial La Orquidea, La Paz':'',
    contractorRegistry:school?'96':'',contractorRegistryVolume:school?'21':'',
    treasuryRecipient:'ALDO ANTONIO VASQUEZ NICOLAS',treasuryDepartment:'DEPARTAMENTO DE TESORERÍA',
    supervisorName:'ING. LUIS FERNANDO AMADOR PORTILLO',supervisorUnit:'UNIDAD DE PROYECTOS',
    projectMunicipality:'Santa María',projectDepartment:'La Paz',officialStartDate:c?.start||''
  },saved);
}
function amountAdvance(c){return N(c?.advanceApproved)>0?N(c.advanceApproved):N(c?.originalAmount)*N(c?.advanceRequestedPct)/100}
function page(title,body){return `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${E(title)}</title><style>@page{size:letter;margin:2cm}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.45;color:#111}h1{text-align:center;font-size:14pt;margin:0 0 16px}h2{font-size:11pt;text-align:center;margin:0 0 14px}.head{text-align:center;margin-bottom:20px}.head b{display:block;font-size:13pt}.meta{width:100%;border-collapse:collapse;margin:12px 0}.meta td{border:1px solid #999;padding:6px;vertical-align:top}.p{text-align:justify;margin:0 0 10px}.sig{width:100%;margin-top:48px;border-collapse:collapse}.sig td{width:50%;text-align:center;padding:0 18px}.line{border-top:1px solid #111;padding-top:6px}.right{text-align:right}.center{text-align:center}</style></head><body>${body}</body></html>`}
function commonHead(){return `<div class="head"><b>MUNICIPALIDAD DE SANTA MARÍA, LA PAZ</b><span>UNIDAD DE PROYECTOS</span></div>`}
function contractDoc(p,c){
  const pf=profile(p,c),advance=amountAdvance(c),pct=N(c.advanceRequestedPct)||15,days=N(c.executionDays)||90,pen=N(c?.controls?.penaltyDailyPct)||0.18,penAmount=N(c.originalAmount)*pen/100;
  return page('Contrato de obra',`${commonHead()}<h1>CONTRATO DE OBRA</h1><h2>${E(String(p.name||'').toUpperCase())}<br>${E(String(p.code||'').toUpperCase())}</h2><table class="meta"><tr><td><b>Contratante:</b><br>${E(pf.mayorName)}<br>DNI ${E(pf.mayorDni)}</td><td><b>Contratista:</b><br>${E(c.contractor||'')}<br>${pf.contractorDni?`DNI ${E(pf.contractorDni)}`:''}</td></tr><tr><td><b>Monto contractual:</b><br>${M(c.originalAmount)}</td><td><b>Plazo:</b><br>${days} días calendario</td></tr><tr><td><b>Anticipo:</b><br>${pct}% — ${M(advance)}</td><td><b>Fecha de firma:</b><br>${E(F(c.signature))}</td></tr></table><p class="p"><b>PRIMERA: OBJETO.</b> El presente contrato tiene por objeto la ejecución del proyecto indicado, conforme a los documentos contractuales, presupuesto, especificaciones técnicas y demás disposiciones aplicables.</p><p class="p"><b>SEGUNDA: MONTO.</b> El valor contractual asciende a ${M(c.originalAmount)}.</p><p class="p"><b>TERCERA: ANTICIPO.</b> Se reconoce un anticipo del ${pct}% equivalente a ${M(advance)}, sujeto a las garantías y condiciones registradas en el expediente contractual.</p><p class="p"><b>CUARTA: PLAZO.</b> El plazo de ejecución es de ${days} días calendario, contado a partir de la orden de inicio.</p><p class="p"><b>QUINTA: MULTA POR ATRASO.</b> En caso de retraso imputable al contratista se aplicará una multa diaria del ${pen.toFixed(2)}% sobre el monto contractual, equivalente actualmente a ${M(penAmount)} por día.</p><p class="p"><b>SEXTA: GARANTÍAS.</b> Se aplicarán las garantías de anticipo, cumplimiento y calidad establecidas en el contrato y registradas en el sistema.</p><p class="p"><b>SÉPTIMA: MODIFICACIONES.</b> Cualquier modificación deberá formalizarse mediante los instrumentos contractuales correspondientes y con la autorización competente.</p><p class="p"><b>OCTAVA: SUPERVISIÓN.</b> La obra estará sujeta a supervisión técnica municipal y a las instrucciones formalmente emitidas durante la ejecución.</p><p class="p">En fe de lo cual, las partes firman el presente contrato en Santa María, La Paz, en la fecha registrada en el expediente.</p><table class="sig"><tr><td><div class="line">${E(pf.mayorName)}<br>ALCALDE MUNICIPAL</div></td><td><div class="line">${E(c.contractor||'')}<br>CONTRATISTA</div></td></tr></table>`)}
function noteDoc(p,c){
  const pf=profile(p,c),advance=amountAdvance(c),pct=N(c.advanceRequestedPct)||15;
  return page('Nota de remisión de anticipo',`${commonHead()}<div class="right">Santa María, La Paz, ${E(F(pf.noteDate||new Date().toISOString().slice(0,10)))}</div><h1>NOTA DE REMISIÓN DE ANTICIPO</h1><p><b>Señor:</b><br>${E(pf.treasuryRecipient)}<br>${E(pf.treasuryDepartment)}<br>Presente.</p><p class="p">Por medio de la presente se remite la documentación correspondiente al anticipo del proyecto <b>${E(String(p.name||'').toUpperCase())}</b>, código <b>${E(String(p.code||'').toUpperCase())}</b>, contratado con <b>${E(c.contractor||'')}</b>.</p><table class="meta"><tr><td><b>Monto del contrato</b></td><td>${M(c.originalAmount)}</td></tr><tr><td><b>Porcentaje de anticipo</b></td><td>${pct.toFixed(2)}%</td></tr><tr><td><b>Monto del anticipo</b></td><td>${M(advance)}</td></tr></table><p class="p">Se solicita realizar el trámite correspondiente conforme a la documentación contractual y garantías que obran en el expediente.</p><p>Atentamente,</p><table class="sig"><tr><td></td><td><div class="line">${E(pf.supervisorName)}<br>${E(pf.supervisorUnit)}</div></td></tr></table>`)}
function startDoc(p,c){
  const pf=profile(p,c),start=pf.officialStartDate||c.start||'';
  return page('Orden de inicio',`${commonHead()}<h1>ORDEN DE INICIO</h1><table class="meta"><tr><td><b>Proyecto</b></td><td>${E(String(p.name||'').toUpperCase())}</td></tr><tr><td><b>Código</b></td><td>${E(String(p.code||'').toUpperCase())}</td></tr><tr><td><b>Contratista</b></td><td>${E(c.contractor||'')}</td></tr><tr><td><b>Monto contractual</b></td><td>${M(c.originalAmount)}</td></tr><tr><td><b>Fecha oficial de inicio</b></td><td>${E(F(start))}</td></tr><tr><td><b>Plazo contractual</b></td><td>${N(c.executionDays)||90} días calendario</td></tr></table><p class="p">Por medio de la presente se autoriza y ordena el inicio de los trabajos correspondientes al proyecto antes descrito, debiendo el contratista ejecutar las obras de conformidad con el contrato, presupuesto, especificaciones técnicas, instrucciones de supervisión y demás documentos que integran el expediente contractual.</p><p class="p">El plazo contractual comenzará a computarse a partir de la fecha oficial de inicio indicada en este documento.</p><table class="sig"><tr><td><div class="line">${E(pf.mayorName)}<br>ALCALDE MUNICIPAL</div></td><td><div class="line">${E(pf.supervisorName)}<br>SUPERVISOR</div></td></tr><tr><td colspan="2" style="padding-top:45px"><div class="line">${E(c.contractor||'')}<br>CONTRATISTA</div></td></tr></table>`)}
function saveWord(html,name,button){
  const blob=new Blob(['\ufeff',html],{type:'application/msword;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  if(button){const old=button.innerHTML;button.innerHTML='✓ Descargado';setTimeout(()=>button.innerHTML=old,1400)}
  notice(`Descarga iniciada: ${name}`);
}
function direct(kind,button){
  const {p,c}=context();if(!p||!c)return notice('No se pudo identificar el proyecto y contrato activos.');
  const code=clean(p.code||'proyecto');
  if(kind==='contract')return saveWord(contractDoc(p,c),`Contrato-${code}.doc`,button);
  if(kind==='note'){if(amountAdvance(c)<=0)return notice('Este contrato no tiene anticipo registrado.');return saveWord(noteDoc(p,c),`Nota-remision-anticipo-${code}.doc`,button)}
  return saveWord(startDoc(p,c),`Orden-inicio-${code}.doc`,button);
}
function addCss(){
  if(document.getElementById('ccContractDownloadActionsCss'))return;const s=document.createElement('style');s.id='ccContractDownloadActionsCss';s.textContent=`
  .cc-payment-docs-head h3{color:#163247!important;font-weight:850!important}.cc-payment-docs-head p{color:#4c6478!important}.cc-payment-docs-kicker{color:#0b6f89!important}.cc-payment-doc b{color:#18384a!important}.cc-payment-doc small{color:#60798f!important}
  .cc-doc-downloads{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}.cc-doc-download{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #cbd8e3;border-radius:12px;background:#fff}.cc-doc-download span{font-size:.82rem;color:#496172}.cc-doc-download b{display:block;color:#18384a;margin-bottom:2px}.cc-doc-download button{white-space:nowrap}@media(max-width:720px){.cc-doc-downloads{grid-template-columns:1fr}.cc-doc-download{align-items:flex-start;flex-direction:column}.cc-doc-download button{width:100%}}`;
  document.head.appendChild(s);
}
function decorate(card){
  if(!card)return;addCss();card.querySelectorAll('.cc-payment-doc small').forEach(x=>x.textContent='Listo para descargar');
  let box=card.querySelector('[data-cc-manual-downloads]');
  if(!box){box=document.createElement('div');box.className='cc-doc-downloads';box.setAttribute('data-cc-manual-downloads','');const actions=card.querySelector('.cc-payment-doc-actions');actions?actions.insertAdjacentElement('afterend',box):card.appendChild(box)}
  box.innerHTML=`<div class="cc-doc-download"><span><b>Contrato de obra</b>Descargar manualmente en Word</span><button class="btn" type="button" data-download-contract>↓ Descargar</button></div><div class="cc-doc-download"><span><b>Nota de remisión</b>Descargar manualmente en Word</span><button class="btn" type="button" data-download-note>↓ Descargar</button></div><div class="cc-doc-download"><span><b>Orden de inicio</b>Descargar manualmente en Word</span><button class="btn" type="button" data-download-start>↓ Descargar</button></div>`;
  box.querySelector('[data-download-contract]').onclick=e=>direct('contract',e.currentTarget);
  box.querySelector('[data-download-note]').onclick=e=>direct('note',e.currentTarget);
  box.querySelector('[data-download-start]').onclick=e=>direct('start',e.currentTarget);
}
function scan(){document.querySelectorAll('[data-cc-payment-docs]').forEach(decorate)}
scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();