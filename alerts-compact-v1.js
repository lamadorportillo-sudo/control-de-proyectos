/* ===== CONTROL CONTRACTUAL · ALERTAS COMPACTAS V1 ===== */
(()=>{
'use strict';
if(window.__CP_ALERTS_COMPACT_V1__)return;
window.__CP_ALERTS_COMPACT_V1__=true;

const state={expanded:false};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

function ensureStyle(){
  if(document.getElementById('cp-alerts-compact-v1-style'))return;
  const s=document.createElement('style');
  s.id='cp-alerts-compact-v1-style';
  s.textContent=`
  .cp-alerts-compact{display:grid;gap:9px;margin:8px 0 10px;padding:12px;border:1px solid rgba(79,140,255,.14);border-radius:15px;background:linear-gradient(145deg,rgba(12,23,37,.92),rgba(7,14,23,.92))}
  .cp-alerts-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.cp-alerts-head b{font-size:12px;color:#edf5ff}.cp-alerts-head small{display:block;margin-top:2px;color:#748ba2;font-size:8px}
  .cp-alerts-chips{display:flex;gap:6px;flex-wrap:wrap}.cp-alert-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 8px;border-radius:999px;border:1px solid #26374a;background:#0a131e;color:#9db0c3;font-size:8px;font-weight:850}.cp-alert-chip strong{font-size:10px;color:#f3f7fb}.cp-alert-chip.critical{border-color:rgba(239,68,68,.24);background:rgba(127,29,29,.12);color:#fecaca}.cp-alert-chip.deadline{border-color:rgba(234,179,8,.24);background:rgba(113,63,18,.12);color:#fde68a}.cp-alert-chip.guarantee{border-color:rgba(59,130,246,.24);background:rgba(30,64,175,.11);color:#bfdbfe}.cp-alert-chip.advance{border-color:rgba(168,85,247,.22);background:rgba(88,28,135,.11);color:#e9d5ff}
  .cp-alerts-open{width:100%;border:1px solid #2b4058;background:#0c1826;color:#c7d8ea;border-radius:10px;padding:8px 10px;font-size:9px;font-weight:850}.cp-alerts-open:hover,.cp-alerts-open.active{border-color:#37689e;background:#15345a;color:#fff}
  .cp-alert-list-clean{display:grid!important;gap:7px!important}.cp-alert-list-clean .rail-alert,.cp-alert-list-clean .followup-item{margin:0!important;border-radius:12px!important;padding:9px 11px!important;min-height:0!important}.cp-alert-list-clean .rail-alert h4,.cp-alert-list-clean .rail-alert b,.cp-alert-list-clean .followup-item h4,.cp-alert-list-clean .followup-item b{font-size:10px!important;line-height:1.25!important}.cp-alert-list-clean .rail-alert small,.cp-alert-list-clean .followup-item small{font-size:8px!important;line-height:1.3!important}.cp-alert-list-clean [data-cp-alert-hidden="1"]{display:none!important}
  .cp-alert-toggle-wrap,.cp-old-follow-toggle{display:none!important}
  @media(max-width:520px){.cp-alerts-chips{display:grid;grid-template-columns:1fr 1fr}.cp-alert-chip{justify-content:center}.cp-alerts-head{display:block}}
  `;
  document.head.appendChild(s);
}

function classify(node){
  const text=norm(node?.textContent),cls=norm(node?.className);
  const critical=/urgent|critical|expired|danger/.test(cls)||/vencid|urgente|critica|critico|atrasad/.test(text);
  const guarantee=/garantia|poliza/.test(text);
  const advance=/anticipo/.test(text);
  const deadline=/plazo|finaliz|vence|vencim/.test(text);
  let score=0;
  if(critical)score+=100;
  if(/vencid|expired/.test(text+' '+cls))score+=50;
  if(guarantee)score+=20;
  if(deadline)score+=15;
  if(advance)score+=10;
  return{critical,guarantee,advance,deadline,score};
}

function compact(list,itemSelector,host){
  if(!list||!host)return false;
  const items=[...list.querySelectorAll(itemSelector)];
  if(!items.length)return false;
  list.hidden=false;list.style.display='grid';list.classList.add('cp-alert-list-clean');
  items.sort((a,b)=>classify(b).score-classify(a).score).forEach(node=>list.appendChild(node));
  const stats=items.reduce((o,node)=>{const c=classify(node);if(c.critical)o.critical++;if(c.deadline)o.deadline++;if(c.guarantee)o.guarantee++;if(c.advance)o.advance++;return o;},{critical:0,deadline:0,guarantee:0,advance:0});
  let summary=host.querySelector(':scope > .cp-alerts-compact');
  if(!summary){summary=document.createElement('div');summary.className='cp-alerts-compact';list.before(summary)}
  summary.innerHTML=`<div class="cp-alerts-head"><div><b>${items.length} alertas activas</b><small>Solo se muestran las 2 de mayor prioridad.</small></div></div><div class="cp-alerts-chips"><span class="cp-alert-chip critical"><strong>${stats.critical}</strong> críticas</span><span class="cp-alert-chip deadline"><strong>${stats.deadline}</strong> plazos</span><span class="cp-alert-chip guarantee"><strong>${stats.guarantee}</strong> garantías</span><span class="cp-alert-chip advance"><strong>${stats.advance}</strong> anticipos</span></div><button type="button" class="cp-alerts-open ${state.expanded?'active':''}" data-cp-alerts-open>${state.expanded?'Ocultar detalle':`Ver todas las alertas (${items.length})`}</button>`;
  items.forEach((node,index)=>{node.dataset.cpAlertHidden=(!state.expanded&&index>=2)?'1':'0'});
  return true;
}

function apply(){
  try{
    if(typeof view!=='undefined'&&view.screen!=='projects')return;
    ensureStyle();
    const rail=document.querySelector('.control-rail-v3 .rail-alert-list');
    if(rail){const host=rail.closest('.rail-card')||rail.parentElement;compact(rail,'.rail-alert',host);document.querySelector('.followup-center .followup-panel')?.setAttribute('hidden','');return}
    const old=document.querySelector('.followup-center .followup-list');
    if(old){const host=old.closest('.followup-panel')||old.parentElement;host?.removeAttribute('hidden');compact(old,'.followup-item',host)}
  }catch(err){console.warn('Alertas compactas:',err)}
}
function afterRender(){setTimeout(apply,0)}
if(typeof renderApp==='function'&&!renderApp.__cpAlertsCompact){const base=renderApp;const wrapped=function(){const result=base.apply(this,arguments);afterRender();return result;};wrapped.__cpAlertsCompact=true;renderApp=wrapped}
if(typeof renderProjects==='function'&&!renderProjects.__cpAlertsCompact){const base=renderProjects;const wrapped=function(){const result=base.apply(this,arguments);afterRender();return result;};wrapped.__cpAlertsCompact=true;renderProjects=wrapped}
document.addEventListener('click',e=>{if(!e.target.closest?.('[data-cp-alerts-open]'))return;state.expanded=!state.expanded;apply()},true);
ensureStyle();setTimeout(apply,0);setTimeout(apply,250);setTimeout(apply,900);
})();

/* Cargador estable de extensiones corporativas. */
(()=>{
'use strict';
if(window.__CC_STABLE_EXTENSIONS_LOADER_V1__)return;
window.__CC_STABLE_EXTENSIONS_LOADER_V1__=true;
const modules=[
  {flag:'__CC_PROCUREMENT_THRESHOLDS_V1__',src:'procurement-thresholds-v1.js?v=20260820-gacetas2',key:'procurement'},
  {flag:'__CC_CORPORATE_UI_V1__',src:'corporate-ui-v1.js?v=20260820-corporate1',key:'corporate'}
];
function loadAll(){
  modules.forEach(m=>{
    if(window[m.flag]||document.querySelector(`script[data-cc-extension="${m.key}"]`))return;
    const s=document.createElement('script');s.src=m.src;s.async=false;s.dataset.ccExtension=m.key;s.onerror=()=>console.error(`No se pudo cargar ${m.src}`);document.head.appendChild(s);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadAll,{once:true});else loadAll();
})();
