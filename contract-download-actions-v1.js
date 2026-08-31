/* Descarga manual de documentos contractuales */
(()=>{
'use strict';
if(window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V1__)return;
window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V1__=true;

function addCss(){
  if(document.getElementById('ccContractDownloadActionsCss'))return;
  const s=document.createElement('style');
  s.id='ccContractDownloadActionsCss';
  s.textContent=`
    .cc-doc-downloads{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}
    .cc-doc-download{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #cbd8e3;border-radius:12px;background:#fff}
    .cc-doc-download span{font-size:.82rem;color:#496172}.cc-doc-download b{display:block;color:#18384a;margin-bottom:2px}
    .cc-doc-download button{white-space:nowrap}
    @media(max-width:720px){.cc-doc-downloads{grid-template-columns:1fr}.cc-doc-download{align-items:flex-start;flex-direction:column}.cc-doc-download button{width:100%}}
  `;
  document.head.appendChild(s);
}

function currentProjectContract(){
  try{
    const p=typeof window.getProject==='function'?window.getProject():null;
    const c=p&&typeof window.getContract==='function'?window.getContract(p):null;
    return {p,c};
  }catch{return {p:null,c:null}}
}

function resolveContext(){
  const ctx=currentProjectContract();
  if(ctx.p&&ctx.c)return ctx;
  try{
    const id=window.currentProjectId||window.selectedProjectId||window.activeProjectId;
    const projects=window.DB?.projects||window.db?.projects||[];
    const p=projects.find(x=>String(x.id)===String(id));
    const contracts=window.DB?.contracts||window.db?.contracts||[];
    const c=p?contracts.find(x=>String(x.projectId)===String(p.id)):null;
    return {p,c};
  }catch{return {p:null,c:null}}
}

function callGenerate(kind){
  const api=window.ccContractPaymentDocuments;
  if(!api||typeof api.generate!=='function')return window.toast?.('El generador de documentos aún no está disponible.')||alert('El generador de documentos aún no está disponible.');
  const {p,c}=resolveContext();
  if(!p||!c)return window.toast?.('No se pudo identificar el contrato activo.')||alert('No se pudo identificar el contrato activo.');
  api.generate(p,c,kind);
}

function decorate(card){
  if(!card||card.querySelector('[data-cc-manual-downloads]'))return;
  addCss();
  const box=document.createElement('div');
  box.className='cc-doc-downloads';
  box.setAttribute('data-cc-manual-downloads','');
  box.innerHTML=`
    <div class="cc-doc-download"><span><b>Contrato de obra</b>Descargar una copia Word</span><button class="btn" type="button" data-download-contract>Descargar</button></div>
    <div class="cc-doc-download"><span><b>Nota de remisión</b>Descargar una copia Word</span><button class="btn" type="button" data-download-note>Descargar</button></div>
    <div class="cc-doc-download"><span><b>Orden de inicio</b>Descargar una copia Word</span><button class="btn" type="button" data-download-start>Descargar</button></div>`;
  const actions=card.querySelector('.cc-payment-doc-actions');
  actions?actions.insertAdjacentElement('afterend',box):card.appendChild(box);
  box.querySelector('[data-download-contract]')?.addEventListener('click',()=>callGenerate('contract'));
  box.querySelector('[data-download-note]')?.addEventListener('click',()=>callGenerate('advanceRemittance'));
  box.querySelector('[data-download-start]')?.addEventListener('click',()=>callGenerate('startOrder'));
}

function scan(){document.querySelectorAll('[data-cc-payment-docs]').forEach(decorate)}
scan();
new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
