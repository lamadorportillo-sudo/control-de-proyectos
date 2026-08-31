/* ===== CONTROL CONTRACTUAL · VISTA PREVIA DEL FORMATO CONTRACTUAL V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_PREVIEW_V1__)return;
window.__CC_CONTRACT_PREVIEW_V1__=true;

const PHONE='9864-2006';
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(v)||0;
const MONEY=v=>`L. ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const DATE=v=>{if(!v)return 'No registrada';const d=new Date(`${String(v).slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?E(v):new Intl.DateTimeFormat('es-HN',{day:'2-digit',month:'long',year:'numeric'}).format(d)};
const SAY=m=>typeof window.toast==='function'?window.toast(m):alert(m);

function context(){
  let p=null,c=null,d=null,v=null;
  try{if(typeof getProject==='function')p=getProject()}catch{}
  try{if(p&&typeof getContract==='function')c=getContract(p)}catch{}
  try{d=db}catch{d=window.db||window.DB||null}
  try{v=view}catch{v=window.view||null}
  d=d||window.db||window.DB||{};v=v||window.view||{};
  if(!p){const id=v.projectId||window.currentProjectId||window.selectedProjectId;p=(Array.isArray(d.projects)?d.projects:[]).find(x=>String(x.id)===String(id))||null}
  if(p&&!c)c=(Array.isArray(d.contracts)?d.contracts:[]).filter(x=>String(x.projectId)===String(p.id)&&!x.voidedAt&&!x.voided_at).slice(-1)[0]||null;
  return {p,c};
}
function controls(c){try{return typeof window.contractControlDefaults==='function'?window.contractControlDefaults(c?.controls):Object.assign({penaltyDailyPct:.18,performanceGuaranteePct:15,qualityGuaranteePct:5,changeOrderLimitPct:10,accumulatedChangeLimitPct:25},c?.controls||{})}catch{return Object.assign({penaltyDailyPct:.18,performanceGuaranteePct:15,qualityGuaranteePct:5,changeOrderLimitPct:10,accumulatedChangeLimitPct:25},c?.controls||{})}}
function profile(p,c){
  const saved=c?.documentProfile||{},code=String(p?.code||'').toUpperCase(),school=code.includes('COT121706-2026');
  return Object.assign({
    mayorName:school?'EDWIN ALBERTO NICOLAS MORALES':'No identificado',
    mayorDni:school?'1217-1979-00268':'No identificado',
    contractorDni:school?'1218-1988-00059':'No identificado',
    contractorProfession:'Ingeniero Civil',
    contractorCivilStatus:school?'soltera':'No identificado',
    contractorNationality:'hondureña',
    contractorAddress:school?'Residencial La Orquidea, La Paz':'No identificado',
    contractorRegistry:school?'96':'',
    contractorRegistryVolume:school?'21':'',
  },saved);
}
function advance(c,amount){const pct=N(c?.advanceRequestedPct)||15,approved=N(c?.advanceApproved);return {pct,value:approved>0?approved:amount*pct/100}}
function projectLabel(p){const name=String(p?.name||'Proyecto').trim(),location=String(p?.location||'').trim(),code=String(p?.code||'').trim();return [name,location&&!name.toLowerCase().includes(location.toLowerCase())?location:'',code&&!name.toLowerCase().includes(code.toLowerCase())?code:''].filter(Boolean).join(', ')}

function addCss(){
  if(document.getElementById('ccContractPreviewCss'))return;
  const s=document.createElement('style');s.id='ccContractPreviewCss';s.textContent=`
  .cc-format-preview-btn{display:inline-flex!important;align-items:center;gap:7px}.cc-format-preview-btn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .cc-official-preview-wrap{background:#dfe7ee;padding:18px;border-radius:14px}.cc-official-paper{width:min(816px,100%);margin:auto;background:#fff;color:#171717;padding:38px 48px;box-shadow:0 18px 45px rgba(17,37,55,.18);font:12px/1.48 Arial,Helvetica,sans-serif}.cc-official-head{text-align:center;border-bottom:1px solid #777;padding-bottom:11px;margin-bottom:18px}.cc-official-head h2{font-size:18px;margin:0 0 4px;color:#111}.cc-official-head p{margin:2px 0;font-size:10.5px;color:#222}.cc-official-title{text-align:center;font-size:13px;font-weight:800;line-height:1.45;margin:18px auto;max-width:690px}.cc-official-project{text-align:center;font-weight:800;margin-bottom:15px}.cc-official-facts{width:100%;border-collapse:collapse;margin:12px 0 18px}.cc-official-facts td{border:1px solid #aaa;padding:7px 8px;vertical-align:top}.cc-official-facts td:first-child{width:26%;font-weight:800;background:#f4f4f4}.cc-official-body p{text-align:justify;margin:0 0 10px}.cc-official-body b{font-weight:800}.cc-official-note{margin-top:18px;padding:10px 12px;border:1px solid #aebbc6;background:#f5f8fa;font-size:10.5px;color:#385063}.cc-official-signatures{display:grid;grid-template-columns:1fr 1fr;gap:44px;margin-top:54px;text-align:center}.cc-official-signatures div{border-top:1px solid #333;padding-top:6px}.cc-preview-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:12px}
  @media(max-width:720px){.cc-official-preview-wrap{padding:7px}.cc-official-paper{padding:24px 18px}.cc-official-signatures{grid-template-columns:1fr;gap:38px}.cc-official-facts td:first-child{width:34%}}
  `;document.head.appendChild(s);
}

function paper(p,c){
  const pf=profile(p,c),ctl=controls(c),amount=N(c?.originalAmount||c?.currentAmount||p?.budget),adv=advance(c,amount),penaltyPct=N(ctl.penaltyDailyPct)||.18,penalty=amount*penaltyPct/100,days=Math.max(1,Math.trunc(N(c?.executionDays)||90));
  const registry=pf.contractorRegistry?`Inscripción ${E(pf.contractorRegistry)}${pf.contractorRegistryVolume?`, tomo ${E(pf.contractorRegistryVolume)}`:''}, Registro Mercantil de La Paz.`:'Registro mercantil: no identificado.';
  return `<div class="cc-official-preview-wrap"><article class="cc-official-paper" data-cc-contract-paper>
    <header class="cc-official-head"><h2>Municipalidad de Santa María, La Paz</h2><p>Email: munisantamaria@Yahoo.com · lapazsantamaria@municipalidadhn.info</p><p><b>Tel. ${PHONE}</b></p></header>
    <div class="cc-official-title">CONTRATO PARA EJECUCIÓN DE PROYECTO DE INFRAESTRUCTURA MUNICIPAL, SUSCRITO ENTRE LA MUNICIPALIDAD DE SANTA MARÍA, DEPARTAMENTO DE LA PAZ Y EL CONTRATISTA</div>
    <div class="cc-official-project">${E(projectLabel(p))}</div>
    <table class="cc-official-facts"><tbody>
      <tr><td>Contratista</td><td>${E(c?.contractor||'No identificado')} · DNI ${E(pf.contractorDni)}</td></tr>
      <tr><td>Alcalde Municipal</td><td>${E(pf.mayorName)} · DNI ${E(pf.mayorDni)}</td></tr>
      <tr><td>Monto contractual</td><td>${MONEY(amount)}</td></tr>
      <tr><td>Anticipo</td><td>${MONEY(adv.value)} · ${adv.pct}%</td></tr>
      <tr><td>Plazo</td><td>${days} días calendario</td></tr>
      <tr><td>Firma</td><td>${DATE(c?.signature)}</td></tr>
      <tr><td>Multa diaria</td><td>${penaltyPct}% del monto contractual · ${MONEY(penalty)} por día de atraso</td></tr>
    </tbody></table>
    <div class="cc-official-body">
      <p>Yo, <b>${E(pf.mayorName)}</b>, actuando en condición de Alcalde Municipal, y por la otra parte <b>${E(c?.contractor||'EL CONTRATISTA')}</b>, ${E(registry)} acuerdan celebrar el contrato correspondiente al proyecto indicado.</p>
      <p><b>PRIMERA: DEFINICIONES.</b> El formato identifica a LA MUNICIPALIDAD, la Unidad Técnica, EL CONTRATISTA y EL SUPERVISOR.</p>
      <p><b>SEGUNDA: OBJETO DEL CONTRATO.</b> EL CONTRATISTA se compromete a construir y dejar listas para su uso las obras que conforman el proyecto, conforme a cantidades, precios unitarios y planos convenidos.</p>
      <p><b>TERCERA: MONTO DEL CONTRATO.</b> Monto contractual registrado: <b>${MONEY(amount)}</b>.</p>
      <p><b>CUARTA Y QUINTA: ANTICIPO Y AMORTIZACIÓN.</b> Anticipo registrado de <b>${MONEY(adv.value)}</b> (${adv.pct}%), sujeto a garantías y amortización progresiva conforme al contrato.</p>
      <p><b>SEXTA: ORDEN DE INICIO.</b> El formato contractual vincula el inicio con la entrega y recepción del anticipo según las condiciones establecidas.</p>
      <p><b>GARANTÍAS Y CONTROL.</b> Cumplimiento ${E(ctl.performanceGuaranteePct||15)}%; calidad ${E(ctl.qualityGuaranteePct||5)}%; variaciones por orden hasta ${E(ctl.changeOrderLimitPct||10)}% y acumuladas hasta ${E(ctl.accumulatedChangeLimitPct||25)}%, conforme a la configuración contractual.</p>
      <p><b>DÉCIMA SÉPTIMA A DÉCIMA NOVENA.</b> El formato incluye procedimiento ante emergencias, solución de conflictos y aceptación de las partes.</p>
    </div>
    <div class="cc-official-signatures"><div><b>${E(pf.mayorName)}</b><br>Alcalde Municipal</div><div><b>${E(c?.contractor||'CONTRATISTA')}</b><br>Contratista</div></div>
    <div class="cc-official-note"><b>Vista previa institucional.</b> Sirve para verificar datos, membrete, teléfono y estructura antes de generar. El botón “Generar contrato Word” utiliza el formato Word oficial completo del expediente.</div>
  </article><div class="cc-preview-actions"><button class="btn primary" type="button" data-cc-preview-word>Generar contrato Word</button><button class="btn" type="button" data-cc-preview-print>PDF / Imprimir</button></div></div>`;
}

function printPaper(p,c){
  const html=paper(p,c).replace(/<div class="cc-preview-actions">[\s\S]*?<\/div><\/div>$/,'</div>');
  const w=window.open('','_blank','noopener,noreferrer');if(!w)return SAY('El navegador bloqueó la vista de impresión.');
  w.document.open();w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Contrato ${E(p?.code||'')}</title><style>body{margin:0;background:#fff}.cc-official-preview-wrap{padding:0}.cc-official-paper{width:190mm;margin:auto;color:#111;padding:16mm 18mm;font:11.5px/1.45 Arial,sans-serif}.cc-official-head{text-align:center;border-bottom:1px solid #777;padding-bottom:9px;margin-bottom:14px}.cc-official-head h2{font-size:17px;margin:0 0 4px}.cc-official-head p{margin:2px 0;font-size:10px}.cc-official-title{text-align:center;font-weight:700;margin:15px 0}.cc-official-project{text-align:center;font-weight:700;margin-bottom:13px}.cc-official-facts{width:100%;border-collapse:collapse}.cc-official-facts td{border:1px solid #999;padding:6px}.cc-official-facts td:first-child{font-weight:700;background:#f3f3f3}.cc-official-body p{text-align:justify}.cc-official-signatures{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:45px;text-align:center}.cc-official-signatures div{border-top:1px solid #333;padding-top:6px}.cc-official-note{margin-top:16px;border:1px solid #bbb;padding:8px;font-size:9.5px}@page{size:letter;margin:12mm}@media print{.cc-official-paper{width:auto;padding:0}}</style></head><body>${html}<script>window.onload=()=>{setTimeout(()=>window.print(),120)}<\/script></body></html>`);w.document.close();
}
function openPreview(){
  const {p,c}=context();if(!p||!c)return SAY('Primero abre un proyecto que tenga contrato registrado.');addCss();
  if(typeof window.openModal==='function'){
    const m=window.openModal('Vista previa del formato oficial',paper(p,c));
    m?.querySelector('[data-cc-preview-word]')?.addEventListener('click',()=>window.ccContractPaymentDocuments?.generate?.(p,c,'contract'));
    m?.querySelector('[data-cc-preview-print]')?.addEventListener('click',()=>printPaper(p,c));
    return;
  }
  printPaper(p,c);
}
function decorate(card){
  if(!card||card.querySelector('[data-cc-contract-preview]'))return;addCss();const actions=card.querySelector('.cc-payment-doc-actions');if(!actions)return;
  const b=document.createElement('button');b.type='button';b.className='btn cc-format-preview-btn';b.setAttribute('data-cc-contract-preview','');b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"></path><path d="M8 9h8M8 13h8M8 17h5"></path></svg><span>Ver formato oficial</span>';actions.insertBefore(b,actions.firstChild);
}
function scan(){document.querySelectorAll('[data-cc-payment-docs]').forEach(decorate)}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-cc-contract-preview]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openPreview()},true);
scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
