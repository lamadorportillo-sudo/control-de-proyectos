/* ===== PULIDO OPERATIVO GLOBAL V1 ===== */
(()=>{
'use strict';
if(window.__CC_OPERATIONAL_POLISH_V1__)return;
window.__CC_OPERATIONAL_POLISH_V1__=true;

function inject(){
  if(document.getElementById('cc-operational-polish-v1-style'))return;
  const s=document.createElement('style');
  s.id='cc-operational-polish-v1-style';
  s.textContent=`
    /* Navegación principal: ninguna opción debe quedar fuera de pantalla */
    body:not(.print-report) #ccxNav{
      display:flex!important;
      flex-wrap:wrap!important;
      align-items:stretch!important;
      gap:5px!important;
      overflow:visible!important;
    }
    body:not(.print-report) #ccxNav button{
      min-height:40px!important;
      white-space:normal!important;
      line-height:1.15!important;
      text-align:center!important;
    }

    /* Selector Proyectos / Disponibilidad presupuestaria */
    body:not(.print-report) .cp-main-tabs{
      background:#f8faf7!important;
      border-color:#dbe4d8!important;
      box-shadow:0 7px 22px rgba(31,50,35,.05)!important;
      overflow:visible!important;
      flex-wrap:wrap!important;
    }
    body:not(.print-report) .cp-main-tabs button{
      background:#fff!important;
      color:#536158!important;
      border-color:#dce4d9!important;
    }
    body:not(.print-report) .cp-main-tabs button:hover{
      background:#f1f6ee!important;
      color:#46643b!important;
    }
    body:not(.print-report) .cp-main-tabs button.active{
      background:#587747!important;
      border-color:#587747!important;
      color:#fff!important;
    }
    body:not(.print-report) .cp-main-tabs .count{
      background:#edf4e9!important;
      color:#46643b!important;
      border:1px solid #cfddca!important;
    }
    body:not(.print-report) .cp-main-tabs button.active .count{
      background:rgba(255,255,255,.18)!important;
      color:#fff!important;
      border-color:rgba(255,255,255,.22)!important;
    }

    /* Disponibilidad presupuestaria: eliminar restos del antiguo tema oscuro */
    body:not(.print-report) .cp-budget-kpi,
    body:not(.print-report) .cp-budget-panel,
    body:not(.print-report) .cp-exec-only,
    body:not(.print-report) .cp-exec-ring-card,
    body:not(.print-report) .cp-exec-metric{
      background:#fff!important;
      color:#172019!important;
      border-color:#dfe6dc!important;
      box-shadow:0 9px 26px rgba(31,50,35,.055)!important;
    }
    body:not(.print-report) .cp-budget-kpi.good{
      background:#f2faf4!important;
      border-color:#c4ddc9!important;
    }
    body:not(.print-report) .cp-budget-kpi small,
    body:not(.print-report) .cp-budget-sub,
    body:not(.print-report) .cp-budget-pager small,
    body:not(.print-report) .cp-exec-head p,
    body:not(.print-report) .cp-exec-ring-info small,
    body:not(.print-report) .cp-exec-metric small,
    body:not(.print-report) .cp-exec-metric span,
    body:not(.print-report) .cp-exec-footer span{
      color:#6d786f!important;
      opacity:1!important;
    }
    body:not(.print-report) .cp-budget-kpi strong,
    body:not(.print-report) .cp-budget-name,
    body:not(.print-report) .cp-exec-head h2,
    body:not(.print-report) .cp-exec-ring-info strong,
    body:not(.print-report) .cp-exec-metric strong,
    body:not(.print-report) .cp-exec-ring b{
      color:#203027!important;
    }
    body:not(.print-report) .cp-budget-kpi.good strong,
    body:not(.print-report) .cp-budget-table .available{
      color:#2f6738!important;
    }
    body:not(.print-report) .cp-budget-table .available.neg{color:#963b3b!important}
    body:not(.print-report) .cp-budget-table .available.zero{color:#6f7b72!important}

    body:not(.print-report) .cp-budget-filter,
    body:not(.print-report) .cp-dashboard-toggle,
    body:not(.print-report) .cp-exec-open{
      background:#fff!important;
      color:#536158!important;
      border-color:#d7e0d4!important;
    }
    body:not(.print-report) .cp-budget-filter:hover,
    body:not(.print-report) .cp-dashboard-toggle:hover,
    body:not(.print-report) .cp-exec-open:hover{
      background:#f1f6ee!important;
      color:#46643b!important;
      border-color:#aebfa8!important;
    }
    body:not(.print-report) .cp-budget-filter.active,
    body:not(.print-report) .cp-dashboard-toggle.active{
      background:#edf4e9!important;
      color:#46643b!important;
      border-color:#b9c9b3!important;
    }
    body:not(.print-report) .cp-exec-badge{
      background:#eef8f0!important;
      color:#2f6738!important;
      border-color:#c6dfca!important;
    }
    body:not(.print-report) .cp-project-search-note{
      background:#fafcf9!important;
      border-color:#cfd9cc!important;
      color:#6d786f!important;
    }
    body:not(.print-report) .cp-project-search-note b{color:#2b3b30!important}

    body:not(.print-report) .cp-exec-ring{
      background:conic-gradient(#6f8d5b calc(var(--p)*1%),#e5ebe2 0)!important;
    }
    body:not(.print-report) .cp-exec-ring:after{
      background:#fff!important;
      border:1px solid #d8e1d5!important;
    }
    body:not(.print-report) .cp-budget-progress{background:#e5ebe2!important}
    body:not(.print-report) .cp-budget-progress i{background:linear-gradient(90deg,#587747,#87a66f)!important}

    /* Tablas operativas: alineación coherente y lectura rápida */
    body:not(.print-report) .table th,
    body:not(.print-report) .table td,
    body:not(.print-report) .cp-budget-table th,
    body:not(.print-report) .cp-budget-table td{
      text-align:left!important;
      vertical-align:top!important;
      line-height:1.35!important;
      text-justify:auto!important;
      word-break:normal!important;
      overflow-wrap:anywhere!important;
    }
    body:not(.print-report) .table th,
    body:not(.print-report) .cp-budget-table th{
      background:#f1f5ef!important;
      color:#4f5f54!important;
      border-color:#dce4d9!important;
      font-weight:850!important;
    }
    body:not(.print-report) .table td,
    body:not(.print-report) .cp-budget-table td{
      background:#fff!important;
      color:#27342b!important;
      border-color:#e7ece5!important;
    }
    body:not(.print-report) .table .num,
    body:not(.print-report) .table .right,
    body:not(.print-report) .table td.money,
    body:not(.print-report) .cp-budget-table .num,
    body:not(.print-report) .cp-budget-table .available{
      text-align:right!important;
      font-variant-numeric:tabular-nums!important;
      white-space:nowrap!important;
    }
    body:not(.print-report) .table .action,
    body:not(.print-report) .cp-budget-table .action{text-align:center!important}

    /* Controles táctiles: no altera checkbox ni radio */
    body:not(.print-report) button,
    body:not(.print-report) .btn,
    body:not(.print-report) input:not([type='checkbox']):not([type='radio']),
    body:not(.print-report) select,
    body:not(.print-report) textarea{min-height:40px}
    body:not(.print-report) button:focus-visible,
    body:not(.print-report) .btn:focus-visible,
    body:not(.print-report) input:focus-visible,
    body:not(.print-report) select:focus-visible,
    body:not(.print-report) textarea:focus-visible{
      outline:3px solid rgba(88,119,71,.18)!important;
      outline-offset:2px!important;
    }

    @media(max-width:980px){
      body:not(.print-report) #ccxNav{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
      }
      body:not(.print-report) #ccxNav button{width:100%!important}
    }
    @media(max-width:680px){
      body:not(.print-report) #ccxNav{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      body:not(.print-report) .cp-main-tabs{display:grid!important;grid-template-columns:1fr!important}
      body:not(.print-report) .cp-main-tabs button{width:100%!important;justify-content:center!important}
      body:not(.print-report) .cp-budget-table tr{
        background:#fff!important;
        border-color:#dfe6dc!important;
        box-shadow:0 5px 16px rgba(31,50,35,.04)!important;
      }
      body:not(.print-report) .cp-budget-table td{border-bottom-color:#e7ece5!important}
      body:not(.print-report) .cp-budget-table td:before{color:#607066!important}
      body:not(.print-report) .cp-budget-table .num,
      body:not(.print-report) .cp-budget-table .available{
        text-align:left!important;
        white-space:normal!important;
      }
    }
    @media(max-width:420px){body:not(.print-report) #ccxNav{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(s);
}

function improveSemantics(){
  document.querySelectorAll('.cp-budget-table th').forEach(th=>th.setAttribute('scope','col'));
  document.querySelectorAll('#ccxNav button,.cp-main-tabs button').forEach(btn=>{
    if(!btn.getAttribute('aria-label'))btn.setAttribute('aria-label',(btn.textContent||'Acción').replace(/\s+/g,' ').trim());
  });
}

function run(){inject();improveSemantics()}
run();
let queued=false;
new MutationObserver(()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;run()});
}).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(run,300);setTimeout(run,1000);
window.ccRunOperationalPolish=run;
})();
