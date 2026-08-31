/* Descarga manual fiable de documentos contractuales V2 */
(()=>{
'use strict';
if(window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V2__)return;
window.__CC_CONTRACT_DOWNLOAD_ACTIONS_V2__=true;

const notice=m=>typeof window.toast==='function'?window.toast(m):alert(m);
const clean=v=>String(v||'documento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,80)||'documento';

function loadContractArchive(){
  if(window.__CC_CONTRACT_FILE_REPOSITORY_V1__||document.getElementById('ccContractFileRepositoryScript'))return;
  const s=document.createElement('script');
  s.id='ccContractFileRepositoryScript';
  s.src='contract-file-repository-v1.js?v=20260831-archive1';
  s.async=false;
  s.onerror=()=>console.warn('No se pudo cargar el archivo documental del contrato.');
  document.head.appendChild(s);
}

function resolveContext(){
  let p=null,c=null;
  try{if(typeof getProject==='function')p=getProject()}catch{}
  try{if(p&&typeof getContract==='function')c=getContract(p)}catch{}
  if(p&&c)return {p,c};
  let d=null,v=null;
  try{d=db}catch{d=window.db||window.DB||null}
  try{v=view}catch{v=window.view||null}
  d=d||window.db||window.DB||{};v=v||window.view||{};
  const projects=Array.isArray(d.projects)?d.projects:[],contracts=Array.isArray(d.contracts)?d.contracts:[];
  const projectId=v.projectId||window.currentProjectId||window.selectedProjectId||window.activeProjectId;
  p=p||projects.find(x=>String(x.id)===String(projectId));
  c=c||(p?contracts.filter(x=>String(x.projectId)===String(p.id)&&!x.voidedAt&&!x.voided_at).slice(-1)[0]:null);
  return {p,c};
}

function fileName(kind,p){
  const code=clean(p?.code||'proyecto');
  if(kind==='contract')return `Contrato-${code}.docx`;
  if(kind==='note')return `Nota-remision-anticipo-${code}.docx`;
  return `Orden-inicio-${code}.docx`;
}

async function captureGeneratedToFile(kind,button){
  const api=window.ccContractPaymentDocuments;
  if(!api||typeof api.generate!=='function')return notice('El generador contractual todavía no está disponible. Actualiza la página e inténtalo de nuevo.');
  const {p,c}=resolveContext();
  if(!p||!c)return notice('No se pudo identificar el proyecto y contrato activos. Vuelve a abrir el proyecto.');
  if(typeof window.showSaveFilePicker!=='function')return notice('Tu navegador no permite elegir dónde guardar el archivo. Usa Microsoft Edge o Chrome actualizado.');

  const name=fileName(kind,p);
  let handle;
  try{
    handle=await window.showSaveFilePicker({
      suggestedName:name,
      types:[{description:'Documento de Microsoft Word',accept:{'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx']}}]
    });
  }catch(err){
    if(err?.name==='AbortError')return;
    console.error('Selector de archivo contractual',err);
    return notice(`No se pudo abrir la ventana para guardar: ${err?.message||err}`);
  }

  const oldText=button?.innerHTML;
  if(button){button.disabled=true;button.innerHTML='Preparando…'}
  const originalClick=HTMLAnchorElement.prototype.click;
  let writePromise=null,captured=false;

  HTMLAnchorElement.prototype.click=function(){
    const href=String(this.href||'');
    if(!captured&&href.startsWith('blob:')){
      captured=true;
      writePromise=(async()=>{
        const response=await fetch(href);
        if(!response.ok)throw new Error('No se pudo leer el documento generado.');
        const blob=await response.blob();
        const writable=await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      })();
      return;
    }
    return originalClick.call(this);
  };

  try{
    const apiKind=kind==='contract'?'contract':kind==='note'?'advanceRemittance':'startOrder';
    await api.generate(p,c,apiKind);
    if(writePromise)await writePromise;
    if(!captured)throw new Error('El generador no entregó el archivo para guardar.');
    if(button)button.innerHTML='✓ Guardado';
    notice(`Documento guardado: ${name}`);
  }catch(err){
    console.error('Guardado contractual',err);
    notice(`No se pudo guardar el documento: ${err?.message||err}`);
  }finally{
    HTMLAnchorElement.prototype.click=originalClick;
    setTimeout(()=>{if(button){button.disabled=false;button.innerHTML=oldText}},1600);
  }
}

function openGuarantees(){
  loadContractArchive();
  if(window.ccContractFileRepository?.focusGuarantees){window.ccContractFileRepository.focusGuarantees();return}
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(window.ccContractFileRepository?.focusGuarantees){clearInterval(timer);window.ccContractFileRepository.focusGuarantees();return}
    if(tries>=12){clearInterval(timer);notice('El archivo de garantías todavía se está cargando. Inténtalo nuevamente.');}
  },100);
}

