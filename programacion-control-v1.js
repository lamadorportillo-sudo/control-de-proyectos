/* ===== PROGRAMACION Y CONTROL DE OBRA V1 ===== */
(()=>{
'use strict';
if(window.__CC_PROGRAMACION_CONTROL_V1__)return;
window.__CC_PROGRAMACION_CONTROL_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ID=()=>globalThis.crypto?.randomUUID?.()||`pc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const isoToday=()=>new Date().toISOString().slice(0,10);
const dayMs=86400000;
const toDate=v=>v?new Date(`${String(v).slice(0,10)}T12:00:00`):null;
const fmtDate=v=>{try{return v?toDate(v).toLocaleDateString('es-HN'):'—'}catch{return v||'—'}};
const daysBetween=(a,b)=>{const x=toDate(a),y=toDate(b);return x&&y?Math.round((y-x)/dayMs):0};

function injectStyle(){
  if(document.getElementById('cc-programacion-control-style'))return;
  const s=document.createElement('style');
  s.id='cc-programacion-control-style';
  s.textContent=`
  .ccpc-wrap{display:grid;gap:12px;color:var(--text,#f3f4f6)}
  .ccpc-hero{border:1px solid #2c4059;background:linear-gradient(135deg,#0c1828,#111d2a 55%,#102516);border-radius:18px;padding:18px;display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr);gap:16px;align-items:center;box-shadow:0 14px 38px rgba(0,0,0,.18)}
  .ccpc-hero h2{font-size:22px!important;margin:0 0 6px!important}.ccpc-hero p{color:#9fb2c9;margin:0;max-width:820px}.ccpc-status{border:1px solid #29425f;background:#0b1420;border-radius:14px;padding:13px}.ccpc-status small{display:block;color:#89a0bb;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.ccpc-status b{display:block;font-size:20px;margin-top:3px}.ccpc-status.good b{color:#86efac}.ccpc-status.warn b{color:#fde68a}.ccpc-status.danger b{color:#fca5a5}
  .ccpc-actions{display:flex;gap:8px;flex-wrap:wrap}.ccpc-actions .btn{min-height:38px}
  .ccpc-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.ccpc-kpi{border:1px solid #243449;background:#0b121c;border-radius:12px;padding:11px}.ccpc-kpi small{display:block;color:#8ea2ba;font-size:9px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}.ccpc-kpi b{font-size:15px}.ccpc-kpi .delta.good{color:#86efac}.ccpc-kpi .delta.warn{color:#fde68a}.ccpc-kpi .delta.danger{color:#fca5a5}
  .ccpc-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(320px,.75fr);gap:12px}.ccpc-panel{border:1px solid #243449;background:#0c131d;border-radius:15px;padding:14px;min-width:0}.ccpc-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}.ccpc-panel-head h3{font-size:15px!important;margin:0!important}.ccpc-panel-head p{font-size:11px;color:#849ab4;margin:3px 0 0}.ccpc-badge{display:inline-flex;align-items:center;gap:5px;border:1px solid #31445d;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:800;color:#b8c7d8}.ccpc-badge.critical{color:#fecaca;border-color:#6a2c2c;background:#2a1212}.ccpc-badge.good{color:#bbf7d0;border-color:#275b3b;background:#102319}.ccpc-badge.warn{color:#fef08a;border-color:#665a1c;background:#28230c}
  .ccpc-table-wrap{overflow:auto;border:1px solid #1f2e40;border-radius:11px}.ccpc-table{width:100%;min-width:1120px;border-collapse:collapse}.ccpc-table th,.ccpc-table td{padding:9px 10px;border-bottom:1px solid #1d2a3a;text-align:left;vertical-align:middle}.ccpc-table th{font-size:9px;color:#88a0bb;text-transform:uppercase;letter-spacing:.04em;background:#0f1824;position:sticky;top:0}.ccpc-table td{font-size:11px}.ccpc-table tr:last-child td{border-bottom:0}.ccpc-table .name{font-weight:800;color:#eef4fb;max-width:240px}.ccpc-table .sub{display:block;color:#7e93aa;font-size:9px;margin-top:2px}.ccpc-mini-actions{display:flex;gap:5px}.ccpc-mini-actions button{border:1px solid #2b3d53;background:#111b28;color:#d8e4f1;border-radius:8px;padding:6px 7px;font-size:9px}.ccpc-mini-actions button.danger{color:#fecaca;border-color:#5b2a2a;background:#251313}
  .ccpc-progress{height:7px;border-radius:999px;background:#182536;overflow:hidden;min-width:86px}.ccpc-progress i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#3b82f6,#22c55e)}.ccpc-progress.plan i{background:linear-gradient(90deg,#64748b,#94a3b8)}
  .ccpc-bars{display:grid;gap:9px}.ccpc-bar-row{display:grid;grid-template-columns:minmax(120px,.8fr) 1.6fr auto;gap:10px;align-items:center}.ccpc-bar-row label{font-size:10px;color:#c5d2df;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ccpc-dualbar{display:grid;gap:4px}.ccpc-dualbar .line{height:7px;border-radius:999px;background:#182536;overflow:hidden}.ccpc-dualbar .line i{display:block;height:100%;border-radius:999px}.ccpc-dualbar .line.plan i{background:#64748b}.ccpc-dualbar .line.real i{background:#3b82f6}.ccpc-bar-row strong{font-size:9px;white-space:nowrap}
  .ccpc-gantt{display:grid;gap:7px}.ccpc-gantt-row{display:grid;grid-template-columns:minmax(130px,.7fr) 1.5fr;gap:10px;align-items:center}.ccpc-gantt-row label{font-size:10px;color:#c5d2df;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ccpc-track{height:20px;border-radius:7px;background:repeating-linear-gradient(90deg,#111d2b 0,#111d2b 9%,#142234 9%,#142234 10%);position:relative;overflow:hidden}.ccpc-taskbar{position:absolute;top:3px;height:14px;border-radius:5px;background:#3b82f6;min-width:3px}.ccpc-taskbar.critical{background:#ef4444}.ccpc-taskbar.done{background:#22c55e}
  .ccpc-stack{display:grid;gap:8px}.ccpc-item{border:1px solid #233247;background:#0a111a;border-radius:11px;padding:10px}.ccpc-item .top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.ccpc-item b{font-size:11px}.ccpc-item p{font-size:10px;color:#8298b1;margin:5px 0 0}.ccpc-item .meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.ccpc-item .meta span{font-size:9px;color:#9eb1c5;border:1px solid #27384c;border-radius:999px;padding:3px 6px}
  .ccpc-practices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.ccpc-check{display:flex;gap:8px;align-items:flex-start;border:1px solid #243449;background:#0a111a;border-radius:10px;padding:9px;font-size:10px}.ccpc-check input{width:auto;margin-top:1px;accent-color:#22c55e}.ccpc-check span{color:#b9c8d7}
  .ccpc-empty{border:1px dashed #33475f;border-radius:12px;padding:20px;text-align:center;color:#8297ae;font-size:11px}
  .ccpc-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);display:grid;place-items:center;padding:12px;z-index:110}.ccpc-modal{width:min(820px,100%);max-height:92vh;overflow:auto;background:#0d141f;border:1px solid #2d4057;border-radius:16px;box-shadow:0 28px 80px rgba(0,0,0,.5)}.ccpc-modal-head{display:flex;justify-content:space-between;align-items:center;padding:14px 15px;border-bottom:1px solid #243449;position:sticky;top:0;background:#0d141f;z-index:2}.ccpc-modal-head h3{margin:0!important}.ccpc-modal-body{padding:15px}.ccpc-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ccpc-field span{display:block;color:#aebfd0;font-size:10px;font-weight:800;margin-bottom:4px}.ccpc-field.wide{grid-column:1/-1}.ccpc-field input,.ccpc-field select,.ccpc-field textarea{width:100%;background:#080d14;border:1px solid #26364a;color:#f3f4f6;border-radius:9px;padding:9px}.ccpc-field textarea{min-height:80px;resize:vertical}.ccpc-modal-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:7px;margin-top:4px}
  nav.tabs button[data-cc-programacion-control].active{background:#183b61!important;color:#fff!important;border-color:#3b6c9f!important;box-shadow:0 0 0 2px rgba(79,140,255,.09)}
  @media(max-width:1050px){.ccpc-kpis{grid-template-columns:repeat(3,1fr)}.ccpc-grid{grid-template-columns:1fr}}
  @media(max-width:680px){.ccpc-hero{grid-template-columns:1fr}.ccpc-kpis{grid-template-columns:repeat(2,1fr)}.ccpc-practices{grid-template-columns:1fr}.ccpc-form{grid-template-columns:1fr}.ccpc-field.wide,.ccpc-modal-actions{grid-column:auto}.ccpc-bar-row{grid-template-columns:1fr}.ccpc-gantt-row{grid-template-columns:1fr}.ccpc-actions{display:grid;grid-template-columns:1fr 1fr}.ccpc-actions .btn:first-child{grid-column:1/-1}}
  @media(max-width:420px){.ccpc-kpis{grid-template-columns:1fr}.ccpc-actions{grid-template-columns:1fr}.ccpc-actions .btn:first-child{grid-column:auto}}
  @media print{.ccpc-actions,.ccpc-mini-actions,nav.tabs,.project-portfolio-actions,#backBtn{display:none!important}.ccpc-wrap{color:#111!important}.ccpc-panel,.ccpc-hero,.ccpc-kpi,.ccpc-item{break-inside:avoid;background:#fff!important;color:#111!important;border-color:#bbb!important}.ccpc-panel p,.ccpc-hero p,.ccpc-item p,.ccpc-kpi small{color:#444!important}}
  `;
  document.head.appendChild(s);
}

function projectId(){
  try{if(typeof view!=='undefined'&&view?.screen==='project'&&view.projectId)return view.projectId}catch{}
  try{
    if(!document.querySelector('nav.tabs')||!document.getElementById('tabBody'))return'';
    const codes=[...document.querySelectorAll('#content b,#content strong,.project-v3-code')].map(x=>String(x.textContent||'').trim()).filter(Boolean);
    return A(db?.projects).find(p=>codes.includes(String(p.id||''))||codes.includes(String(p.code||'').trim()))?.id||'';
  }catch{return''}
}
function projectData(pid){
  try{
    const p=A(db?.projects).find(x=>x.id===pid&&!x.deletedAt)||null;
    const c=p?A(db?.contracts).find(x=>x.projectId===pid)||null:null;
    const visits=p?A(db?.visits).filter(v=>v.projectId===pid):[];
    return{p,c,visits};
  }catch{return{p:null,c:null,visits:[]}}
}
function root(){
  try{
    if(!db.programacionControl||typeof db.programacionControl!=='object'||Array.isArray(db.programacionControl))db.programacionControl={};
    return db.programacionControl;
  }catch{return{}}
}
function state(pid){
  const r=root();
  if(!r[pid])r[pid]={activities:[],milestones:[],reprogramming:[],goodPractices:{objectives:false,detailedPlan:false,periodicUpdate:false,communication:false,qualitySafety:false,continuousImprovement:false},updatedAt:new Date().toISOString()};
  const s=r[pid];
  s.activities=A(s.activities);s.milestones=A(s.milestones);s.reprogramming=A(s.reprogramming);s.goodPractices=s.goodPractices||{};
  return s;
}
function persist(pid){
  try{state(pid).updatedAt=new Date().toISOString();if(typeof saveDB==='function')saveDB();window.__ccCrossModuleSync?.emit?.('cc:data-changed',{source:'programacion-control',projectId:pid})}catch(e){console.warn('No se pudo guardar programación y control',e)}
}

function dateProgress(a,today=isoToday()){
  const s=toDate(a.start),e=toDate(a.end),t=toDate(today);
  if(!s||!e||!t)return 0;
  if(t<=s)return 0;if(t>=e)return 100;
  const span=Math.max(dayMs,e-s);return clamp(((t-s)/span)*100);
}
function weight(a){return Math.max(.0001,N(a.weight)||1)}
function metrics(pid){
  const {p,c,visits}=projectData(pid),s=state(pid),acts=s.activities;
  const totalW=acts.reduce((n,a)=>n+weight(a),0)||1;
  const planned=acts.length?acts.reduce((n,a)=>n+dateProgress(a)*weight(a),0)/totalW:0;
  const executed=acts.length?acts.reduce((n,a)=>n+clamp(a.executed)*weight(a),0)/totalW:N(p?.physicalProgress);
  const deviation=executed-planned;
  const critical=acts.filter(a=>a.critical||N(a.slackDays)===0);
  const criticalDelayed=critical.filter(a=>clamp(a.executed)+2<dateProgress(a));
  const milestones=A(s.milestones),doneMilestones=milestones.filter(m=>m.status==='cumplido').length;
  const start=c?.start||p?.start||acts.map(a=>a.start).filter(Boolean).sort()[0]||'';
  const end=c?.end||p?.end||acts.map(a=>a.end).filter(Boolean).sort().slice(-1)[0]||'';
  const daysLeft=end?daysBetween(isoToday(),end):0;
  const latestVisit=[...visits].sort((a,b)=>String(b.date||b.createdAt||'').localeCompare(String(a.date||a.createdAt||'')))[0]||null;
  const health=deviation<-10?'danger':deviation<-4?'warn':'good';
  return{p,c,s,acts,planned,executed,deviation,critical,criticalDelayed,milestones,doneMilestones,start,end,daysLeft,visits,latestVisit,health};
}
function statusText(m){return m.health==='danger'?'Desviación crítica':m.health==='warn'?'Requiere atención':'En línea'}
function pct(v){return `${clamp(v).toFixed(1)}%`}
function delta(v){const n=N(v);return `${n>0?'+':''}${n.toFixed(1)} pp`}

function ganttHtml(m){
  if(!m.acts.length)return'<div class="ccpc-empty">Agrega actividades para construir el cronograma visual y detectar la ruta crítica.</div>';
  const starts=m.acts.map(a=>toDate(a.start)).filter(Boolean),ends=m.acts.map(a=>toDate(a.end)).filter(Boolean);
  if(!starts.length||!ends.length)return'<div class="ccpc-empty">Completa fechas de inicio y fin en las actividades para mostrar el cronograma.</div>';
  const min=Math.min(...starts.map(d=>d.getTime())),max=Math.max(...ends.map(d=>d.getTime())),span=Math.max(dayMs,max-min);
  return`<div class="ccpc-gantt">${m.acts.map(a=>{const s=toDate(a.start),e=toDate(a.end);if(!s||!e)return'';const left=clamp(((s.getTime()-min)/span)*100),width=Math.max(2,clamp(((e.getTime()-s.getTime())/span)*100));const cls=(a.critical||N(a.slackDays)===0)?'critical':clamp(a.executed)>=100?'done':'';return`<div class="ccpc-gantt-row"><label title="${H(a.name)}">${H(a.name)}</label><div class="ccpc-track"><i class="ccpc-taskbar ${cls}" style="left:${left}%;width:${width}%"></i></div></div>`}).join('')}</div>`;
}
function compareHtml(m){
  if(!m.acts.length)return'<div class="ccpc-empty">El seguimiento planificado vs. ejecutado aparecerá al registrar actividades.</div>';
  return`<div class="ccpc-bars">${m.acts.map(a=>{const plan=dateProgress(a),real=clamp(a.executed),d=real-plan;return`<div class="ccpc-bar-row"><label title="${H(a.name)}">${H(a.name)}</label><div class="ccpc-dualbar"><div class="line plan"><i style="width:${plan}%"></i></div><div class="line real"><i style="width:${real}%"></i></div></div><strong class="${d<-10?'danger-text':''}">${pct(plan)} / ${pct(real)}</strong></div>`}).join('')}</div>`;
}
function activitiesHtml(m){
  if(!m.acts.length)return'<div class="ccpc-empty">No hay actividades registradas. Agrega la primera para iniciar el control.</div>';
  return`<div class="ccpc-table-wrap"><table class="ccpc-table"><thead><tr><th>Actividad</th><th>Inicio</th><th>Fin</th><th>Peso</th><th>Plan hoy</th><th>Ejecutado</th><th>Holgura</th><th>Recursos</th><th></th></tr></thead><tbody>${m.acts.map(a=>{const plan=dateProgress(a),real=clamp(a.executed),critical=a.critical||N(a.slackDays)===0;return`<tr><td class="name">${H(a.name)}${critical?'<span class="sub" style="color:#fca5a5">Ruta crítica</span>':a.predecessor?`<span class="sub">Predecesora: ${H(a.predecessor)}</span>`:''}</td><td>${H(fmtDate(a.start))}</td><td>${H(fmtDate(a.end))}</td><td>${H(N(a.weight)||1)}</td><td><div class="ccpc-progress plan"><i style="width:${plan}%"></i></div><span class="sub">${pct(plan)}</span></td><td><div class="ccpc-progress"><i style="width:${real}%"></i></div><span class="sub">${pct(real)}</span></td><td>${critical?'<span class="ccpc-badge critical">0 / crítica</span>':`${H(N(a.slackDays))} d`}</td><td><span class="sub">Personal: ${H(N(a.personnel)||0)}</span><span class="sub">Equipo: ${H(a.equipment||'—')}</span><span class="sub">Materiales: ${H(a.materials||'—')}</span></td><td><div class="ccpc-mini-actions"><button data-ccpc-edit-act="${H(a.id)}">Editar</button><button class="danger" data-ccpc-del-act="${H(a.id)}">Eliminar</button></div></td></tr>`}).join('')}</tbody></table></div>`;
}
function milestonesHtml(m){
  if(!m.milestones.length)return'<div class="ccpc-empty">Sin hitos. Registra puntos de control importantes del proyecto.</div>';
  return`<div class="ccpc-stack">${m.milestones.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).map(x=>`<div class="ccpc-item"><div class="top"><div><b>${H(x.name)}</b><p>${H(x.notes||'Sin observaciones')}</p></div><span class="ccpc-badge ${x.status==='cumplido'?'good':x.status==='reprogramado'?'warn':''}">${H(x.status||'pendiente')}</span></div><div class="meta"><span>${H(fmtDate(x.date))}</span></div><div class="ccpc-mini-actions" style="margin-top:8px"><button data-ccpc-edit-milestone="${H(x.id)}">Editar</button><button class="danger" data-ccpc-del-milestone="${H(x.id)}">Eliminar</button></div></div>`).join('')}</div>`;
}
function reprogramHtml(m){
  if(!m.s.reprogramming.length)return'<div class="ccpc-empty">No hay reprogramaciones registradas.</div>';
  return`<div class="ccpc-stack">${m.s.reprogramming.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<div class="ccpc-item"><div class="top"><div><b>${H(fmtDate(x.originalEnd))} → ${H(fmtDate(x.newEnd))}</b><p>${H(x.reason||'Sin motivo registrado')}</p></div><span class="ccpc-badge warn">Reprogramación</span></div><div class="meta"><span>Registro: ${H(fmtDate(x.date))}</span>${x.reference?`<span>${H(x.reference)}</span>`:''}${x.approvedBy?`<span>Autoriza: ${H(x.approvedBy)}</span>`:''}</div></div>`).join('')}</div>`;
}
function practicesHtml(m){
  const g=m.s.goodPractices||{};
  const items=[['objectives','Definir objetivos claros'],['detailedPlan','Planificar con detalle'],['periodicUpdate','Actualizar el plan periódicamente'],['communication','Mantener comunicación constante'],['qualitySafety','Control de calidad y seguridad'],['continuousImprovement','Mejora continua']];
  return`<div class="ccpc-practices">${items.map(([k,t])=>`<label class="ccpc-check"><input type="checkbox" data-ccpc-practice="${k}" ${g[k]?'checked':''}><span>${H(t)}</span></label>`).join('')}</div>`;
}

function render(pid){
  const body=document.getElementById('tabBody');if(!body)return;
  const m=metrics(pid),p=m.p;
  body.innerHTML=`<div class="ccpc-wrap" data-ccpc-root="${H(pid)}">
    <section class="ccpc-hero"><div><div class="eyebrow">PROGRAMACIÓN Y CONTROL DE OBRA</div><h2>Seguimiento integral del plazo, avance y recursos</h2><p>Controla cronograma, ruta crítica, actividades, hitos, holguras, recursos, seguimiento planificado vs. ejecutado, reportes, reprogramaciones y buenas prácticas desde el expediente del proyecto.</p></div><div class="ccpc-status ${m.health}"><small>Estado del programa</small><b>${H(statusText(m))}</b><span class="ccpc-badge ${m.criticalDelayed.length?'critical':'good'}" style="margin-top:7px">${m.criticalDelayed.length} actividad${m.criticalDelayed.length===1?'':'es'} crítica${m.criticalDelayed.length===1?'':'s'} con atraso</span></div></section>
    <div class="ccpc-actions"><button class="btn primary" data-ccpc-add-act>+ Actividad</button><button class="btn" data-ccpc-add-milestone>+ Hito</button><button class="btn" data-ccpc-add-reprogram>+ Reprogramación</button><button class="btn" data-ccpc-print>Imprimir control</button></div>
    <section class="ccpc-kpis"><div class="ccpc-kpi"><small>Planificado a hoy</small><b>${pct(m.planned)}</b></div><div class="ccpc-kpi"><small>Ejecutado</small><b>${pct(m.executed)}</b></div><div class="ccpc-kpi"><small>Desviación</small><b class="delta ${m.health}">${delta(m.deviation)}</b></div><div class="ccpc-kpi"><small>Ruta crítica</small><b>${m.critical.length} act.</b></div><div class="ccpc-kpi"><small>Hitos cumplidos</small><b>${m.doneMilestones}/${m.milestones.length}</b></div><div class="ccpc-kpi"><small>Última visita</small><b>${H(m.latestVisit?fmtDate(m.latestVisit.date||m.latestVisit.createdAt):'—')}</b></div></section>
    <section class="ccpc-panel"><div class="ccpc-panel-head"><div><h3>1. Cronograma de obra</h3><p>Representación gráfica de actividades y duración. Las actividades críticas se muestran en rojo.</p></div><span class="ccpc-badge">${H(m.start?fmtDate(m.start):'Sin inicio')} → ${H(m.end?fmtDate(m.end):'Sin fin')}</span></div>${ganttHtml(m)}</section>
    <section class="ccpc-panel"><div class="ccpc-panel-head"><div><h3>2–6. Ruta crítica, actividades, hitos, holguras y recursos</h3><p>Cada actividad conserva fechas, peso, precedencia, holgura, avance y recursos asignados.</p></div><span class="ccpc-badge ${m.criticalDelayed.length?'critical':'good'}">${m.criticalDelayed.length?`${m.criticalDelayed.length} crítica(s) atrasada(s)`:'Ruta crítica controlada'}</span></div>${activitiesHtml(m)}</section>
    <div class="ccpc-grid"><section class="ccpc-panel"><div class="ccpc-panel-head"><div><h3>7. Seguimiento planificado vs. ejecutado</h3><p>Gris = avance programado por tiempo. Azul = avance físico ejecutado reportado.</p></div><span class="ccpc-badge ${m.health}">${H(delta(m.deviation))}</span></div>${compareHtml(m)}</section><section class="ccpc-panel"><div class="ccpc-panel-head"><div><h3>4. Hitos</h3><p>Puntos clave para verificar el cumplimiento.</p></div><span class="ccpc-badge">${m.milestones.length}</span></div>${milestonesHtml(m)}</section></div>
    <div class="ccpc-grid"><section class="ccpc-panel"><div class="ccpc-panel-head"><div><h3>8–9. Reportes y reprogramación</h3><p>La desviación alimenta el reporte de control y cada cambio de plazo queda trazable.</p></div><span class="ccpc-badge">${m.s.reprogramming.length} cambio(s)</span></div>${reprogramHtml(m)}</section><section class="ccpc-panel"><div class="ccpc-panel-head"><div><h3>10. Buenas prácticas</h3><p>Lista rápida para mantener disciplina de planificación y supervisión.</p></div><span class="ccpc-badge">${Object.values(m.s.goodPractices||{}).filter(Boolean).length}/6</span></div>${practicesHtml(m)}</section></div>
    <section class="ccpc-panel"><div class="ccpc-panel-head"><div><h3>Resumen de supervisión</h3><p>Conecta el programa con el expediente de campo y el plazo contractual registrado.</p></div><span class="ccpc-badge">${m.visits.length} visita${m.visits.length===1?'':'s'}</span></div><div class="ccpc-kpis"><div class="ccpc-kpi"><small>Inicio contractual</small><b>${H(fmtDate(m.c?.start||m.p?.start))}</b></div><div class="ccpc-kpi"><small>Fin contractual</small><b>${H(fmtDate(m.c?.end||m.p?.end))}</b></div><div class="ccpc-kpi"><small>Días restantes</small><b>${m.end?H(m.daysLeft):'—'}</b></div><div class="ccpc-kpi"><small>Plazo registrado</small><b>${H(m.c?.executionDays||m.p?.executionDays||'—')} días</b></div><div class="ccpc-kpi"><small>Actividades</small><b>${m.acts.length}</b></div><div class="ccpc-kpi"><small>Actualizado</small><b>${H(fmtDate(String(m.s.updatedAt||'').slice(0,10)))}</b></div></div></section>
  </div>`;
  bindBody(pid);
}

function field(label,name,type='text',value='',wide=false,extra=''){
  return`<label class="ccpc-field ${wide?'wide':''}"><span>${H(label)}</span><${type==='textarea'?'textarea':'input'} name="${H(name)}" ${type!=='textarea'?`type="${H(type)}"`:''} value="${type==='textarea'?'':H(value)}" ${extra}>${type==='textarea'?H(value):''}</${type==='textarea'?'textarea':'input'}></label>`;
}
function openModal(title,inner,onSave){
  document.querySelector('.ccpc-modal-bg')?.remove();
  const bg=document.createElement('div');bg.className='ccpc-modal-bg';bg.innerHTML=`<div class="ccpc-modal"><div class="ccpc-modal-head"><h3>${H(title)}</h3><button class="icon-btn" data-ccpc-close>×</button></div><div class="ccpc-modal-body"><form class="ccpc-form" data-ccpc-form>${inner}<div class="ccpc-modal-actions"><button type="button" class="btn" data-ccpc-close>Cancelar</button><button type="submit" class="btn primary">Guardar</button></div></form></div></div>`;document.body.appendChild(bg);
  bg.querySelectorAll('[data-ccpc-close]').forEach(b=>b.onclick=()=>bg.remove());bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()});
  bg.querySelector('form').onsubmit=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.currentTarget).entries());onSave(fd);bg.remove()};
}
function editActivity(pid,id=''){
  const s=state(pid),a=s.activities.find(x=>x.id===id)||{};
  const html=`${field('Actividad','name','text',a.name||'',true,'required')}${field('Fecha de inicio','start','date',a.start||'')}${field('Fecha de fin','end','date',a.end||'')}${field('Peso relativo','weight','number',a.weight??1,false,'min="0.01" step="0.01"')}${field('Avance ejecutado (%)','executed','number',a.executed??0,false,'min="0" max="100" step="0.1"')}${field('Holgura (días)','slackDays','number',a.slackDays??1,false,'min="0" step="1"')}${field('Actividad predecesora','predecessor','text',a.predecessor||'')}${field('Personal asignado','personnel','number',a.personnel??0,false,'min="0" step="1"')}${field('Equipo','equipment','text',a.equipment||'',true)}${field('Materiales','materials','text',a.materials||'',true)}<label class="ccpc-check wide"><input type="checkbox" name="critical" value="1" ${a.critical?'checked':''}><span>Marcar como actividad de ruta crítica</span></label>${field('Observaciones','notes','textarea',a.notes||'',true)}`;
  openModal(id?'Editar actividad':'Nueva actividad',html,fd=>{const item={...a,id:a.id||ID(),name:fd.name.trim(),start:fd.start,end:fd.end,weight:Math.max(.01,N(fd.weight)||1),executed:clamp(fd.executed),slackDays:Math.max(0,N(fd.slackDays)),predecessor:fd.predecessor?.trim()||'',personnel:Math.max(0,N(fd.personnel)),equipment:fd.equipment?.trim()||'',materials:fd.materials?.trim()||'',critical:fd.critical==='1',notes:fd.notes?.trim()||''};if(a.id)Object.assign(a,item);else s.activities.push(item);persist(pid);render(pid)});
}
function editMilestone(pid,id=''){
  const s=state(pid),x=s.milestones.find(v=>v.id===id)||{};
  const html=`${field('Hito','name','text',x.name||'',true,'required')}${field('Fecha','date','date',x.date||'')}<label class="ccpc-field"><span>Estado</span><select name="status"><option value="pendiente" ${x.status==='pendiente'?'selected':''}>Pendiente</option><option value="cumplido" ${x.status==='cumplido'?'selected':''}>Cumplido</option><option value="reprogramado" ${x.status==='reprogramado'?'selected':''}>Reprogramado</option></select></label>${field('Observaciones','notes','textarea',x.notes||'',true)}`;
  openModal(id?'Editar hito':'Nuevo hito',html,fd=>{const item={...x,id:x.id||ID(),name:fd.name.trim(),date:fd.date,status:fd.status,notes:fd.notes?.trim()||''};if(x.id)Object.assign(x,item);else s.milestones.push(item);persist(pid);render(pid)});
}
function addReprogram(pid){
  const m=metrics(pid),html=`${field('Fecha del registro','date','date',isoToday())}${field('Fin original','originalEnd','date',m.end||'')}${field('Nuevo fin','newEnd','date','')}${field('Referencia / soporte','reference','text','')}${field('Motivo técnico','reason','textarea','',true)}${field('Autorizado por','approvedBy','text','',true)}`;
  openModal('Registrar reprogramación',html,fd=>{state(pid).reprogramming.push({id:ID(),date:fd.date,originalEnd:fd.originalEnd,newEnd:fd.newEnd,reference:fd.reference?.trim()||'',reason:fd.reason?.trim()||'',approvedBy:fd.approvedBy?.trim()||''});persist(pid);render(pid)});
}
function bindBody(pid){
  const b=document.getElementById('tabBody');if(!b)return;
  b.querySelector('[data-ccpc-add-act]')?.addEventListener('click',()=>editActivity(pid));
  b.querySelector('[data-ccpc-add-milestone]')?.addEventListener('click',()=>editMilestone(pid));
  b.querySelector('[data-ccpc-add-reprogram]')?.addEventListener('click',()=>addReprogram(pid));
  b.querySelector('[data-ccpc-print]')?.addEventListener('click',()=>window.print());
  b.querySelectorAll('[data-ccpc-edit-act]').forEach(x=>x.onclick=()=>editActivity(pid,x.dataset.ccpcEditAct));
  b.querySelectorAll('[data-ccpc-del-act]').forEach(x=>x.onclick=()=>{if(confirm('¿Eliminar esta actividad del cronograma?')){const s=state(pid);s.activities=s.activities.filter(a=>a.id!==x.dataset.ccpcDelAct);persist(pid);render(pid)}});
  b.querySelectorAll('[data-ccpc-edit-milestone]').forEach(x=>x.onclick=()=>editMilestone(pid,x.dataset.ccpcEditMilestone));
  b.querySelectorAll('[data-ccpc-del-milestone]').forEach(x=>x.onclick=()=>{if(confirm('¿Eliminar este hito?')){const s=state(pid);s.milestones=s.milestones.filter(a=>a.id!==x.dataset.ccpcDelMilestone);persist(pid);render(pid)}});
  b.querySelectorAll('[data-ccpc-practice]').forEach(x=>x.onchange=()=>{state(pid).goodPractices[x.dataset.ccpcPractice]=x.checked;persist(pid);render(pid)});
}

function addTab(){
  const pid=projectId(),nav=document.querySelector('nav.tabs')||document.querySelector('button[data-tab]')?.closest('nav');
  if(!pid||!nav)return;
  let btn=nav.querySelector('[data-cc-programacion-control]');
  if(!btn){btn=document.createElement('button');btn.type='button';btn.dataset.ccProgramacionControl='1';btn.textContent='Programación y Control';const visits=nav.querySelector('[data-tab="visits"]');nav.insertBefore(btn,visits||nav.lastElementChild?.nextSibling||null)}
  if(!btn.dataset.ccpcBound){btn.dataset.ccpcBound='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();nav.querySelectorAll('button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');render(pid)},true)}
}
function schedule(){requestAnimationFrame(addTab)}
injectStyle();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-open],[data-tab],#backBtn'))setTimeout(addTab,30)},true);
window.addEventListener('cc:data-changed',()=>{const btn=document.querySelector('[data-cc-programacion-control].active');if(btn){const pid=projectId();if(pid)render(pid)}});
setTimeout(addTab,120);
window.__ccProgramacionControl={render,metrics,state};
})();
