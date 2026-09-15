/* CONTROL CONTRACTUAL · GESTIÓN INTEGRAL DEL PROYECTO V1 */
(()=>{
'use strict';
if(window.__CC_PROJECT_MANAGEMENT_V1__)return;
window.__CC_PROJECT_MANAGEMENT_V1__=true;

const STYLE_ID='cc-project-management-v1-css';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v)||0;
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=v=>Math.max(0,Math.min(100,N(v)));
const money=v=>`L ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const date=v=>{if(!v)return'—';try{return typeof dmy==='function'?dmy(v):v}catch{return v}};
const todayISO=()=>new Date().toISOString().slice(0,10);
let active=false,currentProject='',techCache={};

function injectCss(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 nav.tabs button[data-cc-project-management].active{background:linear-gradient(135deg,#215fa7,#164477)!important;color:#fff!important;border-color:#5a9de8!important}
 .ccpm-wrap{display:grid;gap:10px}.ccpm-hero{border:1px solid #2b4965;background:linear-gradient(145deg,#0c1825,#102338 60%,#102d35);border-radius:15px;padding:14px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}
 .ccpm-kicker{font-size:8px;font-weight:900;letter-spacing:.13em;color:#83b8ef}.ccpm-hero h2{font-size:19px!important;margin:3px 0 4px!important}.ccpm-hero p{margin:0;color:#9db2c7;font-size:10px;line-height:1.45;max-width:760px}.ccpm-score{min-width:140px;border:1px solid #355672;background:#091722;border-radius:11px;padding:9px 11px;text-align:right}.ccpm-score small{display:block;color:#86a0b8;font-size:8px}.ccpm-score b{display:block;font-size:22px;color:#eef7ff}.ccpm-score span{font-size:8px;color:#9eb5ca}
 .ccpm-health{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.ccpm-health button{appearance:none;text-align:left;min-height:92px;border:1px solid #263b50;border-radius:11px;background:#0b1621;color:#e9f2fa;padding:8px 9px;cursor:pointer}.ccpm-health button:hover{border-color:#4b779d;background:#102033}.ccpm-health small{display:block;color:#8298ad;font-size:7.5px;text-transform:uppercase;letter-spacing:.06em}.ccpm-health b{display:block;margin:4px 0 3px;font-size:11px}.ccpm-health span{display:block;color:#93a8bb;font-size:8px;line-height:1.3}.ccpm-health .good{border-left:3px solid #38a169}.ccpm-health .warn{border-left:3px solid #d69e2e}.ccpm-health .danger{border-left:3px solid #dc5a5a}.ccpm-health .info{border-left:3px solid #4f8ec9}
 .ccpm-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:8px}.ccpm-panel{border:1px solid #263a4e;border-radius:12px;background:#0b151f;padding:11px}.ccpm-panel h3{font-size:13px!important;margin:0 0 3px!important}.ccpm-panel p{font-size:9px;color:#8298ac;margin:0;line-height:1.45}.ccpm-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:9px}.ccpm-actions{display:flex;gap:5px;flex-wrap:wrap}
 .ccpm-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.ccpm-item{border:1px solid #22364a;border-radius:9px;background:#09131d;padding:8px}.ccpm-item small{display:block;color:#8096aa;font-size:7.5px}.ccpm-item b{display:block;margin-top:3px;font-size:10px;line-height:1.35}.ccpm-item.wide{grid-column:1/-1}
 .ccpm-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.ccpm-field{display:grid;gap:4px}.ccpm-field.wide{grid-column:1/-1}.ccpm-field span{font-size:8px;color:#91a8bc;font-weight:800}.ccpm-field input,.ccpm-field select,.ccpm-field textarea{width:100%;border:1px solid #2a4055;border-radius:8px;background:#07111a;color:#edf5fb;padding:7px 8px;font:inherit;font-size:9px;box-sizing:border-box}.ccpm-field textarea{min-height:64px;resize:vertical}.ccpm-form-actions{grid-column:1/-1;display:flex;justify-content:flex-end}
 .ccpm-quick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.ccpm-quick button{border:1px solid #294158;border-radius:9px;background:#0a1621;color:#dce9f5;min-height:47px;padding:7px;text-align:left;cursor:pointer}.ccpm-quick button:hover{background:#11253a;border-color:#47769f}.ccpm-quick b{display:block;font-size:9px}.ccpm-quick small{display:block;margin-top:2px;color:#8199ad;font-size:7.5px;line-height:1.25}
 .ccpm-note{margin-top:7px;border:1px solid #25405b;border-radius:9px;padding:8px;background:#0a1825;color:#9db3c6;font-size:8px;line-height:1.4}
 @media(max-width:1120px){.ccpm-health{grid-template-columns:repeat(3,minmax(0,1fr))}}
 @media(max-width:820px){.ccpm-layout{grid-template-columns:1fr}.ccpm-hero{grid-template-columns:1fr}.ccpm-score{text-align:left}.ccpm-health{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:520px){.ccpm-health,.ccpm-summary,.ccpm-form,.ccpm-quick{grid-template-columns:1fr}.ccpm-field.wide,.ccpm-item.wide,.ccpm-form-actions{grid-column:auto}}
 `;
 document.head.appendChild(s);
}

