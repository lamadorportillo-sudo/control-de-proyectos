/* ===== IMPRESION PROFESIONAL DE VISITAS V1 ===== */
(()=>{
'use strict';
if(window.__CC_VISIT_PRINT_V1__)return;
window.__CC_VISIT_PRINT_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const D=s=>{try{return typeof dmy==='function'?dmy(s):(s||'—')}catch{return s||'—'}};
const P=v=>{try{return typeof pct==='function'?pct(v):`${Number(v||0).toFixed(2)}%`}catch{return `${Number(v||0).toFixed(2)}%`}};
const say=m=>{try{toast(m)}catch{console.log(m)}};

function currentProject(){
  try{return A(db?.projects).find(p=>p.id===view?.projectId&&!p.deletedAt)||null}catch{return null}
}
function projectVisits(p){return A(db?.visits).filter(v=>v.projectId===p?.id).slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')||Number(a.number||0)-Number(b.number||0))}
function contractOf(p){try{return A(db?.contracts).find(c=>c.projectId===p?.id)||null}catch{return null}}

function ensureCss(){
  if(document.getElementById('cc-visit-print-style'))return;
  const s=document.createElement('style');s.id='cc-visit-print-style';s.textContent=`
  .cc-visit-report-paper{max-width:1180px!important}
  .cc-visit-report-table{table-layout:fixed!important;width:100%!important;border-collapse:collapse!important;font-size:10px!important;line-height:1.42!important}
  .cc-visit-report-table th,.cc-visit-report-table td{white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important;vertical-align:top!important;padding:8px 9px!important;border:1px solid #c7d4e2!important;color:#263b50!important}
  .cc-visit-report-table th{background:#eaf1f8!important;color:#29455f!important;font-size:9px!important;letter-spacing:.035em!important;text-transform:uppercase!important}
  .cc-visit-report-table th:nth-child(1),.cc-visit-report-table td:nth-child(1){width:7%!important;text-align:center}
  .cc-visit-report-table th:nth-child(2),.cc-visit-report-table td:nth-child(2){width:12%!important}
  .cc-visit-report-table th:nth-child(3),.cc-visit-report-table td:nth-child(3){width:8%!important;text-align:center}
  .cc-visit-report-table th:nth-child(4),.cc-visit-report-table td:nth-child(4){width:31%!important}
  .cc-visit-report-table th:nth-child(5),.cc-visit-report-table td:nth-child(5){width:34%!important}
  .cc-visit-report-table th:nth-child(6),.cc-visit-report-table td:nth-child(6){width:8%!important;text-align:center}
  .cc-visit-select-field{min-width:250px!important}
  .cc-visit-print-hint{margin:8px 0 12px;padding:9px 11px;border:1px solid #ccdae8;border-radius:10px;background:#f5f8fb;color:#526a80;font-size:10px}
  .cc-print-visit-btn{white-space:nowrap!important}
  @media(max-width:760px){.cc-visit-report-paper{max-width:none!important}.cc-visit-select-field{min-width:0!important;width:100%}.cc-visit-report-table{font-size:9px!important}.cc-visit-report-table th,.cc-visit-report-table td{padding:6px!important}}
  `;document.head.appendChild(s);
}

function findVisitReportTable(){
  const root=document.getElementById('reportPreview');if(!root)return null;
  const headings=[...root.querySelectorAll('.report-section-title h2')];
  const h=headings.find(x=>/visitas y observaciones/i.test(x.textContent||''));
  if(!h)return null;
  let el=h.closest('.report-section-title')?.nextElementSibling;
  while(el&&!el.classList.contains('report-section-title')){if(el.matches?.('table.report-table'))return el;el=el.nextElementSibling}
  return null;
}

function safePhotoSrc(p){const src=String(p?.src||p?.url||'');return /^(data:image\/|https?:\/\/)/i.test(src)?src:''}
function field(v){return v&&String(v).trim()?H(v):'—'}
function obsRows(v){
  const obs=A(v.observations);
  if(!obs.length)return '<tr><td colspan="7" class="empty-cell">Sin observaciones individuales registradas.</td></tr>';
  return obs.map(o=>`<tr><td>${D(o.date||String(o.createdAt||'').slice(0,10))}</td><td>${field(o.category||'General')}</td><td>${field(o.text)}</td><td>${field(o.priority||'Normal')}</td><td>${field(o.responsible)}</td><td>${o.dueDate?D(o.dueDate):'—'}</td><td>${field(o.status||'Pendiente')}</td></tr>`).join('');
}
function photosBlock(v){
  const photos=A(v.photos).filter(p=>safePhotoSrc(p));if(!photos.length)return'';
  return `<section class="photo-section"><h3>Registro fotográfico</h3><div class="photo-grid">${photos.map((p,i)=>`<figure><img src="${H(safePhotoSrc(p))}" alt="Fotografía ${i+1}"><figcaption>Fotografía ${i+1}${p.name?' · '+H(p.name):''}</figcaption></figure>`).join('')}</div></section>`;
}
function visitSheet(p,c,v,index,total){
  const title=`VISITA DE SUPERVISIÓN N.º ${Number(v.number||index+1)}`;
  return `<article class="visit-sheet">
    <header class="doc-head"><div><div class="doc-kicker">CONTROL Y SEGUIMIENTO DE PROYECTOS</div><h1>${title}</h1><p>${H(p.name||'Proyecto')}</p></div><div class="doc-code"><b>${H(p.code||'SIN CÓDIGO')}</b><span>${index+1} de ${total}</span></div></header>
    <table class="meta-table"><tbody>
      <tr><th>Fecha</th><td>${D(v.date)}</td><th>Tipo</th><td>${field(v.type)}</td><th>Estado</th><td>${field(v.status)}</td><th>Avance físico</th><td>${P(v.physical||0)}</td></tr>
      <tr><th>Personal</th><td>${Number(v.personnel||0)||'—'}</td><th>Clima</th><td>${field(v.weather)}</td><th>Próxima visita</th><td>${v.nextVisit?D(v.nextVisit):'—'}</td><th>Contrato</th><td>${field(c?.number)}</td></tr>
    </tbody></table>
    <table class="info-table"><tbody>
      <tr><th>Objetivo de la visita</th><td colspan="3">${field(v.objective)}</td></tr>
      <tr><th>Supervisor / responsable</th><td>${field(v.supervisor)}</td><th>Representante del contratista</th><td>${field(v.contractorRepresentative)}</td></tr>
    </tbody></table>
    <h3>Actividades, observaciones y seguimiento</h3>
    <table class="main-table"><colgroup><col style="width:30%"><col style="width:28%"><col style="width:22%"><col style="width:20%"></colgroup><thead><tr><th>Actividades ejecutadas</th><th>Observaciones generales</th><th>Instrucciones de supervisión</th><th>Compromisos / seguimiento</th></tr></thead><tbody><tr><td>${field(v.activities)}</td><td>${field(v.generalObservations)}</td><td>${field(v.instructions)}</td><td>${field(v.commitments)}</td></tr></tbody></table>
    <h3>Observaciones individuales</h3>
    <table class="obs-table"><colgroup><col style="width:10%"><col style="width:12%"><col style="width:36%"><col style="width:9%"><col style="width:13%"><col style="width:10%"><col style="width:10%"></colgroup><thead><tr><th>Fecha</th><th>Categoría</th><th>Observación</th><th>Prioridad</th><th>Responsable</th><th>Seguimiento</th><th>Estado</th></tr></thead><tbody>${obsRows(v)}</tbody></table>
    ${photosBlock(v)}
    <div class="signatures"><div><span></span><b>Supervisor / Responsable</b></div><div><span></span><b>Representante del contratista</b></div><div><span></span><b>V.º B.º / Aprobó</b></div></div>
    <footer><span>${H(p.code||'')}</span><span>Fecha de impresión: ${new Date().toLocaleDateString('es-HN')}</span></footer>
  </article>`;
}

function printCss(){return `
@page{size:A4 landscape;margin:9mm 10mm}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#182737;font-family:Arial,Helvetica,sans-serif;font-size:9pt;line-height:1.35;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.visit-sheet{width:100%;page-break-after:always}.visit-sheet:last-child{page-break-after:auto}
.doc-head{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;border-bottom:2px solid #254f7a;padding-bottom:7px;margin-bottom:8px}.doc-kicker{font-size:7.5pt;font-weight:700;letter-spacing:.09em;color:#61778b}.doc-head h1{font-size:17pt;margin:2px 0 2px;color:#1f4265}.doc-head p{margin:0;font-size:10pt;font-weight:700}.doc-code{text-align:right;border:1px solid #b7c9da;padding:6px 9px;min-width:120px}.doc-code b{display:block;font-size:9pt}.doc-code span{font-size:7.5pt;color:#60768a}
table{width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 8px}th,td{border:1px solid #9fb4c7;padding:5px 6px;vertical-align:top;white-space:normal;word-break:normal;overflow-wrap:anywhere}th{background:#e7eef5;color:#294760;text-transform:uppercase;letter-spacing:.025em;font-size:7.4pt;text-align:left}td{font-size:8.4pt}.meta-table th{width:8%}.meta-table td{width:17%;font-weight:700}.info-table th{width:17%}.main-table td{min-height:42mm;line-height:1.4}.main-table th{text-align:center}.obs-table th{font-size:6.8pt}.obs-table td{font-size:7.5pt}.empty-cell{text-align:center;color:#667b8e;padding:10px}h3{font-size:10pt;color:#244766;margin:9px 0 4px;border-left:3px solid #315f8c;padding-left:6px}.photo-section{break-inside:auto}.photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.photo-grid figure{margin:0;border:1px solid #b8c7d5;padding:4px;break-inside:avoid}.photo-grid img{width:100%;height:42mm;object-fit:contain;background:#f5f7f9}.photo-grid figcaption{font-size:7pt;color:#5c7082;margin-top:3px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:18mm;margin-top:15mm;break-inside:avoid}.signatures div{text-align:center;font-size:8pt}.signatures span{display:block;border-top:1px solid #42596e;margin-bottom:3px}footer{display:flex;justify-content:space-between;border-top:1px solid #c7d3de;margin-top:8mm;padding-top:4px;font-size:7pt;color:#687b8d}
@media print{button{display:none!important}}
`;}
function printVisits(p,visitId='__all__'){
  const all=projectVisits(p);const selected=visitId&&visitId!=='__all__'?all.filter(v=>v.id===visitId):all;
  if(!selected.length)return say('No hay visitas disponibles para imprimir.');
  const c=contractOf(p),w=window.open('','_blank','width=1200,height=850');
  if(!w)return say('El navegador bloqueó la ventana de impresión. Habilita las ventanas emergentes para esta página.');
  const body=selected.map((v,i)=>visitSheet(p,c,v,i,selected.length)).join('');
  w.document.open();w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visitas ${H(p.code||'')}</title><style>${printCss()}</style></head><body>${body}<script>window.addEventListener('load',()=>setTimeout(()=>{window.focus();window.print()},250));<\/script></body></html>`);w.document.close();
  try{if(typeof audit==='function')audit('IMPRIMIR','Visita',visitId==='__all__'?p.id:visitId,{projectId:p.id,visitId,quantity:selected.length});if(typeof saveDB==='function')saveDB()}catch{}
}

function setPrintButtonText(select,btn){if(!btn)return;const all=select?.value==='__all__'||!select?.value;btn.textContent=all?'Imprimir todas las visitas':'Imprimir visita seleccionada'}
function decorateReports(){
  ensureCss();
  let isVisits=false;try{isVisits=view?.screen==='project'&&view?.tab==='reports'&&(view.reportType||'final')==='visitas'}catch{}
  if(!isVisits)return;
  const p=currentProject();if(!p)return;const visits=projectVisits(p),preview=document.getElementById('reportPreview');
  preview?.querySelector('.report-paper')?.classList.add('cc-visit-report-paper');
  findVisitReportTable()?.classList.add('cc-visit-report-table');
  const toolbar=document.querySelector('#tabBody .report-toolbar');if(!toolbar)return;
  let fieldBox=toolbar.querySelector('[data-cc-visit-select]');
  if(!fieldBox){
    fieldBox=document.createElement('label');fieldBox.className='field cc-visit-select-field';fieldBox.dataset.ccVisitSelect='1';fieldBox.innerHTML='<span>Visita a imprimir</span><select id="ccVisitPrintSelect"></select>';
    const printBtn=toolbar.querySelector('#printReport');toolbar.insertBefore(fieldBox,printBtn||toolbar.firstChild);
  }
  const select=fieldBox.querySelector('#ccVisitPrintSelect');
  if(select&&!select.dataset.ready){
    select.innerHTML=`<option value="__all__">Todas las visitas (${visits.length})</option>${visits.map(v=>`<option value="${H(v.id)}">Visita N.º ${Number(v.number||0)} · ${D(v.date)} · ${H(v.type||'Supervisión')}</option>`).join('')}`;
    const saved=view.reportVisitId&&visits.some(v=>v.id===view.reportVisitId)?view.reportVisitId:'__all__';select.value=saved;select.dataset.ready='1';
    select.onchange=()=>{view.reportVisitId=select.value;setPrintButtonText(select,document.getElementById('printReport'));const hint=document.querySelector('[data-cc-visit-hint]');if(hint)hint.textContent=select.value==='__all__'?`Se imprimirán las ${visits.length} visitas, cada una en su hoja.`:`Se imprimirá únicamente ${select.options[select.selectedIndex]?.textContent||'la visita seleccionada'}.`};
  }
  const printBtn=document.getElementById('printReport');if(printBtn){setPrintButtonText(select,printBtn);printBtn.onclick=e=>{e.preventDefault();printVisits(p,select?.value||'__all__')}}
  let hint=document.querySelector('[data-cc-visit-hint]');if(!hint){hint=document.createElement('div');hint.className='cc-visit-print-hint';hint.dataset.ccVisitHint='1';toolbar.insertAdjacentElement('afterend',hint)}
  hint.textContent=select?.value==='__all__'?`Formato optimizado para impresión horizontal. Se imprimirán ${visits.length} visita${visits.length===1?'':'s'}, cada una en su propia hoja.`:`Formato optimizado para impresión horizontal. Se imprimirá únicamente ${select?.options[select.selectedIndex]?.textContent||'la visita seleccionada'}.`;
}

function decorateVisitTable(){
  ensureCss();let onVisits=false;try{onVisits=view?.screen==='project'&&view?.tab==='visits'}catch{}
  if(!onVisits)return;const p=currentProject();if(!p)return;const visits=projectVisits(p);
  document.querySelectorAll('#tabBody .table tbody tr').forEach(tr=>{
    if(tr.dataset.ccVisitPrint==='1')return;const first=tr.querySelector('td');if(!first)return;const n=Number((first.textContent||'').match(/\d+/)?.[0]||0);if(!n)return;const v=visits.find(x=>Number(x.number)===n);if(!v)return;const cells=tr.querySelectorAll('td'),cell=cells[cells.length-1];if(!cell)return;
    const b=document.createElement('button');b.type='button';b.className='btn cc-print-visit-btn';b.dataset.ccPrintVisit=v.id;b.textContent='Imprimir';cell.append(' ',b);tr.dataset.ccVisitPrint='1';
  });
}

document.addEventListener('click',e=>{const b=e.target.closest?.('[data-cc-print-visit]');if(!b)return;e.preventDefault();const p=currentProject(),v=p?projectVisits(p).find(x=>x.id===b.dataset.ccPrintVisit):null;if(p&&v)printVisits(p,v.id)},true);
function run(){try{decorateReports();decorateVisitTable()}catch(e){console.warn('Visitas impresión',e)}}
const mo=new MutationObserver(()=>queueMicrotask(run));mo.observe(document.documentElement,{subtree:true,childList:true});
setTimeout(run,0);setTimeout(run,400);setTimeout(run,1200);
window.printProjectVisit=(visitId)=>{const p=currentProject();if(p)printVisits(p,visitId||'__all__')};
})();