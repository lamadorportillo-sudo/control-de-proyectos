/* ===== RESPALDO EXCEL CONTROL CONTRACTUAL V1 ===== */
(()=>{
'use strict';
if(window.__CP_EXCEL_BACKUP_V1__)return;
window.__CP_EXCEL_BACKUP_V1__=true;

const SHEETJS_URL='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
let sheetJsPromise=null;

function notify(msg){
  try{if(typeof toast==='function')return toast(msg);}catch(_e){}
  console.info(msg);
}

function loadSheetJS(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  if(sheetJsPromise)return sheetJsPromise;
  sheetJsPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-cp-sheetjs]');
    if(existing){
      existing.addEventListener('load',()=>window.XLSX?resolve(window.XLSX):reject(new Error('No se pudo iniciar Excel.')),{once:true});
      existing.addEventListener('error',()=>reject(new Error('No se pudo cargar el generador de Excel.')),{once:true});
      return;
    }
    const s=document.createElement('script');
    s.src=SHEETJS_URL;
    s.async=true;
    s.dataset.cpSheetjs='1';
    s.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error('No se pudo iniciar Excel.'));
    s.onerror=()=>reject(new Error('No se pudo cargar el generador de Excel.'));
    document.head.appendChild(s);
  });
  return sheetJsPromise;
}

const safeArray=v=>Array.isArray(v)?v:[];
const r2=v=>Math.round((Number(v)||0)*100)/100;
const json=v=>{try{return JSON.stringify(v??null);}catch(_e){return String(v??'');}};
const dateStamp=()=>{try{if(typeof today==='function')return today();}catch(_e){}return new Date().toISOString().slice(0,10);};

function flatRecord(obj){
  const out={};
  Object.entries(obj||{}).forEach(([k,v])=>{
    if(v===undefined||v===null)out[k]='';
    else if(Array.isArray(v)||typeof v==='object')out[k]=json(v);
    else out[k]=v;
  });
  return out;
}

function projectById(id){return safeArray(db?.projects).find(p=>p.id===id)||null;}
function contractById(id){return safeArray(db?.contracts).find(c=>c.id===id)||null;}
function projectForRecord(rec){
  if(rec?.projectId)return projectById(rec.projectId);
  if(rec?.contractId){const c=contractById(rec.contractId);return c?projectById(c.projectId):null;}
  return null;
}

function linkFields(rec){
  const p=projectForRecord(rec),c=rec?.contractId?contractById(rec.contractId):(rec?.projectId?safeArray(db?.contracts).find(x=>x.projectId===rec.projectId):null);
  return{
    'Código proyecto':p?.code||'',
    'Nombre proyecto':p?.name||'',
    'Contrato':c?.number||'',
    'Contratista':c?.contractor||''
  };
}

function rowsOf(records,withLinks=true){
  return safeArray(records).map(rec=>Object.assign({},withLinks?linkFields(rec):{},flatRecord(rec)));
}

function budgetSnapshot(p){
  const b=p?.budgetControl;if(!b)return null;
  let assigned=+b.assigned||0,decrease=+b.decrease||0,expansion=+b.expansion||0,tp=+b.transferPositive||0,tn=+b.transferNegative||0,paid=+b.paid||0;
  safeArray(b.movements).forEach(m=>{const a=+m.amount||0;if(m.type==='Ampliación')expansion+=a;else if(m.type==='Disminución')decrease+=a;else if(m.type==='Transferencia +')tp+=a;else if(m.type==='Transferencia -')tn+=a;else if(m.type==='Pago')paid+=a;});
  const vigente=r2(assigned-decrease+expansion+tp-tn),disponible=r2(vigente-paid);
  return{assigned:r2(assigned),decrease:r2(decrease),expansion:r2(expansion),transferPositive:r2(tp),transferNegative:r2(tn),vigente,paid:r2(paid),disponible,pct:vigente?r2(paid/vigente*100):0};
}

