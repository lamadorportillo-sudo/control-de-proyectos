/* Descarga manual directa de documentos contractuales V2 */
(()=>{
'use strict';
if(window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V2__)return;
window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V2__=true;

const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(v)||0;
const M=v=>`L. ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const F=v=>{if(!v)return '';const d=new Date(`${String(v).slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat('es-HN',{day:'2-digit',month:'long',year:'numeric'}).format(d)};
const clean=v=>String(v||'documento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,80)||'documento';
const notice=m=>typeof window.toast==='function'?window.toast(m):alert(m);

function resolveContext(){
  let p=null,c=null;
  try{if(typeof getProject==='function')p=getProject()}catch{}
  try{if(p&&typeof getContract==='function')c=getContract(p)}catch{}
  if(p&&c)return {p,c};
  let d=null,v=null;
  try{d=db}catch{d=window.db||window.DB||null}
  try{v=view}catch{v=window.view||null}
  d=d||window.db||window.DB||{};v=v||window.view||{};
  const projects=Array.isArray(d.projects)?d.projects:[],contracts=Array.isArray(d.contracts)?d.contracts:[];
  const projectId=v.projectId||window.currentProjectId||window.selectedProjectId||window.activeProjectId;
  p=p||projects.find(x=>String(x.id)===String(projectId));
  c=c||(p?contracts.filter(x=>String(x.projectId)===String(p.id)&&!x.voidedAt&&!x.voided_at).slice(-1)[0]:null);
  return {p,c};
}

function profile(p,c){
  const saved=c?.documentProfile&&typeof c.documentProfile==='object'?c.documentProfile:{};
  const school=String(p?.code||'').toUpperCase().includes('COT121706-2026');
  return Object.assign({
    mayorName:'EDWIN ALBERTO NICOLAS MORALES',mayorDni:'1217-1979-00268',
    contractorDni:school?'1218-1988-00059':'',
    treasuryRecipient:'ALDO ANTONIO VASQUEZ NICOLAS',treasuryDepartment:'DEPARTAMENTO DE TESORERÍA',
    supervisorName:'ING. LUIS FERNANDO AMADOR PORTILLO',supervisorUnit:'UNIDAD DE PROYECTOS',
    officialStartDate:c?.start||''
  },saved);
}
function advance(c){return N(c?.advanceApproved)>0?N(c.advanceApproved):N(c?.originalAmount)*N(c?.advanceRequestedPct)/100}
function page(title,body){return `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${E(title)}</title><style>@page{size:letter;margin:2cm}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.45;color:#111}h1{text-align:center;font-size:14pt;margin:0 0 16px}h2{text-align:center;font-size:11pt;margin:0 0 14px}.head{text-align:center;margin-bottom:20px}.head b{display:block;font-size:13pt}.meta{width:100%;border-collapse:collapse;margin:12px 0}.meta td{border:1px solid #999;padding:6px;vertical-align:top}.p{text-align:justify;margin:0 0 10px}.sig{width:100%;margin-top:48px;border-collapse:collapse}.sig td{width:50%;text-align:center;padding:0 18px}.line{border-top:1px solid #111;padding-top:6px}.right{text-align:right}</style></head><body>${body}</body></html>`}
const head=()=>`<div class="head"><b>MUNICIPALIDAD DE SANTA MARÍA, LA PAZ</b><span>UNIDAD DE PROYECTOS</span></div>`;
function contractDoc(p,c){const pf=profile(p,c),adv=advance(c),pct=N(c.advanceRequestedPct)||15,days=N(c.executionDays)||90,pen=N(c?.controls?.penaltyDailyPct)||.18,penAmount=N(c.originalAmount)*pen/100;return page('Contrato de obra',`${head()}<h1>CONTRATO DE OBRA</h1><h2>${E(String(p.name||'').toUpperCase())}<br>${E(String(p.code||'').toUpperCase())}</h2><table class="meta"><tr><td><b>Contratante:</b><br>${E(pf.mayorName)}<br>DNI ${E(pf.mayorDni)}</td><td><b>Contratista:</b><br>${E(c.contractor||'')}${pf.contractorDni?`<br>DNI ${E(pf.contractorDni)}`:''}</td></tr><tr><td><b>Monto contractual:</b><br>${M(c.originalAmount)}</td><td><b>Plazo:</b><br>${days} días calendario</td></tr><tr><td><b>Anticipo:</b><br>${pct}% — ${M(adv)}</td><td><b>Fecha de firma:</b><br>${E(F(c.signature))}</td></tr></table><p class="p"><b>PRIMERA: OBJETO.</b> El presente contrato tiene por objeto la ejecución del proyecto indicado conforme a los documentos contractuales y especificaciones aplicables.</p><p class="p"><b>SEGUNDA: MONTO.</b> El valor contractual asciende a ${M(c.originalAmount)}.</p><p class="p"><b>TERCERA: ANTICIPO.</b> Se reconoce un anticipo del ${pct}% equivalente a ${M(adv)}.</p><p class="p"><b>CUARTA: PLAZO.</b> El plazo de ejecución es de ${days} días calendario contado a partir de la orden de inicio.</p><p class="p"><b>QUINTA: MULTA POR ATRASO.</b> Se aplicará una multa diaria del ${pen.toFixed(2)}%, equivalente a ${M(penAmount)} por día.</p><table class="sig"><tr><td><div class="line">${E(pf.mayorName)}<br>ALCALDE MUNICIPAL</div></td><td><div class="line">${E(c.contractor||'')}<br>CONTRATISTA</div></td></tr></table>`)}
function noteDoc(p,c){const pf=profile(p,c),adv=advance(c),pct=N(c.advanceRequestedPct)||15;return page('Nota de remisión de anticipo',`${head()}<div class="right">Santa María, La Paz, ${E(F(pf.noteDate||new Date().toISOString().slice(0,10)))}</div><h1>NOTA DE REMISIÓN DE ANTICIPO</h1><p><b>Señor:</b><br>${E(pf.treasuryRecipient)}<br>${E(pf.treasuryDepartment)}<br>Presente.</p><p class="p">Se remite la documentación correspondiente al anticipo del proyecto <b>${E(String(p.name||'').toUpperCase())}</b>, código <b>${E(String(p.code||'').toUpperCase())}</b>, contratado con <b>${E(c.contractor||'')}</b>.</p><table class="meta"><tr><td><b>Monto del contrato</b></td><td>${M(c.originalAmount)}</td></tr><tr><td><b>Porcentaje de anticipo</b></td><td>${pct.toFixed(2)}%</td></tr><tr><td><b>Monto del anticipo</b></td><td>${M(adv)}</td></tr></table><p>Atentamente,</p><table class="sig"><tr><td></td><td><div class="line">${E(pf.supervisorName)}<br>${E(pf.supervisorUnit)}</div></td></tr></table>`)}
function startDoc(p,c){const pf=profile(p,c),start=pf.officialStartDate||c.start||'';return page('Orden de inicio',`${head()}<h1>ORDEN DE INICIO</h1><table class="meta"><tr><td><b>Proyecto</b></td><td>${E(String(p.name||'').toUpperCase())}</td></tr><tr><td><b>Código</b></td><td>${E(String(p.code||'').toUpperCase())}</td></tr><tr><td><b>Contratista</b></td><td>${E(c.contractor||'')}</td></tr><tr><td><b>Monto contractual</b></td><td>${M(c.originalAmount)}</td></tr><tr><td><b>Fecha oficial de inicio</b></td><td>${E(F(start))}</td></tr><tr><td><b>Plazo contractual</b></td><td>${N(c.executionDays)||90} días calendario</td></tr></table><p class="p">Se autoriza y ordena el inicio de los trabajos correspondientes al proyecto descrito, de conformidad con el contrato, presupuesto, especificaciones técnicas e instrucciones de supervisión.</p><table class="sig"><tr><td><div class="line">${E(pf.mayorName)}<br>ALCALDE MUNICIPAL</div></td><td><div class="line">${E(pf.supervisorName)}<br>SUPERVISOR</div></td></tr><tr><td colspan="2" style="padding-top:45px"><div class="line">${E(c.contractor||'')}<br>CONTRATISTA</div></td></tr></table>`)}

function saveWord(html,name,button){
  try{
    const blob=new Blob(['\ufeff',html],{type:'application/msword;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},5000);
    if(button){const old=button.innerHTML;button.innerHTML='✓ Descargado';setTimeout(()=>button.innerHTML=old,1500)}
    notice(`Descarga iniciada: ${name}`);
  }catch(err){console.error('Descarga contractual V2',err);notice(`No se pudo iniciar la descarga: ${err?.message||err}`)}
}
function direct(kind,button){
  const {p,c}=resolveContext();
  if(!p||!c)return notice('No se pudo identificar el proyecto y contrato activos. Vuelve a abrir el proyecto e inténtalo de nuevo.');
  const code=clean(p.code||'proyecto');
  if(kind==='contract')return saveWord(contractDoc(p,c),`Contrato-${code}.doc`,button);
  if(kind==='note'){if(advance(c)<=0)return notice('Este contrato no tiene anticipo registrado.');return saveWord(noteDoc(p,c),`Nota-remision-anticipo-${code}.doc`,button)}
  return saveWord(startDoc(p,c),`Orden-inicio-${code}.doc`,button);
}
function css(){
  if(document.getElementById('ccContractDownloadActionsV2Css'))return;
  const s=document.createElement('style');s.id='ccContractDownloadActionsV2Css';s.textContent=`.cc-payment-docs-head h3{color:#163247!important;font-weight:850!important}.cc-payment-docs-head p{color:#4c6478!important}.cc-payment-docs-kicker{color:#0b6f89!important}.cc-payment-doc b{color:#18384a!important}.cc-payment-doc small{color:#60798f!important}.cc-doc-downloads{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}.cc-doc-download{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #cbd8e3;border-radius:12px;background:#fff}.cc-doc-download span{font-size:.82rem;color:#496172}.cc-doc-download b{display:block;color:#18384a;margin-bottom:2px}.cc-doc-download button{white-space:nowrap}@media(max-width:720px){.cc-doc-downloads{grid-template-columns:1fr}.cc-doc-download{align-items:flex-start;flex-direction:column}.cc-doc-download button{width:100%}}`;
  document.head.appendChild(s);
}
function decorate(card){
  if(!card)return;css();card.dataset.ccDownloadVersion='2';card.querySelectorAll('.cc-payment-doc small').forEach(x=>x.textContent='Listo para descargar');
  let box=card.querySelector('[data-cc-manual-downloads]');
  if(!box){box=document.createElement('div');box.className='cc-doc-downloads';box.setAttribute('data-cc-manual-downloads','');const actions=card.querySelector('.cc-payment-doc-actions');actions?actions.insertAdjacentElement('afterend',box):card.appendChild(box)}
  box.innerHTML=`<div class="cc-doc-download"><span><b>Contrato de obra</b>Descargar manualmente en Word</span><button class="btn" type="button" data-cc-download-v2="contract">↓ Descargar</button></div><div class="cc-doc-download"><span><b>Nota de remisión</b>Descargar manualmente en Word</span><button class="btn" type="button" data-cc-download-v2="note">↓ Descargar</button></div><div class="cc-doc-download"><span><b>Orden de inicio</b>Descargar manualmente en Word</span><button class="btn" type="button" data-cc-download-v2="start">↓ Descargar</button></div>`;
}
function scan(){document.querySelectorAll('[data-cc-payment-docs]').forEach(decorate)}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-cc-download-v2]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();direct(b.dataset.ccDownloadV2,b)},true);
scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();