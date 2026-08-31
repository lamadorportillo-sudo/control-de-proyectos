/* ===== CONTROL TÉCNICO INTEGRAL DE OBRA V1 ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_TECHNICAL_CONTROL_V1__)return;
window.__CC_TECHNICAL_CONTROL_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const today=()=>new Date().toISOString().slice(0,10);
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''));
const fmtDate=v=>{try{return v?new Date(String(v).slice(0,10)+'T12:00:00').toLocaleDateString('es-HN'):'—'}catch{return v||'—'}};
const fmtMoney=v=>new Intl.NumberFormat('es-HN',{style:'currency',currency:'HNL',maximumFractionDigits:2}).format(N(v));
const STYLE_ID='cc-technical-control-v1-style';

const MODULES={
 calidad:{
   icon:'🧪', label:'Calidad y ensayos', table:'quality_tests', date:'sampling_date',
   subtitle:'Ensayos de laboratorio, resistencia de materiales y no conformidades.',
   columns:[
     ['Código',r=>r.test_code],['Material',r=>r.material_type],['Elemento / frente',r=>r.structural_element],
     ['Requerido',r=>r.required_value==null?'—':`${r.required_value} ${r.unit_measure||''}`],
     ['Obtenido',r=>r.obtained_value==null?'—':`${r.obtained_value} ${r.unit_measure||''}`],
     ['Muestreo',r=>fmtDate(r.sampling_date)],['Estado',r=>statusHTML(r.status)],['Acción',r=>actionHTML(r.id)]
   ],
   fields:[
     {n:'test_code',l:'Código del ensayo',required:1,ph:'Ej. LAB-2026-CONC-001'},
     {n:'material_type',l:'Material',t:'select',required:1,o:['CONCRETO','SUELOS','ACERO','ASFALTO','AGREGADOS','OTROS']},
     {n:'structural_element',l:'Elemento / frente',required:1,wide:1,ph:'Ej. Losa de cubierta Bloque B'},
     {n:'location_text',l:'Ubicación / estación',ph:'Ej. Est. 0+420'},
     {n:'laboratory_name',l:'Laboratorio'},
     {n:'sampling_date',l:'Fecha de muestreo',t:'date',required:1},
     {n:'planned_testing_date',l:'Fecha planificada de ensayo',t:'date'},
     {n:'actual_testing_date',l:'Fecha real de ensayo',t:'date'},
     {n:'required_value',l:'Valor requerido',t:'number',step:'0.0001'},
     {n:'obtained_value',l:'Valor obtenido',t:'number',step:'0.0001'},
     {n:'unit_measure',l:'Unidad',ph:'kg/cm², MPa, %, etc.'},
     {n:'status',l:'Estado',t:'select',o:['PENDIENTE','EN_PROCESO','CONFORME','NO_CONFORME','SUBSANADO','ANULADO']},
     {n:'financial_hold',l:'Retener aprobación financiera relacionada',t:'checkbox'},
     {n:'certificate_path',l:'Ruta / referencia del certificado',wide:1},
     {n:'nonconformity_action',l:'Acción ante no conformidad',t:'textarea',wide:1},
     {n:'notes',l:'Observaciones',t:'textarea',wide:1}
   ],
   normalize:r=>{
     if(r.obtained_value!==null&&r.obtained_value!==''&&r.required_value!==null&&r.required_value!==''&&!['SUBSANADO','ANULADO'].includes(r.status)){
       r.status=N(r.obtained_value)>=N(r.required_value)?'CONFORME':'NO_CONFORME';
     }
     return r;
   }
 },
 actas:{
   icon:'📜', label:'Actas de obra', table:'project_admin_acts', date:'act_date',
   subtitle:'Inicio, suspensión, reinicio, prórrogas, entrega de sitio y órdenes administrativas.',
   columns:[
     ['Acta',r=>r.act_number],['Tipo',r=>labelize(r.act_type)],['Fecha',r=>fmtDate(r.act_date)],
     ['Vigencia',r=>fmtDate(r.effective_date)],['Efecto plazo',r=>`${N(r.days_effect)} días`],
     ['Estado',r=>statusHTML(r.status)],['Acción',r=>actionHTML(r.id)]
   ],
   fields:[
     {n:'act_number',l:'Número / código de acta',required:1},
     {n:'act_type',l:'Tipo de acta',t:'select',required:1,o:['INICIO','SUSPENSION','REINICIO','PRORROGA','ORDEN_SERVICIO','ENTREGA_SITIO','OTRA']},
     {n:'act_date',l:'Fecha del acta',t:'date',required:1},
     {n:'effective_date',l:'Fecha efectiva',t:'date'},
     {n:'days_effect',l:'Efecto sobre plazo (días)',t:'number',step:'1'},
     {n:'status',l:'Estado',t:'select',o:['BORRADOR','VIGENTE','SUPERADA','ANULADA']},
     {n:'reason',l:'Motivo / fundamento',t:'textarea',wide:1},
     {n:'document_path',l:'Ruta / referencia documental',wide:1},
     {n:'notes',l:'Observaciones',t:'textarea',wide:1}
   ]
 },
 bitacora:{
   icon:'📘', label:'Bitácora diaria', table:'site_daily_logs', date:'log_date',
   subtitle:'Registro diario de trabajos, personal, maquinaria, rendimientos y tiempos improductivos.',
   columns:[
     ['Fecha',r=>fmtDate(r.log_date)],['Turno',r=>r.shift||'—'],['Trabajo ejecutado',r=>truncate(r.work_summary,70)],
     ['Avance',r=>r.physical_progress==null?'—':`${N(r.physical_progress).toFixed(2)}%`],
     ['Paro',r=>`${N(r.downtime_hours).toFixed(1)} h`],['Estado',r=>statusHTML(r.status)],['Acción',r=>actionHTML(r.id)]
   ],
   fields:[
     {n:'log_date',l:'Fecha',t:'date',required:1},
     {n:'shift',l:'Turno / jornada',ph:'Ej. 7:00 a. m. – 4:00 p. m.'},
     {n:'weather',l:'Condición climática',ph:'Soleado, lluvia, nublado...'},
     {n:'physical_progress',l:'Avance físico observado %',t:'number',step:'0.01'},
     {n:'work_summary',l:'Trabajos ejecutados',t:'textarea',required:1,wide:1},
     {n:'equipment',l:'Maquinaria y horas',t:'jsontext',wide:1,ph:'Una línea por equipo: Retroexcavadora – 6.5 h'},
     {n:'personnel',l:'Personal en obra',t:'jsontext',wide:1,ph:'Una línea por cuadrilla/cargo'},
     {n:'quantities',l:'Cantidades ejecutadas',t:'jsontext',wide:1,ph:'Una línea por partida/cantidad'},
     {n:'downtime_hours',l:'Horas improductivas',t:'number',step:'0.25'},
     {n:'downtime_reason',l:'Motivo de paro / stand-by',wide:1},
     {n:'status',l:'Estado',t:'select',o:['ABIERTO','REVISADO','CERRADO','ANULADO']},
     {n:'observations',l:'Observaciones',t:'textarea',wide:1}
   ]
 },
 seguridad:{
   icon:'🦺', label:'Seguridad y salud', table:'safety_records', date:'record_date',
   subtitle:'Inspecciones, incidentes, accidentes, EPP, permisos de trabajo y acciones correctivas.',
   columns:[
     ['Fecha',r=>fmtDate(r.record_date)],['Tipo',r=>labelize(r.record_type)],['Severidad',r=>statusHTML(r.severity)],
     ['Descripción',r=>truncate(r.description,70)],['Responsable',r=>r.responsible||'—'],
     ['Estado',r=>statusHTML(r.status)],['Acción',r=>actionHTML(r.id)]
   ],
   fields:[
     {n:'record_date',l:'Fecha',t:'date',required:1},
     {n:'record_type',l:'Tipo de registro',t:'select',required:1,o:['INSPECCION','INCIDENTE','ACCIDENTE','CAPACITACION','EPP','PERMISO_TRABAJO','CONDICION_INSEGURA']},
     {n:'severity',l:'Severidad',t:'select',o:['BAJA','MEDIA','ALTA','CRITICA']},
     {n:'responsible',l:'Responsable de acción'},
     {n:'due_date',l:'Fecha compromiso',t:'date'},
     {n:'status',l:'Estado',t:'select',o:['ABIERTO','EN_SEGUIMIENTO','CERRADO','ANULADO']},
     {n:'description',l:'Descripción / hallazgo',t:'textarea',required:1,wide:1},
     {n:'corrective_action',l:'Acción correctiva',t:'textarea',wide:1}
   ]
 },
 ambiental:{
   icon:'🌱', label:'Ambiental y social', table:'environmental_social_records', date:'record_date',
   subtitle:'Monitoreo ambiental, gestión social, quejas, compensaciones, permisos y comunidad.',
   columns:[
     ['Fecha',r=>fmtDate(r.record_date)],['Categoría',r=>labelize(r.category)],['Impacto',r=>statusHTML(r.impact_level)],
     ['Hallazgo',r=>truncate(r.finding,70)],['Responsable',r=>r.responsible||'—'],
     ['Estado',r=>statusHTML(r.status)],['Acción',r=>actionHTML(r.id)]
   ],
   fields:[
     {n:'record_date',l:'Fecha',t:'date',required:1},
     {n:'category',l:'Categoría',t:'select',required:1,o:['AMBIENTAL','SOCIAL','QUEJA','COMPENSACION','PERMISO','MONITOREO','COMUNIDAD']},
     {n:'impact_level',l:'Nivel de impacto',t:'select',o:['BAJO','MEDIO','ALTO','CRITICO']},
     {n:'responsible',l:'Responsable'},
     {n:'due_date',l:'Fecha compromiso',t:'date'},
     {n:'status',l:'Estado',t:'select',o:['ABIERTO','EN_SEGUIMIENTO','CERRADO','ANULADO']},
     {n:'beneficiary_or_affected',l:'Beneficiario / afectado',wide:1},
     {n:'requirement',l:'Requisito / compromiso',t:'textarea',wide:1},
     {n:'finding',l:'Hallazgo / situación',t:'textarea',required:1,wide:1},
     {n:'action_required',l:'Acción requerida',t:'textarea',wide:1}
   ]
 },
 consultas:{
   icon:'❓', label:'Consultas técnicas', table:'technical_queries', date:'raised_at',
   subtitle:'RFI, planos, materiales, submittals, aclaraciones y cambios propuestos.',
   columns:[
     ['Código',r=>r.code],['Tipo',r=>r.query_type],['Asunto',r=>truncate(r.subject,55)],
     ['Fecha',r=>fmtDate(r.raised_at)],['Vence',r=>fmtDate(r.due_date)],
     ['Impacto',r=>`${fmtMoney(r.impact_cost)} / ${N(r.impact_days)} d`],
     ['Estado',r=>statusHTML(r.status)],['Acción',r=>actionHTML(r.id)]
   ],
   fields:[
     {n:'code',l:'Código',required:1,ph:'Ej. RFI-2026-001'},
     {n:'query_type',l:'Tipo',t:'select',required:1,o:['RFI','SUBMITTAL','MATERIAL','PLANO','ACLARACION','CAMBIO_PROPUESTO']},
     {n:'subject',l:'Asunto',required:1,wide:1},
     {n:'raised_by',l:'Solicitado por'},
     {n:'raised_at',l:'Fecha de consulta',t:'date',required:1},
     {n:'due_date',l:'Fecha límite de respuesta',t:'date'},
     {n:'status',l:'Estado',t:'select',o:['ABIERTA','EN_REVISION','RESPONDIDA','CERRADA','ANULADA']},
     {n:'impact_cost',l:'Impacto en costo (L)',t:'number',step:'0.01'},
     {n:'impact_days',l:'Impacto en plazo (días)',t:'number',step:'1'},
     {n:'question',l:'Consulta técnica',t:'textarea',required:1,wide:1},
     {n:'answer',l:'Respuesta / resolución',t:'textarea',wide:1},
     {n:'answered_by',l:'Respondido por'},
     {n:'answered_at',l:'Fecha de respuesta',t:'date'},
     {n:'document_path',l:'Referencia documental',wide:1}
   ]
 },
 riesgos:{
   icon:'⚠️', label:'Riesgos y reclamos', table:'risk_claims', date:'opened_at',
   subtitle:'Riesgos, reclamos, controversias y eventos de fuerza mayor con impacto en costo y plazo.',
   columns:[
     ['Código',r=>r.code],['Tipo',r=>labelize(r.record_type)],['Título',r=>truncate(r.title,55)],
     ['Impacto',r=>statusHTML(r.impact||'—')],['Exposición',r=>`${fmtMoney(r.amount_exposure)} / ${N(r.days_exposure)} d`],
     ['Estado',r=>statusHTML(r.status)],['Acción',r=>actionHTML(r.id)]
   ],
   fields:[
     {n:'code',l:'Código',required:1,ph:'Ej. RSK-2026-001'},
     {n:'record_type',l:'Tipo',t:'select',required:1,o:['RIESGO','RECLAMO','CONTROVERSIA','FUERZA_MAYOR']},
     {n:'title',l:'Título',required:1,wide:1},
     {n:'probability',l:'Probabilidad',t:'select',o:['','BAJA','MEDIA','ALTA']},
     {n:'impact',l:'Impacto',t:'select',o:['','BAJO','MEDIO','ALTO','CRITICO']},
     {n:'amount_exposure',l:'Exposición económica (L)',t:'number',step:'0.01'},
     {n:'days_exposure',l:'Exposición de plazo (días)',t:'number',step:'1'},
     {n:'owner_name',l:'Responsable / propietario del riesgo'},
     {n:'status',l:'Estado',t:'select',o:['ABIERTO','EN_ANALISIS','MITIGADO','RESUELTO','CERRADO','ANULADO']},
     {n:'opened_at',l:'Fecha de apertura',t:'date',required:1},
     {n:'closed_at',l:'Fecha de cierre',t:'date'},
     {n:'description',l:'Descripción',t:'textarea',required:1,wide:1},
     {n:'mitigation',l:'Mitigación / estrategia',t:'textarea',wide:1},
     {n:'resolution',l:'Resolución',t:'textarea',wide:1},
     {n:'document_path',l:'Referencia documental',wide:1}
   ]
 },
 recepcion:{
   icon:'✅', label:'Recepción y liquidación', table:'project_receptions', date:'reception_date',
   subtitle:'Recepción provisional/final y conciliación técnico-financiera de cierre.',
   columns:[
     ['Acta',r=>r.act_number],['Tipo',r=>labelize(r.reception_type)],['Fecha',r=>fmtDate(r.reception_date)],
     ['Físico',r=>`${N(r.physical_completion_pct).toFixed(2)}%`],['Pagado',r=>fmtMoney(r.paid_total)],
     ['Saldo final',r=>fmtMoney(r.final_balance)],['Estado',r=>statusHTML(r.status)],['Acción',r=>actionHTML(r.id)]
   ],
   fields:[
     {n:'act_number',l:'Número de acta',required:1},
     {n:'reception_type',l:'Tipo',t:'select',required:1,o:['PROVISIONAL','FINAL','LIQUIDACION']},
     {n:'reception_date',l:'Fecha',t:'date',required:1},
     {n:'physical_completion_pct',l:'Avance físico reconocido %',t:'number',step:'0.01'},
     {n:'contract_amount',l:'Monto contractual vigente (L)',t:'number',step:'0.01'},
     {n:'estimated_total',l:'Total estimado (L)',t:'number',step:'0.01'},
     {n:'paid_total',l:'Total pagado (L)',t:'number',step:'0.01'},
     {n:'advance_pending',l:'Anticipo pendiente (L)',t:'number',step:'0.01'},
     {n:'retention_pending',l:'Retención pendiente (L)',t:'number',step:'0.01'},
     {n:'final_balance',l:'Saldo final (L)',t:'number',step:'0.01'},
     {n:'status',l:'Estado',t:'select',o:['BORRADOR','EN_REVISION','APROBADA','CERRADA','ANULADA']},
     {n:'claims_pending',l:'Reclamos / reservas pendientes',t:'textarea',wide:1},
     {n:'punch_list',l:'Lista de pendientes de obra',t:'jsontext',wide:1,ph:'Una línea por pendiente'},
     {n:'signed_by',l:'Firmantes',t:'jsontext',wide:1,ph:'Una línea por firmante'},
     {n:'document_path',l:'Ruta / referencia del acta',wide:1},
     {n:'notes',l:'Observaciones',t:'textarea',wide:1}
   ]
 }
};

let active=false, activeKey='calidad', currentProject='', busy=false;
const cache={};
let contextSummary='';

function injectCss(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 nav.tabs button[data-cc-technical-control].active{background:linear-gradient(135deg,#1f6f54,#155e45)!important;color:#fff!important;border-color:#36a57b!important}
 .cct-wrap{display:grid;gap:9px}.cct-hero{border:1px solid #29465a;background:linear-gradient(135deg,#0b1724,#0d1d2a 58%,#10271f);border-radius:14px;padding:13px 14px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}
 .cct-kicker{font-size:8.5px;font-weight:900;letter-spacing:.12em;color:#67c9a4}.cct-hero h2{font-size:18px!important;margin:3px 0 4px!important}.cct-hero p{margin:0;color:#9fb4c6;font-size:10px;line-height:1.4}
 .cct-hero-badge{border:1px solid #31546b;border-radius:10px;padding:8px 10px;background:#091722;min-width:165px}.cct-hero-badge small{display:block;color:#8299ad;font-size:8px}.cct-hero-badge b{display:block;margin-top:2px;font-size:11px}
 .cct-tabs{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:4px}.cct-tab{min-height:46px;border:1px solid #293d51;border-radius:9px;background:#0b1621;color:#b9cad9;padding:6px 5px;font-size:8px;font-weight:800;line-height:1.15;cursor:pointer}.cct-tab span{display:block;font-size:15px;margin-bottom:2px}.cct-tab.active{background:#14344a;border-color:#39749b;color:#fff}
 .cct-panel{border:1px solid #26394c;border-radius:11px;background:#0b141f;padding:10px}.cct-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px}.cct-panel-head h3{font-size:13px!important;margin:0 0 2px!important}.cct-panel-head p{font-size:9px;color:#8298ad;margin:0}.cct-actions{display:flex;gap:5px;flex-wrap:wrap}
 .cct-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-bottom:8px}.cct-kpi{border:1px solid #25384a;border-radius:9px;background:#09131d;padding:7px 8px}.cct-kpi small{display:block;color:#8398ac;font-size:7.8px;text-transform:uppercase;letter-spacing:.04em}.cct-kpi b{display:block;margin-top:2px;font-size:13px;color:#eef6fd}.cct-kpi.danger b{color:#fca5a5}.cct-kpi.warn b{color:#fde68a}.cct-kpi.good b{color:#86efac}
 .cct-table-wrap{overflow:auto;border:1px solid #223447;border-radius:9px}.cct-table{width:100%;min-width:900px;border-collapse:collapse}.cct-table th,.cct-table td{padding:5px 7px;border-bottom:1px solid #1f3042;text-align:left;vertical-align:middle;font-size:9.5px;line-height:1.25}.cct-table th{position:sticky;top:0;background:#132031;color:#a9bdd2;font-size:8.5px;text-transform:uppercase;letter-spacing:.035em}.cct-table tr:last-child td{border-bottom:0}.cct-table td .btn{min-height:26px!important;padding:4px 6px!important;font-size:8px!important}
 .cct-empty{padding:24px;text-align:center;color:#8297aa;border:1px dashed #31465c;border-radius:9px;font-size:10px}.cct-status{display:inline-flex;padding:3px 5px;border-radius:999px;border:1px solid #39506a;font-size:8px;font-weight:900;white-space:nowrap}.cct-status.good{color:#bbf7d0;background:#102219;border-color:#245c3a}.cct-status.warn{color:#fef08a;background:#27230c;border-color:#665b1d}.cct-status.danger{color:#fecaca;background:#2c1111;border-color:#6d2a2a}.cct-status.info{color:#bfdbfe;background:#0d1e33;border-color:#284d75}
 .cct-loading{padding:25px;text-align:center;color:#95a8b9;font-size:10px}
 .cct-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.cct-field{display:block}.cct-field.wide{grid-column:1/-1}.cct-field>span{display:block;font-size:9.5px;font-weight:750;color:#c9d6e4;margin-bottom:3px}.cct-field input:not([type=checkbox]),.cct-field select,.cct-field textarea{width:100%;min-height:32px;background:#08111b;border:1px solid #2b3e54;border-radius:8px;color:#eef5fc;padding:5px 8px;font-size:11px}.cct-field textarea{min-height:70px;resize:vertical}.cct-check{display:flex!important;align-items:center;gap:8px;padding-top:18px}.cct-check input{width:18px;height:18px}.cct-form-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:5px;margin-top:3px}
 @media(max-width:1100px){.cct-tabs{grid-template-columns:repeat(4,1fr)}.cct-kpis{grid-template-columns:repeat(2,1fr)}}
 @media(max-width:720px){.cct-hero{grid-template-columns:1fr}.cct-tabs{grid-template-columns:repeat(2,1fr)}.cct-panel-head{display:block}.cct-actions{margin-top:7px}.cct-form{grid-template-columns:1fr}.cct-field.wide,.cct-form-actions{grid-column:auto}}
 @media(max-width:440px){.cct-kpis{grid-template-columns:1fr}}
 `;
 document.head.appendChild(s);
}

function labelize(v){return String(v||'—').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())}
function truncate(v,max=60){const x=String(v||'—');return x.length>max?x.slice(0,max-1)+'…':x}
function statusClass(v){
 const x=String(v||'').toUpperCase();
 if(/CONFORME|CERRAD|APROBAD|SUBSANAD|RESUELT|MITIGAD|BAJA|BAJO|VIGENTE|REVISADO|RESPONDIDA/.test(x))return'good';
 if(/NO_CONFORME|CRITIC|ACCIDENTE|ANULAD|VENCID/.test(x))return'danger';
 if(/PENDIENTE|ALTA|ALTO|SUSPENSION|ABIERTO|ABIERTA|EN_ANALISIS|EN_SEGUIMIENTO/.test(x))return'warn';
 return'info';
}
function statusHTML(v){return `<span class="cct-status ${statusClass(v)}">${E(labelize(v||'—'))}</span>`}
function actionHTML(id){return `<button type="button" class="btn" data-cct-edit="${E(id)}">Editar</button>`}
function projectId(){try{return typeof view!=='undefined'&&view?.screen==='project'?String(view.projectId||''):''}catch{return''}}
function workspaceId(){try{return typeof cloudWorkspaceId!=='undefined'?String(cloudWorkspaceId||''):''}catch{return''}}
function contractId(pid){try{return A(db?.contracts).find(c=>c.projectId===pid&&uuid(c.id))?.id||null}catch{return null}}
function projectInfo(pid){try{return A(db?.projects).find(p=>p.id===pid)||null}catch{return null}}
function apiHeaders(extra={}){return {apikey:SUPABASE_KEY,Authorization:`Bearer ${session?.accessToken||''}`,'Content-Type':'application/json',...extra}}
async function rest(table,{method='GET',query='',body=null}={}){
 if(!session?.accessToken)throw new Error('La sesión no está disponible.');
 const u=`${SUPABASE_URL}/rest/v1/${table}${query?`?${query}`:''}`;
 const headers=apiHeaders(method==='GET'?{}:{Prefer:'return=representation'});
 const r=await fetch(u,{method,headers,body:body==null?undefined:JSON.stringify(body),cache:'no-store'});
 const txt=await r.text();let data=null;try{data=txt?JSON.parse(txt):null}catch{data=txt}
 if(!r.ok)throw new Error(data?.message||data?.error||`Error ${r.status}`);
 return data;
}
async function loadRows(key,pid){
 const m=MODULES[key],q=`select=*&project_id=eq.${encodeURIComponent(pid)}&order=${encodeURIComponent(m.date)}.desc&limit=250`;
 const rows=A(await rest(m.table,{query:q}));cache[key]=rows;return rows;
}
function defaultFor(field){
 if(field.t==='date')return today();
 if(field.t==='number')return 0;
 if(field.t==='checkbox')return false;
 if(field.t==='select')return field.o?.find(x=>x)||'';
 return'';
}
function inputFor(f,r){
 const val=r?.[f.n]??defaultFor(f);
 const req=f.required?'required':'';
 const wide=f.wide?' wide':'';
 if(f.t==='select'){
  return `<label class="cct-field${wide}"><span>${E(f.l)}</span><select name="${E(f.n)}" ${req}>${A(f.o).map(o=>`<option value="${E(o)}"${String(o)===String(val)?' selected':''}>${E(o?labelize(o):'—')}</option>`).join('')}</select></label>`;
 }
 if(f.t==='textarea'||f.t==='jsontext'){
  let x=val;
  if(f.t==='jsontext'&&typeof x!=='string'){
    if(Array.isArray(x))x=x.map(v=>typeof v==='string'?v:(v?.detalle??JSON.stringify(v))).join('\n');
    else if(x&&typeof x==='object')x=JSON.stringify(x,null,2); else x='';
  }
  return `<label class="cct-field${wide}"><span>${E(f.l)}</span><textarea name="${E(f.n)}" ${req} placeholder="${E(f.ph||'')}">${E(x||'')}</textarea></label>`;
 }
 if(f.t==='checkbox'){
  return `<label class="cct-field cct-check${wide}"><input type="checkbox" name="${E(f.n)}"${val?' checked':''}><span>${E(f.l)}</span></label>`;
 }
 return `<label class="cct-field${wide}"><span>${E(f.l)}</span><input name="${E(f.n)}" type="${E(f.t||'text')}" ${req} value="${E(val??'')}" ${f.step?`step="${E(f.step)}"`:''} placeholder="${E(f.ph||'')}"></label>`;
}
function parseField(f,form){
 const el=form.elements[f.n];if(!el)return null;
 if(f.t==='checkbox')return !!el.checked;
 if(f.t==='number')return el.value===''?0:Number(el.value);
 if(f.t==='jsontext')return String(el.value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(detalle=>({detalle}));
 return String(el.value||'').trim()||null;
}
function editor(key,row=null){
 const m=MODULES[key],id=`cct-form-${Date.now()}`;
 const html=`<form id="${id}" class="cct-form">${m.fields.map(f=>inputFor(f,row)).join('')}<div class="cct-form-actions"><button type="button" class="btn" data-cct-cancel>Cerrar</button><button type="submit" class="btn primary">${row?'Guardar cambios':'Registrar'}</button></div></form>`;
 if(typeof openModal==='function')openModal(`${row?'Editar':'Nuevo registro'} · ${m.label}`,html);
 else return;
 const form=document.getElementById(id);if(!form)return;
 form.querySelector('[data-cct-cancel]').onclick=()=>document.querySelector('.modal-bg')?.remove();
 form.onsubmit=async e=>{
   e.preventDefault();if(busy)return;busy=true;
   const submit=form.querySelector('button[type=submit]');submit.disabled=true;submit.textContent='Guardando…';
   try{
     let payload={};m.fields.forEach(f=>payload[f.n]=parseField(f,form));
     payload=m.normalize?m.normalize(payload):payload;
     payload.updated_by=session?.userId||null;
     if(row){
       const data=A(await rest(m.table,{method:'PATCH',query:`id=eq.${encodeURIComponent(row.id)}`,body:payload}));
       await syncAlert(key,data[0]||{...row,...payload});
     }else{
       payload.workspace_id=workspaceId();payload.project_id=projectId();payload.created_by=session?.userId||null;
       const cid=contractId(payload.project_id);if(cid&&['calidad','actas','consultas','riesgos','recepcion'].includes(key))payload.contract_id=cid;
       const data=A(await rest(m.table,{method:'POST',body:payload}));
       await syncAlert(key,data[0]||payload);
     }
     document.querySelector('.modal-bg')?.remove();await renderModule(key,true);refreshContext(projectId());
     if(typeof say==='function')say('Registro técnico guardado correctamente.');
   }catch(err){
     if(typeof say==='function')say(`No se pudo guardar: ${err.message}`);else alert(err.message);
     submit.disabled=false;submit.textContent=row?'Guardar cambios':'Registrar';
   }finally{busy=false}
 };
}
function kpis(key,rows){
 const total=rows.length;
 let a=0,b=0,c=0;
 if(key==='calidad'){a=rows.filter(r=>r.status==='CONFORME'||r.status==='SUBSANADO').length;b=rows.filter(r=>r.status==='NO_CONFORME').length;c=rows.filter(r=>['PENDIENTE','EN_PROCESO'].includes(r.status)).length;return [['Total ensayos',total,''],['Conformes',a,'good'],['No conformes',b,b?'danger':'good'],['Pendientes',c,c?'warn':'']]}
 if(key==='seguridad'){a=rows.filter(r=>['ALTA','CRITICA'].includes(r.severity)&&!['CERRADO','ANULADO'].includes(r.status)).length;b=rows.filter(r=>r.status==='ABIERTO'||r.status==='EN_SEGUIMIENTO').length;c=rows.filter(r=>r.record_type==='ACCIDENTE').length;return [['Registros',total,''],['Alta / crítica',a,a?'danger':'good'],['Abiertos',b,b?'warn':'good'],['Accidentes',c,c?'danger':'good']]}
 if(key==='ambiental'){a=rows.filter(r=>['ALTO','CRITICO'].includes(r.impact_level)&&!['CERRADO','ANULADO'].includes(r.status)).length;b=rows.filter(r=>r.status==='ABIERTO'||r.status==='EN_SEGUIMIENTO').length;c=rows.filter(r=>r.category==='QUEJA').length;return [['Registros',total,''],['Impacto alto/crítico',a,a?'danger':'good'],['Abiertos',b,b?'warn':'good'],['Quejas',c,c?'warn':'good']]}
 if(key==='consultas'){a=rows.filter(r=>['ABIERTA','EN_REVISION'].includes(r.status)).length;b=rows.filter(r=>r.due_date&&r.due_date<today()&&!['CERRADA','ANULADA','RESPONDIDA'].includes(r.status)).length;c=rows.reduce((s,r)=>s+N(r.impact_days),0);return [['Consultas',total,''],['Abiertas',a,a?'warn':'good'],['Vencidas',b,b?'danger':'good'],['Impacto potencial',`${c} días`,c?'warn':'']]}
 if(key==='riesgos'){a=rows.filter(r=>r.impact==='CRITICO'&&!['CERRADO','ANULADO','RESUELTO'].includes(r.status)).length;b=rows.filter(r=>['ABIERTO','EN_ANALISIS'].includes(r.status)).length;c=rows.reduce((s,r)=>s+N(r.amount_exposure),0);return [['Registros',total,''],['Críticos',a,a?'danger':'good'],['Abiertos',b,b?'warn':'good'],['Exposición',fmtMoney(c),c?'warn':'']]}
 if(key==='recepcion'){a=rows.filter(r=>r.reception_type==='PROVISIONAL').length;b=rows.filter(r=>r.reception_type==='FINAL').length;c=rows.filter(r=>r.reception_type==='LIQUIDACION').length;return [['Actas',total,''],['Provisional',a,''],['Final',b,''],['Liquidación',c,'']]}
 if(key==='actas'){a=rows.filter(r=>r.act_type==='SUSPENSION'&&r.status==='VIGENTE').length;b=rows.filter(r=>r.act_type==='REINICIO').length;c=rows.reduce((s,r)=>s+N(r.days_effect),0);return [['Actas',total,''],['Suspensiones vigentes',a,a?'danger':'good'],['Reinicios',b,''],['Impacto acumulado',`${c} días`,c?'warn':'']]}
 if(key==='bitacora'){a=rows.filter(r=>r.status==='ABIERTO').length;b=rows.reduce((s,r)=>s+N(r.downtime_hours),0);c=rows.filter(r=>r.log_date===today()).length;return [['Bitácoras',total,''],['Abiertas',a,a?'warn':'good'],['Horas improductivas',b.toFixed(1),b?'warn':''],['Registros de hoy',c,'']]}
 return [['Registros',total,''],['Activos',a,''],['Alertas',b,''],['Cerrados',c,'']];
}
function renderTable(key,rows){
 const m=MODULES[key];
 if(!rows.length)return `<div class="cct-empty">No hay registros en <b>${E(m.label)}</b> para este proyecto.</div>`;
 return `<div class="cct-table-wrap"><table class="cct-table"><thead><tr>${m.columns.map(c=>`<th>${E(c[0])}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${m.columns.map(c=>`<td>${typeof c[1]==='function'?c[1](r):E(r[c[1]]??'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
async function renderModule(key,force=false){
 activeKey=key;const host=document.querySelector('[data-cct-module-host]');if(!host)return;
 document.querySelectorAll('[data-cct-module]').forEach(b=>b.classList.toggle('active',b.dataset.cctModule===key));
 host.innerHTML='<div class="cct-loading">Cargando control técnico…</div>';
 try{
   const rows=force||!cache[key]?await loadRows(key,projectId()):cache[key],m=MODULES[key],cards=kpis(key,rows);
   host.innerHTML=`<section class="cct-panel"><div class="cct-panel-head"><div><h3>${E(m.label)}</h3><p>${E(m.subtitle)}</p></div><div class="cct-actions"><button type="button" class="btn" data-cct-refresh>Actualizar</button><button type="button" class="btn primary" data-cct-new>+ Nuevo registro</button></div></div><div class="cct-kpis">${cards.map(x=>`<article class="cct-kpi ${x[2]||''}"><small>${E(x[0])}</small><b>${E(x[1])}</b></article>`).join('')}</div>${renderTable(key,rows)}</section>`;
   host.querySelector('[data-cct-refresh]').onclick=()=>renderModule(key,true);
   host.querySelector('[data-cct-new]').onclick=()=>editor(key);
   host.querySelectorAll('[data-cct-edit]').forEach(b=>b.onclick=()=>editor(key,rows.find(r=>r.id===b.dataset.cctEdit)));
 }catch(err){
   host.innerHTML=`<div class="alert danger"><b>No se pudo cargar ${E(MODULES[key].label)}.</b><br>${E(err.message)}</div>`;
 }
}
function shell(){
 const p=projectInfo(projectId());
 return `<div class="cct-wrap" data-cct-shell><section class="cct-hero"><div><span class="cct-kicker">CONTROL TÉCNICO INTEGRAL DE OBRA</span><h2>Calidad, campo, seguridad y cierre contractual</h2><p>${E(p?.code||'Proyecto')} · ${E(p?.name||'Expediente activo')}. Los módulos se vinculan al mismo proyecto y conservan auditoría en Supabase.</p></div><div class="cct-hero-badge"><small>MÓDULOS TÉCNICOS</small><b>8 controles integrados</b></div></section><nav class="cct-tabs">${Object.entries(MODULES).map(([k,m])=>`<button type="button" class="cct-tab${k===activeKey?' active':''}" data-cct-module="${k}"><span>${m.icon}</span>${E(m.label)}</button>`).join('')}</nav><div data-cct-module-host></div></div>`;
}
function activate(){
 const pid=projectId(),body=document.getElementById('tabBody'),nav=document.querySelector('nav.tabs');if(!pid||!body||!nav)return;
 active=true;currentProject=pid;nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));const btn=nav.querySelector('[data-cc-technical-control]');btn?.classList.add('active');
 body.innerHTML=shell();document.querySelectorAll('[data-cct-module]').forEach(b=>b.onclick=()=>renderModule(b.dataset.cctModule));renderModule(activeKey);refreshContext(pid);
}
function mount(){
 injectCss();const pid=projectId(),nav=document.querySelector('nav.tabs'),body=document.getElementById('tabBody');if(!pid||!nav||!body)return;
 let btn=nav.querySelector('[data-cc-technical-control]');
 if(!btn){btn=document.createElement('button');btn.type='button';btn.dataset.ccTechnicalControl='1';btn.textContent='Control técnico';btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();activate()},true);nav.appendChild(btn)}
 if(active&&currentProject===pid){
   if(!body.querySelector('[data-cct-shell]'))activate(); else btn.classList.add('active');
 }else if(currentProject&&currentProject!==pid){active=false;currentProject=pid}
}
function criticalAlert(key,r){
 if(key==='calidad'&&r.status==='NO_CONFORME')return ['CRITICA','Ensayo no conforme',`${r.test_code||'Ensayo'} · ${r.structural_element||'Elemento'} no cumple el valor requerido.${r.financial_hold?' Revisar antes de aprobar el pago relacionado.':''}`];
 if(key==='seguridad'&&['ALTA','CRITICA'].includes(r.severity)&&!['CERRADO','ANULADO'].includes(r.status))return [r.severity==='CRITICA'?'URGENTE':'CRITICA','Seguridad y salud',truncate(r.description,180)];
 if(key==='ambiental'&&['ALTO','CRITICO'].includes(r.impact_level)&&!['CERRADO','ANULADO'].includes(r.status))return ['CRITICA','Impacto ambiental/social',truncate(r.finding,180)];
 if(key==='riesgos'&&r.impact==='CRITICO'&&!['RESUELTO','CERRADO','ANULADO'].includes(r.status))return ['CRITICA','Riesgo o reclamo crítico',truncate(`${r.code||''} ${r.title||''}`,180)];
 if(key==='actas'&&r.act_type==='SUSPENSION'&&r.status==='VIGENTE')return ['ADVERTENCIA','Obra suspendida',`${r.act_number||'Acta'} · revisar plazo contractual y condiciones de reinicio.`];
 return null;
}
async function syncAlert(key,r){
 try{
  if(!r?.id||!uuid(r.id)||!workspaceId())return;
  const alertKey=`CONTROL_TECNICO:${MODULES[key].table}:${r.id}`;
  const found=A(await rest('alert_events',{query:`select=id,resolved_at&alert_key=eq.${encodeURIComponent(alertKey)}&limit=1`}))[0];
  const crit=criticalAlert(key,r);
  if(!crit){if(found&&!found.resolved_at)await rest('alert_events',{method:'PATCH',query:`id=eq.${found.id}`,body:{resolved_at:new Date().toISOString(),last_evaluated_at:new Date().toISOString()}});return}
  const body={workspace_id:workspaceId(),alert_key:alertKey,project_id:projectId(),source_type:MODULES[key].table,source_id:r.id,severity:crit[0],title:crit[1],message:crit[2],last_evaluated_at:new Date().toISOString(),resolved_at:null};
  if(found)await rest('alert_events',{method:'PATCH',query:`id=eq.${found.id}`,body});else await rest('alert_events',{method:'POST',body});
 }catch(err){console.warn('No se pudo sincronizar alerta técnica',err)}
}
async function refreshContext(pid){
 if(!pid||!session?.accessToken)return;
 try{
   const pairs=await Promise.all(Object.entries(MODULES).map(async([k,m])=>{
     try{const rows=await loadRows(k,pid);return[k,rows]}catch{return[k,[]]}
   }));
   const d=Object.fromEntries(pairs);
   const qnc=d.calidad.filter(r=>r.status==='NO_CONFORME').length;
   const saf=d.seguridad.filter(r=>['ALTA','CRITICA'].includes(r.severity)&&!['CERRADO','ANULADO'].includes(r.status)).length;
   const env=d.ambiental.filter(r=>['ALTO','CRITICO'].includes(r.impact_level)&&!['CERRADO','ANULADO'].includes(r.status)).length;
   const rsk=d.riesgos.filter(r=>r.impact==='CRITICO'&&!['RESUELTO','CERRADO','ANULADO'].includes(r.status)).length;
   const rfi=d.consultas.filter(r=>['ABIERTA','EN_REVISION'].includes(r.status)).length;
   contextSummary=`Control técnico del proyecto: ensayos ${d.calidad.length} (${qnc} no conformes); actas ${d.actas.length}; bitácoras ${d.bitacora.length}; seguridad ${d.seguridad.length} (${saf} alertas altas/críticas); ambiental-social ${d.ambiental.length} (${env} alertas altas/críticas); consultas técnicas abiertas ${rfi}; riesgos/reclamos críticos ${rsk}; recepciones/liquidaciones ${d.recepcion.length}.`;
   installZordonBridge();
 }catch{}
}
function installZordonBridge(){
 const chat=window.__ccEngineerChat;if(!chat||chat.__cctContextWrapped)return;
 const original=typeof chat.haluCloudContext==='function'?chat.haluCloudContext.bind(chat):null;
 chat.haluCloudContext=(message)=>[original?original(message):'',contextSummary].filter(Boolean).join('\n\n').slice(0,5200);
 chat.__cctContextWrapped=true;
}
document.addEventListener('click',e=>{
 const native=e.target.closest?.('nav.tabs button:not([data-cc-technical-control])');if(native){active=false}
},true);
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount();installZordonBridge()})}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(mount,0);setTimeout(mount,500);setTimeout(mount,1400);
window.__ccTechnicalControl={activate,renderModule,refreshContext,modules:MODULES};
})();
