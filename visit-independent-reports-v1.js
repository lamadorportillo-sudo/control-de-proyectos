/* ===== VISITAS INDEPENDIENTES E INFORMES INDIVIDUALES V2 · CONTRASTE AA ===== */
(()=>{
'use strict';
if(window.__CC_VISIT_INDEPENDENT_REPORTS_V2__)return;
window.__CC_VISIT_INDEPENDENT_REPORTS_V2__=true;
window.__CC_VISIT_INDEPENDENT_REPORTS_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const D=v=>{try{return v&&typeof dmy==='function'?dmy(v):(v?new Date(v+'T12:00:00').toLocaleDateString('es-HN'):'—')}catch{return v||'—'}};
const P=v=>`${Math.max(0,Math.min(100,N(v))).toFixed(2)}%`;
const say=m=>{try{if(typeof toast==='function')toast(m);else console.log(m)}catch{}};
function contributionOf(v){
  return String(v?.communityContribution||v?.community_contribution||v?.rawData?.communityContribution||v?.raw_data?.communityContribution||'').trim();
}
function current(){
  try{
    const pid=view?.projectId;
    const p=A(db?.projects).find(x=>x.id===pid&&!x.deletedAt)||null;
    const c=p?A(db?.contracts).find(x=>x.projectId===p.id)||null:null;
    return{p,c};
  }catch{return{p:null,c:null}}
}
function visitsOf(p){
  return A(db?.visits).filter(v=>v.projectId===p?.id).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||N(a.number)-N(b.number)||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
}
function photoSrc(p){if(typeof p==='string')return p;return String(p?.src||p?.url||p?.dataUrl||p?.data_url||p?.image||'')}
function photosOf(v){
  const raw=A(v?.photos).length?A(v.photos):A(v?.images).length?A(v.images):A(v?.evidencePhotos);
  return raw.map((p,i)=>typeof p==='string'?{name:`Fotografía ${i+1}`,src:p}:{...p,src:photoSrc(p)}).filter(p=>/^(data:image\/|https?:\/\/)/i.test(photoSrc(p)));
}
function css(){
  if(document.getElementById('cc-independent-visits-style'))return;
  const s=document.createElement('style');s.id='cc-independent-visits-style';s.textContent=`
  .cc-visit-report-picker{display:grid;grid-template-columns:minmax(240px,1.5fr) auto auto;gap:8px;align-items:end;margin:0 0 14px;padding:13px;border:1px solid #dfe6dc;background:#f8faf7;border-radius:14px;color:#243b4a}
  .cc-visit-report-picker .field{margin:0}.cc-visit-report-picker .btn{min-height:40px}
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-visit-report-picker .field>span{display:block;background-color:#f8faf7!important;color:#334e68!important;opacity:1!important;text-shadow:none!important}
  .cc-visit-count-note{font-size:10px;color:#53675b;margin:5px 0 0}.cc-visit-print-row{margin-left:5px!important}
  .cc-visit-community-note{grid-column:1/-1;padding:10px 12px;border:1px solid #c9d8e7;background:#f3f7fb;border-radius:10px;font-size:11px;line-height:1.45;color:#334e68}
  .cc-visit-community-note b{color:#244766}
  @media(max-width:760px){.cc-visit-report-picker{grid-template-columns:1fr}.cc-visit-report-picker .btn{width:100%}}
  `;document.head.appendChild(s);
}
function reportCss(){return `
@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:9pt;line-height:1.38;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{width:100%}.head{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;border-bottom:3px solid #315f8c;padding-bottom:8px;margin-bottom:9px}.kicker{font-size:7.5pt;font-weight:700;letter-spacing:.1em;color:#60778c}.head h1{font-size:17pt;margin:2px 0;color:#244766}.head p{margin:0;font-size:10pt;font-weight:700}.code{border:1px solid #b9c9d8;padding:7px 10px;min-width:150px;text-align:right}.code b{display:block}.meta{width:100%;border-collapse:collapse;margin-bottom:8px}.meta th,.meta td,.tbl th,.tbl td{border:1px solid #aabccd;padding:5px 6px;vertical-align:top}.meta th,.tbl th{background:#e9f0f6;color:#294760;text-align:left;font-size:7.3pt;text-transform:uppercase}.meta td{font-weight:700}.section{margin:9px 0 4px;font-size:10pt;color:#244766;border-left:3px solid #315f8c;padding-left:6px}.tbl{width:100%;border-collapse:collapse;margin-bottom:8px}.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.photos figure{margin:0;border:1px solid #bccbd8;padding:4px;break-inside:avoid}.photos img{display:block;width:100%;height:43mm;object-fit:contain;background:#f5f7f9}.photos figcaption{font-size:7pt;color:#607489;margin-top:3px}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:18mm;margin-top:15mm}.sign div{text-align:center;font-size:8pt}.sign span{display:block;border-top:1px solid #465d70;margin-bottom:3px}footer{display:flex;justify-content:space-between;border-top:1px solid #c9d5df;margin-top:8mm;padding-top:4px;font-size:7pt;color:#687b8d}.screen-actions{display:flex;gap:8px;margin:0 0 10px}.screen-actions button{border:1px solid #315f8c;background:#315f8c;color:#fff;border-radius:7px;padding:8px 12px;font-weight:700}@media print{.screen-actions{display:none}}`}
function rows(items){
  const x=items.filter(([,v])=>v!==''&&v!==null&&v!==undefined);
  if(!x.length)return'';
  return `<table class="meta"><tbody>${x.map(([k,v])=>`<tr><th>${H(k)}</th><td>${v}</td></tr>`).join('')}</tbody></table>`;
}
function reportBody(p,c,v){
  const ps=photosOf(v),obs=A(v.observations);
  const meta=[['Proyecto',H(p.name||'')],['Código',H(p.code||'')],['Contrato',H(c?.number||'No registrado')],['Visita',`N.º ${N(v.number)||'—'}`],['Fecha',D(v.date)],['Tipo',H(v.type||'—')],['Estado',H(v.status||'—')],['Avance físico observado',P(v.physical||0)],['Personal en sitio',N(v.personnel)||'—'],['Clima',H(v.weather||'—')],['Supervisor',H(v.supervisor||'—')]];
  const detail=[['Objetivo / motivo',v.objective],['Actividades observadas / trabajos ejecutados',v.activities],['Distribución de aportes / responsabilidades',contributionOf(v)],['Observaciones generales',v.generalObservations],['Instrucciones / recomendaciones',v.instructions],['Compromisos / seguimiento',v.commitments]].filter(([,x])=>String(x||'').trim());
  return `<div class="screen-actions"><button onclick="window.print()">Imprimir / Guardar PDF</button></div><article class="sheet"><header class="head"><div><div class="kicker">CONTROL CONTRACTUAL · VISITA DE CAMPO</div><h1>INFORME DE VISITA N.º ${N(v.number)||'—'}</h1><p>${H(p.name||'Proyecto')}</p></div><div class="code"><b>${H(p.code||'SIN CÓDIGO')}</b><span>${D(v.date)}</span></div></header>${rows(meta)}${detail.length?`<h3 class="section">Seguimiento técnico de campo</h3><table class="tbl"><tbody>${detail.map(([k,x])=>`<tr><th style="width:24%">${H(k)}</th><td>${H(x)}</td></tr>`).join('')}</tbody></table>`:''}${obs.length?`<h3 class="section">Observaciones individuales</h3><table class="tbl"><thead><tr><th>Categoría</th><th>Observación</th><th>Prioridad</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>${obs.map(o=>`<tr><td>${H(o.category||'General')}</td><td>${H(o.text||'')}</td><td>${H(o.priority||'—')}</td><td>${H(o.responsible||'—')}</td><td>${H(o.status||'Pendiente')}</td></tr>`).join('')}</tbody></table>`:''}${ps.length?`<h3 class="section">Registro fotográfico</h3><div class="photos">${ps.map((ph,i)=>`<figure><img src="${H(photoSrc(ph))}" alt="Fotografía ${i+1}"><figcaption>Fotografía ${i+1}${ph.caption?' · '+H(ph.caption):ph.name?' · '+H(ph.name):''}</figcaption></figure>`).join('')}</div>`:''}<div class="sign"><div><span></span><b>Supervisor / Responsable</b></div><div><span></span><b>Representante del contratista</b></div><div><span></span><b>V.º B.º / Aprobó</b></div></div><footer><span>${H(p.code||'')}</span><span>Informe independiente · ${D(v.date)}</span></footer></article>`;
}
function openReport(visitId,autoPrint=false){
  const{p,c}=current();if(!p)return;
  const v=visitsOf(p).find(x=>x.id===visitId);if(!v)return say('No se encontró la visita seleccionada.');
  const w=window.open('','_blank','width=1200,height=850');if(!w)return say('El navegador bloqueó la ventana del informe.');
  const title=`Visita ${N(v.number)||''} - ${p.code||'Proyecto'}`;
  w.document.open();w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${H(title)}</title><style>${reportCss()}</style></head><body>${reportBody(p,c,v)}${autoPrint?'<script>const a=[...document.images];Promise.race([Promise.all(a.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=i.onerror=r}))),new Promise(r=>setTimeout(r,4000))]).then(()=>setTimeout(()=>window.print(),150));<\/script>':''}</body></html>`);w.document.close();
  try{if(typeof audit==='function')audit('VER INFORME','Visita',v.id,{projectId:p.id,visitNumber:v.number});if(typeof saveDB==='function')saveDB()}catch{}
}
function picker(){
  let screen='',tab='';try{screen=view?.screen||'';tab=view?.tab||''}catch{}
  if(screen!=='project'||tab!=='visits')return;
  const{p}=current(),body=document.getElementById('tabBody');if(!p||!body)return;
  const vs=visitsOf(p);let box=body.querySelector('.cc-visit-report-picker');
  if(!box){
    box=document.createElement('div');box.className='cc-visit-report-picker';
    const anchor=body.querySelector('.advance')||body.querySelector('.table-wrap')||body.firstChild;
    anchor?.parentNode?.insertBefore(box,anchor);
  }
  const signature=vs.map(v=>`${v.id}:${v.number}:${v.date}:${v.updatedAt||''}:${contributionOf(v)}`).join('|');
  if(box.dataset.signature!==signature){
    box.dataset.signature=signature;
    const options=vs.slice().reverse();
    box.innerHTML=`<label class="field"><span>Informe de visita a imprimir</span><select data-visit-report-select>${options.length?options.map(v=>`<option value="${H(v.id)}">Visita N.º ${N(v.number)||'—'} · ${D(v.date)} · ${H(v.type||'Supervisión')}</option>`).join(''):'<option value="">No hay visitas registradas</option>'}</select><div class="cc-visit-count-note">${vs.length} visita${vs.length===1?'':'s'} registrada${vs.length===1?'':'s'} de forma independiente.</div></label><button class="btn" type="button" data-visit-preview ${vs.length?'':'disabled'}>Ver informe</button><button class="btn primary" type="button" data-visit-print ${vs.length?'':'disabled'}>Imprimir seleccionada</button><div class="cc-visit-community-note" data-visit-community-note></div>`;
    const select=box.querySelector('[data-visit-report-select]');
    const renderContribution=()=>{
      const note=box.querySelector('[data-visit-community-note]');if(!note)return;
      const v=vs.find(x=>x.id===select?.value),text=contributionOf(v);
      note.innerHTML=text?`<b>Distribución de aportes / responsabilidades:</b> ${H(text)}`:'<b>Distribución de aportes / responsabilidades:</b> No hay información registrada para esta visita.';
    };
    select?.addEventListener('change',renderContribution);
    renderContribution();
    box.querySelector('[data-visit-preview]')?.addEventListener('click',()=>openReport(select?.value,false));
    box.querySelector('[data-visit-print]')?.addEventListener('click',()=>openReport(select?.value,true));
  }
  body.querySelectorAll('tbody tr').forEach(tr=>{
    const first=tr.querySelector('td');if(!first)return;
    const num=N((first.textContent||'').trim());if(!num)return;
    const v=vs.find(x=>N(x.number)===num);if(!v)return;
    const last=tr.querySelector('td:last-child');if(!last||last.querySelector('[data-print-visit-row]'))return;
    const b=document.createElement('button');b.type='button';b.className='btn cc-visit-print-row';b.dataset.printVisitRow=v.id;b.textContent='Imprimir';b.onclick=()=>openReport(v.id,true);last.appendChild(b);
  });
}
function cssAndPicker(){css();picker()}
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;cssAndPicker()})}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-tab="visits"],[data-open],#backBtn'))setTimeout(cssAndPicker,40)},true);
window.__ccOpenVisitIndependentReport=openReport;
setTimeout(cssAndPicker,0);setTimeout(cssAndPicker,250);
})();
