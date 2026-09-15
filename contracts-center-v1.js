/* ===== CONTROL CONTRACTUAL · CENTRO DE CONTRATOS V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACTS_CENTER_V1__)return;
window.__CC_CONTRACTS_CENTER_V1__=true;

const ST={active:false,rows:null,at:0,search:'',newContractOpen:false};
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v)||0;
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const M=v=>`L ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const D=v=>{if(!v)return 'Sin fecha';const d=String(v).slice(0,10).split('-');return d.length===3?`${d[2]}/${d[1]}/${d[0]}`:String(v)};
const WS=()=>{try{return cloudWorkspaceId||null}catch{return null}};
const DB=()=>{try{return db||null}catch{return null}};

function setActive(active){ST.active=!!active;document.body.classList.toggle('cc-contracts-center-active',ST.active);window.dispatchEvent(new CustomEvent('cc:route-changed',{detail:{route:ST.active?'contracts':''}}))}
function loadOfficialFormat(){
 if(window.__CC_OFFICIAL_CONTRACT_FORMAT_V1__||document.getElementById('ccOfficialContractFormatScript'))return;
 const s=document.createElement('script');
 s.id='ccOfficialContractFormatScript';
 s.src='contract-official-format-v1.js?v=20260831-phone3';
 s.async=false;
 s.onerror=()=>console.warn('No se pudo cargar el formato oficial del contrato.');
 document.head.appendChild(s);
}
function loadDownloadActions(){
 if(window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V2__||document.getElementById('ccContractDownloadActionsV2Script'))return;
 const s=document.createElement('script');
 s.id='ccContractDownloadActionsV2Script';
 s.src='contract-download-actions-v2.js?v=20260831-download3';
 s.async=false;
 s.onerror=()=>console.warn('No se pudieron cargar las descargas y archivo documental del expediente contractual.');
 document.head.appendChild(s);
}
function css(){
 if(document.getElementById('cc-contracts-center-v1-style'))return;
 const s=document.createElement('style');s.id='cc-contracts-center-v1-style';s.textContent=`
 .ccc-page{display:grid;gap:10px}.ccc-head{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:0;padding:0;border:0;background:transparent;box-shadow:none}.ccc-head:after{display:none}.ccc-head-copy{max-width:none}.ccc-head h2{margin:0;font-size:22px;line-height:1.1;letter-spacing:-.02em;color:#f8fafc}.ccc-head p,.ccc-eyebrow{display:none!important}.ccc-head-actions{position:static;display:flex;gap:8px}.ccc-head-actions .btn{min-width:0}.ccc-tools{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:12px;border:1px solid rgba(107,155,190,.16);border-radius:12px;background:linear-gradient(90deg,#0b2439,#091b2c)}.ccc-tools input{flex:1;min-width:0;height:46px}.ccc-search-label{grid-column:1/-1;color:#6f9dbb;font-size:8px;font-weight:900;letter-spacing:.15em;text-transform:uppercase}.ccc-table{overflow:auto;border:1px solid rgba(107,155,190,.16);border-radius:12px;background:#081a2a;box-shadow:0 8px 28px rgba(0,0,0,.10)}.ccc-row{display:grid;grid-template-columns:minmax(170px,.8fr) minmax(260px,1.5fr) minmax(155px,.8fr) 135px 120px 112px;gap:10px;align-items:center;padding:11px 13px;border-bottom:1px solid #edf1f5}.ccc-row:last-child{border-bottom:0}.ccc-row.head{position:sticky;top:0;z-index:2;background:#f4f7fa;color:#64788c;font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.ccc-row:not(.head):hover{background:#f8fbfe}.ccc-main b{display:block;color:#1a3148;font-size:10px}.ccc-main small,.ccc-cell small{display:block;margin-top:2px;color:#7a8c9e;font-size:8px}.ccc-cell b{color:#29445e;font-size:10px}.ccc-progress{display:flex;align-items:center;gap:7px}.ccc-track{height:6px;flex:1;border-radius:99px;background:#e7eef5;overflow:hidden}.ccc-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#1769c2,#43a1ef)}.ccc-empty{padding:34px;text-align:center;color:#788a9d}.ccc-nav-btn{white-space:nowrap}
 body.cc-portal-v2 .ccc-head h2{color:#f8fafc}body.cc-portal-v2 .ccc-head p{color:#8fa4bb}body.cc-portal-v2 .ccc-eyebrow{color:#70a9f7}body.cc-portal-v2 .ccc-kpi,body.cc-portal-v2 .ccc-tools,body.cc-portal-v2 .ccc-table{background:linear-gradient(180deg,#0e2237,#091a2b);border-color:rgba(148,163,184,.12);box-shadow:0 10px 28px rgba(0,0,0,.12)}body.cc-portal-v2 .ccc-kpi small{color:#8fa4bb}body.cc-portal-v2 .ccc-kpi strong{color:#f8fafc}body.cc-portal-v2 .ccc-row{border-bottom-color:rgba(148,163,184,.08)}body.cc-portal-v2 .ccc-row.head{background:#0e253d;color:#8fa5bd}body.cc-portal-v2 .ccc-row:not(.head):hover{background:rgba(59,130,246,.045)}body.cc-portal-v2 .ccc-main b,body.cc-portal-v2 .ccc-cell b{color:#dce8f5}body.cc-portal-v2 .ccc-main small,body.cc-portal-v2 .ccc-cell small{color:#71879e}body.cc-portal-v2 .ccc-track{background:#071827}body.cc-portal-v2 .ccc-empty{color:#8fa4bb}
 body.cc-contracts-center-active .ccc-head p{display:none!important}\n @media(max-width:1050px){.ccc-row{grid-template-columns:minmax(150px,.8fr) minmax(220px,1.5fr) 130px 105px 100px}.ccc-row>*:nth-child(3){display:none}}
 @media(max-width:700px){.ccc-head{display:flex;align-items:center}.ccc-head h2{font-size:20px}.ccc-head-actions .btn{flex:0 0 auto}.ccc-row.head{display:none}.ccc-row{grid-template-columns:1fr auto;gap:6px 10px}.ccc-row>*{display:block!important}.ccc-row .ccc-cell{grid-column:1}.ccc-row .ccc-action{grid-column:2;grid-row:1/5;align-self:center}.ccc-tools{display:grid;grid-template-columns:1fr}.ccc-tools input{width:100%}.ccc-tools .btn{width:100%}}
 @media(max-width:440px){.ccc-head{align-items:flex-start}.ccc-head-actions{display:flex}.ccc-head h2{font-size:19px}}
 `;document.head.appendChild(s);
}
function ensureNav(){const nav=document.getElementById('ccxNav');if(!nav)return;let b=document.getElementById('cccNavBtn');if(!b){b=document.createElement('button');b.id='cccNavBtn';b.className='ccc-nav-btn';b.type='button';b.textContent='Contratos';b.dataset.ccContracts='1';const projects=nav.querySelector('[data-ccx="projects"]');projects?.insertAdjacentElement('afterend',b)}b.classList.toggle('active',ST.active);if(ST.active)nav.querySelectorAll('[data-ccx],#ccgNavBtn').forEach(x=>x.classList.remove('active'))}
function fallback(){const d=DB()||{},ps=A(d.projects),chs=A(d.changes),es=A(d.estimates);return A(d.contracts).filter(c=>!c.voidedAt&&!c.voided_at).map(c=>{const p=ps.find(x=>x.id===c.projectId)||{};const delta=chs.filter(x=>x.contractId===c.id&&x.status==='Aprobado'&&!x.voidedAt&&!x.voided_at).reduce((s,x)=>s+N(x.amountDelta),0);const current=N(c.originalAmount)+delta;const est=es.filter(x=>x.contractId===c.id&&x.status!=='Anulada'&&!x.voidedAt&&!x.voided_at);const gross=est.reduce((s,x)=>s+N(x.gross),0),paid=est.filter(x=>/pagad/i.test(x.status||'')).reduce((s,x)=>s+N(x.net),0);return{project_id:p.id,code:p.code,name:p.name,contract_id:c.id,contract_number:c.number,contractor:c.contractor,original_amount:N(c.originalAmount),current_amount:current,estimated_total:gross,paid_total:paid,contractual_balance:Math.max(0,current-gross),financial_progress_pct:current?gross/current*100:0,contract_start_date:c.start,contract_end_date:c.end}})}
async function load(force=false){if(!force&&ST.rows&&Date.now()-ST.at<45000)return ST.rows;const w=WS();if(!w||!navigator.onLine||typeof sbFetch!=='function'){ST.rows=fallback();return ST.rows}try{const q=`/rest/v1/project_financial_summary?select=project_id,code,name,contract_id,contract_number,contractor,original_amount,current_amount,estimated_total,paid_total,contractual_balance,financial_progress_pct,contract_start_date,contract_end_date&workspace_id=eq.${encodeURIComponent(w)}&contract_id=not.is.null&order=contract_number.asc`;const r=await sbFetch(q);ST.rows=A(r.data);ST.at=Date.now();return ST.rows}catch(e){console.warn('Centro de contratos:',e);ST.rows=fallback();return ST.rows}}
function renderRows(rows){const q=ST.search.trim().toLowerCase();if(!q)return `<div class="ccc-empty"><b>Busca un contrato para comenzar.</b><br><small>Escribe número de contrato, nombre del proyecto, código o contratista. También puedes crear un contrato nuevo.</small></div>`;const filtered=rows.filter(x=>`${x.contract_number||''} ${x.code||''} ${x.name||''} ${x.contractor||''}`.toLowerCase().includes(q));if(!filtered.length)return `<div class="ccc-empty">No hay contratos que coincidan con la búsqueda.</div>`;return `<div class="ccc-row head"><span>Contrato</span><span>Proyecto</span><span>Contratista</span><span>Monto</span><span>Vigencia</span><span>Acción</span></div>${filtered.map(x=>{const end=x.contract_end_date?new Date(String(x.contract_end_date).slice(0,10)+'T12:00:00'):null,today=new Date(),status=!end?'Sin fecha final':end<today?'Plazo vencido':'Vigente';return `<div class="ccc-row"><div class="ccc-main"><b>${E(x.contract_number||'Sin número')}</b><small>Contrato registrado</small></div><div class="ccc-main"><b>${E(x.code||'')} · ${E(x.name||'Proyecto')}</b><small>${E(x.project_id||'')}</small></div><div class="ccc-cell"><b>${E(x.contractor||'No registrado')}</b><small>Contratista</small></div><div class="ccc-cell"><b>${M(x.original_amount||x.current_amount)}</b><small>Monto contractual</small></div><div class="ccc-cell"><b>${D(x.contract_start_date)} → ${D(x.contract_end_date)}</b><small>${status}</small></div><div class="ccc-action"><button class="btn primary" data-ccc-open="${E(x.project_id)}">Abrir contrato →</button></div></div>`}).join('')}`}
function projectWithoutContractRows(){
 const d=DB()||{},contracts=A(d.contracts).filter(x=>!x.voidedAt&&!x.voided_at);
 return A(d.projects).filter(p=>!p.deletedAt&&!p.deleted_at&&!p.archivedAt&&!p.archived_at).filter(p=>!contracts.some(c=>String(c.projectId||c.project_id)===String(p.id))).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
}
function newContract(){
 const projects=projectWithoutContractRows();
 if(!projects.length){if(typeof toast==='function')toast('Todos los proyectos activos ya tienen contrato registrado.');return}
 if(typeof openModal!=='function'){
   const p=projects[0];setActive(false);try{if(typeof contractModal==='function')contractModal(p,null);else openProject(p.id)}catch{};return;
 }
 const html=`<div class="stack"><div class="notice">Selecciona el proyecto al que deseas vincular el contrato. El contrato quedará dentro del mismo expediente.</div><input id="cccProjectPickerSearch" placeholder="Buscar proyecto, código o ubicación"><div id="cccProjectPickerRows" class="stack"></div></div>`;
 const modal=openModal('Nuevo contrato',html);ST.newContractOpen=true;
 const host=modal.querySelector('#cccProjectPickerRows'),input=modal.querySelector('#cccProjectPickerSearch');
 const paint=()=>{const q=String(input?.value||'').trim().toLowerCase();const rows=projects.filter(p=>!q||`${p.code||''} ${p.name||''} ${p.location||''}`.toLowerCase().includes(q)).slice(0,40);host.innerHTML=rows.length?rows.map(p=>`<button type="button" class="btn" data-ccc-pick-project="${E(p.id)}" style="text-align:left"><b>${E(p.code||'Sin código')}</b> · ${E(p.name||'Proyecto')}<br><small>${E(p.location||'Sin ubicación')}</small></button>`).join(''):'<div class="ccc-empty">No se encontraron proyectos.</div>';};
 input?.addEventListener('input',paint);paint();
 host.addEventListener('click',e=>{const b=e.target.closest?.('[data-ccc-pick-project]');if(!b)return;const p=projects.find(x=>String(x.id)===String(b.dataset.cccPickProject));if(!p)return;modal.remove();ST.newContractOpen=false;setActive(false);try{if(typeof contractModal==='function')contractModal(p,null);else{view.projectId=p.id;view.screen='project';view.tab='contract';renderApp()}}catch(err){console.warn(err)}});
}
async function render(){if(!ST.active)return;css();ensureNav();const c=document.getElementById('content');if(!c)return;c.innerHTML='<div class="ccc-empty">Cargando contratos…</div>';const rows=(await load()).filter(x=>x.contract_id&&(x.contract_number||x.contractor||N(x.original_amount)>0));if(!ST.active)return;c.innerHTML=`<section class="ccc-page"><div class="ccc-head"><div class="ccc-head-copy"><h2>Contratos</h2></div><div class="ccc-head-actions"><button class="btn primary" id="cccNew">＋ Nuevo contrato</button></div></div><div class="ccc-tools"><span class="ccc-search-label">Buscar contrato</span><input id="cccSearch" placeholder="Número, proyecto, código o contratista…" value="${E(ST.search)}"><button class="btn" id="cccClear">Limpiar</button></div><div class="ccc-table" id="cccRows">${renderRows(rows)}</div></section>`;const input=document.getElementById('cccSearch');if(input)input.oninput=e=>{ST.search=e.target.value;document.getElementById('cccRows').innerHTML=renderRows(rows)};document.getElementById('cccClear')?.addEventListener('click',()=>{ST.search='';if(input){input.value='';input.focus()}document.getElementById('cccRows').innerHTML=renderRows(rows)});document.getElementById('cccNew')?.addEventListener('click',newContract);ensureNav()}
function openCenter(){ST.search='';setActive(true);ensureNav();render()}
function closeCenter(){setActive(false);ensureNav()}
function openProject(id){if(!id)return;setActive(false);try{view.projectId=id;view.screen='project';view.tab='contract';renderApp()}catch(e){console.error(e)}}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-cc-contracts]');if(b){e.preventDefault();e.stopPropagation();openCenter();return}if(e.target.closest?.('[data-ccx],#ccgNavBtn')){setActive(false);setTimeout(ensureNav,0)}const op=e.target.closest?.('[data-ccc-open]');if(op){e.preventDefault();openProject(op.dataset.cccOpen)}},true);
if(typeof renderApp==='function'&&!renderApp.__ccContractsCenter){const base=renderApp;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(()=>{ensureNav();if(ST.active)render()},20);return r};wrapped.__ccContractsCenter=true;renderApp=wrapped}
window.__ccContractsCenter={open:openCenter,close:closeCenter,refresh:()=>{ST.rows=null;return render()},state:ST};
css();loadOfficialFormat();loadDownloadActions();setTimeout(ensureNav,150);setTimeout(ensureNav,700);setTimeout(loadOfficialFormat,900);setTimeout(loadDownloadActions,950);
})();
