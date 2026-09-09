/* CONTROL CONTRACTUAL · CENTRO GLOBAL DE GARANTÍAS V2 */
(()=>{
'use strict';
if(window.__CC_GUARANTEES_CENTER_V2__)return;window.__CC_GUARANTEES_CENTER_V2__=true;
const ST={active:false,search:'',project:'all'};
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v)||0;
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=v=>`L ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const D=v=>{if(!v)return'—';const a=String(v).slice(0,10).split('-');return a.length===3?`${a[2]}/${a[1]}/${a[0]}`:String(v)};
const DB=()=>{try{return db||null}catch{return null}};
function daysTo(date){if(!date)return 99999;return Math.ceil((new Date(date+'T23:59:59')-new Date())/86400000)}
function alertFor(date){const d=daysTo(date);if(d<0)return{level:'expired',label:'VENCIDA',days:d};if(d<=7)return{level:'urgent',label:'URGENTE',days:d};if(d<=15)return{level:'critical',label:'CRÍTICA',days:d};if(d<=30)return{level:'attention',label:'ATENCIÓN',days:d};if(d<=60)return{level:'warning',label:'PRÓXIMA A VENCER',days:d};return{level:'good',label:'VIGENTE',days:d}}
function setActive(active){ST.active=!!active;document.body.classList.toggle('cc-guarantees-center-active',ST.active);window.dispatchEvent(new CustomEvent('cc:route-changed',{detail:{route:ST.active?'guarantees':''}}))}
function rows(){const d=DB()||{},ps=A(d.projects).filter(p=>!p.deletedAt),cs=A(d.contracts);return A(d.guarantees).filter(g=>!g.voidedAt&&!g.voided_at).map(g=>{const p=ps.find(x=>x.id===g.projectId)||{},c=cs.find(x=>x.id===g.contractId)||cs.find(x=>x.projectId===g.projectId)||{},a=alertFor(g.end);return{...g,projectCode:p.code||'',projectName:p.name||'Proyecto',contractNumber:c.number||'',contractor:c.contractor||'No registrado',alert:a,amount:N(g.applied??g.calculated),extensions:A(g.extensions).length}}).filter(x=>x.projectName).sort((a,b)=>a.alert.days-b.alert.days)}
function filtered(all){const q=ST.search.trim().toLowerCase();return all.filter(x=>ST.project==='all'||x.projectId===ST.project).filter(x=>!q||`${x.projectCode} ${x.projectName} ${x.contractNumber} ${x.contractor} ${x.type} ${x.number||''} ${x.issuer||''}`.toLowerCase().includes(q))}
function css(){if(document.getElementById('cc-guarantees-center-v1-style'))return;const s=document.createElement('style');s.id='cc-guarantees-center-v1-style';s.textContent=`
.ccg-page{display:grid;gap:0}.cc-guarantees-center-active .ccg-head,.cc-guarantees-center-active .ccg-kpis{display:none!important}.ccg-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px}.ccg-head h2{margin:3px 0;color:#f8fafc;font-size:24px;letter-spacing:-.025em}.ccg-head p{margin:0;color:#8fa4bb;font-size:10px}.ccg-eyebrow{color:#70a9f7;font-size:8px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.ccg-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.ccg-kpi{padding:13px 14px;border:1px solid rgba(148,163,184,.12);border-radius:13px;background:linear-gradient(145deg,#0e243c,#0a1d31);box-shadow:0 9px 26px rgba(0,0,0,.12)}.ccg-kpi small{display:block;color:#8fa4bb;font-size:8px}.ccg-kpi strong{display:block;margin-top:5px;color:#f8fafc;font-size:18px}.ccg-kpi.warn strong{color:#fde68a}.ccg-kpi.danger strong{color:#fecdd3}.ccg-tools{display:grid;grid-template-columns:minmax(280px,1fr) minmax(260px,1fr) auto auto;gap:8px;padding:10px;border:1px solid rgba(148,163,184,.12);border-radius:13px;background:#0a1d30}.ccg-tools input,.ccg-tools select{height:38px;min-width:0;border:1px solid #29415d;border-radius:9px;background:#071827;color:#f8fafc;padding:0 10px;font-size:9px}.ccg-tools #ccgNew{height:38px;white-space:nowrap}.ccg-count{display:grid;place-items:center;color:#8fa4bb;font-size:8px}.ccg-tablewrap{overflow:auto;border:1px solid rgba(148,163,184,.11);border-radius:14px;background:#081827}.ccg-table{width:100%;min-width:1120px;border-collapse:collapse}.ccg-table th,.ccg-table td{padding:9px 10px;border-bottom:1px solid rgba(148,163,184,.075);text-align:left;vertical-align:middle}.ccg-table th{position:sticky;top:0;background:#0e253d;color:#8fa5bd;font-size:7px;text-transform:uppercase;letter-spacing:.055em}.ccg-table td{color:#d7e3ef;font-size:8px}.ccg-table tr:hover td{background:rgba(59,130,246,.035)}.ccg-project b{display:block;color:#76a9fa;font-size:8px}.ccg-project strong{display:block;color:#f8fafc;font-size:9px;margin:2px 0}.ccg-project small,.ccg-contract small{display:block;color:#71879e;font-size:7px}.ccg-contract b{display:block;color:#cbd8e6;font-size:8px}.ccg-alert{display:inline-flex;padding:4px 7px;border-radius:999px;border:1px solid rgba(34,197,94,.16);background:rgba(34,197,94,.06);color:#bbf7d0;font-size:7px;font-weight:900;white-space:nowrap}.ccg-alert.warning,.ccg-alert.attention{border-color:rgba(245,158,11,.20);background:rgba(245,158,11,.07);color:#fde68a}.ccg-alert.critical,.ccg-alert.urgent,.ccg-alert.expired{border-color:rgba(244,63,94,.22);background:rgba(244,63,94,.08);color:#fecdd3}.ccg-days{font-weight:900;color:#dce8f5}.ccg-days.danger{color:#fecdd3}.ccg-amount{text-align:right;font-variant-numeric:tabular-nums}.ccg-empty{padding:34px;text-align:center;color:#8fa4bb}
@media(max-width:1000px){.ccg-kpis{grid-template-columns:1fr 1fr}.ccg-tools{grid-template-columns:1fr 1fr}.ccg-tools input{grid-column:1/-1}.ccg-count{display:none}}
@media(max-width:520px){.ccg-head{display:block}.ccg-head .btn{margin-top:9px;width:100%}.ccg-kpis{grid-template-columns:1fr 1fr}.ccg-tools{grid-template-columns:1fr}.ccg-tools input{grid-column:auto}.ccg-table{min-width:920px}}
`;document.head.appendChild(s)}
function openProject(id){setActive(false);try{view.projectId=id;view.screen='project';view.tab='guarantees';renderApp()}catch(e){console.warn(e)}}
function render(options={}){
  if(!ST.active)return;css();
  const c=document.getElementById('content');if(!c)return;
  const restoreSearch=!!options.restoreSearch&&document.activeElement?.id==='ccgSearch';
  const oldSearch=document.getElementById('ccgSearch'),caret=restoreSearch?oldSearch?.selectionStart:0;
  const all=rows(),projects=A(DB()?.projects).filter(p=>!p.deletedAt).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
  const hasFilter=!!(ST.search.trim()||ST.project!=='all'),list=filtered(all);
  c.innerHTML=`<section class="ccg-page">
    <div class="ccg-head"><div><span class="ccg-eyebrow">CONTROL DE VIGENCIAS CONTRACTUALES</span><h2>Garantías</h2><p>Consulta y registra garantías vinculadas a cada expediente.</p></div></div>
    <div class="ccg-kpis"></div>
    <div class="ccg-tools">
      <input id="ccgSearch" placeholder="Buscar por proyecto, código, contrato, garantía o contratista…" value="${E(ST.search)}">
      <select id="ccgProject"><option value="all">Elegir un proyecto</option>${projects.map(p=>`<option value="${E(p.id)}" ${ST.project===p.id?'selected':''}>${E(p.code||'')} · ${E(p.name||'Proyecto')}</option>`).join('')}</select>
      <button type="button" class="btn primary" id="ccgNew">＋ Agregar garantía</button>
      <span class="ccg-count">${hasFilter?`${list.length} resultado${list.length===1?'':'s'}`:'Elige o busca un proyecto'}</span>
    </div>
    ${hasFilter?`<div class="ccg-tablewrap">${list.length?`<table class="ccg-table"><thead><tr><th>Proyecto</th><th>Contrato / contratista</th><th>Garantía</th><th>Número / emisor</th><th>Inicio</th><th>Vencimiento</th><th>Estado</th><th>Días</th><th>Monto</th><th></th></tr></thead><tbody>${list.map(x=>`<tr><td class="ccg-project"><b>${E(x.projectCode)}</b><strong>${E(x.projectName)}</strong></td><td class="ccg-contract"><b>${E(x.contractNumber||'Pendiente')}</b><small>${E(x.contractor)}</small></td><td><b>${E(x.type||'Garantía')}</b></td><td>${E(x.number||'—')}<small style="display:block;color:#71879e">${E(x.issuer||'Sin emisor registrado')}</small></td><td>${D(x.start)}</td><td><b>${D(x.end)}</b></td><td><span class="ccg-alert ${E(x.alert.level)}">${E(x.alert.label)}</span></td><td><span class="ccg-days ${x.alert.days<0?'danger':''}">${x.alert.days>=0?x.alert.days:`Vencida ${Math.abs(x.alert.days)}`}</span></td><td class="ccg-amount"><b>${M(x.amount)}</b></td><td><button class="btn primary" type="button" data-ccg-open="${E(x.projectId)}">Abrir garantías →</button></td></tr>`).join('')}</tbody></table>`:'<div class="ccg-empty">No hay garantías registradas para esta búsqueda.</div>'}</div>`:''}
  </section>`;
  const search=document.getElementById('ccgSearch');
  search.oninput=e=>{ST.search=e.target.value;clearTimeout(search._t);search._t=setTimeout(()=>render({restoreSearch:true}),180)};
  document.getElementById('ccgProject').onchange=e=>{ST.project=e.target.value;render()};
  document.querySelectorAll('[data-ccg-open]').forEach(b=>b.onclick=()=>openProject(b.dataset.ccgOpen));
  document.getElementById('ccgNew').onclick=()=>{try{if(typeof dashboardQuickAction==='function')dashboardQuickAction('guarantee')}catch{}};
  if(restoreSearch){const next=document.getElementById('ccgSearch');if(next){next.focus({preventScroll:true});const pos=Math.min(Number(caret)||0,next.value.length);try{next.setSelectionRange(pos,pos)}catch{}}}
}
function openCenter(){window.__ccContractsCenter?.close?.();window.__ccPaymentsCenter?.close?.();ST.search='';ST.project='all';setActive(true);render()}
function closeCenter(){setActive(false)}
window.__ccGuaranteesCenter={open:openCenter,close:closeCenter,render,state:ST};
window.addEventListener('cc:data-changed',()=>{if(ST.active)setTimeout(render,40)});
css();
})();
