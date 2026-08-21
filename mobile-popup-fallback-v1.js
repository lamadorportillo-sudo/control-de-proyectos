/* ===== FALLBACK MÓVIL PARA INFORMES / CONSTANCIAS V1 ===== */
(()=>{
'use strict';
if(window.__CC_MOBILE_POPUP_FALLBACK_V1__)return;
window.__CC_MOBILE_POPUP_FALLBACK_V1__=true;

const nativeOpen=typeof window.open==='function'?window.open.bind(window):null;
let activeOverlay=null;

function css(){
  if(document.getElementById('cc-mobile-popup-fallback-style'))return;
  const s=document.createElement('style');
  s.id='cc-mobile-popup-fallback-style';
  s.textContent=`
  .cc-doc-overlay{position:fixed;inset:0;z-index:9999;background:rgba(15,23,18,.78);backdrop-filter:blur(5px);padding:10px;display:flex;flex-direction:column}
  .cc-doc-shell{width:min(1180px,100%);height:100%;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 28px 90px rgba(0,0,0,.38);display:flex;flex-direction:column}
  .cc-doc-toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #dfe6dc;background:#f8faf7;color:#26372b}
  .cc-doc-toolbar strong{font-size:12px}.cc-doc-toolbar-actions{display:flex;gap:7px}
  .cc-doc-toolbar button{border:1px solid #cfd9cc;background:#fff;color:#33423a;border-radius:9px;padding:8px 11px;font-weight:800;cursor:pointer}
  .cc-doc-toolbar button.primary{background:#587747;color:#fff;border-color:#587747}
  .cc-doc-frame{width:100%;height:100%;border:0;background:#fff;flex:1}
  @media(max-width:680px){.cc-doc-overlay{padding:0}.cc-doc-shell{border-radius:0}.cc-doc-toolbar{padding:8px}.cc-doc-toolbar strong{max-width:46vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cc-doc-toolbar button{padding:8px 9px;font-size:11px}}
  `;
  document.head.appendChild(s);
}

function closeOverlay(){
  if(activeOverlay){activeOverlay.remove();activeOverlay=null}
}

function fallbackWindow(){
  css();
  closeOverlay();
  const overlay=document.createElement('div');
  overlay.className='cc-doc-overlay';
  overlay.innerHTML=`<section class="cc-doc-shell"><div class="cc-doc-toolbar"><strong>Vista del documento</strong><div class="cc-doc-toolbar-actions"><button type="button" class="primary" data-cc-doc-print>Imprimir / PDF</button><button type="button" data-cc-doc-close>Cerrar</button></div></div><iframe class="cc-doc-frame" title="Vista del documento"></iframe></section>`;
  document.body.appendChild(overlay);
  activeOverlay=overlay;
  const frame=overlay.querySelector('.cc-doc-frame');
  const win=frame.contentWindow;
  overlay.querySelector('[data-cc-doc-close]').onclick=closeOverlay;
  overlay.querySelector('[data-cc-doc-print]').onclick=()=>{try{win.focus();win.print()}catch{}};
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeOverlay()});
  document.addEventListener('keydown',function escClose(e){if(e.key==='Escape'&&activeOverlay===overlay){closeOverlay();document.removeEventListener('keydown',escClose)}},{passive:true});
  return win;
}

window.open=function(url='',target='_blank',features=''){
  let w=null;
  try{if(nativeOpen)w=nativeOpen(url,target,features)}catch{}
  if(w)return w;
  const blank=!url||url==='about:blank';
  if(blank)return fallbackWindow();
  try{location.href=url}catch{}
  return null;
};

window.__ccOpenInAppDocument=function(html,title='Vista del documento'){
  const w=fallbackWindow();
  try{
    w.document.open();
    w.document.write(String(html||''));
    w.document.close();
    const label=activeOverlay?.querySelector('.cc-doc-toolbar strong');
    if(label)label.textContent=title;
  }catch{}
  return w;
};
})();