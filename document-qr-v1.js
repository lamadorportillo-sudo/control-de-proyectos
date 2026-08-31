/* ===== QR DIGITAL PARA INFORMES V1 ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__CC_DOCUMENT_QR_V1__)return;
window.__CC_DOCUMENT_QR_V1__=true;
let ctx=null,publishing=false;
const cache=new Map();
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function injectCss(){if(document.getElementById('cc-document-qr-style'))return;const s=document.createElement('style');s.id='cc-document-qr-style';s.textContent=`
.cc-document-qr{margin:24px 0 0;padding:14px;border:1px solid #d7e1eb;border-radius:12px;display:flex;gap:14px;align-items:center;break-inside:avoid;background:#fff;color:#172033}.cc-document-qr img{width:112px;height:112px;object-fit:contain;flex:0 0 auto}.cc-document-qr .qr-kicker{font-size:10px;font-weight:800;letter-spacing:.08em;color:#48647c}.cc-document-qr .qr-title{font-size:14px;font-weight:800;margin:4px 0}.cc-document-qr .qr-meta{font-size:9px;color:#65798d;overflow-wrap:anywhere}.cc-document-qr .qr-link{display:inline-block;margin-top:5px;font-size:9px;color:#245d94;text-decoration:none}.cc-qr-note{font-size:11px;color:#8fa8c4;align-self:center}@media(max-width:620px){.cc-document-qr{align-items:flex-start}.cc-document-qr img{width:96px;height:96px}}@media print{.cc-document-qr{page-break-inside:avoid!important;break-inside:avoid!important}.cc-document-qr .qr-link{color:#172033!important;text-decoration:none!important}}
`;document.head.appendChild(s)}
function currentTitle(){return document.querySelector('.report-type-card.active b')?.textContent?.trim()||document.querySelector('#reportType option:checked')?.textContent?.trim()||'Informe del proyecto'}
function reportType(){try{return String(document.getElementById('reportType')?.value||ctx?.type||window.view?.reportType||'final')}catch{return'final'}}
function reportPaper(){return document.querySelector('#reportPreview .report-paper,.report-paper')}
function cleanClone(){const p=reportPaper();if(!p)return null;const c=p.cloneNode(true);c.querySelectorAll('.cc-document-qr').forEach(x=>x.remove());return c}
function standaloneHtml(){const clone=cleanClone();if(!clone)throw new Error('No hay vista previa del informe.');let css='';try{css=typeof window.reportStandaloneCss==='function'?window.reportStandaloneCss():''}catch{}return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${E(currentTitle())}</title><style>${css}</style></head><body>${clone.outerHTML}</body></html>`}
function cacheKey(){return `${ctx?.project?.id||''}|${reportType()}|${currentTitle()}`}
function qrBlock(data){const el=document.createElement('section');el.className='cc-document-qr';el.dataset.qrReportId=data.report_id||'';el.innerHTML=`<img src="${E(data.qr_data_url)}" alt="Código QR del documento digital"><div><div class="qr-kicker">VERSIÓN DIGITAL</div><div class="qr-title">Escanee el código QR para consultar este informe en digital.</div><div class="qr-meta">ID documental: ${E(data.report_id||'')}</div><a class="qr-link" href="${E(data.public_url||'#')}" target="_blank" rel="noopener">Abrir versión digital</a></div>`;return el}
function putQr(data){const p=reportPaper();if(!p)return;p.querySelectorAll('.cc-document-qr').forEach(x=>x.remove());p.appendChild(qrBlock(data))}
async function publish(){
  if(publishing)throw new Error('Ya se está generando el QR digital.');
  const p=ctx?.project;if(!p?.id)throw new Error('No se pudo identificar el proyecto del informe.');
  if(!window.session?.accessToken)throw new Error('La sesión no está disponible para publicar el documento digital.');
  const key=cacheKey(),known=cache.get(key);if(known){putQr(known);return known}
  publishing=true;
  try{
    const html=standaloneHtml();
    const r=await fetch(`${SUPABASE_URL}/functions/v1/document-publisher`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.accessToken}`,'content-type':'application/json'},body:JSON.stringify({project_id:p.id,report_type:reportType(),title:currentTitle(),html}),cache:'no-store'});
    const data=await r.json().catch(()=>({}));if(!r.ok||!data?.ok)throw new Error(data?.error||`No se pudo publicar el documento (${r.status}).`);
    cache.set(key,data);putQr(data);return data;
  }finally{publishing=false}
}
function downloadWithQr(){const clone=reportPaper()?.cloneNode(true);if(!clone)throw new Error('No hay informe para exportar.');let css='';try{css=typeof window.reportStandaloneCss==='function'?window.reportStandaloneCss():''}catch{}const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${E(currentTitle())}</title><style>${css}</style></head><body>${clone.outerHTML}</body></html>`;const blob=new Blob([html],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);const code=String(ctx?.project?.code||'proyecto').replace(/[^a-z0-9_-]/gi,'_');a.download=`informe-${reportType()}-${code}-${new Date().toISOString().slice(0,10)}.html`;a.click();URL.revokeObjectURL(a.href);try{window.audit?.('GENERAR INFORME','Proyecto',ctx?.project?.id,{projectId:ctx?.project?.id,contractId:ctx?.contract?.id||null,reportType:reportType(),digitalQr:true});window.saveDB?.()}catch{}}
function addNote(){const tb=document.querySelector('.report-toolbar');if(!tb||tb.querySelector('.cc-qr-note'))return;const n=document.createElement('span');n.className='cc-qr-note';n.textContent='Cada documento generado incluirá QR para abrir su versión digital.';tb.appendChild(n)}
function wrapRender(){if(window.__CC_QR_RENDER_WRAPPED__||typeof window.renderReports!=='function')return;window.__CC_QR_RENDER_WRAPPED__=true;const original=window.renderReports;window.renderReports=function(p,c,...rest){ctx={project:p,contract:c,type:window.view?.reportType||'final'};const out=original.call(this,p,c,...rest);setTimeout(()=>{addNote();const paper=reportPaper();paper?.querySelectorAll('.cc-document-qr').forEach(x=>x.remove())},0);return out}}
document.addEventListener('click',async e=>{const b=e.target.closest?.('#printReport,#downloadReport');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(b.disabled)return;b.disabled=true;const old=b.textContent;b.textContent='Generando QR…';try{await publish();if(b.id==='printReport'){document.body.classList.add('print-report');setTimeout(()=>{window.print();setTimeout(()=>document.body.classList.remove('print-report'),250)},50)}else downloadWithQr();if(typeof window.toast==='function')window.toast('Documento generado con QR y versión digital disponible.')}catch(err){console.error('document-qr',err);if(typeof window.toast==='function')window.toast(`No se generó el documento: ${err?.message||err}`)}finally{b.disabled=false;b.textContent=old}},true);
new MutationObserver(()=>{injectCss();wrapRender();addNote()}).observe(document.documentElement,{childList:true,subtree:true});
injectCss();wrapRender();setTimeout(()=>{wrapRender();addNote()},500);setTimeout(()=>{wrapRender();addNote()},1400);
window.__ccDocumentQr={publish,cache};
})();
