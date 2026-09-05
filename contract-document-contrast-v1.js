/* ===== CONTROL CONTRACTUAL · CONTRASTE DOCUMENTAL V3 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_DOCUMENT_CONTRAST_V3__)return;
window.__CC_CONTRACT_DOCUMENT_CONTRAST_V3__=true;
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

  /* Bloque de generación de contrato/anticipo/orden de inicio. La tarjeta usa
     un degradado, pero declara también una base sólida para conservar contraste
     verificable aun cuando otras capas no puedan resolver background-image. */
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs{
    background-color:#f8fbfd!important;color:#173247!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs .cc-payment-docs-head,
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs .cc-payment-docs-head h3{
    color:#173247!important;opacity:1!important;text-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs .cc-payment-docs-kicker{
    color:#075167!important;opacity:1!important;text-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs .cc-payment-docs-head p{
    color:#354f63!important;opacity:1!important;text-shadow:none!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs .cc-payment-doc{
    background-color:#fff!important;color:#173247!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc-payment-docs .cc-payment-doc small{
    background-color:#fff!important;color:#536b7e!important;opacity:1!important;
  }

  /* Cada pago vive en una tarjeta clara propia. El encabezado no porta un
     atributo de contraste en el DOM real, por lo que la regla debe apoyarse en
     la clase estructural estable y no en una marca que nunca se renderiza. */
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-payment-head{
    background-color:#fff!important;color:#173247!important;
  }
  html body.cc-portal-v2:not(.print-report) #content #tabBody .cc2-archive .cc2-payment-head small{
    background-color:#fff!important;color:#425d73!important;opacity:1!important;text-shadow:none!important;
  }
  `;
}
install();
setTimeout(install,250);
setTimeout(install,900);
window.ccInstallContractDocumentContrast=install;
})();