function projectId(){
 try{const id=window.ccCurrentProjectId?.();if(id)return String(id)}catch{}
 try{return typeof view!=='undefined'&&view?.screen==='project'?String(view.projectId||''):''}catch{return''}
}
function project(pid){try{return A(db?.projects).find(p=>String(p.id)===String(pid)&&!p.deletedAt)||null}catch{return null}}
function contract(pid){try{return A(db?.contracts).filter(c=>String(c.projectId)===String(pid)&&!c.voidedAt&&!c.voided_at).slice(-1)[0]||null}catch{return null}}
function state(pid){
 try{
  if(!db.projectManagement||typeof db.projectManagement!=='object'||Array.isArray(db.projectManagement))db.projectManagement={};
  if(!db.projectManagement[pid])db.projectManagement[pid]={
    scope:{objective:'',deliverables:'',exclusions:'',acceptance:'',status:'SIN_REVISAR'},
    closeout:{nextAction:'',owner:'',targetDate:'',pending:'',lessons:''},
    updatedAt:new Date().toISOString()
  };
  const s=db.projectManagement[pid];
  s.scope=s.scope||{objective:'',deliverables:'',exclusions:'',acceptance:'',status:'SIN_REVISAR'};
  s.closeout=s.closeout||{nextAction:'',owner:'',targetDate:'',pending:'',lessons:''};
  return s;
 }catch{return{scope:{},closeout:{}}}
}
function persist(pid){
 try{
  state(pid).updatedAt=new Date().toISOString();
  if(typeof audit==='function')audit('ACTUALIZAR','Gestión del proyecto',pid,{updatedAt:state(pid).updatedAt});
  if(typeof saveDB==='function')saveDB();
  window.__ccCrossModuleSync?.emit?.('cc:data-changed',{source:'project-management',projectId:pid});
 }catch(err){console.warn('No se pudo guardar la gestión del proyecto',err)}
}
function financial(pid){
 const p=project(pid),c=contract(pid);if(!p)return{p:null,c:null,fin:null,est:[]};
 const est=c?A(db?.estimates).filter(e=>String(e.contractId)===String(c.id)&&!e.voidedAt&&!e.voided_at):[];
 let fin=null;try{if(typeof projectFinancials==='function')fin=projectFinancials(p,c,est)}catch{}
 return{p,c,fin,est};
}
function schedule(pid){
 try{return window.__ccProgramacionControl?.metrics?.(pid)||null}catch{return null}
}
function statusMeta(level,label,detail,action){
 return{level:level||'info',label:label||'Sin revisar',detail:detail||'',action:action||''};
}
function scopeStatus(pid){
 const x=String(state(pid).scope.status||'SIN_REVISAR');
 if(x==='CONFORME')return statusMeta('good','Conforme','Alcance revisado y controlado.','scope');
 if(x==='ATENCION')return statusMeta('warn','Atención','El alcance requiere revisión o definición.','scope');
 if(x==='CRITICO')return statusMeta('danger','Crítico','Existe una desviación o indefinición relevante.','scope');
 return statusMeta('info','Sin revisar','Completa objetivo, entregables y criterios de aceptación.','scope');
}
function scheduleStatus(pid){
 const m=schedule(pid);
 if(!m||!A(m.acts).length)return statusMeta('info','Sin cronograma','Registra actividades para comparar programado vs. ejecutado.','schedule');
 if(m.health==='danger')return statusMeta('danger','Desviación crítica',`${N(m.deviation).toFixed(1)} pp frente a lo programado.`,'schedule');
 if(m.health==='warn')return statusMeta('warn','Requiere atención',`${N(m.deviation).toFixed(1)} pp frente a lo programado.`,'schedule');
 return statusMeta('good','En línea',`${N(m.executed).toFixed(1)}% ejecutado / ${N(m.planned).toFixed(1)}% programado.`,'schedule');
}
function costStatus(pid){
 const {p,c,fin}=financial(pid);if(!p)return statusMeta('info','Sin datos','Proyecto no disponible.','changes');
 const amount=N(c?.currentAmount??p.budget);
 if(!amount)return statusMeta('info','Monto pendiente','No hay monto contractual vigente confirmado.','contract');
 if(!fin)return statusMeta('info','Por calcular','Abre pagos/estimaciones para actualizar el control financiero.','estimates');
 const amountC=Math.round(amount*100),gross=N(fin.grossC),paid=N(fin.totalPaidC);
 if(gross>amountC+1||paid>amountC+1)return statusMeta('danger','Revisar costo','El acumulado supera el monto contractual vigente.','estimates');
 const changes=A(db?.changes).filter(x=>(String(x.projectId)===String(pid)||String(x.contractId)===String(c?.id))&&!x.voidedAt&&!x.voided_at&&/aprobad/i.test(x.status||''));
 if(changes.length)return statusMeta('warn','Con modificaciones',`${changes.length} modificación${changes.length===1?'':'es'} aprobada${changes.length===1?'':'s'}; monto vigente ${money(amount)}.`,'changes');
 return statusMeta('good','Controlado',`Monto vigente ${money(amount)}; sin exceso detectado.`,'estimates');
}
function guaranteeStatus(pid){
 const gs=A(db?.guarantees).filter(g=>String(g.projectId)===String(pid)&&!g.voidedAt&&!g.voided_at);
 if(!gs.length)return statusMeta('info','Sin garantías','No hay garantías registradas.','guarantees');
 let serious=0,warn=0;
 for(const g of gs){try{const a=typeof guaranteeAlert==='function'?guaranteeAlert(g.end):null;if(['expired','urgent','critical'].includes(a?.level))serious++;else if(['warning','attention'].includes(a?.level))warn++}catch{}}
 if(serious)return statusMeta('danger','Garantía crítica',`${serious} garantía${serious===1?'':'s'} vencida${serious===1?'':'s'} o urgente${serious===1?'':'s'}.`,'guarantees');
 if(warn)return statusMeta('warn','Próximo control',`${warn} garantía${warn===1?'':'s'} requiere${warn===1?'':'n'} seguimiento.`,'guarantees');
 return statusMeta('good','Vigentes',`${gs.length} garantía${gs.length===1?'':'s'} sin alerta inmediata.`,'guarantees');
}
function closeoutStatus(pid){
 const p=project(pid),rows=A(techCache[pid]?.recepcion);
 const final=rows.some(r=>['FINAL','LIQUIDACION'].includes(String(r.reception_type||''))&&['APROBADA','CERRADA'].includes(String(r.status||'')));
 const done=/finaliz|cerrad/i.test(p?.status||'');
 if(final)return statusMeta('good','Cierre documentado','Existe recepción final o liquidación aprobada/cerrada.','closeout');
 if(done)return statusMeta('warn','Cierre pendiente','El proyecto figura finalizado, pero falta completar recepción/liquidación.','closeout');
 return statusMeta('info','En ejecución','El cierre se habilita progresivamente con recepción y liquidación.','closeout');
}
function qualityStatus(pid){
 const rows=A(techCache[pid]?.calidad);
 if(!rows.length)return statusMeta('info','Sin ensayos','No hay ensayos técnicos cargados o todavía no se han consultado.','quality');
 const nc=rows.filter(r=>r.status==='NO_CONFORME').length,pending=rows.filter(r=>['PENDIENTE','EN_PROCESO'].includes(r.status)).length;
 if(nc)return statusMeta('danger','No conformidad',`${nc} ensayo${nc===1?'':'s'} no conforme${nc===1?'':'s'}.`,'quality');
 if(pending)return statusMeta('warn','En revisión',`${pending} ensayo${pending===1?'':'s'} pendiente${pending===1?'':'s'} o en proceso.`,'quality');
 return statusMeta('good','Conforme',`${rows.length} ensayo${rows.length===1?'':'s'} sin no conformidades abiertas.`,'quality');
}
function riskStatus(pid){
 const rows=A(techCache[pid]?.riesgos);
 if(!rows.length)return statusMeta('info','Sin riesgos registrados','No hay riesgos/reclamos cargados o todavía no se han consultado.','risk');
 const open=rows.filter(r=>!['RESUELTO','CERRADO','ANULADO'].includes(String(r.status||''))),crit=open.filter(r=>r.impact==='CRITICO'),high=open.filter(r=>['ALTO','CRITICO'].includes(r.impact));
 if(crit.length)return statusMeta('danger','Riesgo crítico',`${crit.length} riesgo${crit.length===1?'':'s'} crítico${crit.length===1?'':'s'} abierto${crit.length===1?'':'s'}.`,'risk');
 if(high.length||open.length)return statusMeta('warn','Requiere seguimiento',`${open.length} registro${open.length===1?'':'s'} abierto${open.length===1?'':'s'}.`,'risk');
 return statusMeta('good','Controlado','No hay riesgos o reclamos abiertos.','risk');
}
function overall(statuses){
 const levels=statuses.map(x=>x.level),score=levels.reduce((n,x)=>n+(x==='good'?100:x==='warn'?60:x==='danger'?25:45),0)/(levels.length||1);
 const label=levels.includes('danger')?'Requiere intervención':levels.includes('warn')?'Seguimiento necesario':levels.every(x=>x==='good')?'Gestión estable':'Información por completar';
 return{score:Math.round(score),label};
}