function addCss(){
  if(document.getElementById('ccContractDownloadActionsV2Css'))return;
  const s=document.createElement('style');s.id='ccContractDownloadActionsV2Css';s.textContent=`
  .cc-payment-docs-head h3{color:#163247!important;font-weight:850!important}.cc-payment-docs-head p{color:#4c6478!important}.cc-payment-docs-kicker{color:#0b6f89!important}.cc-payment-doc b{color:#18384a!important}.cc-payment-doc small{color:#60798f!important}
  .cc-doc-downloads{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}.cc-doc-download{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #cbd8e3;border-radius:12px;background:#fff}.cc-doc-download span{font-size:.82rem;color:#496172}.cc-doc-download b{display:block;color:#18384a;margin-bottom:2px}.cc-doc-download button{white-space:nowrap}
  .cc-guarantee-shortcut{display:inline-flex!important;align-items:center;gap:7px}.cc-guarantee-shortcut svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
  @media(max-width:720px){.cc-doc-downloads{grid-template-columns:1fr}.cc-doc-download{align-items:flex-start;flex-direction:column}.cc-doc-download button{width:100%}}`;
  document.head.appendChild(s);
}

function decorate(card){
  if(!card)return;addCss();card.dataset.ccDownloadVersion='2-save-picker';
  card.querySelectorAll('.cc-payment-doc small').forEach(x=>x.textContent='Listo para guardar');
  const actions=card.querySelector('.cc-payment-doc-actions');
  if(actions&&!actions.querySelector('[data-cc-open-guarantees]')){
    const b=document.createElement('button');
    b.type='button';b.className='btn cc-guarantee-shortcut';b.setAttribute('data-cc-open-guarantees','');b.title='Cargar y archivar garantías del contrato';
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.8 8.6 7 10 4.2-1.4 7-5.4 7-10V6l-7-3Z"></path><path d="M12 15V8"></path><path d="m9.5 10.5 2.5-2.5 2.5 2.5"></path></svg><span>Cargar garantías</span>';
    actions.appendChild(b);
  }
  let box=card.querySelector('[data-cc-manual-downloads]');
  if(!box){
    box=document.createElement('div');box.className='cc-doc-downloads';box.setAttribute('data-cc-manual-downloads','');
    actions?actions.insertAdjacentElement('afterend',box):card.appendChild(box);
  }
  box.innerHTML=`
    <div class="cc-doc-download"><span><b>Contrato de obra</b>Elegir dónde guardar el Word</span><button class="btn" type="button" data-cc-save-doc="contract">Guardar Word</button></div>
    <div class="cc-doc-download"><span><b>Nota de remisión</b>Elegir dónde guardar el Word</span><button class="btn" type="button" data-cc-save-doc="note">Guardar Word</button></div>
    <div class="cc-doc-download"><span><b>Orden de inicio</b>Elegir dónde guardar el Word</span><button class="btn" type="button" data-cc-save-doc="start">Guardar Word</button></div>`;
}

function scan(){document.querySelectorAll('[data-cc-payment-docs]').forEach(decorate)}
document.addEventListener('click',e=>{
  const g=e.target.closest?.('[data-cc-open-guarantees]');
  if(g){e.preventDefault();e.stopImmediatePropagation();openGuarantees();return}
  const b=e.target.closest?.('[data-cc-save-doc]');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  captureGeneratedToFile(b.dataset.ccSaveDoc,b);
},true);
loadContractArchive();scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});setTimeout(loadContractArchive,900);
})();