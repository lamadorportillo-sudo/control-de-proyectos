/* ===== VISIBILIDAD GLOBAL Y CONTRASTE V1 ===== */
(()=>{
'use strict';
if(window.__CC_VISIBILITY_AUDIT_V1__)return;
window.__CC_VISIBILITY_AUDIT_V1__=true;

function injectCss(){
  if(document.getElementById('cc-visibility-audit-style'))return;
  const s=document.createElement('style');
  s.id='cc-visibility-audit-style';
  s.textContent=`
    /* Cabecera: alto contraste sobre el tema claro */
    body:not(.print-report) .topbar{
      background:#fbfcfa!important;
      color:#1f2c23!important;
      border:1px solid #d9e2d6!important;
      box-shadow:0 10px 30px rgba(35,55,39,.08)!important;
    }
    body:not(.print-report) .topbar .brand h1{color:#1e2c22!important;opacity:1!important;visibility:visible!important}
    body:not(.print-report) .topbar .brand .eyebrow{color:#5f7d4a!important;opacity:1!important;visibility:visible!important;font-weight:850!important}
    body:not(.print-report) .topbar .brand>div:last-child{min-width:210px!important}
    body:not(.print-report) .topbar .cloud-pill{
      display:flex!important;align-items:center!important;gap:9px!important;
      min-width:142px!important;min-height:46px!important;padding:8px 12px!important;
      border:1px solid #bfd9c4!important;border-radius:14px!important;
      background:#eff8f0!important;color:#244b30!important;
      box-shadow:none!important;visibility:visible!important;opacity:1!important;
    }
    body:not(.print-report) .topbar .cloud-pill small{color:#477253!important;font-size:9px!important;font-weight:800!important;opacity:1!important}
    body:not(.print-report) .topbar .cloud-pill b{color:#244b30!important;font-size:11px!important;font-weight:850!important;opacity:1!important}
    body:not(.print-report) .topbar .sync-dot{background:#38c878!important;box-shadow:0 0 0 5px #ddf6e7!important}
    body:not(.print-report) .topbar .top-actions>.btn,
    body:not(.print-report) .topbar #learnBtn{
      background:#f6f8f5!important;color:#26342a!important;border:1px solid #cfd9cc!important;
      box-shadow:none!important;opacity:1!important;visibility:visible!important;min-height:46px!important;
    }
    body:not(.print-report) .topbar .top-actions>.btn:hover,
    body:not(.print-report) .topbar #learnBtn:hover{background:#eef4eb!important;border-color:#8ca37e!important}
    body:not(.print-report) .topbar .top-actions>.btn.primary{background:#587747!important;color:#fff!important;border-color:#587747!important}
    body:not(.print-report) .topbar .userbox{
      background:#5e646b!important;color:#fff!important;border:1px solid #555b62!important;
      box-shadow:none!important;opacity:1!important;visibility:visible!important;
    }
    body:not(.print-report) .topbar .userbox b{color:#fff!important;opacity:1!important}
    body:not(.print-report) .topbar .userbox small{color:#e2e5e8!important;opacity:1!important}
    body:not(.print-report) .topbar .userbox .avatar{background:#7b8187!important;color:#fff!important;border:1px solid #999fa5!important}
    body:not(.print-report) .topbar .userbox .btn{background:#6b7178!important;color:#fff!important;border-color:#8a9096!important}

    /* Elementos comunes que deben permanecer legibles en el tema claro */
    body:not(.print-report) .panel-head h2,
    body:not(.print-report) .panel-head h3,
    body:not(.print-report) .card h3,
    body:not(.print-report) .info strong,
    body:not(.print-report) .kpi strong,
    body:not(.print-report) .project-metric b{color:#1f2d23!important}
    body:not(.print-report) .panel-head .muted,
    body:not(.print-report) .info small,
    body:not(.print-report) .kpi small,
    body:not(.print-report) .project-metric small,
    body:not(.print-report) .project-meta,
    body:not(.print-report) .notice{color:#657168!important;opacity:1!important}
    body:not(.print-report) label.field>span{color:#39493e!important;opacity:1!important}
    body:not(.print-report) .table th{color:#46564b!important;opacity:1!important}
    body:not(.print-report) .table td{color:#27342b!important;opacity:1!important}
    body:not(.print-report) nav.tabs button:not(.active){color:#48564d!important;background:#fff!important;border-color:#d7e0d4!important}

    /* Corrección automática cuando un módulo vuelve a colocar texto casi invisible */
    body:not(.print-report) [data-cc-contrast='dark']{color:#172019!important;opacity:1!important;visibility:visible!important}
    body:not(.print-report) [data-cc-contrast='light']{color:#fff!important;opacity:1!important;visibility:visible!important}
    body:not(.print-report) button[data-cc-contrast='dark']{background:#f6f8f5!important;border-color:#cfd9cc!important}
    body:not(.print-report) button[data-cc-contrast='light']{background:#55606b!important;border-color:#707a84!important}

    @media(max-width:1050px){
      body:not(.print-report) .topbar{align-items:flex-start!important}
      body:not(.print-report) .top-actions{width:100%!important;justify-content:flex-start!important}
      body:not(.print-report) .topbar .brand{min-width:250px!important}
    }
    @media(max-width:720px){
      body:not(.print-report) .topbar .brand{width:100%!important;min-width:0!important}
      body:not(.print-report) .topbar .brand>div:last-child{min-width:0!important}
      body:not(.print-report) .topbar .cloud-pill{display:flex!important;flex:1 1 150px!important}
      body:not(.print-report) .topbar .top-actions>.btn{flex:1 1 150px!important}
      body:not(.print-report) .topbar .userbox{width:100%!important;flex-wrap:wrap!important}
    }
  `;
  document.head.appendChild(s);
}

function rgb(value){
  const m=String(value||'').match(/rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?\)/i);
  return m?{r:+m[1],g:+m[2],b:+m[3],a:m[4]===undefined?1:+m[4]}:null;
}
function lum(c){
  const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};
  return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);
}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function background(el){
  let n=el;
  while(n&&n!==document.documentElement){
    const c=rgb(getComputedStyle(n).backgroundColor);
    if(c&&c.a>.75)return c;
    n=n.parentElement;
  }
  return rgb(getComputedStyle(document.body).backgroundColor)||{r:244,g:246,b:243,a:1};
}
function auditContrast(){
  const selectors='button,.btn,.eyebrow,.muted,.pill,.status,.info small,.info strong,.kpi small,.kpi strong,.project-metric small,.project-metric b,.project-meta,label.field>span,.table th,.table td,.panel-head h2,.panel-head h3';
  document.querySelectorAll(selectors).forEach(el=>{
    if(el.closest('.report-paper')||el.closest('.hero-control-contractual'))return;
    const fg=rgb(getComputedStyle(el).color),bg=background(el);
    if(!fg||!bg)return;
    if(ratio(fg,bg)<2.7){el.dataset.ccContrast=lum(bg)>.48?'dark':'light'}
    else delete el.dataset.ccContrast;
  });
}
function clarifyHeader(){
  const top=document.querySelector('.topbar');
  if(!top)return;
  const cloud=top.querySelector('.cloud-pill');
  if(cloud){
    const sm=cloud.querySelector('small');if(sm&&!sm.textContent.trim())sm.textContent='NUBE';
    cloud.title='Estado de sincronización con Supabase';
    cloud.setAttribute('aria-label','Estado de sincronización con Supabase');
  }
  const learn=document.getElementById('learnBtn');
  if(learn){
    learn.textContent='🧠 IA / Aprendizaje';
    learn.title='Abrir aprendizaje adaptativo';
    learn.setAttribute('aria-label','Abrir aprendizaje adaptativo');
  }
  const backup=document.getElementById('backupBtn');
  if(backup){backup.title='Descargar respaldo del expediente';backup.setAttribute('aria-label','Descargar respaldo del expediente')}
  const np=document.getElementById('newProjectBtn');
  if(np){np.title='Crear un nuevo proyecto';np.setAttribute('aria-label','Crear un nuevo proyecto')}
  top.querySelectorAll('button').forEach(b=>{
    if(!b.textContent.trim()&&!b.getAttribute('aria-label')){b.setAttribute('aria-label','Acción');b.title='Acción'}
  });
}
function fixLegacyLabels(){
  document.querySelectorAll('.progress-label span').forEach(s=>{
    if(/avance físico\s*=\s*financiero/i.test(s.textContent||''))s.textContent='Avance financiero certificado / estimado acumulado';
  });
}
function run(){clarifyHeader();fixLegacyLabels();auditContrast()}

injectCss();
let queued=false;
new MutationObserver(()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;run()});
}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
window.addEventListener('resize',()=>{clearTimeout(window.__ccContrastTimer);window.__ccContrastTimer=setTimeout(run,120)});
setTimeout(run,0);setTimeout(run,350);setTimeout(run,1200);
window.ccRunVisibilityAudit=run;
})();