/* ===== VISIBILIDAD GLOBAL Y CONTRASTE V4 ===== */
(()=>{
'use strict';
if(window.__CC_VISIBILITY_AUDIT_V4__)return;
window.__CC_VISIBILITY_AUDIT_V4__=true;

const STYLE_ID='cc-visibility-audit-style';

function injectCss(){
  let s=document.getElementById(STYLE_ID);
  if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}
  s.textContent=`
    /* Cabecera clara: el contraste aquí es deliberado y local, no global. */
    body:not(.print-report) .topbar{
      background:#fbfcfa!important;color:#1f2c23!important;border:1px solid #d9e2d6!important;
      box-shadow:0 10px 30px rgba(35,55,39,.08)!important;
    }
    body:not(.print-report) .topbar .brand h1{color:#1e2c22!important;opacity:1!important;visibility:visible!important}
    body:not(.print-report) .topbar .brand .eyebrow{color:#4f6f3e!important;opacity:1!important;visibility:visible!important;font-weight:850!important}
    body:not(.print-report) .topbar .brand>div:last-child{min-width:210px!important}
    body:not(.print-report) .topbar .cloud-pill{
      display:flex!important;align-items:center!important;gap:9px!important;min-width:142px!important;min-height:46px!important;
      padding:8px 12px!important;border:1px solid #bfd9c4!important;border-radius:14px!important;
      background:#eff8f0!important;color:#244b30!important;box-shadow:none!important;visibility:visible!important;opacity:1!important;
    }
    body:not(.print-report) .topbar .cloud-pill small{color:#3f684a!important;font-size:9px!important;font-weight:800!important;opacity:1!important}
    body:not(.print-report) .topbar .cloud-pill b{color:#183d24!important;font-size:11px!important;font-weight:850!important;opacity:1!important}
    body:not(.print-report) .topbar .sync-dot{background:#258954!important;box-shadow:0 0 0 5px #ddf6e7!important}
    body:not(.print-report) .topbar .top-actions>.btn,
    body:not(.print-report) .topbar #learnBtn{background:#f6f8f5!important;color:#26342a!important;border:1px solid #c4cec1!important;box-shadow:none!important;opacity:1!important;visibility:visible!important;min-height:46px!important}
    body:not(.print-report) .topbar .top-actions>.btn:hover,
    body:not(.print-report) .topbar #learnBtn:hover{background:#eef4eb!important;border-color:#79906c!important}
    body:not(.print-report) .topbar .top-actions>.btn.primary{background:#4e6e3e!important;color:#fff!important;border-color:#4e6e3e!important}
    body:not(.print-report) .topbar .userbox{background:#535960!important;color:#fff!important;border:1px solid #474d53!important;box-shadow:none!important;opacity:1!important;visibility:visible!important}
    body:not(.print-report) .topbar .userbox b{color:#fff!important;opacity:1!important}
    body:not(.print-report) .topbar .userbox small{color:#f1f3f5!important;opacity:1!important}
    body:not(.print-report) .topbar .userbox .avatar{background:#686f76!important;color:#fff!important;border:1px solid #8f969c!important}
    body:not(.print-report) .topbar .userbox .btn{background:#626970!important;color:#fff!important;border-color:#858c93!important}

    /* Sincronización: superficie estable y legible tanto autenticado como invitado. */
    body:not(.print-report) #ccxSync{
      background:#10243b!important;color:#f8fbff!important;border:1px solid #55769d!important;
      opacity:1!important;visibility:visible!important;text-shadow:none!important;
    }
    body:not(.print-report) #ccxSync,
    body:not(.print-report) #ccxSync *{
      color:#f8fbff!important;opacity:1!important;visibility:visible!important;
    }
    body:not(.print-report) #ccxSync [data-cc-readable='dark'],
    body:not(.print-report) #ccxSync [data-cc-readable='light']{color:#f8fbff!important}

    /* Los modales son una superficie oscura coherente. Evita cuerpo claro con texto claro. */
    body:not(.print-report) .modal-bg>.modal:not(.report-paper),
    body:not(.print-report) .modal-bg .modal:not(.report-paper){
      background:#0b1320!important;color:#f5f8fc!important;border-color:#31445f!important;
    }
    body:not(.print-report) .modal:not(.report-paper) .modal-head{
      background:#0d1725!important;color:#f7faff!important;border-bottom-color:#263a55!important;
    }
    body:not(.print-report) .modal:not(.report-paper) .modal-body{background:#0b1320!important;color:#f5f8fc!important}
    body:not(.print-report) .modal:not(.report-paper) h1,
    body:not(.print-report) .modal:not(.report-paper) h2,
    body:not(.print-report) .modal:not(.report-paper) h3,
    body:not(.print-report) .modal:not(.report-paper) h4{color:#f7faff!important;opacity:1!important}
    body:not(.print-report) .modal:not(.report-paper) .notice,
    body:not(.print-report) .modal:not(.report-paper) .muted,
    body:not(.print-report) .modal:not(.report-paper) .empty,
    body:not(.print-report) .modal:not(.report-paper) .cc-sec-note{color:#b8c8da!important;opacity:1!important}
    body:not(.print-report) .modal:not(.report-paper) label.field>span{color:#d7e2ef!important;opacity:1!important}
    body:not(.print-report) .modal:not(.report-paper) .cc-sec-row small,
    body:not(.print-report) .modal:not(.report-paper) .cc-sec-event small,
    body:not(.print-report) .modal:not(.report-paper) .cc-sec-kpi small{color:#b8c8da!important;opacity:1!important}
    body:not(.print-report) .modal:not(.report-paper) .cc-sec-row b,
    body:not(.print-report) .modal:not(.report-paper) .cc-sec-event b,
    body:not(.print-report) .modal:not(.report-paper) .cc-sec-kpi strong,
    body:not(.print-report) .modal:not(.report-paper) .cc-sec-toolbar b{color:#f7faff!important;opacity:1!important}
    body:not(.print-report) .modal:not(.report-paper) .alert.info{background:#0c2946!important;border-color:#3978b7!important;color:#dbeafe!important}
    body:not(.print-report) .modal:not(.report-paper) .alert.info b{color:#fff!important}
    body:not(.print-report) .modal:not(.report-paper) .alert.good{background:#10291b!important;border-color:#347d51!important;color:#d1fae5!important}
    body:not(.print-report) .modal:not(.report-paper) .alert.danger{background:#321417!important;border-color:#944047!important;color:#fee2e2!important}
    body:not(.print-report) .modal:not(.report-paper) .alert{color:#fef3c7!important}

    /* Deshabilitado debe seguir siendo legible; la condición se comunica además por cursor/estado. */
    body:not(.print-report) button:disabled,
    body:not(.print-report) .btn:disabled,
    body:not(.print-report) input:disabled,
    body:not(.print-report) select:disabled,
    body:not(.print-report) textarea:disabled{opacity:.68!important}

    /* Corrección automática de cualquier texto que caiga por debajo del contraste mínimo. */
    body:not(.print-report) [data-cc-readable='dark']{color:#142019!important;opacity:1!important;visibility:visible!important}
    body:not(.print-report) [data-cc-readable='light']{color:#f8fbff!important;opacity:1!important;visibility:visible!important}

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
}

function rgb(value){
  const m=String(value||'').match(/rgba?\((\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)(?:[ ,/]+([\d.]+))?\)/i);
  return m?{r:+m[1],g:+m[2],b:+m[3],a:m[4]===undefined?1:+m[4]}:null;
}
function blend(fg,bg){const a=Math.max(0,Math.min(1,fg.a??1));return{r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a),a:1}}
function lum(c){const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)}
function ratio(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function effectiveBackground(el){
  const layers=[];let n=el;
  while(n&&n!==document.documentElement){const c=rgb(getComputedStyle(n).backgroundColor);if(c&&c.a>0)layers.push(c);n=n.parentElement}
  let out=rgb(getComputedStyle(document.body).backgroundColor)||{r:7,g:10,b:15,a:1};
  for(let i=layers.length-1;i>=0;i--)out=blend(layers[i],out);
  return out;
}
function directText(el){return [...el.childNodes].some(n=>n.nodeType===3&&String(n.textContent||'').trim().length>0)}
function requiredRatio(el){const cs=getComputedStyle(el),size=parseFloat(cs.fontSize)||14,weight=parseInt(cs.fontWeight,10)||400;return(size>=24||(size>=18.66&&weight>=700))?3:4.5}
function knownDarkSurface(el){return !!el.closest('#content .ccx-page,#content .cp-budget-page,#content .cp-exec-only,#content .followup-panel,#content .quick-panel,#content .cp-alerts-compact,#content .cp-project-search-note,.modal:not(.report-paper)')}
function bestReadable(bg){
  const dark={r:20,g:32,b:25,a:1},light={r:248,g:251,b:255,a:1};
  return ratio(light,bg)>=ratio(dark,bg)?'light':'dark';
}
function shouldAudit(el){
  if(!(el instanceof HTMLElement))return false;
  if(el.closest('.report-paper,.print-report,.hero-control-contractual'))return false;
  const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity||'1')<.05)return false;
  if(!directText(el)&&!['BUTTON','A','TH','TD','LABEL'].includes(el.tagName))return false;
  return true;
}
function auditContrast(){
  const selector='p,span,small,b,strong,h1,h2,h3,h4,label,button,a,th,td,.muted,.notice,.eyebrow,.status,.pill,.empty,.cc-sec-note';
  document.querySelectorAll(selector).forEach(el=>{
    if(!shouldAudit(el))return;
    if(el.closest('#ccxSync')){el.dataset.ccReadable='light';return}
    const fg=rgb(getComputedStyle(el).color),bg=effectiveBackground(el);if(!fg||!bg)return;
    const r=ratio(fg,bg),need=requiredRatio(el);
    if(r+0.05<need)el.dataset.ccReadable=knownDarkSurface(el)?'light':bestReadable(bg);else delete el.dataset.ccReadable;
  });
}
function clarifyHeader(){
  const top=document.querySelector('.topbar');if(!top)return;
  const cloud=top.querySelector('.cloud-pill');if(cloud){const sm=cloud.querySelector('small');if(sm&&!sm.textContent.trim())sm.textContent='NUBE';cloud.title='Estado de sincronización con Supabase';cloud.setAttribute('aria-label','Estado de sincronización con Supabase')}
  const learn=document.getElementById('learnBtn');if(learn){learn.textContent='🧠 IA / Aprendizaje';learn.title='Abrir aprendizaje adaptativo';learn.setAttribute('aria-label','Abrir aprendizaje adaptativo')}
  const backup=document.getElementById('backupBtn');if(backup){backup.title='Descargar respaldo del expediente';backup.setAttribute('aria-label','Descargar respaldo del expediente')}
  const np=document.getElementById('newProjectBtn');if(np){np.title='Crear un nuevo proyecto';np.setAttribute('aria-label','Crear un nuevo proyecto')}
  top.querySelectorAll('button').forEach(b=>{if(!b.textContent.trim()&&!b.getAttribute('aria-label')){b.setAttribute('aria-label','Acción');b.title='Acción'}});
}
function fixLegacyLabels(){document.querySelectorAll('.progress-label span').forEach(s=>{if(/avance físico\s*=\s*financiero/i.test(s.textContent||''))s.textContent='Avance financiero certificado / estimado acumulado'})}
function run(){injectCss();clarifyHeader();fixLegacyLabels();auditContrast()}

let queued=false;
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})}
injectCss();run();
new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','disabled']});
window.addEventListener('resize',()=>{clearTimeout(window.__ccContrastTimer);window.__ccContrastTimer=setTimeout(run,120)});
setTimeout(run,350);setTimeout(run,1200);setTimeout(run,2600);
window.ccRunVisibilityAudit=run;
window.ccAuditContrast=auditContrast;
})();