/* ===== ZORDON · DENSIDAD UNIFICADA DE INTERFAZ V1 ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined')return;
if(window.__CC_ZORDON_UNIFIED_DENSITY_V1__)return;
window.__CC_ZORDON_UNIFIED_DENSITY_V1__=true;

const STYLE_ID='cc-zordon-unified-density-v1-style';
const MODULE_WORDS=['inicio','dashboard','proyectos','contratistas','ingenieria','presupuestos','diseno','supervision','auditoria','compras','contratos','juridico','biblioteca','documentos','configuracion','revisar proyecto','ayudas sociales','cotizaciones','evaluacion de contratistas','pagos','licitaciones','garantias'];
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

function installCss(){
  if(document.getElementById(STYLE_ID)||typeof document.createElement!=='function')return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
  /* DENSIDAD GLOBAL: MISMO CRITERIO VISUAL EN TODAS LAS PESTAÑAS */
  html body:not(.print-report).cc-zordon-density{font-size:12.5px!important;line-height:1.38!important}
  html body:not(.print-report).cc-zordon-density .shell{width:min(100%,1540px)!important;max-width:1540px!important;padding:11px 14px 22px!important}
  html body:not(.print-report).cc-zordon-density h1{font-size:19px!important;line-height:1.14!important;margin-bottom:2px!important}
  html body:not(.print-report).cc-zordon-density h2{font-size:15px!important;line-height:1.2!important;margin-bottom:3px!important}
  html body:not(.print-report).cc-zordon-density h3{font-size:12.5px!important;line-height:1.24!important;margin-bottom:3px!important}
  html body:not(.print-report).cc-zordon-density .eyebrow{font-size:8.5px!important;margin-bottom:2px!important;letter-spacing:.105em!important}

  /* CABECERA, PESTAÑAS Y ACCIONES */
  html body:not(.print-report).cc-zordon-density .topbar{padding:7px 9px!important;gap:7px!important;margin-bottom:8px!important;border-radius:11px!important}
  html body:not(.print-report).cc-zordon-density .top-actions,
  html body:not(.print-report).cc-zordon-density .toolbar,
  html body:not(.print-report).cc-zordon-density .actions{gap:5px!important;margin-bottom:7px!important}
  html body:not(.print-report).cc-zordon-density .tabs{gap:4px!important;margin-bottom:7px!important;padding-bottom:2px!important}
  html body:not(.print-report).cc-zordon-density .tabs button,
  html body:not(.print-report).cc-zordon-density .cp-main-tabs button,
  html body:not(.print-report).cc-zordon-density .btn{min-height:30px!important;padding:5px 8px!important;border-radius:8px!important;font-size:10px!important;line-height:1.15!important}
  html body:not(.print-report).cc-zordon-density .icon-btn{width:30px!important;height:30px!important;min-width:30px!important;min-height:30px!important;padding:0!important;border-radius:8px!important}

  /* PANELES Y TARJETAS */
  html body:not(.print-report).cc-zordon-density .panel{padding:9px 10px!important;margin-bottom:8px!important;border-radius:11px!important}
  html body:not(.print-report).cc-zordon-density .panel-head{gap:6px!important;margin-bottom:6px!important}
  html body:not(.print-report).cc-zordon-density .card{padding:9px!important;border-radius:10px!important}
  html body:not(.print-report).cc-zordon-density .grid-kpi,
  html body:not(.print-report).cc-zordon-density .exec-kpis{gap:6px!important;margin-bottom:8px!important}
  html body:not(.print-report).cc-zordon-density .kpi,
  html body:not(.print-report).cc-zordon-density .exec-kpi{padding:7px 8px!important;border-radius:9px!important;min-height:0!important}
  html body:not(.print-report).cc-zordon-density .kpi small,
  html body:not(.print-report).cc-zordon-density .exec-kpi small{font-size:8px!important;margin-bottom:2px!important}
  html body:not(.print-report).cc-zordon-density .kpi strong,
  html body:not(.print-report).cc-zordon-density .exec-kpi strong{font-size:13px!important;line-height:1.12!important}

  /* RESÚMENES, AVANCES Y DATOS */
  html body:not(.print-report).cc-zordon-density .summary-grid,
  html body:not(.print-report).cc-zordon-density .advance{gap:5px!important;margin-bottom:7px!important}
  html body:not(.print-report).cc-zordon-density .info,
  html body:not(.print-report).cc-zordon-density .advance>div{padding:6px 7px!important;border-radius:8px!important;min-height:0!important}
  html body:not(.print-report).cc-zordon-density .info small,
  html body:not(.print-report).cc-zordon-density .advance small{font-size:8.5px!important;margin-bottom:2px!important}
  html body:not(.print-report).cc-zordon-density .info strong,
  html body:not(.print-report).cc-zordon-density .advance strong{font-size:11.5px!important;line-height:1.18!important}
  html body:not(.print-report).cc-zordon-density .project-context{gap:5px!important;padding:6px!important;margin-bottom:7px!important;border-radius:9px!important}
  html body:not(.print-report).cc-zordon-density .project-context .ctx{padding:4px 6px!important}

  /* TABLAS: MÁS INFORMACIÓN EN MENOS ESPACIO */
  html body:not(.print-report).cc-zordon-density .table-wrap{border-radius:9px!important;max-width:100%!important}
  html body:not(.print-report).cc-zordon-density .table{min-width:720px!important}
  html body:not(.print-report).cc-zordon-density .table th,
  html body:not(.print-report).cc-zordon-density .table td,
  html body:not(.print-report).cc-zordon-density .cp-budget-table th,
  html body:not(.print-report).cc-zordon-density .cp-budget-table td{padding:5px 7px!important;font-size:9.5px!important;line-height:1.25!important}
  html body:not(.print-report).cc-zordon-density .table th,
  html body:not(.print-report).cc-zordon-density .cp-budget-table th{font-size:8.5px!important;letter-spacing:.035em!important}

  /* FORMULARIOS */
  html body:not(.print-report).cc-zordon-density .form-grid{gap:7px!important}
  html body:not(.print-report).cc-zordon-density .field span{font-size:9.5px!important;margin-bottom:3px!important}
  html body:not(.print-report).cc-zordon-density .field small{font-size:8.5px!important;margin-top:3px!important}
  html body:not(.print-report).cc-zordon-density input:not([type='checkbox']):not([type='radio']),
  html body:not(.print-report).cc-zordon-density select,
  html body:not(.print-report).cc-zordon-density textarea,
  html body:not(.print-report).cc-zordon-density .input,
  html body:not(.print-report).cc-zordon-density .search{min-height:32px!important;padding:5px 8px!important;border-radius:8px!important;font-size:11px!important}
  html body:not(.print-report).cc-zordon-density textarea{min-height:62px!important}

  /* ALERTAS, AUDITORÍA, VISITAS Y FILAS OPERATIVAS */
  html body:not(.print-report).cc-zordon-density .alert{padding:7px 9px!important;margin:6px 0!important;border-radius:8px!important;font-size:10px!important}
  html body:not(.print-report).cc-zordon-density .alert-list{gap:5px!important}
  html body:not(.print-report).cc-zordon-density .alert-row{gap:6px!important;padding:6px 7px!important;border-radius:8px!important;min-height:0!important}
  html body:not(.print-report).cc-zordon-density .status,
  html body:not(.print-report).cc-zordon-density .pill{padding:3px 5px!important;font-size:8px!important;line-height:1.1!important}

  /* REPORTES / DOCUMENTOS: SELECTORES COMPACTOS; PAPEL NO SE ALTERA */
  html body:not(.print-report).cc-zordon-density .report-toolbar{gap:6px!important;margin-bottom:8px!important}
  html body:not(.print-report).cc-zordon-density .report-type-grid{gap:5px!important;margin-bottom:8px!important}
  html body:not(.print-report).cc-zordon-density .report-type-card{min-height:66px!important;padding:7px 8px!important;border-radius:9px!important}
  html body:not(.print-report).cc-zordon-density .report-type-card b{font-size:11px!important;margin-bottom:2px!important}
  html body:not(.print-report).cc-zordon-density .report-type-card small{font-size:8.5px!important;line-height:1.25!important}

  /* SELECTORES, BIBLIOTECA, COMPRAS, CONTRATOS Y MÓDULOS QUE USAN TILES */
  html body:not(.print-report).cc-zordon-density .service-tile{min-height:74px!important;height:74px!important;padding:7px!important;border-radius:9px!important}
  html body:not(.print-report).cc-zordon-density .service-project{padding:6px 7px!important;border-radius:8px!important;min-height:0!important}
  html body:not(.print-report).cc-zordon-density .service-picker-head,
  html body:not(.print-report).cc-zordon-density .service-picker-tools{padding:7px 8px!important;gap:5px!important}
  html body:not(.print-report).cc-zordon-density .rail-card{padding:7px 8px!important;border-radius:9px!important}

  /* MODALES Y LOGIN */
  html body:not(.print-report).cc-zordon-density .modal{border-radius:11px!important;max-height:90vh!important}
  html body:not(.print-report).cc-zordon-density .modal-head{padding:8px 10px!important}
  html body:not(.print-report).cc-zordon-density .modal-body{padding:9px 10px!important}
  html body:not(.print-report).cc-zordon-density .modal-actions{gap:5px!important;margin-top:3px!important}
  html body:not(.print-report).cc-zordon-density .auth-card{width:min(420px,100%)!important;padding:18px!important;border-radius:15px!important}
  html body:not(.print-report).cc-zordon-density .auth-card .logo{width:46px!important;height:46px!important;margin-bottom:12px!important}
  html body:not(.print-report).cc-zordon-density .seg{margin:12px 0!important;padding:3px!important;border-radius:9px!important}
  html body:not(.print-report).cc-zordon-density .seg button{padding:6px!important;font-size:10px!important}

  /* PATRONES DE LOS MÓDULOS RESTANTES Y FUTUROS */
  html body:not(.print-report).cc-zordon-density #app :is(
    [class*='contractor'],[class*='audit'],[class*='purchase'],[class*='contract'],[class*='legal'],
    [class*='library'],[class*='document'],[class*='setting'],[class*='review'],[class*='social'],
    [class*='quote'],[class*='payment'],[class*='evaluation'],[class*='guarantee'],[class*='procurement']
  ):is(.card,.panel,[class$='-card'],[class$='-item'],[class$='-row'],[class$='-tile']){
    padding:7px 8px!important;border-radius:9px!important;min-height:0!important;gap:6px!important
  }
  html body:not(.print-report).cc-zordon-density #app :is(
    [class*='contractor'],[class*='audit'],[class*='purchase'],[class*='contract'],[class*='legal'],
    [class*='library'],[class*='document'],[class*='setting'],[class*='review'],[class*='social'],
    [class*='quote'],[class*='payment'],[class*='evaluation'],[class*='guarantee'],[class*='procurement']
  ) img{max-height:68px!important;object-fit:cover!important}

  /* RESPONSIVE: COMPACTO PERO LEGIBLE */
  @media(max-width:1100px){
    html body:not(.print-report).cc-zordon-density .grid-kpi{grid-template-columns:repeat(3,minmax(0,1fr))!important}
    html body:not(.print-report).cc-zordon-density .report-type-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  }
  @media(max-width:720px){
    html body:not(.print-report).cc-zordon-density .shell{padding:9px 9px 18px!important}
    html body:not(.print-report).cc-zordon-density .grid-kpi{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    html body:not(.print-report).cc-zordon-density .summary-grid,
    html body:not(.print-report).cc-zordon-density .advance{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    html body:not(.print-report).cc-zordon-density .report-type-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    html body:not(.print-report).cc-zordon-density .panel{padding:8px!important}
  }
  @media(max-width:440px){
    html body:not(.print-report).cc-zordon-density .grid-kpi,
    html body:not(.print-report).cc-zordon-density .summary-grid,
    html body:not(.print-report).cc-zordon-density .advance,
    html body:not(.print-report).cc-zordon-density .report-type-grid{grid-template-columns:1fr!important}
  }
  `;
  document.head.appendChild(s);
}

function tagModules(){
  const body=document.body;if(!body)return;
  body.classList.add('cc-zordon-density');
  const app=document.getElementById('app');if(!app)return;
  const headings=[...app.querySelectorAll('h1,h2,h3,.eyebrow')];
  headings.forEach(el=>{
    const text=norm(el.textContent);
    if(!text||!MODULE_WORDS.some(w=>text.includes(w)))return;
    const host=el.closest('.panel,.card,section,[data-screen],[data-view]');
    if(host)host.classList.add('cc-zordon-density-module');
  });
}

let queued=false;
function run(){installCss();tagModules()}
function schedule(){if(queued)return;queued=true;const go=()=>{queued=false;run()};if(typeof requestAnimationFrame==='function')requestAnimationFrame(go);else setTimeout(go,0)}
run();
if(typeof MutationObserver==='function'){
  const target=document.getElementById('app')||document.documentElement;
  const observer=new MutationObserver(schedule);observer.observe(target,{childList:true,subtree:true});
}
setTimeout(run,250);setTimeout(run,900);
window.__ccZordonUnifiedDensity={run};
})();
