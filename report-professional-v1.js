/* ===== INFORMES PROFESIONALES, TRAZABILIDAD CLARA Y ANALISIS INTELIGENTE V1 ===== */
(()=>{
'use strict';
if(window.__CC_REPORT_PROFESSIONAL_V1__)return;
window.__CC_REPORT_PROFESSIONAL_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const n=v=>Number(v)||0;
const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const escx=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>typeof fmt==='function'?fmt(v):`L. ${n(v).toLocaleString('es-HN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const dmyx=v=>typeof dmy==='function'?dmy(v):(v||'—');
const pctv=v=>`${clamp(v).toFixed(2)}%`;

function injectCss(){
  if(document.getElementById('cc-report-professional-style'))return;
  const s=document.createElement('style');
  s.id='cc-report-professional-style';
  s.textContent=`
    .report-paper .report-table{width:100%!important;border-collapse:separate!important;border-spacing:0!important;table-layout:auto!important;border:1px solid #d9e1e8!important;border-radius:9px!important;overflow:hidden!important;margin:8px 0 15px!important;background:#fff!important}
    .report-paper .report-table th{background:#eef3f7!important;color:#31475d!important;font-size:9px!important;letter-spacing:.045em!important;line-height:1.25!important;padding:8px 9px!important;text-align:left!important;vertical-align:middle!important;border-right:1px solid #dce4eb!important;border-bottom:1px solid #cfd9e2!important;white-space:normal!important}
    .report-paper .report-table td{font-size:10.2px!important;line-height:1.35!important;padding:8px 9px!important;text-align:left!important;vertical-align:top!important;border-right:1px solid #e3e8ed!important;border-bottom:1px solid #e7ebef!important;overflow-wrap:anywhere!important;word-break:normal!important;white-space:normal!important}
    .report-paper .report-table th:last-child,.report-paper .report-table td:last-child{border-right:0!important}
    .report-paper .report-table tbody tr:nth-child(even) td{background:#fafcfd!important}
    .report-paper .report-table tbody tr:last-child td{border-bottom:0!important}
    .report-paper .report-table .cell-number,.report-paper .report-table th.cell-number{text-align:right!important;font-variant-numeric:tabular-nums!important;white-space:nowrap!important}
    .report-paper .report-table .cell-date,.report-paper .report-table th.cell-date{text-align:center!important;white-space:nowrap!important}
    .report-paper .report-table .cell-center,.report-paper .report-table th.cell-center{text-align:center!important}
    .report-paper .report-table .report-money{text-align:right!important;margin:0!important;min-width:0!important}
    .report-paper .report-table .report-money span{font-weight:700!important;font-variant-numeric:tabular-nums!important}
    .report-paper .report-table .report-money small{display:none!important}
    .report-paper .trace-table th:nth-child(1),.report-paper .trace-table td:nth-child(1){width:16%;text-align:center!important}
    .report-paper .trace-table th:nth-child(2),.report-paper .trace-table td:nth-child(2){width:18%}
    .report-paper .trace-table th:nth-child(3),.report-paper .trace-table td:nth-child(3){width:13%;text-align:center!important}
    .report-paper .trace-table th:nth-child(4),.report-paper .trace-table td:nth-child(4){width:15%}
    .report-paper .trace-table th:nth-child(5),.report-paper .trace-table td:nth-child(5){width:38%}
    .report-action{display:inline-block;border-radius:999px;padding:3px 7px;font-size:8.5px;font-weight:800;letter-spacing:.02em;background:#edf3f8;color:#28455f;border:1px solid #d1dce5;white-space:nowrap}
    .report-action.create{background:#e9f7ef;color:#17603a;border-color:#cce9d8}.report-action.edit{background:#eef4ff;color:#24518b;border-color:#d3e2f8}.report-action.print{background:#f3effc;color:#5b3f86;border-color:#ddd2f0}.report-action.delete{background:#fff0f0;color:#8a2d2d;border-color:#f0d1d1}.report-action.update{background:#fff8e6;color:#785b12;border-color:#eadcae}
    .report-status-box{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(260px,2fr) minmax(160px,.8fr);gap:0;border:1px solid #d8e1e8;border-radius:10px;overflow:hidden;margin:8px 0 14px;background:#fff}
    .report-status-box>div{padding:10px 12px;border-right:1px solid #e1e7ec}.report-status-box>div:last-child{border-right:0}.report-status-box small{display:block;color:#718094;font-size:8.5px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}.report-status-box b{display:block;color:#20364b;font-size:10.5px;line-height:1.35}.report-status-box .attention b{color:#8b5a12}.report-status-box .danger b{color:#8b2d2d}.report-status-box .good b{color:#21613f}
    .report-ai-note{font-size:9px;color:#69798a;margin:4px 0 9px;padding-left:2px}
    .report-ai-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0 12px}.report-ai-box{border:1px solid #d7e0e8;border-radius:10px;background:#fbfcfd;padding:12px}.report-ai-box h3{font-size:11px!important;margin:0 0 8px!important;color:#21394f!important;text-transform:uppercase;letter-spacing:.04em}.report-ai-item{display:grid;grid-template-columns:22px 1fr;gap:7px;margin:0 0 8px;align-items:start}.report-ai-item:last-child{margin-bottom:0}.report-ai-item .idx{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:#eaf1f7;color:#2e5779;font-weight:800;font-size:8.5px}.report-ai-item p{margin:0!important;font-size:10.3px!important;line-height:1.45!important;text-align:left!important;color:#2a3b4d!important}.report-ai-box.rec{border-color:#d4dfd2;background:#fbfdfb}.report-ai-box.rec .idx{background:#e8f4e9;color:#2f6738}
    .report-table-wrap{width:100%;overflow-x:auto}
    @media(max-width:760px){.report-status-box{grid-template-columns:1fr}.report-status-box>div{border-right:0;border-bottom:1px solid #e1e7ec}.report-status-box>div:last-child{border-bottom:0}.report-ai-grid{grid-template-columns:1fr}.report-paper .report-table th,.report-paper .report-table td{font-size:9px!important;padding:7px!important}}
    @media print{.report-paper .report-table tr{break-inside:avoid!important;page-break-inside:avoid!important}.report-paper .report-table thead{display:table-header-group!important}.report-ai-box,.report-status-box{break-inside:avoid!important;page-break-inside:avoid!important}.report-ai-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}}
  `;
  document.head.appendChild(s);
}

function userName(a){
  try{return A(db?.users).find(u=>u.id===a?.userId)?.name||'Usuario'}catch{return'Usuario'}
}

function visitForAudit(a){
  const d=a?.detail||{};
  try{return A(db?.visits).find(v=>v.id===a?.entityId||v.id===d.visitId||Number(v.number)===Number(d.visitNumber))||null}catch{return null}
}

function auditActionClass(a){
  const x=String(a?.action||'').toLowerCase();
  if(/eliminar|borrar/.test(x))return'delete';
  if(/imprimir|generar informe|exportar/.test(x))return'print';
  if(/crear|registrar|agregar/.test(x))return'create';
  if(/editar|corregir/.test(x))return'edit';
  return'update';
}

function auditActionLabel(a){
  const x=String(a?.action||'').toLowerCase();
  if(/imprimir/.test(x))return'Impresión';
  if(/generar informe|exportar/.test(x))return'Informe';
  if(/eliminar|borrar/.test(x))return'Eliminación';
  if(/crear|registrar|agregar/.test(x))return'Registro';
  if(/editar|corregir/.test(x))return'Edición';
  if(/actualizar/.test(x))return'Actualización';
  if(/ampliar/.test(x))return'Ampliación';
  return String(a?.action||'Movimiento').toLowerCase().replace(/^./,m=>m.toUpperCase());
}

function auditModule(a){
  const t=String(a?.type||'').toLowerCase();
  if(/fotograf/.test(t))return'Fotografías de visita';
  if(/visita/.test(t))return'Visitas';
  if(/contrato/.test(t))return'Contrato';
  if(/estimaci|pago/.test(t))return'Pagos / Estimaciones';
  if(/garant/.test(t))return'Garantías';
  if(/modific|cambio|adenda/.test(t))return'Modificaciones';
  if(/proyecto/.test(t))return'Proyecto';
  if(/oferta|adjudic|contrataci/.test(t))return'Contratación';
  return a?.type||'Expediente';
}

function humanAudit(a,p,c){
  const d=a?.detail||{},action=String(a?.action||'').toLowerCase(),type=String(a?.type||'').toLowerCase(),v=visitForAudit(a);
  const visitNo=v?.number||d.visitNumber||d.number;
  if(/imprimir/.test(action)&&/visita/.test(type))return `Se generó el informe correspondiente a la Visita N.º ${visitNo||'registrada'}.`;
  if(/fotograf/.test(type)){
    const count=d.photoCount??d.quantity??v?.photos?.length;
    return count!==undefined?`Se actualizaron las fotografías de la Visita N.º ${visitNo||'registrada'}; el registro contiene ${count} imagen${Number(count)===1?'':'es'} de campo.`:`Se actualizó el registro fotográfico de la Visita N.º ${visitNo||'registrada'}.`;
  }
  if(/visita/.test(type)&&/editar|actualizar/.test(action))return `Se actualizó la información técnica registrada en la Visita N.º ${visitNo||'correspondiente'}.`;
  if(/visita/.test(type)&&/crear|registrar/.test(action))return `Se registró la Visita N.º ${visitNo||'correspondiente'} dentro del expediente del proyecto.`;
  if(/contrato/.test(type)){
    const number=d.number||c?.number||'registrado';
    if(d.end)return `Se actualizó el contrato N.º ${number}, incluyendo su fecha de vigencia o finalización al ${dmyx(d.end)}.`;
    if(d.status)return `Se actualizó el contrato N.º ${number}; estado registrado: ${d.status}.`;
    return `Se actualizó información del contrato N.º ${number}.`;
  }
  if(/estimaci|pago/.test(type))return d.number?`Se ${/eliminar/.test(action)?'eliminó':'actualizó'} la Estimación/Pago N.º ${d.number}.`:`Se registró un movimiento en Pagos / Estimaciones.`;
  if(/garant/.test(type))return d.type?`Se ${/eliminar/.test(action)?'eliminó':'actualizó'} la garantía de ${d.type}${d.end?`, con vigencia hasta ${dmyx(d.end)}`:''}.`:`Se actualizó información de garantías del proyecto.`;
  if(/modific|cambio|adenda/.test(type))return d.number?`Se actualizó la modificación ${d.number}${d.amountDelta!==undefined?` por ${money(d.amountDelta)}`:''}${d.daysDelta?` y ${d.daysDelta} día(s) de plazo`:''}.`:`Se registró un cambio contractual en el expediente.`;
  if(/proyecto/.test(type))return d.status?`Se actualizó el estado del proyecto a “${d.status}”.`:`Se actualizó información general del proyecto.`;
  const ignore=new Set(['id','projectId','contractId','visitId','userId','updatedAt','createdAt','photoCount','quantity']);
  const labels={code:'código',name:'nombre',number:'número',type:'tipo',status:'estado',end:'fecha final',start:'fecha inicial',issuer:'emisor',amount:'monto',amountDelta:'variación de monto',days:'días',daysDelta:'variación de plazo',reason:'motivo',document:'documento',reportType:'tipo de informe',previousEnd:'vigencia anterior',newEnd:'nueva vigencia',category:'categoría',priority:'prioridad'};
  const parts=[];
  for(const [k,val0] of Object.entries(d)){
    if(ignore.has(k)||val0===null||val0===undefined||val0===''||typeof val0==='object')continue;
    let val=val0;
    if(typeof val0==='number'&&/(amount|base|applied|budget|paid)/i.test(k))val=money(val0);
    parts.push(`${labels[k]||k}: ${val}`);
    if(parts.length===3)break;
  }
  return parts.length?`Se registró un cambio en ${auditModule(a)} (${parts.join('; ')}).`:`Se registró un movimiento en ${auditModule(a)}.`;
}

function auditRowsFor(p,c){
  let rows=[];
  try{
    const est=c?A(db.estimates).filter(e=>e.contractId===c.id):[],gs=A(db.guarantees).filter(g=>g.projectId===p.id),chs=c?A(db.changes).filter(x=>x.contractId===c.id):[],ps=A(db.payments).filter(x=>x.projectId===p.id);
    rows=typeof reportRelevantAudit==='function'?reportRelevantAudit(p,c,est,gs,chs,ps):A(db.audit).filter(a=>a.detail?.projectId===p.id||a.detail?.contractId===c?.id||a.entityId===p.id||a.entityId===c?.id);
  }catch{}
  const mapped=rows.map(a=>({a,user:userName(a),action:auditActionLabel(a),cls:auditActionClass(a),module:auditModule(a),desc:humanAudit(a,p,c),at:new Date(a.at||0)})).filter(x=>!Number.isNaN(+x.at));
  mapped.sort((x,y)=>y.at-x.at);
  const groups=[];
  for(const x of mapped){
    const day=x.at.toISOString().slice(0,10),key=[x.user,x.action,x.module,x.desc,day].join('|');
    const g=groups.find(z=>z.key===key);
    if(g){g.count++;if(x.at<g.first)g.first=x.at;if(x.at>g.last)g.last=x.at}else groups.push({...x,key,count:1,first:x.at,last:x.at});
  }
  return groups.slice(0,30);
}

function formatAuditDate(g){
  const date=g.last.toLocaleDateString('es-HN',{day:'2-digit',month:'2-digit',year:'numeric'});
  const t1=g.first.toLocaleTimeString('es-HN',{hour:'numeric',minute:'2-digit'}),t2=g.last.toLocaleTimeString('es-HN',{hour:'numeric',minute:'2-digit'});
  return g.count>1&&t1!==t2?`${date}<br><small>${escx(t1)} – ${escx(t2)}</small>`:`${date}<br><small>${escx(t2)}</small>`;
}

function contractSituation(p,c){
  const advanceExpected=!!c&&(n(c.advanceRequestedPct)>0||n(c.advanceApproved)>0||n(c.advancePaid)>0||!/^(|No solicitado|Rechazado)$/i.test(String(c.advanceStatus||'')));
  const advancePaid=!!c&&/pagado/i.test(String(c.advanceStatus||''))&&n(c.advancePaid)>0;
  if(!c)return{title:'Contrato pendiente de registrar',level:'attention',follow:'Completar información contractual antes de emitir controles definitivos.'};
  if(advanceExpected&&!advancePaid)return{title:'Pendiente de pago de anticipo',level:'attention',follow:c.start?'Verificar que la fecha de inicio registrada corresponda a una Orden de Inicio formal.':'Definir la fecha de inicio únicamente cuando proceda conforme al expediente contractual.'};
  if(!c.start)return{title:'Pendiente de fecha de inicio',level:'attention',follow:'Registrar la Orden de Inicio y su fecha efectiva para activar el control de plazo.'};
  if(/suspend/i.test(String(p.status||c.status||'')))return{title:'Proyecto suspendido',level:'danger',follow:'Verificar soporte de suspensión, plazo remanente y condiciones para reinicio.'};
  return{title:p.status||c.status||'En seguimiento',level:'good',follow:'Mantener actualizados los hitos técnicos, financieros y contractuales.'};
}

function smartAnalysis(p,c){
  const visits=A(db?.visits).filter(v=>v.projectId===p.id).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
  const latest=visits.at(-1)||null,physical=clamp(latest?.physical||p.physicalProgress||0);
  const allEst=c?A(db?.estimates).filter(e=>e.contractId===c.id&&!e.voidedAt&&!e.voided_at&&!/anulad/i.test(String(e.status||''))):[];
  const est=allEst.filter(e=>/^(aprobada|aprobado|pagada|pagado)$/i.test(String(e.status||'').trim()));
  const gross=est.reduce((s,e)=>s+n(e.gross),0),current=n(c?.currentAmount??p.budget),financial=current?clamp(gross/current*100):0;
  const fin=typeof projectFinancials==='function'?projectFinancials(p,c,est):null,paid=fin?Number(fin.totalPaidC||0)/100:est.filter(e=>/pagad/i.test(String(e.status||''))).reduce((s,e)=>s+n(e.net),0),paidPct=current?clamp(paid/current*100):0;
  const gs=A(db?.guarantees).filter(g=>g.projectId===p.id),alerts=gs.map(g=>({g,a:typeof guaranteeAlert==='function'?guaranteeAlert(g.end):{level:'good',days:999,label:'VIGENTE'}})).filter(x=>['warning','attention','critical','urgent','expired'].includes(x.a.level));
  const pendingObs=visits.reduce((s,v)=>s+A(v.observations).filter(o=>!/^atendida$/i.test(String(o.status||''))).length,0);
  const changes=c?A(db?.changes).filter(x=>x.contractId===c.id&&/aprobado/i.test(String(x.status||''))):[],changeAmt=changes.reduce((s,x)=>s+n(x.amountDelta),0),changeDays=changes.reduce((s,x)=>s+n(x.daysDelta),0);
  const situation=contractSituation(p,c),advanceExpected=!!c&&(n(c.advanceRequestedPct)>0||n(c.advanceApproved)>0||n(c.advancePaid)>0||!/^(|No solicitado|Rechazado)$/i.test(String(c.advanceStatus||''))),advancePaid=!!c&&/pagado/i.test(String(c.advanceStatus||''))&&n(c.advancePaid)>0;
  const start=c?.start||p.start||'',end=c?.end||p.end||'',timePct=(start&&end&&!(advanceExpected&&!advancePaid)&&typeof reportTimePct==='function')?reportTimePct(start,end):null;
  const conclusions=[],recs=[];
  if(!c)conclusions.push('No se registra todavía un contrato completo en el expediente, por lo que los controles de plazo, pagos y garantías no pueden considerarse definitivos.');
  else if(advanceExpected&&!advancePaid)conclusions.push(`El contrato ${c.number?`N.º ${c.number} `:''}se encuentra con el anticipo pendiente de pago. Por esta razón, la fecha efectiva de inicio debe verificarse contra la Orden de Inicio y demás condiciones contractuales.`);
  else conclusions.push(`El proyecto presenta información contractual registrada${c.number?` bajo el contrato N.º ${c.number}`:''}, con estado actual “${p.status||c.status||'En seguimiento'}”.`);
  if(visits.length)conclusions.push(`La última visita de campo registrada (${dmyx(latest.date)}) reporta un avance físico observado de ${pctv(physical)}${latest.activities?` y documenta actividades de ejecución en sitio`:''}.`);
  else conclusions.push('No se registran visitas de supervisión de campo; por tanto, el informe no dispone de una referencia reciente de avance físico observado.');
  if(est.length)conclusions.push(`Las estimaciones aprobadas o pagadas acumuladas ascienden a ${money(gross)}, equivalentes al ${pctv(financial)} del monto contractual vigente. El desembolso registrado representa aproximadamente ${pctv(paidPct)}.`);
  else conclusions.push('No se registran estimaciones periódicas en el expediente, por lo que no existe todavía avance financiero certificado mediante estimaciones.');
  if(physical>0&&financial===0)conclusions.push('Existe avance físico de campo registrado sin avance financiero certificado en estimaciones; ambos indicadores deben mantenerse separados hasta que exista documentación financiera aprobada.');
  else if(Math.abs(physical-financial)>=10)conclusions.push(`Se observa una diferencia de ${Math.abs(physical-financial).toFixed(2)} puntos porcentuales entre el avance físico observado y el avance financiero estimado.`);
  if(timePct!==null&&timePct>physical+10)conclusions.push(`El tiempo contractual consumido (${pctv(timePct)}) supera de forma relevante el avance físico observado (${pctv(physical)}), lo que amerita seguimiento de plazo.`);
  if(alerts.length)conclusions.push(`${alerts.length} garantía(s) presentan alerta de vigencia y requieren revisión administrativa.`);
  if(pendingObs)conclusions.push(`${pendingObs} observación(es) de supervisión permanecen pendientes de atención o cierre.`);
  if(changes.length)conclusions.push(`Se registran ${changes.length} modificación(es) aprobada(s), con variación acumulada de ${money(changeAmt)} y ${changeDays} día(s) de plazo.`);

  if(advanceExpected&&!advancePaid)recs.push('Dar seguimiento al trámite del anticipo y verificar previamente la garantía correspondiente, dejando documentada la fecha efectiva de pago y la Orden de Inicio cuando proceda.');
  if(!c?.start)recs.push('Registrar formalmente la fecha de inicio contractual para habilitar el cálculo correcto de días transcurridos, vencimientos y alertas de plazo.');
  if(physical>0&&financial===0)recs.push('Mantener separado el avance físico del financiero y registrar oportunamente las estimaciones cuando sean presentadas, aprobadas o pagadas.');
  else if(physical-financial>=10)recs.push('Revisar si existen trabajos ejecutados aún no incluidos en estimaciones y documentar la conciliación entre avance de campo y avance financiero.');
  else if(financial-physical>=10)recs.push('Verificar que el avance financiero certificado esté respaldado por cantidades de obra realmente ejecutadas y comprobadas en campo.');
  if(timePct!==null&&timePct>physical+10)recs.push('Solicitar y documentar medidas de recuperación del plazo, con metas verificables para las próximas visitas de supervisión.');
  if(alerts.length)recs.push('Revisar de inmediato las garantías con alerta de vencimiento y tramitar ampliación, renovación o sustitución cuando corresponda.');
  if(pendingObs)recs.push('Asignar responsable y fecha compromiso a cada observación pendiente, verificando su cierre en la siguiente visita de supervisión.');
  if(changes.length)recs.push('Mantener vinculadas las órdenes de cambio o adendas aprobadas con sus justificaciones, montos, ampliaciones de plazo y documentos de respaldo.');
  const fieldText=[latest?.activities,latest?.generalObservations,latest?.instructions].filter(Boolean).join(' ').toLowerCase();
  if(/terracer|excav|nivel|subrasante|paviment/.test(fieldText))recs.push('Durante los trabajos de terracería y conformación, verificar niveles topográficos, pendientes, humedad y compactación antes de autorizar la colocación de las capas siguientes.');
  if(/concreto|hormig[oó]n|fundici/.test(fieldText))recs.push('Verificar antes y durante las fundiciones dimensiones, refuerzo, recubrimientos, consistencia del concreto, curado y registros de control de calidad aplicables.');
  if(/dren|cuneta|alcantar/.test(fieldText))recs.push('Comprobar cotas de entrada y salida, pendientes y condiciones de descarga de las obras de drenaje antes de su recepción o cobertura.');
  if(!recs.length)recs.push('Mantener actualizado el expediente y continuar el seguimiento técnico, financiero y contractual con evidencia documental en cada hito relevante.');
  return{conclusions:conclusions.slice(0,7),recs:[...new Set(recs)].slice(0,7),situation,physical,financial,paidPct,latest};
}

function replaceTrace(root,p,c){
  const titles=[...root.querySelectorAll('.report-section-title')],title=titles.find(x=>/trazabilidad del expediente/i.test(x.querySelector('h2')?.textContent||''));
  if(!title)return;
  const sub=title.querySelector('.sub');if(sub)sub.textContent='Historial de actuaciones relevantes, presentado en lenguaje claro';
  let node=title.nextElementSibling;while(node&&!node.classList.contains('report-section-title')){const next=node.nextElementSibling;node.remove();node=next}
  const ana=smartAnalysis(p,c),status=document.createElement('div');status.className='report-status-box';status.innerHTML=`<div><small>Situación actual</small><b>${escx(ana.situation.title)}</b></div><div><small>Observación registrada</small><b>${escx(p.description||'Sin observación general registrada para este proyecto.')}</b></div><div class="${ana.situation.level}"><small>Seguimiento</small><b>${escx(ana.situation.follow)}</b></div>`;
  title.insertAdjacentElement('afterend',status);
  const rows=auditRowsFor(p,c),wrap=document.createElement('div');wrap.className='report-table-wrap';
  wrap.innerHTML=rows.length?`<table class="report-table trace-table"><thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Acción</th><th>Sección</th><th>Descripción del movimiento</th></tr></thead><tbody>${rows.map(g=>`<tr><td>${formatAuditDate(g)}</td><td>${escx(g.user)}</td><td><span class="report-action ${g.cls}">${escx(g.action)}${g.count>1?` ×${g.count}`:''}</span></td><td>${escx(g.module)}</td><td>${escx(g.desc)}</td></tr>`).join('')}</tbody></table>`:'<p class="report-section-empty">No hay movimientos históricos vinculados disponibles.</p>';
  status.insertAdjacentElement('afterend',wrap);
}

function replaceConclusions(root,p,c){
  const titles=[...root.querySelectorAll('.report-section-title')],title=titles.find(x=>/conclusiones y recomendaciones/i.test(x.querySelector('h2')?.textContent||''));
  if(!title)return;
  const sub=title.querySelector('.sub');if(sub)sub.textContent='Análisis automático basado en la información registrada en el expediente';
  let box=title.nextElementSibling;if(box?.classList.contains('report-two-col'))box.remove();
  const ana=smartAnalysis(p,c),holder=document.createElement('div');
  holder.innerHTML=`<div class="report-ai-note">Análisis generado automáticamente a partir de contrato, estimaciones, visitas, garantías, modificaciones y alertas registradas. Debe revisarse antes de firma o remisión oficial.</div><div class="report-ai-grid"><div class="report-ai-box"><h3>Conclusiones del análisis</h3>${ana.conclusions.map((x,i)=>`<div class="report-ai-item"><span class="idx">${i+1}</span><p>${escx(x)}</p></div>`).join('')}</div><div class="report-ai-box rec"><h3>Recomendaciones de seguimiento</h3>${ana.recs.map((x,i)=>`<div class="report-ai-item"><span class="idx">${i+1}</span><p>${escx(x)}</p></div>`).join('')}</div></div>`;
  const frag=document.createDocumentFragment();while(holder.firstChild)frag.appendChild(holder.firstChild);title.after(frag);
}

function markTables(root){
  root.querySelectorAll('table.report-table').forEach(t=>{
    const headers=[...t.querySelectorAll('thead th')];
    headers.forEach((th,i)=>{
      const text=(th.textContent||'').toLowerCase();
      let cls='';
      if(/monto|total|saldo|bruto|neto|pagado|retenci|deducci|variaci[oó]n|precio|oferta|anticipo/.test(text))cls='cell-number';
      else if(/fecha|inicio|final|vence|vigencia|per[ií]odo/.test(text))cls='cell-date';
      else if(/%|porcentaje|estado|calificaci[oó]n|d[ií]as|n\.º|número/.test(text))cls='cell-center';
      if(!cls)return;th.classList.add(cls);t.querySelectorAll('tbody tr').forEach(tr=>tr.children[i]?.classList.add(cls));
    });
  });
}

function enhanceHtml(html,p,c){
  const root=document.createElement('div');root.innerHTML=html;
  replaceTrace(root,p,c);replaceConclusions(root,p,c);markTables(root);
  return root.innerHTML;
}

function install(){
  if(typeof buildProjectReport!=='function')return false;
  if(buildProjectReport.__ccProfessional)return true;
  const original=buildProjectReport;
  const wrapped=function(p,c,type='integral'){
    const html=original(p,c,type);
    try{return enhanceHtml(html,p,c)}catch(err){console.error('No se pudo mejorar el informe',err);return html}
  };
  wrapped.__ccProfessional=true;wrapped.__original=original;
  try{buildProjectReport=wrapped}catch{}
  try{window.buildProjectReport=wrapped}catch{}
  return true;
}

injectCss();
if(!install()){
  let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>40)clearInterval(timer)},150);
}
})();