async function techRows(pid){
 try{
  if(!pid||typeof SUPABASE_URL==='undefined'||typeof SUPABASE_KEY==='undefined'||typeof session==='undefined'||!session?.accessToken)return;
  const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${session.accessToken}`};
  const get=async(table,select)=>{
   const u=`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&project_id=eq.${encodeURIComponent(pid)}&limit=250`;
   const r=await fetch(u,{headers,cache:'no-store'});if(!r.ok)return[];const d=await r.json();return A(d);
  };
  const [calidad,riesgos,recepcion]=await Promise.all([
    get('quality_tests','status'),
    get('risk_claims','status,impact,record_type,title'),
    get('project_receptions','reception_type,status,reception_date')
  ]);
  techCache[pid]={calidad,riesgos,recepcion,loadedAt:Date.now()};
  if(active&&currentProject===pid&&document.querySelector('[data-ccpm-shell]'))render(pid,false);
 }catch(err){console.warn('Gestión del proyecto: no se pudo cargar el resumen técnico',err)}
}
function maybeLoadTech(pid){
 const x=techCache[pid];if(x&&Date.now()-N(x.loadedAt)<60000)return;
 techRows(pid);
}

function render(pid,loadTech=true){
 const root=document.getElementById('tabBody'),p=project(pid),c=contract(pid);if(!root||!p)return;
 active=true;currentProject=pid;
 const nav=document.querySelector('nav.tabs');nav?.querySelectorAll('button').forEach(b=>b.classList.remove('active'));nav?.querySelector('[data-cc-project-management]')?.classList.add('active');
 const st=state(pid),m=schedule(pid),gs=guaranteeStatus(pid);
 const statuses=[scopeStatus(pid),scheduleStatus(pid),costStatus(pid),qualityStatus(pid),riskStatus(pid),closeoutStatus(pid)];
 const ov=overall(statuses),f=financial(pid),fin=f.fin;
 root.innerHTML=`<div class="ccpm-wrap" data-ccpm-shell>
  <section class="ccpm-hero"><div><span class="ccpm-kicker">GESTIÓN INTEGRAL DEL PROYECTO</span><h2>${E(p.name||'Proyecto')}</h2><p>Una sola vista para controlar alcance, programación, costo, calidad, riesgos, cambios y cierre sin duplicar la información del expediente contractual.</p></div><div class="ccpm-score"><small>Estado de gestión</small><b>${ov.score}%</b><span>${E(ov.label)}</span></div></section>
  <section class="ccpm-health">
   ${[
    ['Alcance',statuses[0]],['Cronograma',statuses[1]],['Costo',statuses[2]],['Calidad',statuses[3]],['Riesgos',statuses[4]],['Cierre',statuses[5]]
   ].map(([name,x])=>`<button type="button" class="${x.level}" data-ccpm-open="${x.action}"><small>${name}</small><b>${E(x.label)}</b><span>${E(x.detail)}</span></button>`).join('')}
  </section>
  <section class="ccpm-layout">
   <div class="ccpm-panel" id="ccpmScope"><div class="ccpm-head"><div><h3>Alcance y criterios de aceptación</h3><p>Define lo que se debe entregar y evita cambios informales fuera del contrato.</p></div></div>
    <form class="ccpm-form" id="ccpmScopeForm">
     <label class="ccpm-field wide"><span>Objetivo / alcance principal</span><textarea name="objective" placeholder="Qué debe lograr y entregar el proyecto">${E(st.scope.objective||'')}</textarea></label>
     <label class="ccpm-field wide"><span>Entregables principales</span><textarea name="deliverables" placeholder="Obras, productos o resultados verificables">${E(st.scope.deliverables||'')}</textarea></label>
     <label class="ccpm-field"><span>Exclusiones del alcance</span><textarea name="exclusions" placeholder="Qué no está incluido">${E(st.scope.exclusions||'')}</textarea></label>
     <label class="ccpm-field"><span>Criterios de aceptación</span><textarea name="acceptance" placeholder="Cómo se comprobará que cumple">${E(st.scope.acceptance||'')}</textarea></label>
     <label class="ccpm-field"><span>Estado del alcance</span><select name="status"><option value="SIN_REVISAR">Sin revisar</option><option value="CONFORME">Conforme</option><option value="ATENCION">Atención</option><option value="CRITICO">Crítico</option></select></label>
     <div class="ccpm-form-actions"><button type="submit" class="btn primary">Guardar alcance</button></div>
    </form>
   </div>
   <aside class="ccpm-panel"><div class="ccpm-head"><div><h3>Accesos vinculados</h3><p>Abre el módulo correcto sin repetir datos.</p></div></div><div class="ccpm-quick">
    <button type="button" data-ccpm-open="schedule"><b>Programación y Control</b><small>Cronograma, hitos y ruta crítica.</small></button>
    <button type="button" data-ccpm-open="risk"><b>Riesgos y reclamos</b><small>Probabilidad, impacto y mitigación.</small></button>
    <button type="button" data-ccpm-open="quality"><b>Calidad y ensayos</b><small>Pruebas, no conformidades y certificados.</small></button>
    <button type="button" data-ccpm-open="changes"><b>Modificaciones</b><small>Órdenes de cambio y ampliaciones.</small></button>
    <button type="button" data-ccpm-open="guarantees"><b>Garantías</b><small>${E(gs.label)} · ${E(gs.detail)}</small></button>
    <button type="button" data-ccpm-open="visits"><b>Supervisión</b><small>Visitas, evidencias y observaciones.</small></button>
    <button type="button" data-ccpm-open="estimates"><b>Pagos / Estimaciones</b><small>${fin?`${money(N(fin.totalPaidC)/100)} pagado`:'Control financiero del expediente.'}</small></button>
    <button type="button" data-ccpm-open="closeout"><b>Recepción y liquidación</b><small>Cierre técnico-financiero.</small></button>
   </div><div class="ccpm-note">Los indicadores son de gestión. No sustituyen el contrato, las actas, ensayos, garantías ni la documentación oficial que respalda cada dato.</div></aside>
  </section>
  <section class="ccpm-layout">
   <div class="ccpm-panel"><div class="ccpm-head"><div><h3>Resumen programado vs. ejecutado</h3><p>Se alimenta de Programación y Control; no crea un cronograma paralelo.</p></div><div class="ccpm-actions"><button type="button" class="btn" data-ccpm-open="schedule">Abrir cronograma</button></div></div>
    <div class="ccpm-summary">
     <div class="ccpm-item"><small>Programado</small><b>${m&&A(m.acts).length?`${N(m.planned).toFixed(1)}%`:'Sin actividades'}</b></div>
     <div class="ccpm-item"><small>Ejecutado</small><b>${m&&A(m.acts).length?`${N(m.executed).toFixed(1)}%`:'—'}</b></div>
     <div class="ccpm-item"><small>Desviación</small><b>${m&&A(m.acts).length?`${N(m.deviation)>0?'+':''}${N(m.deviation).toFixed(1)} pp`:'—'}</b></div>
     <div class="ccpm-item"><small>Actividades críticas atrasadas</small><b>${m?A(m.criticalDelayed).length:'—'}</b></div>
     <div class="ccpm-item"><small>Inicio</small><b>${m?date(m.start):date(c?.start||p.start)}</b></div>
     <div class="ccpm-item"><small>Finalización</small><b>${m?date(m.end):date(c?.end||p.end)}</b></div>
    </div>
   </div>
   <div class="ccpm-panel"><div class="ccpm-head"><div><h3>Próxima acción y cierre</h3><p>Registra el siguiente paso de gestión y conserva lecciones aprendidas.</p></div></div>
    <form class="ccpm-form" id="ccpmCloseForm">
     <label class="ccpm-field wide"><span>Próxima acción prioritaria</span><input name="nextAction" value="${E(st.closeout.nextAction||'')}" placeholder="Ej. Verificar corrección de cuneta sector norte"></label>
     <label class="ccpm-field"><span>Responsable</span><input name="owner" value="${E(st.closeout.owner||'')}"></label>
     <label class="ccpm-field"><span>Fecha meta</span><input name="targetDate" type="date" value="${E(st.closeout.targetDate||'')}"></label>
     <label class="ccpm-field wide"><span>Pendientes para cierre</span><textarea name="pending">${E(st.closeout.pending||'')}</textarea></label>
     <label class="ccpm-field wide"><span>Lecciones aprendidas</span><textarea name="lessons">${E(st.closeout.lessons||'')}</textarea></label>
     <div class="ccpm-form-actions"><button type="submit" class="btn primary">Guardar seguimiento</button></div>
    </form>
   </div>
  </section>
 </div>`;
 const sf=root.querySelector('#ccpmScopeForm');if(sf){
  sf.elements.status.value=st.scope.status||'SIN_REVISAR';
  sf.onsubmit=e=>{e.preventDefault();const d=new FormData(sf);st.scope={...st.scope,objective:String(d.get('objective')||'').trim(),deliverables:String(d.get('deliverables')||'').trim(),exclusions:String(d.get('exclusions')||'').trim(),acceptance:String(d.get('acceptance')||'').trim(),status:String(d.get('status')||'SIN_REVISAR')};persist(pid);render(pid,false);try{toast('Gestión del alcance guardada.')}catch{}};
 }
 const cf=root.querySelector('#ccpmCloseForm');if(cf)cf.onsubmit=e=>{e.preventDefault();const d=new FormData(cf);st.closeout={...st.closeout,nextAction:String(d.get('nextAction')||'').trim(),owner:String(d.get('owner')||'').trim(),targetDate:String(d.get('targetDate')||''),pending:String(d.get('pending')||'').trim(),lessons:String(d.get('lessons')||'').trim()};persist(pid);render(pid,false);try{toast('Seguimiento de gestión guardado.')}catch{}};
 root.querySelectorAll('[data-ccpm-open]').forEach(b=>b.onclick=()=>openLinked(pid,b.dataset.ccpmOpen));
 if(loadTech)maybeLoadTech(pid);
 installZordonBridge();
}

function nativeTab(id){
 try{if(typeof view!=='undefined'){view.tab=id;if(typeof renderProject==='function')renderProject();return true}}catch{}
 const b=document.querySelector(`nav.tabs [data-tab="${id}"]`);if(b){b.click();return true}return false;
}
function openLinked(pid,key){
 if(key==='scope'){document.getElementById('ccpmScope')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(key==='schedule'){const b=document.querySelector('[data-cc-programacion-control]');if(b){b.click();return}}
 if(['quality','risk','closeout'].includes(key)){
  const mod=key==='quality'?'calidad':key==='risk'?'riesgos':'recepcion';
  try{window.__ccTechnicalControl?.activate?.();setTimeout(()=>window.__ccTechnicalControl?.renderModule?.(mod),0);return}catch{}
 }
 if(key==='contract')return nativeTab('contract');
 if(key==='changes')return nativeTab('changes');
 if(key==='guarantees')return nativeTab('guarantees');
 if(key==='visits')return nativeTab('visits');
 if(key==='estimates')return nativeTab('estimates');
}
function activate(){
 const pid=projectId();if(!pid)return;render(pid);
}
function mount(){
 injectCss();
 const pid=projectId(),nav=document.querySelector('nav.tabs'),body=document.getElementById('tabBody');if(!pid||!nav||!body)return;
 let btn=nav.querySelector('[data-cc-project-management]');
 if(!btn){
  btn=document.createElement('button');btn.type='button';btn.dataset.ccProjectManagement='1';btn.textContent='Gestión del proyecto';
  btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();render(pid)},true);
  const summary=nav.querySelector('[data-tab="summary"]');if(summary)summary.insertAdjacentElement('afterend',btn);else nav.prepend(btn);
 }
 if(active&&currentProject===pid){
  if(!body.querySelector('[data-ccpm-shell]'))render(pid);else btn.classList.add('active');
 }else if(currentProject&&currentProject!==pid){active=false;currentProject=pid}
}
function zordonText(){
 const pid=projectId();if(!pid)return'';
 const st=state(pid),sc=scopeStatus(pid),sch=scheduleStatus(pid),cost=costStatus(pid);
 return`Gestión del proyecto activo: alcance ${sc.label}; cronograma ${sch.label}; costo ${cost.label}; próxima acción ${st.closeout.nextAction||'no registrada'}${st.closeout.targetDate?` para ${st.closeout.targetDate}`:''}.`;
}
function installZordonBridge(){
 const chat=window.__ccEngineerChat;if(!chat||chat.__ccpmContextWrapped)return;
 const original=typeof chat.haluCloudContext==='function'?chat.haluCloudContext.bind(chat):null;
 chat.haluCloudContext=message=>[original?original(message):'',zordonText()].filter(Boolean).join('\n\n').slice(0,5200);
 chat.__ccpmContextWrapped=true;
}

document.addEventListener('click',e=>{const native=e.target.closest?.('nav.tabs button:not([data-cc-project-management])');if(native)active=false},true);
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount();installZordonBridge()})}).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:data-changed',()=>{if(active&&currentProject)render(currentProject,false)});
setTimeout(mount,80);setTimeout(mount,600);
window.__ccProjectManagement={activate,render,state,status:{scope:scopeStatus,schedule:scheduleStatus,cost:costStatus,quality:qualityStatus,risk:riskStatus,closeout:closeoutStatus},refreshTechnical:techRows};
})();
