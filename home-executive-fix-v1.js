/* ===== INICIO EJECUTIVO · CORRECCIONES DE AUDITORÍA V1 ===== */
(()=>{
'use strict';
if(window.__CC_HOME_EXEC_FIX_V1__)return;
window.__CC_HOME_EXEC_FIX_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v)||0;
const M=v=>`L ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const P=v=>`${Math.max(0,Math.min(100,N(v))).toFixed(2)}%`;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function getDB(){try{return db||null}catch{return null}}
function activeProjects(){const d=getDB();return d?A(d.projects).filter(p=>!p.deletedAt):[]}
function contractFor(p){const d=getDB();return d?A(d.contracts).find(c=>c.projectId===p.id&&!c.voidedAt&&!c.voided_at)||null:null}
function currentAmount(p,c){
  const direct=N(c?.currentAmount);
  if(direct>0)return direct;
  const base=N(c?.originalAmount||p?.budget);
  const d=getDB();
  if(!c||!d)return base;
  const delta=A(d.changes).filter(x=>x.contractId===c.id&&/aprobado/i.test(String(x.status||''))&&!x.voidedAt&&!x.voided_at).reduce((s,x)=>s+N(x.amountDelta),0);
  return Math.max(0,base+delta);
}
function grossFor(c){const d=getDB();if(!d||!c)return 0;return A(d.estimates).filter(e=>e.contractId===c.id&&!/anulad/i.test(String(e.status||''))).reduce((s,e)=>s+N(e.gross),0)}
function paidFor(p,c){
  try{
    if(typeof projectFinancials==='function'){
      const f=projectFinancials(p,c);
      const cents=N(f?.totalPaidC);
      if(typeof fromCents==='function')return N(fromCents(cents));
      return cents/100;
    }
  }catch{}
  const d=getDB();if(!d)return 0;
  const est=c?A(d.estimates).filter(e=>e.contractId===c.id&&/pagad/i.test(String(e.status||''))):[];
  const paidEst=est.reduce((s,e)=>s+N(e.net),0);
  const advance=/pagad/i.test(String(c?.advanceStatus||''))?N(c?.advancePaid):0;
  const other=A(d.payments).filter(x=>x.projectId===p.id&&/pagad/i.test(String(x.status||''))).reduce((s,x)=>s+N(x.amount),0);
  return paidEst+advance+other;
}
function latestVisit(p){const d=getDB();if(!d)return null;return A(d.visits).filter(v=>v.projectId===p.id).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).at(-1)||null}
function physicalFor(p,c){
  const v=latestVisit(p);if(v&&Number.isFinite(Number(v.physical)))return Math.max(0,Math.min(100,N(v.physical)));
  try{if(typeof projectAutomaticProgress==='function')return Math.max(0,Math.min(100,N(projectAutomaticProgress(p,c)?.physical)))}catch{}
  return Math.max(0,Math.min(100,N(p.physicalProgress)))
}
function timePct(p,c){
  const start=c?.start||p.start||'',end=c?.end||p.end||'';
  if(!start||!end)return null;
  const s=new Date(start+'T00:00:00'),e=new Date(end+'T23:59:59'),now=new Date();
  if(Number.isNaN(+s)||Number.isNaN(+e)||e<=s)return null;
  if(now<=s)return 0;if(now>=e)return 100;
  return Math.max(0,Math.min(100,(now-s)/(e-s)*100));
}
function weighted(rows,key){
  const valid=rows.filter(x=>Number.isFinite(Number(x[key])));
  if(!valid.length)return 0;
  const totalW=valid.reduce((s,x)=>s+Math.max(0,N(x.weight)),0);
  if(totalW>0)return valid.reduce((s,x)=>s+N(x[key])*Math.max(0,N(x.weight)),0)/totalW;
  return valid.reduce((s,x)=>s+N(x[key]),0)/valid.length;
}
function snapshot(){
  const ps=activeProjects();
  const rows=ps.map(p=>{const c=contractFor(p),amount=currentAmount(p,c),gross=grossFor(c),paid=paidFor(p,c),physical=physicalFor(p,c),time=timePct(p,c);return{p,c,amount,gross,paid,physical,time}});
  const execution=rows.filter(x=>/ejecuci/i.test(String(x.p.status||'')));
  const finalized=rows.filter(x=>/finaliz|cerrad/i.test(String(x.p.status||'')));
  const pre=rows.filter(x=>/planific|proceso de contrat|adjudic/i.test(String(x.p.status||'')));
  const portfolio=rows.reduce((s,x)=>s+x.amount,0),paid=rows.reduce((s,x)=>s+x.paid,0);
  const execAmount=execution.reduce((s,x)=>s+x.amount,0),execGross=execution.reduce((s,x)=>s+x.gross,0),execPaid=execution.reduce((s,x)=>s+x.paid,0);
  const financial=execAmount?execGross/execAmount*100:0;
  const physical=weighted(execution.map(x=>({...x,weight:x.amount||1})),'physical');
  const time=weighted(execution.filter(x=>x.time!==null).map(x=>({...x,weight:x.amount||1})),'time');
  return{rows,execution,finalized,pre,portfolio,paid,execAmount,execGross,execPaid,financial,physical,time,balance:Math.max(0,execAmount-execGross)};
}

function topIssue(ps){
  try{
    if(typeof dashboardFollowups==='function'){
      const f=dashboardFollowups(ps);const x=A(f?.items)[0];
      if(x)return{title:x.title||'Seguimiento requerido',detail:x.detail||'',projectId:x.projectId,tab:x.tab||'summary',level:x.level||'attention'};
    }
  }catch{}
  const d=getDB();if(!d)return null;
  let best=null;
  for(const p of ps){
    const c=contractFor(p),phys=physicalFor(p,c);
    for(const g of A(d.guarantees).filter(g=>g.projectId===p.id)){
      let a=null;try{a=typeof guaranteeAlert==='function'?guaranteeAlert(g.end):null}catch{}
      if(a&&['expired','urgent','critical','attention','warning'].includes(a.level)){
        const score={expired:0,urgent:1,critical:2,attention:3,warning:4}[a.level]??5;
        const item={score,title:`Garantía ${g.type||''}: ${a.label||'revisar vigencia'}`,detail:`${p.code||''} · ${g.number||'Sin número'}`,projectId:p.id,tab:'guarantees',level:a.level};
        if(!best||score<best.score)best=item;
      }
    }
    if(c?.end&&!/finaliz|cerrad/i.test(String(p.status||''))){
      const days=Math.ceil((new Date(c.end+'T12:00:00')-new Date())/86400000);
      if(days<0&&phys<100){const item={score:0,title:'Proyecto con plazo vencido',detail:`${p.code||''} · avance físico ${P(phys)}`,projectId:p.id,tab:'summary',level:'expired'};if(!best||item.score<best.score)best=item}
    }
  }
  return best;
}
function priorityLabel(value,text=''){
  const t=String(text).toLowerCase(),n=N(value);
  if(/vencid|cr[ií]tic|urgente|incumpl/.test(t))return['Urgente','danger'];
  if(/garant|plazo|atras|pendiente/.test(t))return['Alta','high'];
  if(n>=80)return['Urgente','danger'];
  if(n>=55)return['Alta','high'];
  if(n>=25)return['Atención','attention'];
  return['Seguimiento','info'];
}
function parseMoney(text){return N(String(text||'').replace(/[^0-9.-]/g,''))}
function syncTime(){
  try{
    if(typeof cloudLastSaved!=='undefined'&&cloudLastSaved){const d=new Date(cloudLastSaved);if(!Number.isNaN(+d))return d}
  }catch{}
  return null;
}
function formatDateTime(d){return d.toLocaleString('es-HN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'numeric',minute:'2-digit'})}

function injectCss(){
  if(document.getElementById('cc-home-exec-fix-style'))return;
  const s=document.createElement('style');s.id='cc-home-exec-fix-style';s.textContent=`
  .cc-home-exec-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0}
  .cc-home-exec-three>div{padding:12px;border:1px solid #dfe7f0;border-radius:12px;background:#fff}
  .cc-home-exec-three small{display:block;color:#718196;font-size:8px;text-transform:uppercase;letter-spacing:.05em}
  .cc-home-exec-three strong{display:block;margin-top:5px;color:#17334c;font-size:18px}
  .cc-home-exec-three span{display:block;margin-top:4px;color:#74869a;font-size:9px;line-height:1.35}
  .cc-home-exec-three .warn{background:#fffaf0;border-color:#efdba8}.cc-home-exec-three .warn strong{color:#a66a08}
  .cc-home-priority{display:inline-flex!important;align-items:center;justify-content:center;padding:5px 8px;border-radius:999px;border:1px solid #d5e0ea;background:#f2f6fa;color:#4e6479;font-size:8px!important;font-weight:850}
  .cc-home-priority.danger{background:#fff0f1;border-color:#efc9cc;color:#aa3540}.cc-home-priority.high{background:#fff7e8;border-color:#eed9ab;color:#96620b}.cc-home-priority.attention{background:#fffbea;border-color:#eadfae;color:#7c681b}.cc-home-priority.info{background:#eef6ff;border-color:#c9dff4;color:#1769c2}
  .cc-home-top-issue{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 13px;border:1px solid #efd9ad;border-radius:12px;background:#fffaf1}
  .cc-home-top-issue .dot{width:10px;height:10px;border-radius:50%;background:#d58a13;box-shadow:0 0 0 5px #fff0cf}.cc-home-top-issue strong{display:block;color:#67470b;font-size:10px}.cc-home-top-issue small{display:block;color:#8b7447;font-size:9px;margin-top:2px}.cc-home-top-issue .btn{white-space:nowrap}
  .cc-home-reconcile-note{display:block!important;margin-top:4px!important;color:#6c7c8f!important;font-size:8px!important;line-height:1.35!important}
  .cc-home-access-extra{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
  .cc-home-access-extra button{padding:12px;border:1px solid #dfe7f0;border-radius:12px;background:#fff;color:#294158;text-align:left;min-height:68px}.cc-home-access-extra button:hover{background:#f4f8fc;border-color:#abc2d8}.cc-home-access-extra b{display:block;font-size:11px}.cc-home-access-extra small{display:block;margin-top:4px;color:#74869a;font-size:8px}
  @media(max-width:760px){.cc-home-exec-three,.cc-home-access-extra{grid-template-columns:1fr}.cc-home-top-issue{grid-template-columns:auto 1fr}.cc-home-top-issue .btn{grid-column:1/-1;width:100%}}
  `;document.head.appendChild(s);
}

function patchHome(){
  injectCss();
  const root=document.querySelector('#content .ccx-page');
  const title=root?.querySelector('.ccx-head h2');
  if(!root||!title||!/estado general del portafolio/i.test(title.textContent||''))return;
  const snap=snapshot();
  const kpis=root.querySelector('.ccx-kpis');
  if(kpis){
    const cards=[...kpis.children];
    if(cards[0]){cards[0].querySelector('strong').textContent=String(snap.rows.length);const span=cards[0].querySelector('span');if(span)span.textContent=`${snap.execution.length} en ejecución`}
    if(cards[1]){cards[1].querySelector('strong').textContent=String(snap.finalized.length);const span=cards[1].querySelector('span');if(span)span.textContent=`${snap.pre.length} antes de ejecución`}
    if(cards[3]){const sm=cards[3].querySelector('small'),st=cards[3].querySelector('strong'),sp=cards[3].querySelector('span');if(sm)sm.textContent='Monto contractual vigente';if(st)st.textContent=M(snap.portfolio);if(sp)sp.textContent=`Total pagado: ${M(snap.paid)}`}
  }
  const ex=root.querySelector('.ccx-exec');
  if(ex){const cells=[...ex.children];if(cells[0]){cells[0].querySelector('strong').textContent=P(snap.financial);const bar=cells[0].querySelector('.ccx-bar i');if(bar)bar.style.width=Math.min(100,snap.financial)+'%'}if(cells[1])cells[1].querySelector('strong').textContent=M(snap.execAmount);if(cells[2])cells[2].querySelector('strong').textContent=M(snap.execGross);if(cells[3])cells[3].querySelector('strong').textContent=M(snap.execPaid);if(cells[4])cells[4].querySelector('strong').textContent=M(snap.balance)}
  let three=root.querySelector('[data-cc-home-three]');
  if(!three){three=document.createElement('section');three.className='cc-home-exec-three';three.dataset.ccHomeThree='1';ex?.insertAdjacentElement('afterend',three)}
  if(three){const gap=Math.round((snap.physical-snap.time)*100)/100;three.innerHTML=`<div><small>Avance físico promedio</small><strong>${P(snap.physical)}</strong><span>Promedio ponderado de proyectos en ejecución según la supervisión registrada.</span></div><div><small>Avance financiero</small><strong>${P(snap.financial)}</strong><span>Estimaciones acumuladas respecto al monto contractual vigente.</span></div><div class="${snap.time>snap.physical+10?'warn':''}"><small>Tiempo contractual consumido</small><strong>${P(snap.time)}</strong><span>${snap.execution.length?`Diferencia físico vs. tiempo: ${gap>=0?'+':''}${gap.toFixed(2)} puntos.`:'Sin proyectos en ejecución.'}</span></div>`}
  const issue=topIssue(snap.rows.map(x=>x.p));let issueBox=root.querySelector('[data-cc-home-issue]');
  if(issue){if(!issueBox){issueBox=document.createElement('section');issueBox.className='cc-home-top-issue';issueBox.dataset.ccHomeIssue='1';three?.insertAdjacentElement('afterend',issueBox)}issueBox.innerHTML=`<span class="dot"></span><div><strong>Atención prioritaria: ${esc(issue.title)}</strong><small>${esc(issue.detail||'Abrir el expediente para revisar el seguimiento requerido.')}</small></div><button class="btn" type="button" data-cc-home-open="${esc(issue.projectId||'')}" data-cc-home-tab="${esc(issue.tab||'summary')}">Revisar ahora</button>`}else if(issueBox)issueBox.remove();
  const attention=[...root.querySelectorAll('details.ccx-fold')].find(d=>/situaciones que requieren atención/i.test(d.querySelector('summary')?.textContent||''));
  if(attention){attention.querySelectorAll('.ccx-row').forEach(row=>{const cells=[...row.children];if(cells.length<3)return;const reason=cells[0]?.querySelector('small')?.textContent||'';const b=cells[1]?.querySelector('b');const sm=cells[1]?.querySelector('small');if(!b)return;const [label,cls]=priorityLabel(b.textContent,reason);if(sm)sm.textContent='Nivel';b.textContent=label;b.className=`cc-home-priority ${cls}`;cells[2].querySelector('small')&&(cells[2].querySelector('small').textContent='Avance financiero')})}
  const rec=[...root.querySelectorAll('details.ccx-fold')].find(d=>/conciliación contractual/i.test(d.querySelector('summary')?.textContent||''));
  if(rec){rec.querySelectorAll('.ccx-row').forEach(row=>{const cells=[...row.children];if(cells.length<3)return;const first=cells[0],contractual=parseMoney(cells[1]?.querySelector('b')?.textContent),budget=parseMoney(cells[2]?.querySelector('b')?.textContent);let note='Diferencia pendiente de conciliación entre el expediente contractual y el último corte presupuestario.';if(contractual>budget+.01)note='El expediente contractual registra más pagos que el corte presupuestario; verificar si S.A.M.I. aún no refleja movimientos recientes.';else if(budget>contractual+.01)note='S.A.M.I. registra más pago que el expediente contractual; revisar pagos o estimaciones aún no incorporados al expediente.';let el=first?.querySelector('.cc-home-reconcile-note');if(!el&&first){el=document.createElement('small');el.className='cc-home-reconcile-note';first.appendChild(el)}if(el)el.textContent=note})}
  const access=root.querySelector('.ccx-access');let extra=root.querySelector('[data-cc-home-access-extra]');
  if(access&&!extra){extra=document.createElement('section');extra.className='cc-home-access-extra';extra.dataset.ccHomeAccessExtra='1';extra.innerHTML=`<button type="button" data-cc-home-contracts><b>Contratos</b><small>Ver contratos, montos vigentes y ejecución.</small></button><button type="button" data-cc-home-quick="visit"><b>Registrar visita</b><small>Agregar supervisión y avance físico.</small></button><button type="button" data-cc-home-quick="estimate"><b>Nueva estimación</b><small>Registrar avance financiero y pago periódico.</small></button>`;access.insertAdjacentElement('afterend',extra)}
  const sync=document.getElementById('ccxSync');if(sync){const t=syncTime(),suffix=t?` · Última actualización: ${formatDateTime(t)}`:' · Datos cargados en esta sesión';if(!/Última actualización:|Datos cargados en esta sesión/.test(sync.textContent||''))sync.insertAdjacentText('beforeend',suffix)}
}

document.addEventListener('click',e=>{
  const op=e.target.closest?.('[data-cc-home-open]');if(op){e.preventDefault();try{view.projectId=op.dataset.ccHomeOpen;view.screen='project';view.tab=op.dataset.ccHomeTab||'summary';renderApp()}catch{}return}
  if(e.target.closest?.('[data-cc-home-contracts]')){e.preventDefault();document.getElementById('cccNavBtn')?.click();return}
  const q=e.target.closest?.('[data-cc-home-quick]');if(q){e.preventDefault();try{if(typeof dashboardQuickAction==='function')dashboardQuickAction(q.dataset.ccHomeQuick)}catch{}return}
},true);

let queued=false;
const run=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;patchHome()})};
new MutationObserver(run).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('online',run);window.addEventListener('offline',run);
setTimeout(run,0);setTimeout(run,400);setTimeout(run,1200);
window.ccPatchHomeExecutive=patchHome;
})();
