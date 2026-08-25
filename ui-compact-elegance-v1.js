/* ===== CONTROL CONTRACTUAL · INTERFAZ COMPACTA Y ELEGANTE V1 ===== */
(()=>{
'use strict';
if(window.__CC_COMPACT_ELEGANCE_V1__)return;
window.__CC_COMPACT_ELEGANCE_V1__=true;

const STYLE_ID='cc-compact-elegance-v1-style';
const icon=(name)=>{
  const paths={
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-7h5v7"/>',
    projects:'<path d="M3.5 5.5h6l1.7 2H20.5v11a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"/><path d="M2 10h20"/>',
    wallet:'<path d="M3 6.5h15a3 3 0 0 1 3 3v8a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 1 17.5v-12A2.5 2.5 0 0 1 3.5 3H18"/><path d="M16 12h5"/><circle cx="16" cy="12" r=".7" fill="currentColor" stroke="none"/>',
    alert:'<path d="M12 3 2.7 20h18.6L12 3Z"/><path d="M12 9v5"/><path d="M12 17.4h.01"/>',
    audit:'<path d="M7 3h10v4H7z"/><path d="M5 5H4a2 2 0 0 0-2 2v13h20V7a2 2 0 0 0-2-2h-1"/><path d="m8 13 2.2 2.2L16 9.5"/>',
    report:'<path d="M5 2.5h10l4 4V21.5H5z"/><path d="M15 2.5v5h4"/><path d="M8 12h8M8 16h8"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    download:'<path d="M12 3v12"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4 20h16"/>',
    logout:'<path d="M10 4H4v16h6"/><path d="M14 8l4 4-4 4"/><path d="M8 12h10"/>',
    edit:'<path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
    trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
    folder:'<path d="M3 5h6l2 2h10v12H3z"/>',
    printer:'<path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 15h12v6H6z"/>',
    pin:'<path d="M20 10c0 5.2-8 11-8 11S4 15.2 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    shield:'<path d="M12 2.8 20 6v5.5c0 5.2-3.3 8.5-8 10-4.7-1.5-8-4.8-8-10V6l8-3.2Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c.5-4 2.7-6 6-6s5.5 2 6 6"/><path d="M16 5.5a3 3 0 0 1 0 5.5M17 14c2.3.5 3.7 2.4 4 5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    save:'<path d="M4 3h13l3 3v15H4z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    left:'<path d="m15 5-7 7 7 7"/>',
    right:'<path d="m9 5 7 7-7 7"/>',
    refresh:'<path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 0-2 5"/>',
    calendar:'<path d="M4 5h16v16H4z"/><path d="M8 2v6M16 2v6M4 10h16"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.8-1.9.9-1.9-2.1-2.1-1.9.9-1.9-.8-.7-2h-3l-.7 2-1.9.8-1.9-.9L1.9 6l.9 1.9L2 9.8l-2 .7v3l2 .7.8 1.9-.9 1.9 2.1 2.1 1.9-.9 1.9.8.7 2h3l.7-2 1.9-.8 1.9.9 2.1-2.1-.9-1.9.8-1.9 2-.7Z" transform="scale(.85) translate(2.1 2.1)"/>',
    eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>'
  };
  const body=paths[name];if(!body)return'';
  return `<svg class="cc-ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
};

function injectStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  :root{--cc-compact-radius:12px;--cc-compact-gap:8px}
  body:not(.print-report){font-size:13px!important;line-height:1.42!important}
  body:not(.print-report) .shell{width:min(100%,1380px)!important;max-width:1380px!important;padding:14px 16px 18px!important}
  body:not(.print-report) .topbar{gap:10px!important;padding:8px 10px!important;margin-bottom:11px!important;border-radius:14px!important;box-shadow:0 10px 28px rgba(0,0,0,.18)!important}
  body:not(.print-report) .brand{gap:9px!important;min-width:0!important}
  body:not(.print-report) .brand .logo,body:not(.print-report) .logo{width:36px!important;height:36px!important;min-width:36px!important;border-radius:11px!important;font-size:11px!important;box-shadow:0 7px 20px rgba(37,99,235,.24)!important}
  body:not(.print-report) .topbar h1,body:not(.print-report) h1{font-size:20px!important;line-height:1.14!important;letter-spacing:-.018em!important;margin-bottom:2px!important}
  body:not(.print-report) h2{font-size:16px!important;line-height:1.2!important}
  body:not(.print-report) h3{font-size:13px!important;line-height:1.25!important}
  body:not(.print-report) .eyebrow{font-size:9px!important;letter-spacing:.115em!important;margin:0 0 3px!important}
  body:not(.print-report) .muted,body:not(.print-report) .notice,body:not(.print-report) small{line-height:1.35!important}

  body:not(.print-report) .top-actions,body:not(.print-report) .actions,body:not(.print-report) .toolbar{gap:6px!important}
  body:not(.print-report) button,body:not(.print-report) .btn{min-height:34px!important;padding:7px 9px!important;border-radius:9px!important;font-size:11.5px!important;line-height:1.15!important}
  body:not(.print-report) .btn,body:not(.print-report) .icon-btn,body:not(.print-report) #ccxNav button,body:not(.print-report) .tabs button,body:not(.print-report) .cp-main-tabs button{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important}
  body:not(.print-report) .icon-btn{width:34px!important;height:34px!important;min-width:34px!important;min-height:34px!important;padding:0!important;border-radius:9px!important}
  body:not(.print-report) .cc-ui-icon{width:15px!important;height:15px!important;min-width:15px!important;flex:0 0 15px!important;display:inline-block!important;overflow:visible!important}
  body:not(.print-report) .btn.primary{box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 8px 20px rgba(36,100,233,.24)!important}
  body:not(.print-report) .btn:hover,body:not(.print-report) .icon-btn:hover{transform:translateY(-1px)!important}

  body:not(.print-report) input:not([type='checkbox']):not([type='radio']),body:not(.print-report) select,body:not(.print-report) textarea,body:not(.print-report) .input,body:not(.print-report) .search{min-height:36px!important;padding:7px 9px!important;border-radius:9px!important;font-size:12.5px!important}
  body:not(.print-report) textarea{min-height:72px!important}
  body:not(.print-report) .field span{font-size:11px!important;margin-bottom:4px!important}
  body:not(.print-report) .field small{font-size:9.5px!important;margin-top:4px!important}

  body:not(.print-report) .panel{padding:11px 12px!important;margin-bottom:10px!important;border-radius:13px!important;box-shadow:0 12px 30px rgba(0,0,0,.18)!important}
  body:not(.print-report) .panel-head{gap:8px!important;margin-bottom:9px!important}
  body:not(.print-report) .grid-kpi,body:not(.print-report) .exec-kpis{gap:7px!important;margin-bottom:10px!important}
  body:not(.print-report) .kpi,body:not(.print-report) .exec-kpi{padding:9px 10px!important;border-radius:12px!important;box-shadow:0 10px 26px rgba(0,0,0,.18)!important}
  body:not(.print-report) .kpi small,body:not(.print-report) .exec-kpi small{font-size:9px!important;margin-bottom:3px!important}
  body:not(.print-report) .kpi strong,body:not(.print-report) .exec-kpi strong{font-size:15px!important;line-height:1.15!important}
  body:not(.print-report) .card{padding:11px!important;border-radius:12px!important}
  body:not(.print-report) .project-grid,body:not(.print-report) .project-grid-v3{gap:8px!important}
  body:not(.print-report) .summary-grid,body:not(.print-report) .advance{gap:7px!important}
  body:not(.print-report) .info,body:not(.print-report) .advance>div{padding:8px!important;border-radius:9px!important}
  body:not(.print-report) .status,body:not(.print-report) .pill{padding:3px 6px!important;font-size:9px!important;line-height:1.2!important}

  body:not(.print-report) .tabs{gap:5px!important;margin-bottom:9px!important;padding-bottom:3px!important;scrollbar-width:thin!important}
  body:not(.print-report) .tabs button{padding:6px 8px!important;min-height:32px!important;font-size:10.5px!important;border-radius:8px!important}
  body:not(.print-report) #ccxNav{gap:5px!important}
  body:not(.print-report) #ccxNav button{min-height:34px!important;padding:6px 8px!important;font-size:10.5px!important;border-radius:9px!important}

  body:not(.print-report) .table-wrap{border-radius:10px!important;max-width:100%!important}
  body:not(.print-report) .table th,body:not(.print-report) .table td,body:not(.print-report) .cp-budget-table th,body:not(.print-report) .cp-budget-table td{padding:7px 8px!important;font-size:10.5px!important;line-height:1.3!important;border-color:rgba(120,161,230,.12)!important}
  body:not(.print-report) .table th,body:not(.print-report) .cp-budget-table th{background:#101a28!important;color:#9eb2cc!important}
  body:not(.print-report) .table td,body:not(.print-report) .cp-budget-table td{background:#0a1320!important;color:#e8f1fb!important}
  body:not(.print-report) .cp-budget-table tr{background:#0a1320!important;border-color:rgba(120,161,230,.12)!important;box-shadow:none!important}

  body:not(.print-report) .cp-main-tabs{padding:4px!important;gap:4px!important;background:rgba(8,17,31,.86)!important;border-color:rgba(120,161,230,.16)!important;box-shadow:0 8px 22px rgba(0,0,0,.14)!important}
  body:not(.print-report) .cp-main-tabs button,body:not(.print-report) .cp-budget-filter,body:not(.print-report) .cp-dashboard-toggle,body:not(.print-report) .cp-exec-open{min-height:32px!important;padding:6px 8px!important;background:#0d1827!important;color:#b8c8dc!important;border-color:rgba(120,161,230,.16)!important}
  body:not(.print-report) .cp-main-tabs button:hover,body:not(.print-report) .cp-budget-filter:hover,body:not(.print-report) .cp-dashboard-toggle:hover,body:not(.print-report) .cp-exec-open:hover{background:#13233a!important;color:#edf5ff!important;border-color:rgba(104,158,255,.34)!important}
  body:not(.print-report) .cp-main-tabs button.active,body:not(.print-report) .cp-budget-filter.active,body:not(.print-report) .cp-dashboard-toggle.active{background:linear-gradient(135deg,#2f6ee7,#1f56c5)!important;color:#fff!important;border-color:#4b82ee!important}
  body:not(.print-report) .cp-budget-kpi,body:not(.print-report) .cp-budget-panel,body:not(.print-report) .cp-exec-only,body:not(.print-report) .cp-exec-ring-card,body:not(.print-report) .cp-exec-metric{background:linear-gradient(155deg,rgba(14,28,48,.94),rgba(7,16,29,.97))!important;color:#eef6ff!important;border-color:rgba(112,157,226,.16)!important;box-shadow:0 10px 26px rgba(0,0,0,.17)!important}
  body:not(.print-report) .cp-budget-kpi strong,body:not(.print-report) .cp-budget-name,body:not(.print-report) .cp-exec-head h2,body:not(.print-report) .cp-exec-ring-info strong,body:not(.print-report) .cp-exec-metric strong,body:not(.print-report) .cp-exec-ring b{color:#f3f8ff!important}
  body:not(.print-report) .cp-budget-kpi small,body:not(.print-report) .cp-budget-sub,body:not(.print-report) .cp-budget-pager small,body:not(.print-report) .cp-exec-head p,body:not(.print-report) .cp-exec-ring-info small,body:not(.print-report) .cp-exec-metric small,body:not(.print-report) .cp-exec-metric span,body:not(.print-report) .cp-exec-footer span{color:#91a6c2!important}
  body:not(.print-report) .cp-project-search-note{background:#0c1725!important;border-color:rgba(120,161,230,.16)!important;color:#91a6c2!important}
  body:not(.print-report) .cp-project-search-note b{color:#edf5ff!important}

  body:not(.print-report) .modal{width:min(860px,calc(100vw - 22px))!important;max-height:90vh!important;border-radius:14px!important;box-shadow:0 24px 70px rgba(0,0,0,.45)!important}
  body:not(.print-report) .modal.small{width:min(480px,calc(100vw - 22px))!important}
  body:not(.print-report) .modal-head{padding:10px 12px!important}
  body:not(.print-report) .modal-body{padding:12px!important}
  body:not(.print-report) .form-grid{gap:8px!important}
  body:not(.print-report) .modal-actions{gap:6px!important;margin-top:3px!important}

  body:not(.print-report) .auth{padding:14px!important}
  body:not(.print-report) .auth-card{width:min(420px,100%)!important;padding:18px!important;border-radius:16px!important;box-shadow:0 24px 70px rgba(0,0,0,.40)!important}
  body:not(.print-report) .auth-card .logo{width:46px!important;height:46px!important;margin-bottom:12px!important;font-size:14px!important}
  body:not(.print-report) .seg{margin:12px 0!important;padding:3px!important;border-radius:9px!important}
  body:not(.print-report) .seg button{min-height:32px!important;padding:6px!important;border-radius:7px!important;font-size:11px!important}

  body:not(.print-report)::after{width:360px!important;height:360px!important;right:-170px!important;opacity:.16!important}
  body:not(.print-report) .exec-overview::before{width:190px!important;height:190px!important;right:7%!important;top:-42px!important;opacity:.55!important;border-width:24px!important}
  body:not(.print-report) .exec-overview::after{width:58px!important;height:58px!important;opacity:.68!important}
  body:not(.print-report) .exec-kpi:hover,body:not(.print-report) .kpi:hover{transform:translateY(-2px)!important}

  body:not(.print-report) .cc-guest-entry{margin-top:11px!important;padding-top:11px!important}
  body:not(.print-report) .cc-guest-entry button{min-height:36px!important;background:linear-gradient(180deg,rgba(22,39,65,.92),rgba(11,24,43,.96))!important;border-color:rgba(118,164,235,.25)!important;color:#eaf3ff!important}
  body:not(.print-report) .cc-guest-entry p{font-size:9px!important;color:#8096b2!important}
  body:not(.print-report) .cc-guest-banner{padding:8px 10px!important;gap:10px!important;border-radius:11px!important;background:linear-gradient(100deg,rgba(47,69,29,.88),rgba(37,46,22,.92))!important;border-color:rgba(213,180,70,.33)!important;color:#f7e7a6!important;box-shadow:0 8px 22px rgba(0,0,0,.16)!important}
  body:not(.print-report) .cc-guest-banner small{font-size:9.5px!important;color:#d4c789!important}
  body:not(.print-report) .cc-guest-banner button{min-height:32px!important;padding:6px 8px!important;background:rgba(18,24,16,.52)!important;color:#f6e7a5!important;border-color:rgba(213,180,70,.32)!important;font-size:10px!important}

  body:not(.print-report) #app,body:not(.print-report) .shell,body:not(.print-report) .panel,body:not(.print-report) .modal,body:not(.print-report) .card,body:not(.print-report) .table-wrap{min-width:0!important;max-width:100%}
  body:not(.print-report) img{max-width:100%;height:auto}
  body:not(.print-report) .top-actions{align-items:center!important}
  body:not(.print-report) .userbox{gap:6px!important}
  body:not(.print-report) .avatar{width:32px!important;height:32px!important;font-size:11px!important}
  body:not(.print-report) .cloud-pill{padding:6px 8px!important;min-height:34px!important;border-radius:10px!important}
  body:not(.print-report) .cloud-pill small{font-size:7.5px!important}.cloud-pill b{font-size:9.5px!important}

  @media(max-width:980px){
    body:not(.print-report) .shell{padding:11px 12px 16px!important}
    body:not(.print-report) #ccxNav{grid-template-columns:repeat(4,minmax(0,1fr))!important}
  }
  @media(max-width:720px){
    body:not(.print-report){font-size:12.5px!important}
    body:not(.print-report) .shell{padding:9px!important}
    body:not(.print-report) .topbar{padding:8px!important;margin-bottom:8px!important}
    body:not(.print-report) .topbar h1,body:not(.print-report) h1{font-size:18px!important}
    body:not(.print-report) button,body:not(.print-report) .btn,body:not(.print-report) .icon-btn{min-height:38px!important}
    body:not(.print-report) .icon-btn{width:38px!important;min-width:38px!important}
    body:not(.print-report) #ccxNav button{min-height:38px!important}
    body:not(.print-report) .panel{padding:9px!important}
    body:not(.print-report) .modal{width:calc(100vw - 10px)!important;max-height:94vh!important;border-radius:12px!important}
    body:not(.print-report) .modal-head,body:not(.print-report) .modal-body{padding:10px!important}
    body:not(.print-report) .cc-guest-banner{align-items:stretch!important}
    body:not(.print-report) .cc-guest-banner button{width:100%!important}
    body:not(.print-report) .exec-overview::before,body:not(.print-report) .exec-overview::after{display:none!important}
  }
  @media(max-width:440px){
    body:not(.print-report) .shell{padding:7px!important}
    body:not(.print-report) .auth{padding:8px!important}
    body:not(.print-report) .auth-card{padding:14px!important;border-radius:14px!important}
    body:not(.print-report) #ccxNav{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    body:not(.print-report) .top-actions{gap:5px!important}
  }
  @media(prefers-reduced-motion:reduce){body:not(.print-report) *,body:not(.print-report)::before,body:not(.print-report)::after{animation:none!important;transition-duration:.01ms!important}}
  `;document.head.appendChild(s);
}

function normalizedText(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function iconName(el){
  const t=normalizedText(el),id=String(el.id||'').toLowerCase(),action=String(el.dataset?.action||el.dataset?.ccx||'').toLowerCase();
  if(el.classList?.contains('close')||/cerrar/.test(t)||id.includes('close'))return'close';
  if(id==='newprojectbtn'||/nuevo proyecto|crear proyecto|agregar|añadir|registrar/.test(t))return'plus';
  if(id==='backupbtn'||/respaldo|descargar|exportar/.test(t))return'download';
  if(id==='logoutbtn'||/salir|cerrar sesión/.test(t))return'logout';
  if(/editar|modificar/.test(t))return'edit';
  if(/eliminar|borrar/.test(t))return'trash';
  if(/guardar/.test(t))return'save';
  if(/imprimir/.test(t))return'printer';
  if(/garant/.test(t))return'shield';
  if(/equipo|usuarios|solicitudes/.test(t))return'users';
  if(/visita|ubicaci/.test(t))return'pin';
  if(/estimaci|pago|presupuesto|disponibilidad/.test(t)||action==='budget')return'wallet';
  if(/informe|reporte/.test(t)||action==='reports')return'report';
  if(/alerta/.test(t)||action==='alerts')return'alert';
  if(/auditor/.test(t)||action==='audit')return'audit';
  if(/proyectos/.test(t)||action==='projects')return'projects';
  if(/^inicio$/.test(t)||action==='home')return'home';
  if(/abrir expediente|abrir detalle|ver detalle|expediente/.test(t))return'folder';
  if(/buscar/.test(t)||id.includes('search'))return'search';
  if(/volver|anterior/.test(t))return'left';
  if(/siguiente|continuar/.test(t))return'right';
  if(/actualizar|recargar|reintentar/.test(t))return'refresh';
  if(/fecha|calendario|programaci/.test(t))return'calendar';
  if(/configuraci|ajustes/.test(t))return'settings';
  if(/ver|vista/.test(t))return'eye';
  return'';
}
function cleanLeadingGlyph(el){
  const rx=/^\s*[＋+⇩↓✕×←→↻⟳☰▦⚙⌖⚠✓]\s*/;
  for(const n of el.childNodes){if(n.nodeType===Node.TEXT_NODE&&rx.test(n.nodeValue||'')){n.nodeValue=(n.nodeValue||'').replace(rx,'');return}}
}
function enhanceControl(el){
  if(!el||el.dataset?.ccElegantIcon==='1')return;
  const name=iconName(el);if(!name)return;
  el.dataset.ccElegantIcon='1';
  cleanLeadingGlyph(el);
  if(name==='close'&&(el.classList.contains('icon-btn')||el.classList.contains('close'))){el.innerHTML=icon('close');if(!el.getAttribute('aria-label'))el.setAttribute('aria-label','Cerrar');return}
  el.insertAdjacentHTML('afterbegin',icon(name));
}
function enhanceIcons(root=document){
  root.querySelectorAll?.('.btn,.icon-btn,#ccxNav button,.cp-main-tabs button,.tabs button').forEach(enhanceControl);
  root.querySelectorAll?.('.project-location>span:first-child').forEach(el=>{if(el.dataset.ccElegantPin)return;el.dataset.ccElegantPin='1';el.innerHTML=icon('pin')});
}
function run(){injectStyle();enhanceIcons()}
run();
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})}).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(run,150);setTimeout(run,700);setTimeout(run,1600);
window.ccRunCompactElegance=run;
})();
