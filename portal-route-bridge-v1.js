/* CONTROL CONTRACTUAL · PUENTE DE RUTAS DEL PORTAL V1 */
(()=>{
'use strict';
if(window.__CC_PORTAL_ROUTE_BRIDGE_V1__)return;window.__CC_PORTAL_ROUTE_BRIDGE_V1__=true;
const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let syncing=false;
function activeRoute(){if(document.body.classList.contains('cc-contracts-center-active'))return'contratos';if(document.body.classList.contains('cc-payments-center-active'))return'pagos';if(document.body.classList.contains('cc-guarantees-center-active'))return'garantias';if(document.body.classList.contains('cc-visits-center-active'))return'visitas';if(document.body.classList.contains('cc-reports-center-active'))return'reportes';if(document.body.classList.contains('cc-alerts-center-active'))return'alertas';if(document.body.classList.contains('cc-audit-center-active'))return'auditoria';return''}
function sync(){
  if(syncing)return;syncing=true;
  try{
    const side=Q('#ccSidebar');if(!side)return;
    const route=activeRoute();if(route)QA('.cc-side-btn',side).forEach(b=>b.classList.toggle('active',b.dataset.route===route));
  }finally{syncing=false}
}
function closeCenters(except=''){
  if(except!=='contratos')window.__ccContractsCenter?.close?.();
  if(except!=='pagos')window.__ccPaymentsCenter?.close?.();
  if(except!=='garantias')window.__ccGuaranteesCenter?.close?.();
  if(except!=='visitas')window.__ccVisitsCenter?.close?.();
  if(except!=='reportes')window.__ccReportsCenter?.close?.();
  if(except!=='alertas')window.__ccAlertsCenter?.close?.();
  if(except!=='auditoria')window.__ccAuditCenter?.close?.();
}
document.addEventListener('click',event=>{
  const button=event.target.closest?.('#ccSidebar .cc-side-btn[data-route]');if(!button)return;
  const route=button.dataset.route;
  if(route==='contratos'&&window.__ccContractsCenter?.open){event.preventDefault();event.stopImmediatePropagation();closeCenters('contratos');window.__ccContractsCenter.open();setTimeout(sync,20);return}
  if(route==='pagos'&&window.__ccPaymentsCenter?.open){event.preventDefault();event.stopImmediatePropagation();closeCenters('pagos');window.__ccPaymentsCenter.open();setTimeout(sync,20);return}
  if(route==='garantias'&&window.__ccGuaranteesCenter?.open){event.preventDefault();event.stopImmediatePropagation();closeCenters('garantias');window.__ccGuaranteesCenter.open();setTimeout(sync,20);return}
  if(route==='visitas'&&window.__ccVisitsCenter?.open){event.preventDefault();event.stopImmediatePropagation();closeCenters('visitas');window.__ccVisitsCenter.open();setTimeout(sync,20);return}
  if(route==='reportes'&&window.__ccReportsCenter?.open){event.preventDefault();event.stopImmediatePropagation();closeCenters('reportes');window.__ccReportsCenter.open();setTimeout(sync,20);return}
  if(route==='alertas'&&window.__ccAlertsCenter?.open){event.preventDefault();event.stopImmediatePropagation();closeCenters('alertas');window.__ccAlertsCenter.open();setTimeout(sync,20);return}
  if(route==='auditoria'&&window.__ccAuditCenter?.open){event.preventDefault();event.stopImmediatePropagation();closeCenters('auditoria');window.__ccAuditCenter.open();setTimeout(sync,20);return}
  closeCenters();
},true);
window.addEventListener('cc:route-changed',()=>setTimeout(sync,0));
if(NativeObserver)new NativeObserver(()=>sync()).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
setTimeout(sync,0);setTimeout(sync,500);
})();
