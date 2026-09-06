/* ===== COORDINADOR DE RENDIMIENTO DEL DOM V8.1 · INTERFAZ ORDENADA ===== */
(()=>{
'use strict';
if(window.__CC_PERFORMANCE_RUNTIME_V8__)return;
window.__CC_PERFORMANCE_RUNTIME_V8__=true;
window.__CC_PERFORMANCE_RUNTIME_V7__=true;
window.__CC_PERFORMANCE_RUNTIME_V6__=true;
window.__CC_PERFORMANCE_RUNTIME_V5__=true;
window.__CC_PERFORMANCE_RUNTIME_V4__=true;
window.__CC_PERFORMANCE_RUNTIME_V3__=true;
window.__CC_PERFORMANCE_RUNTIME_V2__=true;
window.__CC_PERFORMANCE_RUNTIME_V1__=true;

/* MutationObserver pertenece al navegador y nunca se reemplaza globalmente. */
if(!window.__ccNativeMutationObserver&&window.MutationObserver){
  window.__ccNativeMutationObserver=window.MutationObserver;
}

function installContainment(){
  if(document.getElementById('ccPerformanceContainment'))return;
  const style=document.createElement('style');
  style.id='ccPerformanceContainment';
  style.textContent=`
.project-v3,.project-card,.project-photo-item,.portfolio-project-card{content-visibility:auto;contain-intrinsic-size:1px 260px}
.table tbody tr{content-visibility:auto;contain-intrinsic-size:1px 48px}
`;
  (document.head||document.documentElement).appendChild(style);
}

function installOrderedInterface(){
  if(document.getElementById('ccOrderedInterfaceV1'))return;
  const style=document.createElement('style');
  style.id='ccOrderedInterfaceV1';
  style.textContent=`
/* Un lienzo amplio y una jerarquía visual consistente. */
html body.cc-portal-v2:not(.print-report) .shell.cc-shell{
  width:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  grid-template-columns:clamp(218px,16vw,252px) minmax(0,1fr)!important;
}
html body.cc-portal-v2:not(.print-report) .cc-app-column{
  min-width:0!important;
  padding:clamp(12px,1.5vw,26px)!important;
}
html body.cc-portal-v2:not(.print-report) #content{
  width:100%!important;
  max-width:none!important;
}
html body.cc-portal-v2:not(.print-report) .topbar,
html body.cc-portal-v2:not(.print-report) .cc-commandbar,
html body.cc-portal-v2:not(.print-report) .panel{
  border-color:rgba(112,160,224,.18)!important;
  box-shadow:0 18px 48px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.025)!important;
}
html body.cc-portal-v2:not(.print-report) .topbar{
  gap:22px!important;
  align-items:flex-start!important;
  padding:18px 20px!important;
}
html body.cc-portal-v2:not(.print-report) .topbar .brand{
  min-width:240px!important;
  align-items:center!important;
}
html body.cc-portal-v2:not(.print-report) .topbar .top-actions{
  width:auto!important;
  max-width:none!important;
  display:flex!important;
  flex:1 1 auto!important;
  flex-wrap:wrap!important;
  justify-content:flex-end!important;
  align-items:center!important;
  gap:8px!important;
}
html body.cc-portal-v2:not(.print-report) .topbar .btn,
html body.cc-portal-v2:not(.print-report) .cc-command-btn{
  min-height:38px!important;
  padding:9px 12px!important;
  font-size:12.5px!important;
  line-height:1.2!important;
  white-space:nowrap!important;
}
html body.cc-portal-v2:not(.print-report) .cc-commandbar{
  display:grid!important;
  grid-template-columns:minmax(280px,1fr) auto!important;
  align-items:center!important;
  gap:12px!important;
  padding:12px!important;
}
html body.cc-portal-v2:not(.print-report) .cc-global-search,
html body.cc-portal-v2:not(.print-report) .cc-global-search input{
  width:100%!important;
  min-width:0!important;
}
html body.cc-portal-v2:not(.print-report) .cc-command-actions{
  display:flex!important;
  flex-wrap:wrap!important;
  justify-content:flex-end!important;
  gap:8px!important;
}

/* Las pestañas no vuelven a crecer en varias filas. */
html body.cc-portal-v2:not(.print-report) nav.tabs{
  display:flex!important;
  grid-template-columns:none!important;
  flex-wrap:nowrap!important;
  gap:7px!important;
  width:100%!important;
  min-height:52px!important;
  height:auto!important;
  padding:8px!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  overscroll-behavior-inline:contain;
  scrollbar-width:thin;
  scroll-snap-type:x proximity;
}
html body.cc-portal-v2:not(.print-report) nav.tabs>button{
  flex:0 0 auto!important;
  min-height:36px!important;
  padding:8px 12px!important;
  font-size:12.5px!important;
  line-height:1.2!important;
  white-space:nowrap!important;
  scroll-snap-align:start;
}

/* Tabla financiera: números principales primero, detalle legal a demanda. */
html body.cc-portal-v2:not(.print-report) .table-wrap:has(.cc-estimation-table){
  overflow:auto!important;
  background:linear-gradient(180deg,rgba(13,27,46,.94),rgba(8,19,32,.96))!important;
  border-radius:14px!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table{
  width:100%!important;
  min-width:1390px!important;
  border-collapse:separate!important;
  border-spacing:0!important;
  table-layout:auto!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table th{
  padding:11px 12px!important;
  font-size:11.5px!important;
  line-height:1.25!important;
  letter-spacing:.055em!important;
  white-space:normal!important;
  overflow-wrap:normal!important;
  word-break:normal!important;
  vertical-align:middle!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table td{
  padding:13px 12px!important;
  font-size:13px!important;
  line-height:1.4!important;
  overflow-wrap:normal!important;
  word-break:normal!important;
  vertical-align:top!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody tr:nth-child(even) td{
  background:rgba(15,31,50,.56)!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody tr:hover td{
  background:rgba(35,82,145,.18)!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table th:nth-child(1),
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table td:nth-child(1){min-width:54px!important;width:54px!important;text-align:center!important}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table th:nth-child(2),
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table td:nth-child(2){min-width:122px!important;white-space:nowrap!important}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table th:nth-child(n+3):nth-child(-n+8),
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table td:nth-child(n+3):nth-child(-n+8){min-width:158px!important}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table th:nth-child(9),
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table td:nth-child(9){min-width:126px!important;white-space:nowrap!important}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table th:nth-child(10),
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table td:nth-child(10){min-width:92px!important;white-space:nowrap!important}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table th:nth-child(11),
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table td:nth-child(11){min-width:90px!important}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table th:nth-child(12),
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table td:nth-child(12){min-width:190px!important}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table .money-dual{
  min-width:0!important;
  max-width:none!important;
  display:grid!important;
  gap:5px!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table .money-dual>strong{
  color:#f5f9ff!important;
  font-size:14px!important;
  font-weight:850!important;
  line-height:1.25!important;
  white-space:nowrap!important;
  font-variant-numeric:tabular-nums;
}
html body.cc-portal-v2:not(.print-report) .cc-money-words{
  margin:0!important;
  color:#9db3cc!important;
}
html body.cc-portal-v2:not(.print-report) .cc-money-words>summary{
  width:max-content;
  max-width:100%;
  color:#87a9cf!important;
  font-size:10.5px!important;
  font-weight:750!important;
  line-height:1.3!important;
  cursor:pointer;
  list-style:none;
  white-space:nowrap;
}
html body.cc-portal-v2:not(.print-report) .cc-money-words>summary::-webkit-details-marker{display:none}
html body.cc-portal-v2:not(.print-report) .cc-money-words>summary::before{content:'＋';margin-right:4px;color:#6fb5ff}
html body.cc-portal-v2:not(.print-report) .cc-money-words[open]>summary::before{content:'−'}
html body.cc-portal-v2:not(.print-report) .cc-money-words>small{
  display:block!important;
  margin-top:7px!important;
  color:#a9bad0!important;
  font-size:11px!important;
  line-height:1.45!important;
  overflow-wrap:break-word!important;
  word-break:normal!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table .actions{
  display:flex!important;
  flex-wrap:wrap!important;
  gap:6px!important;
}
html body.cc-portal-v2:not(.print-report) table.cc-estimation-table .btn{
  min-height:34px!important;
  padding:7px 9px!important;
  font-size:11.5px!important;
}

@media (max-width:1180px){
  html body.cc-portal-v2:not(.print-report) .topbar{
    display:grid!important;
    grid-template-columns:minmax(0,1fr)!important;
  }
  html body.cc-portal-v2:not(.print-report) .topbar .top-actions{
    width:100%!important;
    display:grid!important;
    grid-template-columns:repeat(3,minmax(0,1fr))!important;
    justify-content:stretch!important;
  }
  html body.cc-portal-v2:not(.print-report) .topbar .top-actions>.btn,
  html body.cc-portal-v2:not(.print-report) .topbar .top-actions>.cloud-pill{
    width:100%!important;
    justify-content:center!important;
  }
  html body.cc-portal-v2:not(.print-report) .topbar .userbox{grid-column:1/-1!important}
  html body.cc-portal-v2:not(.print-report) .cc-commandbar{grid-template-columns:minmax(0,1fr)!important}
  html body.cc-portal-v2:not(.print-report) .cc-command-actions{
    display:grid!important;
    grid-template-columns:repeat(4,minmax(0,1fr))!important;
    justify-content:stretch!important;
  }
  html body.cc-portal-v2:not(.print-report) .cc-command-btn{justify-content:center!important}

  html body.cc-portal-v2:not(.print-report) .table-wrap:has(.cc-estimation-table){overflow:visible!important}
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table,
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody{
    display:block!important;
    width:100%!important;
    min-width:0!important;
  }
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table thead{display:none!important}
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody{
    padding:12px!important;
  }
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody tr{
    display:grid!important;
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    gap:1px!important;
    margin:0 0 12px!important;
    overflow:hidden!important;
    border:1px solid rgba(111,158,221,.19)!important;
    border-radius:13px!important;
    background:rgba(89,134,196,.15)!important;
    box-shadow:0 10px 28px rgba(0,0,0,.12)!important;
    content-visibility:auto;
    contain-intrinsic-size:1px 620px;
  }
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody tr::before{
    content:attr(data-record-title);
    grid-column:1/-1;
    display:block;
    padding:12px 14px;
    background:linear-gradient(90deg,rgba(29,78,216,.28),rgba(14,165,233,.1));
    color:#f3f8ff;
    font-size:14px;
    font-weight:850;
    letter-spacing:.01em;
  }
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody td{
    display:block!important;
    width:auto!important;
    min-width:0!important;
    padding:12px 14px!important;
    background:#0b1726!important;
    border:0!important;
    white-space:normal!important;
  }
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody tr:nth-child(even) td{background:#0d1b2c!important}
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody td::before{
    content:attr(data-label);
    display:block;
    margin-bottom:5px;
    color:#87a0bd;
    font-size:10px;
    font-weight:850;
    line-height:1.25;
    letter-spacing:.07em;
    text-transform:uppercase;
  }
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody td:first-child{display:none!important}
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody td:last-child{grid-column:1/-1!important}
}

@media (max-width:720px){
  html body.cc-portal-v2:not(.print-report) .topbar .top-actions,
  html body.cc-portal-v2:not(.print-report) .cc-command-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  html body.cc-portal-v2:not(.print-report) nav.tabs{margin-inline:0!important;border-radius:12px!important}
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody{padding:8px!important}
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody tr{grid-template-columns:minmax(0,1fr)!important}
  html body.cc-portal-v2:not(.print-report) table.cc-estimation-table tbody td:last-child{grid-column:auto!important}
}

html body.cc-portal-v2:not(.print-report) .cc-cloud-delay-notice{
  display:flex!important;
  align-items:flex-start!important;
  gap:8px!important;
  margin:10px 14px 0!important;
  padding:10px 12px!important;
  border:1px solid color-mix(in srgb,var(--warn,#f59e0b) 46%,transparent)!important;
  border-radius:12px!important;
  background:color-mix(in srgb,var(--warn,#f59e0b) 12%,var(--panel,#0f1722))!important;
  color:var(--text,#e7eef7)!important;
  font-size:12px!important;
  line-height:1.45!important;
}
html body.cc-portal-v2:not(.print-report) .cc-cloud-delay-notice span{color:var(--muted,#9dafc2)!important}
`;
  (document.head||document.documentElement).appendChild(style);
}

function enhanceFinancialTables(root=document){
  const tables=[];
  if(root.matches?.('table.table'))tables.push(root);
  root.querySelectorAll?.('table.table').forEach(table=>tables.push(table));

  tables.forEach(table=>{
    const headers=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
    const isEstimate=headers.includes('BRUTO')&&headers.includes('DEDUCCIÓN ANTICIPO')&&headers.includes('NETO A PAGAR');
    if(!isEstimate)return;

    table.classList.add('cc-estimation-table');
    table.setAttribute('aria-label','Estimaciones y pagos periódicos');

    table.querySelectorAll('tbody tr').forEach(row=>{
      const cells=[...row.cells];
      const number=cells[0]?.textContent.trim()||'';
      row.dataset.recordTitle=number?`Estimación N.º ${number}`:'Estimación';
      cells.forEach((cell,index)=>{
        cell.dataset.label=headers[index]||'';
      });
    });

    table.querySelectorAll('.money-dual').forEach(block=>{
      if(block.dataset.ccMoneyOrdered==='1')return;
      const words=block.querySelector(':scope>small');
      if(!words)return;
      const details=document.createElement('details');
      details.className='cc-money-words';
      const summary=document.createElement('summary');
      summary.textContent='Monto en letras';
      words.replaceWith(details);
      details.append(summary,words);
      block.dataset.ccMoneyOrdered='1';
    });
  });
}

function syncCloudDelayNotice(){
  const existing=document.getElementById('ccCloudDelayNotice');
  const cloudIsLoaded=typeof cloudLoaded!=='undefined'&&cloudLoaded;
  if(cloudIsLoaded){
    existing?.remove();
    window.__CC_LOCAL_CLOUD_FALLBACK__=false;
    return;
  }
  if(!window.__CC_LOCAL_CLOUD_FALLBACK__||existing)return;

  const anchor=document.getElementById('ccCommandbar')||document.querySelector('.tabs');
  if(!anchor)return;

  const notice=document.createElement('div');
  notice.id='ccCloudDelayNotice';
  notice.className='cc-cloud-delay-notice';
  notice.setAttribute('role','status');
  notice.innerHTML='<strong>Trabajando con la copia local.</strong><span>Supabase está tardando en responder; los datos se sincronizarán al recuperar la conexión.</span>';
  anchor.insertAdjacentElement('afterend',notice);
}

function recoverSlowCloudStart(){
  const heading=document.querySelector('#app .auth-card h1');
  const message=heading?.parentElement?.querySelector('.muted')?.textContent||'';
  const isTimeout=heading?.textContent?.trim()==='No se pudo abrir la nube'&&/agotó el tiempo|tiempo total de arranque/i.test(message);
  if(!isTimeout)return syncCloudDelayNotice();

  const localDb=typeof db==='undefined'?null:db;
  const activeSession=typeof session==='undefined'?null:session;
  const hasLocalData=localDb&&typeof localDb==='object'&&Object.keys(localDb).length>0;
  if(!activeSession?.accessToken||!hasLocalData||typeof renderApp!=='function')return;

  try{
    window.__CC_LOCAL_CLOUD_FALLBACK__=true;
    cloudLoaded=false;
    renderApp();
    syncCloudDelayNotice();
  }catch(error){
    console.warn('No se pudo activar la copia local durante el arranque.',error?.message||error);
  }
}

let enhanceQueued=false;
function queueEnhancement(root=document){
  if(enhanceQueued)return;
  enhanceQueued=true;
  requestAnimationFrame(()=>{
    enhanceQueued=false;
    enhanceFinancialTables(root?.isConnected===false?document:root);
  });
}

function observeInterface(){
  const target=document.getElementById('app')||document.body;
  const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
  if(!target||!NativeObserver||window.__CC_ORDERED_INTERFACE_OBSERVER__)return;
  const observer=new NativeObserver(mutations=>{
    const relevant=mutations.some(m=>[...m.addedNodes].some(node=>node.nodeType===1));
    if(relevant){
      queueEnhancement(document);
      recoverSlowCloudStart();
    }
  });
  observer.observe(target,{childList:true,subtree:true});
  window.__CC_ORDERED_INTERFACE_OBSERVER__=observer;
}

function registerOffline(){
  if(!('serviceWorker' in navigator)||location.protocol!=='https:')return;
  const scope=new URL('.',location.href).pathname;
  navigator.serviceWorker.register(`${scope}service-worker-v1.js?v=20260903-sw2`,{scope,updateViaCache:'none'})
    .catch(error=>console.warn('Caché sin conexión no disponible.',error?.message||error));
}

/* Este archivo no carga módulos funcionales. Solo coordina rendimiento y presentación. */
function bootPerformance(){
  installContainment();
  installOrderedInterface();
  enhanceFinancialTables(document);
  recoverSlowCloudStart();
  observeInterface();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bootPerformance,{once:true});
  window.addEventListener('load',registerOffline,{once:true});
}else{
  bootPerformance();
  registerOffline();
}
})();