function budgetRows(){
  return safeArray(db?.projects).filter(p=>!p.deletedAt&&p.budgetControl).map(p=>{
    const b=p.budgetControl,s=budgetSnapshot(p);
    return{
      'Código':p.code||'',
      'Proyecto':p.name||'',
      'Fuente':b.source||'',
      'Fecha de corte':b.cutDate||'',
      'Página fuente':b.sourcePage||'',
      'Asignado':s.assigned,
      'Disminuciones':s.decrease,
      'Ampliaciones':s.expansion,
      'Transferencia +':s.transferPositive,
      'Transferencia -':s.transferNegative,
      'Presupuesto vigente':s.vigente,
      'Pagado':s.paid,
      'Disponible':s.disponible,
      '% pagado':s.pct
    };
  });
}

function budgetMovementRows(){
  const out=[];
  safeArray(db?.projects).filter(p=>p.budgetControl).forEach(p=>{
    safeArray(p.budgetControl.movements).forEach(m=>out.push(Object.assign({'Código proyecto':p.code||'','Nombre proyecto':p.name||''},flatRecord(m))));
  });
  return out;
}

function paymentRows(){
  const direct=rowsOf(db?.payments);
  if(direct.length)return direct;
  return safeArray(db?.estimates).map(e=>Object.assign({},linkFields(e),{
    'N° estimación':e.number??'',
    'Monto bruto':e.gross??e.amount??'',
    'Neto estimado':e.net??'',
    'Anticipo aplicado':e.advanceApplied??'',
    'Estado':e.status??'',
    'Fecha':e.paymentDate??e.date??e.end??''
  },flatRecord(e)));
}

function auditRows(){
  return safeArray(db?.audit).map(a=>{
    const u=safeArray(db?.users).find(x=>x.id===a.userId);
    return Object.assign({'Usuario':u?.name||u?.email||''},flatRecord(a));
  });
}

function jsonBackupRows(){
  const raw=JSON.stringify(db,null,2),size=30000,rows=[];
  for(let i=0,n=1;i<raw.length;i+=size,n++)rows.push({'Parte':n,'Contenido JSON':raw.slice(i,i+size)});
  return rows;
}

function addSheet(XLSX,wb,name,rows,opts={}){
  const data=rows?.length?rows:[{'Sin datos':'No hay registros en esta sección.'}];
  const ws=XLSX.utils.json_to_sheet(data);
  const headers=Object.keys(data[0]||{});
  ws['!autofilter']={ref:`A1:${XLSX.utils.encode_col(Math.max(0,headers.length-1))}${Math.max(1,data.length+1)}`};
  ws['!cols']=headers.map((header,idx)=>{
    let max=String(header).length;
    for(let i=0;i<Math.min(data.length,250);i++)max=Math.max(max,String(data[i]?.[header]??'').length);
    const cap=opts.json&&idx===1?80:(/proyecto|nombre|descrip|observ|detalle|contenido/i.test(header)?45:24);
    return{wch:Math.max(10,Math.min(cap,max+2))};
  });
  const range=XLSX.utils.decode_range(ws['!ref']||'A1:A1');
  for(let c=range.s.c;c<=range.e.c;c++){
    const head=String(ws[XLSX.utils.encode_cell({r:0,c})]?.v||'');
    if(/monto|presupuesto|pagado|disponible|asignado|ampliacion|ampliaciones|disminucion|retencion|anticipo|transferencia|precio|total|saldo/i.test(head)){
      for(let r=1;r<=range.e.r;r++){const cell=ws[XLSX.utils.encode_cell({r,c})];if(cell&&cell.t==='n')cell.z='"L" #,##0.00';}
    }else if(/%|porcentaje|avance/i.test(head)){
      for(let r=1;r<=range.e.r;r++){const cell=ws[XLSX.utils.encode_cell({r,c})];if(cell&&cell.t==='n')cell.z='0.00';}
    }
  }
  XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));
}

