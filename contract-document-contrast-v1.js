/* ===== CONTROL CONTRACTUAL · CONTRASTE DOCUMENTAL V2 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_DOCUMENT_CONTRAST_V2__)return;
window.__CC_CONTRACT_DOCUMENT_CONTRAST_V2__=true;
window.__CC_CONTRACT_DOCUMENT_CONTRAST_V1__=true;

const STYLE_ID='cc-contract-document-contrast-v1-style';
function install(){
  let s=document.getElementById(STYLE_ID);
  if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
  s.textContent=`
  /* El expediente documental es una superficie clara. Reglas históricas del
     portal oscuro no deben recolorear títulos, estados ni textos secundarios. */
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive{
    background-color:#f8fbfd!important;color:#173247!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-head h3,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive h3.cc2-title{
    background-color:#f8fbfd!important;color:#173247!important;opacity:1!important;text-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-head small{
    background-color:#f8fbfd!important;color:#0b5f75!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-card small,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-top small,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-latest small{
    background-color:#fff!important;color:#536b7e!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-state{
    background-color:#f1f3f5!important;color:#4d5a66!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-empty{
    background-color:#f4f8fb!important;color:#4f6578!important;opacity:1!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-empty small{
    background-color:#f4f8fb!important;color:#4f6578!important;opacity:1!important;
  }
  /* Bloque de generación de contrato/anticipo/orden de inicio: superficie
     clara independiente del repositorio cc2. */
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs .cc-payment-doc{
    background-color:#fff!important;color:#173247!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs .cc-payment-doc small{
    background-color:#fff!important;color:#536b7e!important;opacity:1!important;
  }
  /* Cabecera de cada pago. data-cc-readable="dark" confirma que el contenido
     se dibuja sobre la tarjeta clara del expediente. */
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-payment-head small[data-cc-readable="dark"]{
    color:#425d73!important;opacity:1!important;text-shadow:none!important;
  }
  `;
}
install();
setTimeout(install,250);
setTimeout(install,900);
window.ccInstallContractDocumentContrast=install;
})();
