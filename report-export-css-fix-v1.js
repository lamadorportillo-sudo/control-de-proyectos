/* ===== CONSERVAR ESTILOS PROFESIONALES AL EXPORTAR INFORMES V1 ===== */
(()=>{
'use strict';
if(window.__CC_REPORT_EXPORT_CSS_FIX_V1__)return;
window.__CC_REPORT_EXPORT_CSS_FIX_V1__=true;
function install(){
  if(typeof reportStandaloneCss!=='function')return false;
  const fn=()=>[...document.querySelectorAll('style')].map(s=>s.textContent||'').join('\n');
  try{reportStandaloneCss=fn}catch{}
  try{window.reportStandaloneCss=fn}catch{}
  return true;
}
if(!install()){let n=0,t=setInterval(()=>{n++;if(install()||n>40)clearInterval(t)},150)}
})();