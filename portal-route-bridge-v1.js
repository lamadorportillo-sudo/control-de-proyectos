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
  const operational=['contratos','pagos','garantias','visitas','reportes','alertas','auditoria'];
  if(operational.includes(route)){
    event.preventDefault();event.stopImmediatePropagation();
    if(window.__ccSingleNav?.openOperationalCenter){
      window.__ccSingleNav.openOperationalCenter(route);
      setTimeout(sync,20);
      return;
    }
    const map={
      contratos:window.__ccContractsCenter,pagos:window.__ccPaymentsCenter,garantias:window.__ccGuaranteesCenter,
      visitas:window.__ccVisitsCenter,reportes:window.__ccReportsCenter,alertas:window.__ccAlertsCenter,auditoria:window.__ccAuditCenter
    };
    closeCenters(route);map[route]?.open?.();setTimeout(sync,20);return;
  }
  closeCenters();
},true);
window.addEventListener('cc:route-changed',()=>setTimeout(sync,0));
if(NativeObserver)new NativeObserver(()=>sync()).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
setTimeout(sync,0);setTimeout(sync,500);
})();
