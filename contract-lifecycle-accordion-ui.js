/* ===== UI DESPLEGABLE VISIBLE PARA FASES CONTRACTUALES ===== */
(()=>{
  if(window.__CP_LC_ACCORDION_UI__) return;
  window.__CP_LC_ACCORDION_UI__=true;

  const css=`
  .lc-accordion-tools{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin:2px 0 4px}
  .lc-accordion-tools button{border:1px solid rgba(96,165,250,.22);background:#0a1522;color:#cfe3ff;border-radius:10px;padding:8px 11px;font-size:9px;font-weight:850;cursor:pointer}
  .lc-accordion-tools button:hover{background:#10233a;border-color:rgba(96,165,250,.38)}
  .lc-phase-head{grid-template-columns:38px minmax(0,1fr) auto minmax(112px,auto)!important}
  .lc-toggle{width:auto!important;min-width:108px!important;height:32px!important;padding:0 10px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;border-color:rgba(96,165,250,.24)!important;background:#0a1726!important;color:#dbeafe!important;font-size:9px!important;font-weight:900!important;transform:none!important}
  .lc-toggle::after{content:'▼';font-size:10px;color:#7db3ff;transition:transform .18s ease}
  .lc-phase.open .lc-toggle{background:rgba(37,99,235,.14)!important;border-color:rgba(96,165,250,.38)!important;transform:none!important}
  .lc-phase.open .lc-toggle::after{content:'▲'}
  .lc-phase:not(.open) .lc-phase-head{border-bottom-color:transparent!important}
  .lc-phase:not(.open) .lc-phase-head:hover{background:rgba(59,130,246,.07)}
  .lc-phase.open{box-shadow:0 0 0 1px rgba(96,165,250,.07) inset}
  @media(max-width:620px){
    .lc-phase-head{grid-template-columns:34px minmax(0,1fr) 96px!important;gap:8px!important}
    .lc-phase-pct{grid-column:2!important;grid-row:2!important}
    .lc-toggle{grid-column:3!important;grid-row:1/3!important;min-width:92px!important;width:92px!important;padding:0 7px!important;font-size:8px!important}
    .lc-accordion-tools{justify-content:stretch}.lc-accordion-tools button{flex:1}
  }`;

  if(!document.getElementById('lc-accordion-visible-css')){
    const s=document.createElement('style');
    s.id='lc-accordion-visible-css';
    s.textContent=css;
    document.head.appendChild(s);
  }

  function refreshLabels(root=document){
    root.querySelectorAll('.lc-phase').forEach(section=>{
      const t=section.querySelector('.lc-toggle');
      if(t) t.childNodes[0] ? t.childNodes[0].nodeValue=(section.classList.contains('open')?'Ocultar ':'Ver ') : t.textContent=(section.classList.contains('open')?'Ocultar ':'Ver ');
    });
  }

  function decorate(){
    const wrap=document.querySelector('#tabBody .lc-wrap');
    if(!wrap) return;
    const list=wrap.querySelector('.lc-phase-list');
    if(!list) return;

    if(!wrap.querySelector('.lc-accordion-tools')){
      const tools=document.createElement('div');
      tools.className='lc-accordion-tools';
      tools.innerHTML='<button type="button" data-lc-expand-all>Expandir todas las fases</button><button type="button" data-lc-collapse-all>Contraer todas las fases</button>';
      list.parentNode.insertBefore(tools,list);
      tools.querySelector('[data-lc-expand-all]').onclick=()=>{
        list.querySelectorAll('.lc-phase').forEach(s=>s.classList.add('open'));
        list.querySelectorAll('[data-lc-toggle]').forEach(h=>h.setAttribute('aria-expanded','true'));
        refreshLabels(wrap);
      };
      tools.querySelector('[data-lc-collapse-all]').onclick=()=>{
        list.querySelectorAll('.lc-phase').forEach(s=>s.classList.remove('open'));
        list.querySelectorAll('[data-lc-toggle]').forEach(h=>h.setAttribute('aria-expanded','false'));
        refreshLabels(wrap);
      };
    }

    wrap.querySelectorAll('[data-lc-toggle]').forEach(head=>{
      const section=head.closest('.lc-phase');
      const toggle=head.querySelector('.lc-toggle');
      if(toggle){
        toggle.textContent=section?.classList.contains('open')?'Ocultar ':'Ver ';
        toggle.title=section?.classList.contains('open')?'Ocultar requisitos de esta fase':'Ver requisitos de esta fase';
      }
      if(!head.dataset.lcVisibleUiBound){
        head.dataset.lcVisibleUiBound='1';
        head.addEventListener('click',()=>setTimeout(()=>refreshLabels(wrap),0));
        head.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')setTimeout(()=>refreshLabels(wrap),0)});
      }
    });
    refreshLabels(wrap);
  }

  const mo=new MutationObserver(()=>decorate());
  mo.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(decorate,0);
  setTimeout(decorate,500);
})();