async function exportBackupExcel(){
  try{
    if(typeof db==='undefined'||!db)throw new Error('No hay información cargada para respaldar.');
    notify('Preparando respaldo en Excel…');
    const XLSX=await loadSheetJS();
    const wb=XLSX.utils.book_new();
    const budgets=budgetRows();
    const bt=budgets.reduce((a,r)=>{a.v+=Number(r['Presupuesto vigente'])||0;a.p+=Number(r.Pagado)||0;a.d+=Number(r.Disponible)||0;return a;},{v:0,p:0,d:0});
    const summary=[
      {'Concepto':'Fecha de generación','Valor':new Date().toLocaleString('es-HN')},
      {'Concepto':'Sistema','Valor':'Control Contractual – Control de Proyectos'},
      {'Concepto':'Proyectos activos','Valor':safeArray(db.projects).filter(p=>!p.deletedAt).length},
      {'Concepto':'Proyectos en papelera','Valor':safeArray(db.projects).filter(p=>p.deletedAt).length},
      {'Concepto':'Contratos','Valor':safeArray(db.contracts).length},
      {'Concepto':'Estimaciones','Valor':safeArray(db.estimates).length},
      {'Concepto':'Pagos','Valor':safeArray(db.payments).length},
      {'Concepto':'Garantías','Valor':safeArray(db.guarantees).length},
      {'Concepto':'Modificaciones','Valor':safeArray(db.changes).length},
      {'Concepto':'Visitas','Valor':safeArray(db.visits).length},
      {'Concepto':'Proyectos con control presupuestario','Valor':budgets.length},
      {'Concepto':'Presupuesto vigente controlado','Valor':r2(bt.v)},
      {'Concepto':'Pagado controlado','Valor':r2(bt.p)},
      {'Concepto':'Disponible controlado','Valor':r2(bt.d)}
    ];
    addSheet(XLSX,wb,'Resumen',summary);
    addSheet(XLSX,wb,'Proyectos',rowsOf(db.projects,false));
    addSheet(XLSX,wb,'Contratos',rowsOf(db.contracts));
    addSheet(XLSX,wb,'Estimaciones',rowsOf(db.estimates));
    addSheet(XLSX,wb,'Pagos',paymentRows());
    addSheet(XLSX,wb,'Garantias',rowsOf(db.guarantees));
    addSheet(XLSX,wb,'Modificaciones',rowsOf(db.changes));
    addSheet(XLSX,wb,'Visitas',rowsOf(db.visits));
    addSheet(XLSX,wb,'Disponibilidad',budgets);
    addSheet(XLSX,wb,'Mov Presupuestarios',budgetMovementRows());
    addSheet(XLSX,wb,'Usuarios',rowsOf(db.users,false));
    addSheet(XLSX,wb,'Auditoria',auditRows());
    addSheet(XLSX,wb,'Respaldo tecnico',jsonBackupRows(),{json:true});
    const file=`control-contractual-respaldo-${dateStamp()}.xlsx`;
    XLSX.writeFile(wb,file,{compression:true});
    try{if(typeof audit==='function')audit('EXPORTAR','Respaldo Excel',null,{file,sheets:wb.SheetNames.length});if(typeof saveDB==='function')saveDB();}catch(_e){}
    notify('Respaldo Excel generado correctamente.');
  }catch(err){
    console.error('Respaldo Excel',err);
    notify(err?.message||'No se pudo generar el respaldo en Excel.');
  }
}

function wireBackupButton(){
  const b=document.getElementById('backupBtn');
  if(!b)return;
  b.textContent='⇩ Respaldo Excel';
  b.title='Descargar respaldo completo en un libro de Excel con varias hojas';
  b.onclick=exportBackupExcel;
}

try{window.exportBackup=exportBackupExcel;}catch(_e){}
try{exportBackup=exportBackupExcel;}catch(_e){}

if(typeof renderApp==='function'&&!renderApp.__cpExcelBackupHook){
  const base=renderApp;
  const wrapped=function(){const result=base.apply(this,arguments);queueMicrotask(wireBackupButton);return result;};
  wrapped.__cpExcelBackupHook=true;
  renderApp=wrapped;
}

setTimeout(wireBackupButton,0);
setTimeout(wireBackupButton,300);
setTimeout(wireBackupButton,1000);
})();
