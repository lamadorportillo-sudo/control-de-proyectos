/* ===== UNIFICACION VISUAL GLOBAL V1 ===== */
(()=>{
'use strict';
if(window.__CC_THEME_UNIFIER_V1__)return;
window.__CC_THEME_UNIFIER_V1__=true;

function inject(){
  if(document.getElementById('cc-theme-unifier-v1-style'))return;
  const s=document.createElement('style');
  s.id='cc-theme-unifier-v1-style';
  s.textContent=`
    body:not(.print-report) .exec-intro,
    body:not(.print-report) .exec-visual,
    body:not(.print-report) .exec-kpi,
    body:not(.print-report) .projects-board,
    body:not(.print-report) .project-v3,
    body:not(.print-report) .rail-card,
    body:not(.print-report) .sv4-card,
    body:not(.print-report) .sv4-kpi{
      background:#fff!important;color:#172019!important;border-color:#dfe6dc!important;
      box-shadow:0 10px 28px rgba(31,50,35,.07)!important;
    }

    body:not(.print-report) .exec-title-row h2,
    body:not(.print-report) .exec-money strong,
    body:not(.print-report) .exec-kpi strong,
    body:not(.print-report) .project-v3 h3,
    body:not(.print-report) .v3-metric b,
    body:not(.print-report) .rail-card h3,
    body:not(.print-report) .rail-state-row b,
    body:not(.print-report) .sv4-title,
    body:not(.print-report) .sv4-big-progress strong,
    body:not(.print-report) .sv4-section-title h3,
    body:not(.print-report) .sv4-date b,
    body:not(.print-report) .sv4-activity-item b,
    body:not(.print-report) .sv4-info b,
    body:not(.print-report) .sv4-guarantee b,
    body:not(.print-report) .sv4-chip b,
    body:not(.print-report) .sv4-bar-label b,
    body:not(.print-report) .sv4-time-meta b,
    body:not(.print-report) .sv4-kpi-foot b,
    body:not(.print-report) .sv4-advance-head b,
    body:not(.print-report) .sv4-advance-meta b{
      color:#203027!important;
    }

    body:not(.print-report) .exec-title-row p,
    body:not(.print-report) .exec-money small,
    body:not(.print-report) .exec-money span,
    body:not(.print-report) .exec-kpi-top small,
    body:not(.print-report) .exec-kpi-foot,
    body:not(.print-report) .project-v3-sub,
    body:not(.print-report) .project-v3-contractor,
    body:not(.print-report) .v3-metric small,
    body:not(.print-report) .project-v3-health,
    body:not(.print-report) .rail-card>p,
    body:not(.print-report) .rail-alert small,
    body:not(.print-report) .rail-state-row span,
    body:not(.print-report) .rail-quick span,
    body:not(.print-report) .sv4-muted,
    body:not(.print-report) .sv4-big-progress span,
    body:not(.print-report) .sv4-bar-label,
    body:not(.print-report) .sv4-kpi small,
    body:not(.print-report) .sv4-kpi-foot,
    body:not(.print-report) .sv4-section-title p,
    body:not(.print-report) .sv4-date small,
    body:not(.print-report) .sv4-time-meta,
    body:not(.print-report) .sv4-activity-item small,
    body:not(.print-report) .sv4-info small,
    body:not(.print-report) .sv4-guarantee small,
    body:not(.print-report) .sv4-advance-head small,
    body:not(.print-report) .sv4-advance-meta,
    body:not(.print-report) .sv4-words{
      color:#6d786f!important;opacity:1!important;
    }

    body:not(.print-report) .exec-sync{
      background:#eff8f0!important;border-color:#bfd9c4!important;color:#2f6738!important;
    }
    body:not(.print-report) .exec-chip,
    body:not(.print-report) .project-v3-contractor,
    body:not(.print-report) .v3-metric,
    body:not(.print-report) .rail-state-row,
    body:not(.print-report) .sv4-chip,
    body:not(.print-report) .sv4-activity-item,
    body:not(.print-report) .sv4-info,
    body:not(.print-report) .sv4-guarantee{
      background:#f7f9f5!important;border-color:#dfe6dc!important;color:#334139!important;
    }
    body:not(.print-report) .exec-chip b{color:#203027!important}

    body:not(.print-report) .portfolio-ring{
      background:conic-gradient(#6f8d5b calc(var(--p)*1%),#e6ece3 0)!important;
      box-shadow:inset 0 0 0 1px #d8e1d5!important,0 10px 24px rgba(31,50,35,.08)!important;
    }
    body:not(.print-report) .portfolio-ring:after{background:#fff!important;border-color:#d9e2d6!important}
    body:not(.print-report) .portfolio-ring-content b{color:#203027!important}
    body:not(.print-report) .portfolio-ring-content small{color:#6d786f!important}

    body:not(.print-report) .exec-bar,
    body:not(.print-report) .mini-progress-track,
    body:not(.print-report) .rail-state-bar,
    body:not(.print-report) .sv4-track,
    body:not(.print-report) .sv4-timeline-line{
      background:#e8ede6!important;border-color:#d8e0d5!important;
    }
    body:not(.print-report) .exec-bar>i,
    body:not(.print-report) .mini-progress-fill,
    body:not(.print-report) .rail-state-bar i,
    body:not(.print-report) .sv4-fill{
      background:linear-gradient(90deg,#587747,#86a66c)!important;
    }
    body:not(.print-report) .mini-progress-fill.time,
    body:not(.print-report) .sv4-fill.time,
    body:not(.print-report) .sv4-timeline-line i{background:linear-gradient(90deg,#7d887f,#aab2ab)!important}

    body:not(.print-report) .projects-board{border-radius:20px!important}
    body:not(.print-report) .board-head h2{color:#203027!important}
    body:not(.print-report) .board-head p{color:#6d786f!important}
    body:not(.print-report) .view-switch{background:#eef3eb!important;border-color:#dce5d9!important}
    body:not(.print-report) .view-switch button{color:#657168!important}
    body:not(.print-report) .view-switch button.active{background:#fff!important;color:#587747!important}
    body:not(.print-report) .status-filter{background:#fff!important;color:#5f6d62!important;border-color:#d9e1d6!important}
    body:not(.print-report) .status-filter.active{background:#edf4e9!important;color:#46643b!important;border-color:#b9c9b3!important}

    body:not(.print-report) .project-v3-code{color:#5f7d4a!important}
    body:not(.print-report) .project-v3-actions{background:#f8faf7!important;border-color:#e1e7df!important}
    body:not(.print-report) .health-tag{background:#eef8f0!important;color:#2f6738!important;border-color:#c8dfcc!important}
    body:not(.print-report) .health-tag.warn{background:#fff8e8!important;color:#8c6518!important;border-color:#ead99f!important}
    body:not(.print-report) .health-tag.danger{background:#fff2f2!important;color:#8a3434!important;border-color:#e9c4c4!important}

    body:not(.print-report) .rail-alert,
    body:not(.print-report) .rail-quick button{
      background:#f7f9f5!important;color:#28372d!important;border-color:#dce4d9!important;
    }
    body:not(.print-report) .rail-alert b{color:#28372d!important}
    body:not(.print-report) .rail-alert-icon{background:#edf4e9!important;color:#587747!important;border-color:#d0ddca!important}
    body:not(.print-report) .rail-empty{background:#eff8f0!important;color:#2f6738!important;border-color:#c6dfca!important}
    body:not(.print-report) .rail-quick button.primary{background:#edf4e9!important;color:#46643b!important;border-color:#c5d7bf!important}

    body:not(.print-report) .sv4-eyebrow{color:#5f7d4a!important}
    body:not(.print-report) .sv4-link{color:#587747!important}
    body:not(.print-report) .sv4-today{background:#edf4e9!important;border-color:#cbdcc5!important;color:#46643b!important}
    body:not(.print-report) .sv4-act-icon{background:#edf4e9!important;border-color:#d0ddca!important;color:#587747!important}
    body:not(.print-report) .sv4-activity-item button{color:#587747!important}
    body:not(.print-report) .sv4-advance{background:#f3f8f0!important;border-color:#d5e2d1!important}

    body:not(.print-report) .sv4-status{background:#eef8f0!important;color:#2f6738!important;border-color:#c6dfca!important}
    body:not(.print-report) .sv4-status.warn,
    body:not(.print-report) .sv4-g-state.warning,
    body:not(.print-report) .sv4-g-state.attention{background:#fff8e8!important;color:#866112!important;border-color:#ead99f!important}
    body:not(.print-report) .sv4-status.danger,
    body:not(.print-report) .sv4-g-state.critical,
    body:not(.print-report) .sv4-g-state.urgent,
    body:not(.print-report) .sv4-g-state.expired{background:#fff2f2!important;color:#8b3333!important;border-color:#e9c1c1!important}
    body:not(.print-report) .sv4-status.info{background:#eef5fb!important;color:#3f6682!important;border-color:#cbdbe7!important}
    body:not(.print-report) .sv4-g-state{background:#eef8f0!important;color:#2f6738!important;border-color:#c6dfca!important}

    @media(max-width:760px){
      body:not(.print-report) .exec-overview,
      body:not(.print-report) .dashboard-workspace-v3,
      body:not(.print-report) .sv4-hero,
      body:not(.print-report) .sv4-grid{grid-template-columns:1fr!important}
    }
  `;
  document.head.appendChild(s);
}

function correctLegacyLanguage(){
  const replacements=[
    [/avance físico-financiero/gi,'avance físico y avance financiero'],
    [/avance físico\s*=\s*financiero/gi,'avance financiero certificado / estimado acumulado']
  ];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    if(node.parentElement?.closest('.report-paper'))return;
    let text=node.nodeValue||'',next=text;
    replacements.forEach(([rx,val])=>{next=next.replace(rx,val)});
    if(next!==text)node.nodeValue=next;
  });
}

function run(){inject();correctLegacyLanguage()}
run();
let queued=false;
new MutationObserver(()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;run()});
}).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(run,300);setTimeout(run,1000);
window.ccRunThemeUnifier=run;
})();